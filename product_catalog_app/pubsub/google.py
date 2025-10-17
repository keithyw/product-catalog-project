import json
from typing import Dict, Any
from google.api_core.exceptions import AlreadyExists, NotFound
from google.cloud import pubsub_v1
from .base import AbstractPubSubClient

class GooglePubSubClient(AbstractPubSubClient):
    def initialize(self):
        self._publisher = pubsub_v1.PublisherClient()
        self._subscriber = pubsub_v1.SubscriberClient()

    def publish(self, topic: str, data: Dict[str, Any]):
        return self.publisher.publish(
            self.publisher.topic_path(self.project_id, topic),
            data=json.dumps(data).encode('utf-8')
        )

    def subscribe(self, subscription_id: str, callback):        
        return self.subscriber.subscribe(
            self.subscriber.subscription_path(self.project_id, subscription_id),
            callback=callback
        )
        
    def create_subscription(self, topic_id: str, subscription_id: str):
        try:
            self.subscriber.create_subscription(
                request={
                    "name": self.subscriber.subscription_path(
                        self.project_id, 
                        subscription_id
                    ),
                    "topic": self.publisher.topic_path(self.project_id, topic_id)
                }
            )
        except AlreadyExists:
            raise ValueError(f"Subscription {subscription_id} already exists")
        
    def get_subscription(self, subscription_id: str):
        try:
            return self.subscriber.get_subscription(
                request={
                    "subscription": self.subscriber.subscription_path(
                        self.project_id, 
                        subscription_id
                    ),
                },
            )
        except NotFound:
            return None

    def create_topic(self, topic_id: str):
        topic_path = self.publisher.topic_path(self.project_id, topic_id)
        try:
            self.publisher.create_topic(request={"name": topic_path})
        except AlreadyExists:
            raise ValueError(f"Topic {topic_id} already exists")

    def get_topic(self, topic_id: str):
        try:
            topic_path = self.publisher.topic_path(self.project_id, topic_id)
            return self.publisher.get_topic(request={"topic": topic_path})
        except NotFound:
            return None

        