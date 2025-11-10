from abc import ABC, abstractmethod
from typing import TypeVar
from .params import GenAICommandParameterInterface

T = TypeVar('T')

class AbstractGenAICommandParameters(ABC, GenAICommandParameterInterface):
    """Abstract base class for GenAI command parameters.
    
    Provides a base implementation for parameters used in GenAI commands,
    including validation, data access, and property management.
    """
    
    def __init__(self, prompt: str, params: dict):
        """Initialize GenAI command parameters.
        
        Args:
            prompt: The prompt string to send to the GenAI model.
            params: Dictionary containing additional parameters for the command.
        """
        self._prompt = prompt
        self._params = params

    @property
    def prompt(self) -> str:
        """Get the prompt string.
        
        Returns:
            The prompt string to send to the GenAI model.
        """
        return self._prompt

    @property
    def data(self) -> dict:
        """Get the parameters dictionary.
        
        Returns:
            Dictionary containing the command parameters.
        """
        return self._params    

    def validate_params(self) -> bool:
        """Validate custom parameters.
        
        Custom validator that should be overloaded in subclasses. Otherwise,
        it just defaults to true. Inherited classes can call super() for this
        base case after performing additional checks.
        
        Returns:
            True if validation passes, False otherwise.
        """
        return True

    def validate(self) -> bool:
        """Validate that all required parameters are set.
        
        Checks that prompt is present, then calls validate_params() for
        additional custom validation.
        
        Returns:
            True if all validations pass, False otherwise.
        """
        if not self.prompt:
            return False
        return self.validate_params()

    def get_value(self, key: str, default: T = None) -> T:
        """Get a parameter value by key.
        
        Args:
            key: The parameter key to retrieve.
            default: Optional default value to return if key is not set.
            
        Returns:
            The value associated with the key, or default if provided.
            
        Raises:
            ValueError: If the key is not set and no default is provided.
        """
        if not self._params[key]:
            raise ValueError(f"{key} is not set")
        return self._params[key]

    def set_value(self, key: str, val: T) -> None:
        """Set a parameter value by key.
        
        Args:
            key: The parameter key to set.
            val: The value to associate with the key.
        """
        self._params[key] = val