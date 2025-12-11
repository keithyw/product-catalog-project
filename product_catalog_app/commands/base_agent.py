import json
from abc import ABC, abstractmethod
from google.genai import types
from google.adk.artifacts import BaseArtifactService
from google.adk.tools import BaseTool
from json.decoder import JSONDecodeError
from pydantic import BaseModel
from product_catalog_app.agents.factory import create_agent
from product_catalog_app.agents.runner import RunnerService
from product_catalog_app.agents.session_manager import AgentSessionManager
from product_catalog_app.core.utils.prompt_render import render
from containers.base import AbstractContainer
from .params import AgentCommandParameterInterface
from .results import CommandResults

class AbstractAgentCommand(ABC):
    """Abstract base class for agent-based commands.
    
    Provides the framework for executing agent commands, including session
    management, prompt generation, and agent execution. Subclasses must
    implement abstract methods to define specific command behavior.
    """
    def __init__(self, container: AbstractContainer, params: AgentCommandParameterInterface):
        """Initialize the agent command.
        
        Args:
            container: The dependency injection container providing services.
            params: Parameters for the agent command including agent name,
                description, user ID, and additional parameters.
        """
        self._container = container
        self._parameters = params
        self._agent = None
        self._artifact_service = None
        # additional dict for maintaining other data
        self._internal_data = {}
        # the results of the agent run
        self._output = None
        # CommandResults that we might want to handle in the post process phase
        self._results = None
        self._runner = None
        self._session_manager = None
        self._prompt_template = None
        self._disallow_transfer = False
        self._prompt_data = {}
        self._tools = []

    @property
    def container(self):
        """Get the dependency injection container.
        
        Returns:
            The AbstractContainer instance providing services.
        """
        return self._container
    
    @property
    def artifact_service(self) -> BaseArtifactService:
        return self._artifact_service
    
    @property
    def internal_data(self) -> dict:
        """Get the internal data dictionary.
        
        Returns:
            Dictionary for maintaining additional data during command execution.
        """
        return self._internal_data

    @property
    def parameters(self) -> AgentCommandParameterInterface:
        """Get the command parameters.
        
        Returns:
            The AgentCommandParameterInterface instance containing command parameters.
        """
        return self._parameters
    
    @property
    def tools(self) -> list[BaseTool]:
        """Get the list of tools available to the agent.
        
        Returns:
            List of BaseTool instances that can be used by the agent.
        """
        return self._tools

    @property
    def _parsed_output(self) -> dict:
        """Get the parsed JSON output from the agent.
        
        Returns:
            Dictionary containing the parsed agent output.
            
        Raises:
            ValueError: If output is not set or cannot be parsed as JSON.
        """
        if not self._output:
            raise ValueError("Output is not set or agent failed to return anything")
        try:
            self.container.logger.info(f"raw output: {self._output}")
            return json.loads(self._output)
        except JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format from Agent. Raw output: {self._output}")

    @abstractmethod
    def _generate_session_key(self) -> str:
        """Generate a unique session key for the agent session.
        
        Returns:
            A unique string identifier for the session.
        """
        pass
    
    @abstractmethod
    def _get_input_content(self) -> types.Content:
        """Get the input content to pass to the agent when it runs.
        
        Returns:
            types.Content containing additional information and parameters
            to be passed to the agent.
        """
        pass
    
    @abstractmethod
    def _get_schema(self) -> BaseModel:
        """Get the output schema for the agent to use.
        
        Returns:
            A Pydantic BaseModel class defining the expected output schema.
        """
        pass

    async def _pre_process(self):
        """Callback that happens before the central logic of the handler runs.
        
        Override this method to perform operations such as loading data
        before the main handler logic executes.
        """
        pass
    
    async def _post_process(self):
        """Callback for any additional logic that may need to occur after the main handler runs.
        
        Override this method to perform post-processing operations after
        the main handler has completed.
        """
        pass
    
    @abstractmethod
    async def _handle(self) -> CommandResults:
        """Process the concrete logic for the command.
        
        This method contains the main business logic for the command.
        It is called after the agent has generated output.
        
        Returns:
            CommandResults containing the result of the command execution.
        """
        pass

    def _generate_agent(self):
        """Generate and configure the agent instance.
        
        Creates an agent using the factory with the specified name,
        description, prompt, schema, and tools.
        
        Returns:
            The configured agent instance.
        """
        self.container.logger.info("creating agent")
        self._agent = create_agent(
            self.parameters.agent_name,
            self.parameters.description,
            self._generate_prompt(),
            self._get_schema(),
            self.tools,
        )
        if self._disallow_transfer:
            self._agent.disallow_transfer_to_parent = True
            self._agent.disallow_transfer_to_peers = True
        return self._agent

    async def _generate_session(self):
        """Generate and start an agent session.
        
        Creates an AgentSessionManager instance and starts a new session
        for the agent execution.
        """
        self._session_manager = AgentSessionManager(
            self.parameters.agent_name,
            self.parameters.user_id,
            self._generate_session_key(),
        )
        await self._session_manager.start_session()
        
    def _generate_runner(self):
        """Generate the runner service for executing the agent.
        
        Creates a RunnerService instance configured with the agent,
        parameters, session manager, and tools.
        """
        self._runner = RunnerService(
            self._agent,
            self.parameters.agent_name,
            self.parameters.user_id,
            self._session_manager,
            self._tools,
        )
        if self._artifact_service:
            self._runner.artifact_service = self._artifact_service

    def _generate_prompt(self) -> str:
        """Generate the prompt from the template and data.
        
        Renders the prompt template with the prompt data using the
        render utility function.
        
        Returns:
            The rendered prompt string.
            
        Raises:
            ValueError: If the prompt template is not set.
        """
        if not self._prompt_template:
            raise ValueError("prompt template not set")
        self.container.logger.info("trying to render prompt")
        prompt = render(self._prompt_template, self._prompt_data)
        # temporary for debugging
        self.container.logger.info(f"prompt {prompt}")
        return prompt
    
    async def execute(self) -> CommandResults:
        """Execute the agent command.
        
        This is the main entry point for executing the command. It performs
        validation, pre-processing, agent generation, session creation,
        runner setup, agent execution, handling, and post-processing.
        
        Returns:
            CommandResults containing the result of the command execution,
            including data, success status, and any error messages.
        """
        if not self.parameters.validate():
            self.container.logger.info(f"parameter validation failed")
            return CommandResults(None, "Parameter validation failed.", False)
        try:
            self.container.logger.info("pre process")
            await self._pre_process()
            self.container.logger.info("generate agent")
            self._generate_agent()
            self.container.logger.info("gen session")
            await self._generate_session()
            self.container.logger.info("generate runner")
            self._generate_runner()
            self.container.logger.info("running")
            self._output = await self._runner.run(self._get_input_content())
            self.container.logger.info("handle")
            self._results = await self._handle()
            self.container.logger.info("post process")
            await self._post_process()
            self.container.logger.info("returning")
            return self._results
        except Exception as e:
            self.container.logger.error(F"Command exception: {e}")
            return CommandResults(None, f"Command failed execution: {e}", False)