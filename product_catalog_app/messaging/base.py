from abc import ABC, abstractmethod
from typing import Dict, Any

class AbstractMessenger(ABC):
    @abstractmethod
    def publish(self, topic: str, data: Dict[str, Any]):
        pass

    @abstractmethod
    def subscribe(self, subscription_id: str, callback):
        pass