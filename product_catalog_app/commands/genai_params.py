from abc import ABC, abstractmethod
from typing import TypeVar
from .params import GenAICommandParameterInterface

T = TypeVar('T')

class AbstractGenAICommandParameters(ABC, GenAICommandParameterInterface):
    
    def __init__(self, prompt: str, params: dict):
        self._prompt = prompt
        self._params = params

    @property
    def prompt(self) -> str:
        return self._prompt

    @property
    def data(self) -> dict:
        return self._params    

    def validate_params(self) -> bool:
        """Make this the base case"""
        if not self.prompt:
            return False
        """Custom validator that should be overloaded. Otherwise, we
           just default to true. Inherited classes can just call super() for this
           after additional checks

        Returns:
            bool:
        """
        return True

    def validate(self) -> bool:
        if not self.prompt:
            return False
        return self.validate_params()

    def get_value(self, key: str, default: T = None) -> T:
        if not self._params[key]:
            raise ValueError(f"{key} is not set")
        return self._params[key]

    def set_value(self, key: str, val: T) -> None:
        self._params[key] = val