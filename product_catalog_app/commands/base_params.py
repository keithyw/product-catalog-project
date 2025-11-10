from abc import ABC, abstractmethod
from typing import TypeVar
from .params import CommandParameterInterface

T = TypeVar('T')

class AbstractCommandParameters(ABC, CommandParameterInterface):
    """Abstract base class for command parameters.
    
    Provides a base implementation for parameters used in commands,
    including validation and data access methods.
    """

    def __init__(self, params: dict):
        """Initialize command parameters.
        
        Args:
            params: Dictionary containing parameters for the command.
        """
        self._params = params
        
    @property
    def data(self) -> dict:
        """Get the parameters dictionary.
        
        Returns:
            Dictionary containing the command parameters.
        """
        return self._params

    def validate(self) -> bool:
        """Validate that all required parameters are set.
        
        Default implementation returns True since the command object will
        always call validate. Override this method in subclasses to implement
        custom validation logic.
        
        Returns:
            True if validation passes, False otherwise.
        """
        return True

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