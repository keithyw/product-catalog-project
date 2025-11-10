import pytest
from unittest.mock import Mock, patch
import logging
from google.genai import Client
from containers.base import AbstractContainer
from pubsub.base import AbstractPubSubClient


class ConcreteContainer(AbstractContainer):
    """Concrete implementation of AbstractContainer for testing purposes."""
    
    def __init__(self, mock_config=None, mock_gen_client=None, mock_pubsub_client=None):
        """Initialize the concrete container with mocked dependencies.
        
        Args:
            mock_config: Mock configuration object.
            mock_gen_client: Mock generator client.
            mock_pubsub_client: Mock pubsub client.
        """
        self._mock_config = mock_config or {}
        self._mock_gen_client = mock_gen_client
        self._mock_pubsub_client = mock_pubsub_client
        super().__init__()
    
    def initialize(self):
        """Initialize the concrete container."""
        if self._mock_gen_client is not None:
            self._gen_client = self._mock_gen_client
        if self._mock_pubsub_client is not None:
            self._pubsub_client = self._mock_pubsub_client
        self._models = {'test_model': Mock()}
    
    def config(self):
        """Return the mock configuration.
        
        Returns:
            dict: The mock configuration object.
        """
        return self._mock_config
    
    def get_config_property(self, property):
        """Get a configuration property from the mock config.
        
        Args:
            property (str): The name of the configuration property.
            
        Returns:
            Any: The value of the configuration property.
        """
        return self._mock_config.get(property, 'test_logfile.log')


@pytest.fixture(autouse=True)
def clear_singleton_instance():
    """Clear the singleton instance before and after each test to ensure isolation."""
    # Clear before test
    if hasattr(ConcreteContainer, '_instance'):
        delattr(ConcreteContainer, '_instance')
    yield
    # Clear after test
    if hasattr(ConcreteContainer, '_instance'):
        delattr(ConcreteContainer, '_instance')


class TestAbstractContainerSingleton:
    """Test cases for the singleton pattern of AbstractContainer."""
    
    def test_get_instance_creates_new_instance_on_first_call(self):
        """Test that get_instance creates a new instance on first call."""
        with patch('containers.base.logging.basicConfig'):
            with patch('containers.base.logging.getLogger') as mock_get_logger:
                mock_logger = Mock()
                mock_get_logger.return_value = mock_logger
                
                instance = ConcreteContainer.get_instance()
                
                assert instance is not None
                assert isinstance(instance, ConcreteContainer)
    
    def test_get_instance_returns_same_instance_on_subsequent_calls(self):
        """Test that get_instance returns the same instance on subsequent calls."""
        with patch('containers.base.logging.basicConfig'):
            with patch('containers.base.logging.getLogger') as mock_get_logger:
                mock_logger = Mock()
                mock_get_logger.return_value = mock_logger
                
                instance1 = ConcreteContainer.get_instance()
                instance2 = ConcreteContainer.get_instance()
                instance3 = ConcreteContainer.get_instance()
                
                assert instance1 is instance2
                assert instance2 is instance3
                assert instance1 is instance3
    
    def test_get_instance_preserves_instance_across_multiple_calls(self):
        """Test that the singleton instance is preserved across multiple calls."""
        with patch('containers.base.logging.basicConfig'):
            with patch('containers.base.logging.getLogger') as mock_get_logger:
                mock_logger = Mock()
                mock_get_logger.return_value = mock_logger
                
                instance1 = ConcreteContainer.get_instance()
                # Modify the instance
                instance1._models['new_model'] = Mock()
                
                instance2 = ConcreteContainer.get_instance()
                
                # Verify the modification is preserved
                assert 'new_model' in instance2._models
                assert instance1 is instance2


class TestAbstractContainerProperties:
    """Test cases for the properties of AbstractContainer."""
    
    @pytest.fixture
    def mock_gen_client(self):
        """Create a mock generator client."""
        return Mock(spec=Client)
    
    @pytest.fixture
    def mock_pubsub_client(self):
        """Create a mock pubsub client."""
        return Mock(spec=AbstractPubSubClient)
    
    @pytest.fixture
    def mock_config(self):
        """Create a mock configuration."""
        return {'LOGFILE': 'test.log'}
    
    @pytest.fixture
    def container(self, mock_config, mock_gen_client, mock_pubsub_client):
        """Create a container instance for testing."""
        with patch('containers.base.logging.basicConfig'):
            with patch('containers.base.logging.getLogger') as mock_get_logger:
                mock_logger = Mock()
                mock_get_logger.return_value = mock_logger
                
                container = ConcreteContainer(
                    mock_config=mock_config,
                    mock_gen_client=mock_gen_client,
                    mock_pubsub_client=mock_pubsub_client
                )
                return container
    
    def test_gen_client_property_returns_expected_value(self, container, mock_gen_client):
        """Test that gen_client property returns the expected generator client."""
        assert container.gen_client is mock_gen_client
    
    def test_gen_client_property_returns_none_when_not_set(self):
        """Test that gen_client property returns None when not set."""
        with patch('containers.base.logging.basicConfig'):
            with patch('containers.base.logging.getLogger') as mock_get_logger:
                mock_logger = Mock()
                mock_get_logger.return_value = mock_logger
                
                container = ConcreteContainer(mock_config={'LOGFILE': 'test.log'})
                assert container.gen_client is None
    
    def test_logger_property_returns_logger_instance(self, container):
        """Test that logger property returns a logger instance."""
        assert container.logger is not None
        assert isinstance(container.logger, (logging.Logger, Mock))
    
    def test_models_property_returns_models_dictionary(self, container):
        """Test that models property returns the models dictionary."""
        assert container.models is not None
        assert isinstance(container.models, dict)
        assert 'test_model' in container.models
    
    def test_models_property_returns_empty_dict_when_no_models(self):
        """Test that models property returns empty dict when no models are set."""
        class EmptyContainer(ConcreteContainer):
            def initialize(self):
                pass
        
        with patch('containers.base.logging.basicConfig'):
            with patch('containers.base.logging.getLogger') as mock_get_logger:
                mock_logger = Mock()
                mock_get_logger.return_value = mock_logger
                
                container = EmptyContainer(mock_config={'LOGFILE': 'test.log'})
                assert container.models == {}
    
    def test_pubsub_client_property_returns_expected_value(self, container, mock_pubsub_client):
        """Test that pubsub_client property returns the expected pubsub client."""
        assert container.pubsub_client is mock_pubsub_client
    
    def test_pubsub_client_property_returns_none_when_not_set(self):
        """Test that pubsub_client property returns None when not set."""
        with patch('containers.base.logging.basicConfig'):
            with patch('containers.base.logging.getLogger') as mock_get_logger:
                mock_logger = Mock()
                mock_get_logger.return_value = mock_logger
                
                container = ConcreteContainer(mock_config={'LOGFILE': 'test.log'})
                assert container.pubsub_client is None


class TestAbstractContainerGetModel:
    """Test cases for the get_model method of AbstractContainer."""
    
    @pytest.fixture
    def container(self):
        """Create a container instance for testing."""
        with patch('containers.base.logging.basicConfig'):
            with patch('containers.base.logging.getLogger') as mock_get_logger:
                mock_logger = Mock()
                mock_get_logger.return_value = mock_logger
                
                container = ConcreteContainer(mock_config={'LOGFILE': 'test.log'})
                return container
    
    def test_get_model_returns_existing_model(self, container):
        """Test that get_model returns an existing model from the models dictionary."""
        model = container.get_model('test_model')
        assert model is not None
        assert model == container._models['test_model']
    
    def test_get_model_raises_key_error_for_nonexistent_model(self, container):
        """Test that get_model raises KeyError for a model that doesn't exist."""
        with pytest.raises(KeyError):
            container.get_model('nonexistent_model')
    
    def test_get_model_raises_value_error_for_none_value(self, container):
        """Test that get_model raises ValueError when model value is None."""
        container._models['none_model'] = None
        
        with pytest.raises(ValueError) as exc_info:
            container.get_model('none_model')
        
        assert "none_model is not found" in str(exc_info.value)
    
    def test_get_model_raises_value_error_for_falsy_value(self, container):
        """Test that get_model raises ValueError when model value is falsy (empty string)."""
        container._models['empty_model'] = ''
        
        with pytest.raises(ValueError) as exc_info:
            container.get_model('empty_model')
        
        assert "empty_model is not found" in str(exc_info.value)
    
    def test_get_model_returns_model_with_multiple_models_registered(self, container):
        """Test that get_model works correctly when multiple models are registered."""
        mock_model1 = Mock()
        mock_model2 = Mock()
        container._models['model1'] = mock_model1
        container._models['model2'] = mock_model2
        
        retrieved_model1 = container.get_model('model1')
        retrieved_model2 = container.get_model('model2')
        retrieved_test_model = container.get_model('test_model')
        
        assert retrieved_model1 is mock_model1
        assert retrieved_model2 is mock_model2
        assert retrieved_test_model is not None


class TestAbstractContainerInitialization:
    """Test cases for the initialization of AbstractContainer."""
    
    def test_initialize_is_called_during_construction(self):
        """Test that initialize is called during container construction."""
        with patch('containers.base.logging.basicConfig'):
            with patch('containers.base.logging.getLogger') as mock_get_logger:
                mock_logger = Mock()
                mock_get_logger.return_value = mock_logger
                
                container = ConcreteContainer(mock_config={'LOGFILE': 'test.log'})
                
                # Verify that initialize was called by checking if models were set
                assert 'test_model' in container._models
    
    def test_container_initializes_with_default_values(self):
        """Test that container initializes with default None values for clients."""
        class MinimalContainer(ConcreteContainer):
            def initialize(self):
                pass
        
        with patch('containers.base.logging.basicConfig'):
            with patch('containers.base.logging.getLogger') as mock_get_logger:
                mock_logger = Mock()
                mock_get_logger.return_value = mock_logger
                
                container = MinimalContainer(mock_config={'LOGFILE': 'test.log'})
                
                assert container._gen_client is None
                assert container._pubsub_client is None
                assert container._models == {}
    
    def test_container_logging_is_configured_during_initialization(self):
        """Test that logging is configured during container initialization."""
        with patch('containers.base.logging.basicConfig') as mock_basic_config:
            with patch('containers.base.logging.getLogger') as mock_get_logger:
                mock_logger = Mock()
                mock_get_logger.return_value = mock_logger
                
                container = ConcreteContainer(mock_config={'LOGFILE': 'test.log'})
                
                # Verify that basicConfig was called
                mock_basic_config.assert_called_once()
                # Verify that getLogger was called
                mock_get_logger.assert_called()
                # Verify that logger has a handler added
                assert mock_logger.addHandler.called

