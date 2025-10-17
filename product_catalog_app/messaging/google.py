import json
from typing import Dict, Any
from .base import AbstractMessenger
from google.cloud import pubsub_v1
from django.conf import settings

class GooglePubSubClient(AbstractMessenger):
    _instance = None
    _publisher = None
    _subscriber = None
    _project_id = None
    
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(GooglePubSubClient, cls).__new__(cls)
            cls._publisher = pubsub_v1.PublisherClient()
            cls._subscriber = pubsub_v1.SubscriberClient()
            cls._project_id = getattr(settings, 'PUBSUB_PROJECT_ID', '')
            if not cls._project_id:
                raise ValueError('PUBSUB_PROJECT_ID environmental variable is not set')
        return cls._instance
    
    def get_project(self):
        return self._project_id
    
    def get_subscriber(self):
        return self._subscriber
    
    def publish(self, topic: str, data: Dict[str, Any]):
        topic_path = self._publisher.topic_path(self._project_id, topic)
        send = json.dumps(data).encode('utf-8')
        self._publisher.publish(topic_path, data=send)
        
    def subscribe(self, subscription_id: str, callback):
        path = self._subscriber.subscription_path(self._project_id, subscription_id)
        return self._subscriber.subscribe(path, callback=callback)
        
        
