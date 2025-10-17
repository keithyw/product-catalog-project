from abc import ABC, abstractmethod
from typing import TypeVar
from .params import AgentCommandParameterInterface

T = TypeVar('T')

class AbstractAgentCommandParameters(ABC, AgentCommandParameterInterface):
    
    def __init__(self, agent_name: str, description: str, user_id: str, params: dict):
        self._agent_name = agent_name
        self._description = description
        self._user_id = user_id
        self._params = params

    @property
    def agent_name(self) -> str:
        return self._agent_name

    @property
    def description(self) -> str:
        return self._description

    @property
    def user_id(self) -> str:
        return self._user_id

    @property
    def data(self) -> dict:
        return self._params    

    def validate_params(self) -> bool:
        """Custom validator that should be overloaded. Otherwise, we
           just default to true

        Returns:
            bool:
        """
        return True

    def validate(self) -> bool:
        if not self.agent_name:
            return False
        if not self.user_id:
            return False
        return self.validate_params()

    def get_value(self, key: str, default: T = None) -> T:
        if not self._params[key]:
            raise ValueError(f"{key} is not set")
        return self._params[key]

    def set_value(self, key: str, val: T) -> None:
        self._params[key] = val