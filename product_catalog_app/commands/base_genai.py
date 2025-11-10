from abc import ABC, abstractmethod
from pydantic import BaseModel
from google.genai import types
from containers.base import AbstractContainer
from core.utils.prompt_render import render
from .params import GenAICommandParameterInterface
from .results import CommandResults

class AbstractGenAICommand(ABC):
    """Abstract base class for GenAI-based commands.
    
    Provides the framework for executing GenAI commands, including prompt
    generation, function definition, and response handling. Subclasses must
    implement abstract methods to define specific command behavior.
    """
    def __init__(self, container: AbstractContainer, params: GenAICommandParameterInterface):
        """Initialize the GenAI command.
        
        Args:
            container: The dependency injection container providing services.
            params: Parameters for the GenAI command including prompt and
                additional parameters.
        """
        self._container = container
        self._params = params
        self._prompt = None
        self._prompt_template = None
        self._prompt_data = {}
        self._internal_data = {}
        self._output = None
        self._results = None
        self._function_name = None
        self._function_description = None

    @property    
    def container(self):
        """Get the dependency injection container.
        
        Returns:
            The AbstractContainer instance providing services.
        """
        return self._container

    @property
    def internal_data(self):
        """Get the internal data dictionary.
        
        Returns:
            Dictionary for maintaining additional data during command execution.
        """
        return self._internal_data

    @property
    def parameters(self):
        """Get the command parameters.
        
        Returns:
            The GenAICommandParameterInterface instance containing command parameters.
        """
        return self._params

    @property
    @abstractmethod
    def prompt(self) -> str:
        """Get the prompt for the GenAI command.
        
        Allows the class to determine how the prompt is generated,
        whether from a user or a template.
        
        Returns:
            The prompt string to send to the GenAI model.
        """
        pass

    @property
    @abstractmethod
    def function_name(self) -> str:
        """Get the GenAI function name.
        
        Override this property to specify the function name for the GenAI
        function declaration.
        
        Returns:
            The name of the function to be declared to the GenAI model.
        """
        pass

    @property
    @abstractmethod
    def function_description(self) -> str:
        """Get the GenAI function description.
        
        Override this property to specify the function description for the
        GenAI function declaration.
        
        Returns:
            The description of the function to be declared to the GenAI model.
        """
        pass

    def _generate_prompt(self) -> str:
        """Generate the prompt from template and user input.
        
        Users might override this method and call super() if they need
        further processing on the prompt data aspect. Might eventually
        require some sort of override flag so the GenAI can bypass this.
        
        Returns:
            The generated prompt string combining template and user input.
            
        Raises:
            ValueError: If prompt template or prompt data is not set.
        """
        if not self._prompt_template:
            raise ValueError("prompt template not set")
        if not self._prompt_data:
            raise ValueError("prompt data not set")
        self._prompt = "\n".join([render(self._prompt_template, self._prompt_data), self.parameters.prompt])
        # temporary for debugging
        self.container.logger.info(f"prompt {self._prompt}")
        return self._prompt

    def _pre_process(self):
        """Callback that occurs before handle logic runs.
        
        Override this method to load data and set it to the internal data
        from params before the main handler logic executes.
        """
        pass

    @property
    @abstractmethod
    def _response_schema(self) -> type[BaseModel]:
        """Get the Pydantic response schema for the GenAI.
        
        Returns:
            A Pydantic BaseModel class defining the expected response schema.
        """
        pass
    
    @property
    def _function_call(self) -> types.FunctionCall:
        """Get the function call from the GenAI output.
        
        Returns:
            The function call object from the GenAI response.
            
        Raises:
            ValueError: If output is not generated or function call is not returned.
        """
        if not self._output:
            raise ValueError("Output not generated")
        function_call = self._output.candidates[0].content.parts[0].function_call
        if not function_call:
            raise ValueError("function call not returned")
        return function_call

    def _generate_definition(self) -> types.Tool:
        """Generate the function definition tool for GenAI.
        
        Creates a Tool object with a function declaration based on the
        response schema, function name, and function description.
        
        Returns:
            A types.Tool instance containing the function declaration.
        """
        json_schema = self._response_schema.model_json_schema()
        parameters = {
            "type": "object",
            "properties": json_schema.get("properties", {}),
            "required": json_schema.get("required", []),
        }
        return types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name=self.function_name,
                    description=self.function_description,
                    parameters=parameters,
                )
            ]
        )
    
    def _generate(self) -> types.GenerateContentResponse:
        """Generate content from the GenAI model.
        
        Sends the prompt to the GenAI model with the function definition
        and returns the generated response.
        
        Returns:
            The GenerateContentResponse from the GenAI model.
        """
        return self.container.gen_client.models.generate_content(
            model=self.container.get_config_property("GEMINI_SEARCH_MODEL"),
            contents=[types.Part.from_text(text=self.prompt)],
            config=types.GenerateContentConfig(tools=[self._generate_definition()]),
        )

    def _handle(self) -> CommandResults:
        """Process the concrete logic of the GenAI output.
        
        Override this method to implement the main business logic for
        processing the GenAI output and returning command results.
        
        Returns:
            CommandResults containing the result of processing the GenAI output.
        """
        pass
    
    def _post_process(self):
        """Callback to handle anything after handle is called.
        
        Override this method to further process the results from handle,
        such as additional data transformation or cleanup operations.
        """
        pass
    
    def execute(self) -> CommandResults:
        """Execute the GenAI command.
        
        This is the main entry point for executing the command. It performs
        validation, pre-processing, content generation, handling, and
        post-processing.
        
        Returns:
            CommandResults containing the result of the command execution,
            including data, success status, and any error messages.
        """
        if not self.parameters.validate():
            self.container.logger.info("validate failed")
            return CommandResults(None, "Parameter validation failed.", False)
        try:
            self._pre_process()
            self.container.logger.info("trying to generate")
            self._output = self._generate()
            self.container.logger.info(f"raw out: {self._output}")
            self._results = self._handle()
            self._post_process()
            return self._results
        except Exception as e:
            self.container.logger.error(F"Command exception: {e}")
            return CommandResults(None, f"Command failed execution: {e}", False)
        