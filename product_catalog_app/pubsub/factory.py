from containers.base import AbstractContainer
from .google import GooglePubSubClient

def get_pubsub_client(type: str, container: AbstractContainer):
    if type == "google":
        return GooglePubSubClient(container)
    else:
        raise ValueError(f"Unknown client type: {type}")