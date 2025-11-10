from typing import Protocol, TypeVar, Generic

T = TypeVar('T')

class CommandParameterInterface(Protocol):
    """Protocol interface for command parameters.
    
    Defines the interface that all command parameter classes must implement,
    including data access, validation, and value getter/setter methods.
    """
    
    @property
    def data(self) -> dict:
        """Get the parameters dictionary.
        
        Returns:
            Dictionary containing the command parameters.
        """
        ...
        
    def validate(self) -> bool:
        """Validate that all required parameters are set.
        
        Returns:
            True if validation passes, False otherwise.
        """
        ...
        
    def get_value(self, key: str, default: T = None) -> T:
        """Get a parameter value by key.
        
        Args:
            key: The parameter key to retrieve.
            default: Optional default value to return if key is not set.
            
        Returns:
            The value associated with the key, or default if provided.
        """
        ...
        
    def set_value(self, key: str, val: T) -> None:
        """Set a parameter value by key.
        
        Args:
            key: The parameter key to set.
            val: The value to associate with the key.
        """
        ...
        
class AgentCommandParameterInterface(CommandParameterInterface):
    """Protocol interface for agent command parameters.
    
    Extends CommandParameterInterface with agent-specific properties
    including agent name, description, and user ID.
    """

    @property
    def agent_name(self) -> str:
        """Get the agent name.
        
        Returns:
            The name of the agent to be used.
        """
        ...

    @property
    def description(self) -> str:
        """Get the agent description.
        
        Returns:
            Description of the agent's purpose.
        """
        ...

    @property
    def user_id(self) -> str:
        """Get the user ID.
        
        Returns:
            The identifier of the user executing the command.
        """
        ...

class GenAICommandParameterInterface(CommandParameterInterface):
    """Protocol interface for GenAI command parameters.
    
    Extends CommandParameterInterface with GenAI-specific properties
    including the prompt string.
    """

    @property
    def prompt(self) -> str:
        """Get the prompt string.
        
        Returns:
            The prompt string to send to the GenAI model.
        """
        ...