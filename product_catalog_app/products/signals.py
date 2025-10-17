from messaging.constants import PRODUCT_ATTRIBUTES_SET_UPDATES_TOPIC
from messaging.factory import get_messenger
from .models import ProductAttributeSet

messenger = get_messenger()

def attribute_set_updated(sender, instance: ProductAttributeSet, created, **kwargs):
    if not created:
        message = {
            "set_id": str(instance.pk),
            "type": "update",
            "message": "Product attribute set updated",
        }
        messenger.publish(PRODUCT_ATTRIBUTES_SET_UPDATES_TOPIC, data=message)