import os
import json
from google.api_core.exceptions import AlreadyExists
from google.cloud import pubsub_v1
from product_catalog_app.containers.django_container import DjangoContainer

container = DjangoContainer.get_instance()

script_dir = os.path.dirname(os.path.abspath(__file__))
filepath = os.path.join(script_dir, 'pubsub_config.json')
with open(filepath, 'r') as f:
    config = json.load(f)
    
emulator_host = container.get_config_property('PUBSUB_EMULATOR_HOST')
if not emulator_host:
    raise ValueError('PUBSUB_EMULATOR_HOST environmental variable is not set')

project_id = container.get_config_property('PUBSUB_PROJECT_ID')
if not project_id:
    raise ValueError('PUBSUB_PROJECT_ID environmental variable is not set')

def setup():
    print("--- Setting up resources for PubSub ---")
    topics = config.get("topics", [])
    for t in topics:
        topic_id = t.get('topic_id')
        subscriptions = t.get('subscriptions', [])
        
        if not topic_id:
            print("Warning topic entry has no topic_id")
            continue
        
        try:
            container.pubsub_client.create_topic(topic_id)
            print(f"Topic '{topic_id}' created")
        except AlreadyExists:
            print(f"Topic '{topic_id}' already exists")
            
        for sub_id in subscriptions:
            try:
                container.pubsub_client.create_subscription(topic_id, sub_id)
                print(f"Subscription '{sub_id}' created")
            except AlreadyExists:
                print(f"Subscription '{sub_id}' already exists")
    print("--- Setup Complete for PubSub ---")
    
if __name__ == "__main__":
    setup()