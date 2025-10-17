from abc import ABC, abstractmethod
from typing import Dict, Any

class AbstractPubSubClient(ABC):
    def __init__(self, container):
        self._container = container
        self._project_id = self._container.get_config_property('PUBSUB_PROJECT_ID')
        self._publisher = None
        self._subscriber = None
        self.initialize()

    # initialize publisher and subscriber in concrete class
    @abstractmethod
    def initialize(self):
        pass

    @property
    def project_id(self):
        return self._project_id

    @property
    def publisher(self):
        return self._publisher

    @property
    def subscriber(self):
        return self._subscriber

    @abstractmethod
    def publish(self, topic: str, data: Dict[str, Any]):
        pass

    @abstractmethod
    def subscribe(self, subscription_id: str, callback):
        pass

    @abstractmethod
    def create_subscription(self, topic_id: str, subscription_id: str):
        pass
    
    @abstractmethod
    def get_subscription(self, subscription_id: str):
        pass

    @abstractmethod
    def create_topic(self, topic_id: str):
        pass
    
    @abstractmethod
    def get_topic(self, topic_id: str):
        pass