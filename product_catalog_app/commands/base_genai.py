from abc import ABC, abstractmethod
from pydantic import BaseModel
from google.genai import types
from containers.base import AbstractContainer
from core.utils.prompt_render import render
from .params import GenAICommandParameterInterface
from .results import CommandResults

class AbstractGenAICommand(ABC):
    def __init__(self, container: AbstractContainer, params: GenAICommandParameterInterface):
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
        return self._container

    @property
    def internal_data(self):
        return self._internal_data

    @property
    def parameters(self):
        return self._params

    @property
    @abstractmethod
    def prompt(self) -> str:
        """Allows the class to determine how the prompt is generated
           whether from a user or a template
        """
        pass

    @property
    @abstractmethod
    def function_name(self) -> str:
        """overload the genai function name"""
        pass

    @property
    @abstractmethod
    def function_description(self) -> str:
        """overload the genai function description"""
        pass

    def _generate_prompt(self) -> str:
        """user might override this version and call super() if they
           need further processing on the prompt data aspect.
           Might eventually require some sort of override flag
           so the genai can bypass this
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
        """Callback the occurs before handle logic runs"""
        """Load data, set it to the internal data from params"""
        pass

    @property
    @abstractmethod
    def _response_schema(self) -> type[BaseModel]:
        """The Pydantic response schema for the gen ai"""
        pass
    
    @property
    def _function_call(self) -> types.FunctionCall:
        if not self._output:
            raise ValueError("Output not generated")
        function_call = self._output.candidates[0].content.parts[0].function_call
        if not function_call:
            raise ValueError("function call not returned")
        return function_call

    def _generate_definition(self) -> types.Tool:
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
        """generates the content from a model"""
        return self.container.gen_client.models.generate_content(
            model=self.container.get_config_property("GEMINI_SEARCH_MODEL"),
            contents=[types.Part.from_text(text=self.prompt)],
            config=types.GenerateContentConfig(tools=[self._generate_definition()]),
        )

    def _handle(self) -> CommandResults:
        """Concrete logic of the processing of genai output"""
        pass
    
    def _post_process(self):
        """Callback to handle anything after handle is called"""
        """Further process the results from handle"""
        pass
    
    def execute(self) -> CommandResults:
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
        