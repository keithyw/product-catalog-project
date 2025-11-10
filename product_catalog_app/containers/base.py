import logging
from abc import ABC, abstractmethod
from google.genai import Client
from pubsub.base import AbstractPubSubClient

class AbstractContainer(ABC):
    """Abstract base class for application containers.

    This class defines the interface and basic structure for dependency
    injection containers used throughout the application. Concrete subclasses
    should implement initialization, configuration, and dependency management
    methods as defined here.

    Example:
        class MyContainer(AbstractContainer):
            def initialize(self):
                # custom setup

            def config(self):
                return my_config

        container = MyContainer.get_instance()
    
    """
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
        """Retrieves the singleton instance of the container.

        Ensures only one instance of the container exists. If the instance does not exist,
        it will be created upon the first call.

        Returns:
            AbstractContainer: The singleton instance of the container.

        Example:
            container = MyContainer.get_instance()
        """
        if not hasattr(cls, '_instance'):
            print("creating new instance")
            cls._instance = cls()
        return cls._instance
    
    @abstractmethod
    def config(self):
        """Returns the configuration details for the container.

        This method should be implemented by subclasses to provide the
        configuration object or dictionary that represents the application's
        runtime or environment settings.

        Returns:
            Any: The configuration object or data structure used by the container.

        Raises:
            NotImplementedError: If not implemented by a subclass.
        """
        pass
    
    @property
    def gen_client(self) -> Client:
        """Gets the generator client associated with this container.

        Returns:
            Client: The generator client instance used by the container.
        """
        return self._gen_client

    @property
    def logger(self):
        """Gets the logger for this container.

        Returns:
            logging.Logger: The logger instance used by the container.
        """
        return self._logger
    
    @property
    def models(self):
        """Gets the registered models associated with this container.

        Returns:
            dict: A dictionary of registered model instances.
        """
        return self._models
    
    @property
    def pubsub_client(self) -> AbstractPubSubClient:
        """Gets the pub/sub client associated with this container.

        Returns:
            AbstractPubSubClient: The pub/sub client instance used by the container.
        """
        return self._pubsub_client
    
    @abstractmethod
    def get_config_property(self, property):
        """Extracts a specific property from the container's configuration.

        This method should be implemented by subclasses to define how a particular
        property is retrieved from the configuration object or structure.

        Args:
            property (str): The name or key of the configuration property to retrieve.

        Returns:
            Any: The value of the requested configuration property.

        Raises:
            NotImplementedError: If not implemented by a subclass.
        """
        pass
    
    def get_model(self, model):
        """Retrieves a model from the container's registered models.

        Args:
            model (str): The name of the model to retrieve.

        Returns:
            Any: The model instance corresponding to the given name.

        Raises:
            ValueError: If the specified model is not found in the container.
        """
        if not self._models[model]:
            raise ValueError(f"{model} is not found")
        return self._models[model]