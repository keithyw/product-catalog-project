import os
import json
import sys
import django
from google.api_core.exceptions import AlreadyExists
from google.cloud import pubsub_v1

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

if project_root not in sys.path:
    sys.path.insert(0, project_root)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'product_catalog_app.settings')
django.setup()

from django.conf import settings

script_dir = os.path.dirname(os.path.abspath(__file__))
filepath = os.path.join(script_dir, 'pubsub_config.json')
with open(filepath, 'r') as f:
    config = json.load(f)
    
emulator_host = getattr(settings, 'PUBSUB_EMULATOR_HOST', '')
if not emulator_host:
    raise ValueError('PUBSUB_EMULATOR_HOST environmental variable is not set')

project_id = getattr(settings, 'PUBSUB_PROJECT_ID', '')
if not project_id:
    raise ValueError('PUBSUB_PROJECT_ID environmental variable is not set')

publisher = pubsub_v1.PublisherClient()
subscriber = pubsub_v1.SubscriberClient()

def setup():
    print("--- Setting up resources for PubSub ---")
    topics = config.get("topics", [])
    for t in topics:
        topic_id = t.get('topic_id')
        subscriptions = t.get('subscriptions', [])
        
        if not topic_id:
            print("Warning topic entry has no topic_id")
            continue
        
        topic_path = publisher.topic_path(project_id, topic_id)
        try:
            publisher.create_topic(request={"name": topic_path})
            print(f"Topic '{topic_id}' created")
        except AlreadyExists:
            print(f"Topic '{topic_id}' already exists")
            
        for sub_id in subscriptions:
            sub_path = subscriber.subscription_path(project_id, sub_id)
            try:
                subscriber.create_subscription(
                    request={"name": sub_path, "topic": topic_path}                    
                )
                print(f"Subscription '{sub_id}' created")
            except AlreadyExists:
                print(f"Subscription '{sub_id}' already exists")
    print("--- Setup Complete for PubSub ---")
    
if __name__ == "__main__":
    setup()