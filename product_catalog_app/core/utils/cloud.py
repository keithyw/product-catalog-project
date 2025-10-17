import base64
import json
import requests

def decode_message(cloud_event: dict) -> dict:
    msg = cloud_event.data.get("data", {}).get("message", {})
    m = msg.get("data", "")
    if not m:
        raise ValueError("Received empty message data")
    return json.loads(base64.b64decode(m).decode("utf-8"))

# replicates the header expected by cloud function spec
def make_cloud_header(payload: dict) -> dict:
    return {
        'Content-Type': 'application/json',
        'ce-specversion': payload['specversion'],
        'ce-type': payload['type'],
        'ce-source': payload['source'],
        'ce-id': payload['id'],
    }
    
# generates the payload expected for a cloud message
def make_cloud_payload(message, project_id: str, topic_id: str) -> dict:
    return {
        "specversion": "1.0",
        "type": "google.cloud.pubsub.topic.v1.messagePublished",
        "source": f"//pubsub.googleapis.com/projects/{project_id}/topics/{topic_id}",
        "id": message.message_id,
        "time": message.publish_time.isoformat(),
        "data": {
            "message": {
                "data": base64.b64encode(message.data).decode("utf-8"),
                "attributes": dict(message.attributes),
                "messageId": message.message_id,
                "publishTime": message.publish_time.isoformat()
            },
        },
    }
    
def forward_message(params: dict):
    print(f"got message {params}")
    message = params['message']
    project_id = params['project_id']
    topic_id = params['topic_id']
    url = params['url']
    target = params['target']
    payload = make_cloud_payload(message, project_id, topic_id)
    headers = make_cloud_header(payload)
    res = requests.post(
        f"{url}/{target}",
        json=payload,
        headers=headers,
    )
    res.raise_for_status()
    # will remove later
    print(f"Message forwarded to {url}/{target}")