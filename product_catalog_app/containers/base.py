import logging
from abc import ABC, abstractmethod
from pubsub.base import AbstractPubSubClient

class AbstractContainer(ABC):
    def __init__(self):
        """Base set of available fields"""

        print("init container")
        self._gen_client = None
        self._pubsub_client = None
        self._models = {}
        self.initialize()
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
            datefmt='%m-%d %H:%M',
            filename=self.get_config_property('LOGFILE'),
            filemode='w',
        )
        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        self._logger = logging.getLogger(__name__)
        self._logger.addHandler(console)

    @abstractmethod
    def initialize(self):
        """Additional initialization done by the concrete implementation"""
        pass
    
    @classmethod
    def get_instance(cls):
        """Returns the singleton instance of the container."""
        if not hasattr(cls, '_instance'):
            print("creating new instance")
            cls._instance = cls()
        return cls._instance
    
    @abstractmethod
    def config(self):
        pass
    
    @property
    def gen_client(self):
        return self._gen_client

    @property
    def logger(self):
        return self._logger
    
    @property
    def models(self):
        return self._models
    
    @property
    def pubsub_client(self) -> AbstractPubSubClient:
        return self._pubsub_client
    
    @abstractmethod
    def get_config_property(self, property):
        """Handles the way a property is extracted from the config"""
        pass
    
    def get_model(self, model):
        if not self._models[model]:
            raise ValueError(f"{model} is not found")
        return self._models[model]