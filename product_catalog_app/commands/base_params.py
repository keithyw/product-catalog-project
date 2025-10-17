from abc import ABC, abstractmethod
from typing import TypeVar
from .params import CommandParameterInterface

T = TypeVar('T')

class AbstractCommandParameters(ABC, CommandParameterInterface):

    def __init__(self, params: dict):
        self._params = params
        
    @property
    def data(self) -> dict:
        return self._params

    def validate(self) -> bool:
        """Default this to true since the command object will always call validate"""
        return True

    def get_value(self, key: str, default: T = None) -> T:
        if not self._params[key]:
            raise ValueError(f"{key} is not set")
        return self._params[key]

    def set_value(self, key: str, val: T) -> None:
        self._params[key] = val