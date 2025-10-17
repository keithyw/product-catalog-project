from abc import ABC, abstractmethod
from containers.base import AbstractContainer
from .params import CommandParameterInterface
from .results import CommandResults

class AbstractCommand(ABC):
    def __init__(self, container: AbstractContainer, params: CommandParameterInterface):
        self._container = container
        self._parameters = params
        
    @property
    def container(self):
        return self._container
    
    @property
    def parameters(self) -> CommandParameterInterface:
        return self._parameters
    
    @abstractmethod
    def handle(self) -> CommandResults:
        """Concrete logic will be processed here"""
        pass

    def validate(self, params: dict) -> bool:
        """User should override this method"""
        return True
    
    # thinking of changing the params to an object. That way
    # the responsibility of the validation will be handled on the object itself
    def execute(self) -> CommandResults:
        """Dev calls this after instantiating command"""
        if not self.parameters.validate():
            return CommandResults(None, "Parameter validation failed.", False)
        results = self.handle()
        # may need post processing of the results
        # so keeping this until we figure out additional steps
        return results
        
        
        