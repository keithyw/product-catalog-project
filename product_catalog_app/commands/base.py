from abc import ABC, abstractmethod
from containers.base import AbstractContainer
from .params import CommandParameterInterface
from .results import CommandResults

class AbstractCommand(ABC):
    """Abstract base class for commands.
    
    Provides the framework for executing commands, including validation
    and execution flow. Subclasses must implement the handle method to
    define specific command behavior.
    """
    def __init__(self, container: AbstractContainer, params: CommandParameterInterface):
        """Initialize the command.
        
        Args:
            container: The dependency injection container providing services.
            params: Parameters for the command.
        """
        self._container = container
        self._parameters = params
        
    @property
    def container(self):
        """Get the dependency injection container.
        
        Returns:
            The AbstractContainer instance providing services.
        """
        return self._container
    
    @property
    def parameters(self) -> CommandParameterInterface:
        """Get the command parameters.
        
        Returns:
            The CommandParameterInterface instance containing command parameters.
        """
        return self._parameters
    
    @abstractmethod
    def handle(self) -> CommandResults:
        """Process the concrete logic for the command.
        
        This method contains the main business logic for the command.
        Subclasses must implement this method to define specific behavior.
        
        Returns:
            CommandResults containing the result of the command execution.
        """
        pass

    def validate(self, params: dict) -> bool:
        """Validate command parameters.
        
        User should override this method to implement custom validation logic.
        The default implementation returns True.
        
        Args:
            params: Dictionary containing parameters to validate.
            
        Returns:
            True if validation passes, False otherwise.
        """
        return True
    
    # thinking of changing the params to an object. That way
    # the responsibility of the validation will be handled on the object itself
    def execute(self) -> CommandResults:
        """Execute the command.
        
        This is the main entry point for executing the command. It performs
        parameter validation and then calls the handle method to process
        the command logic.
        
        Returns:
            CommandResults containing the result of the command execution,
            including data, success status, and any error messages.
        """
        if not self.parameters.validate():
            return CommandResults(None, "Parameter validation failed.", False)
        results = self.handle()
        # may need post processing of the results
        # so keeping this until we figure out additional steps
        return results
        
        
        