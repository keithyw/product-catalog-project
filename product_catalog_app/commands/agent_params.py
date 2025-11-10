from abc import ABC, abstractmethod
from typing import TypeVar
from .params import AgentCommandParameterInterface

T = TypeVar('T')

class AbstractAgentCommandParameters(ABC, AgentCommandParameterInterface):
    """Abstract base class for agent command parameters.
    
    Provides a base implementation for parameters used in agent commands,
    including validation, data access, and property management.
    """
    
    def __init__(self, agent_name: str, description: str, user_id: str, params: dict):
        """Initialize agent command parameters.
        
        Args:
            agent_name: The name of the agent to be used.
            description: Description of the agent's purpose.
            user_id: The identifier of the user executing the command.
            params: Dictionary containing additional parameters for the command.
        """
        self._agent_name = agent_name
        self._description = description
        self._user_id = user_id
        self._params = params

    @property
    def agent_name(self) -> str:
        """Get the agent name.
        
        Returns:
            The name of the agent.
        """
        return self._agent_name

    @property
    def description(self) -> str:
        """Get the agent description.
        
        Returns:
            The description of the agent's purpose.
        """
        return self._description

    @property
    def user_id(self) -> str:
        """Get the user ID.
        
        Returns:
            The identifier of the user executing the command.
        """
        return self._user_id

    @property
    def data(self) -> dict:
        """Get the parameters dictionary.
        
        Returns:
            Dictionary containing the command parameters.
        """
        return self._params    

    def validate_params(self) -> bool:
        """Custom validator that should be overloaded. Otherwise, we
           just default to true

        Returns:
            bool:
        """
        return True

    def validate(self) -> bool:
        """Validate that all required parameters are set.
        
        Checks that agent_name and user_id are present, then calls
        validate_params() for additional custom validation.
        
        Returns:
            True if all validations pass, False otherwise.
        """
        if not self.agent_name:
            return False
        if not self.user_id:
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