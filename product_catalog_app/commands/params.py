from typing import Protocol, TypeVar, Generic

T = TypeVar('T')

class CommandParameterInterface(Protocol):
    
    @property
    def data(self) -> dict:
        ...
        
    def validate(self) -> bool:
        ...
        
    def get_value(self, key: str, default: T = None) -> T:
        ...
        
    def set_value(self, key: str, val: T) -> None:
        ...
        
class AgentCommandParameterInterface(CommandParameterInterface):

    @property
    def agent_name(self) -> str:
        ...

    @property
    def description(self) -> str:
        ...

    @property
    def user_id(self) -> str:
        ...