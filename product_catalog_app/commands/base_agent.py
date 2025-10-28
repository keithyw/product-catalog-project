import json
from abc import ABC, abstractmethod
from google.genai import types
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
    def __init__(self, container: AbstractContainer, params: AgentCommandParameterInterface):
        self._container = container
        self._parameters = params
        self._agent = None
        # additional dict for maintaining other data
        self._internal_data = {}
        # the results of the agent run
        self._output = None
        # CommandResults that we might want to handle in the post process phase
        self._results = None
        self._runner = None
        self._session_manager = None
        self._prompt_template = None
        self._prompt_data = {}
        self._tools = []

    @property
    def container(self):
        return self._container
    
    @property
    def internal_data(self) -> dict:
        return self._internal_data

    @property
    def parameters(self) -> AgentCommandParameterInterface:
        return self._parameters
    
    @property
    def tools(self) -> list[BaseTool]:
        return self._tools

    @property
    def _parsed_output(self) -> dict:
        if not self._output:
            raise ValueError("Output is not set or agent failed to return anything")
        try:
            self.container.logger.info(f"raw output: {self._output}")
            return json.loads(self._output)
        except JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format from Agent. Raw output: {self._output}")

    @abstractmethod
    def _generate_session_key(self) -> str:
        pass
    
    @abstractmethod
    def _get_input_content(self) -> types.Content:
        """Passes additional info to the agent when it runs"""
        pass
    
    @abstractmethod
    def _get_schema(self) -> BaseModel:
        """The output schema for the agent to use"""
        pass

    async def _pre_process(self):
        """Callback that happens before the central logic of the handler runs such as loading data"""
        pass
    
    async def _post_process(self):
        """Callback for any additional logic that may need to occur after the main handler runs"""
        pass
    
    @abstractmethod
    async def _handle(self) -> CommandResults:
        """Concrete logic will be processed here"""
        pass
    
    def _generate_agent(self):
        self._agent = create_agent(
            self.parameters.agent_name,
            self.parameters.description,
            self._generate_prompt(),
            self._get_schema(),
            self.tools,
        )
        return self._agent

    async def _generate_session(self):
        self._session_manager = AgentSessionManager(
            self.parameters.agent_name,
            self.parameters.user_id,
            self._generate_session_key(),
        )
        await self._session_manager.start_session()
        
    def _generate_runner(self):
        self._runner = RunnerService(
            self._agent,
            self.parameters.agent_name,
            self.parameters.user_id,
            self._session_manager,
        )        

    def _generate_prompt(self) -> str:
        if not self._prompt_template:
            raise ValueError("prompt template not set")
        prompt = render(self._prompt_template, self._prompt_data)
        # temporary for debugging
        self.container.logger.info(f"prompt {prompt}")
        return prompt
    
    async def execute(self) -> CommandResults:
        """Dev calls this after instantiating command"""
        if not self.parameters.validate():
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