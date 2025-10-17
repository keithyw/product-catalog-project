import base64
import functions_framework
import json
from cloudevents.http import CloudEvent
from product_catalog_app.containers.django_container import DjangoContainer

container = DjangoContainer.get_instance()

@functions_framework.cloud_event
def process(cloud_event: CloudEvent) -> None:
    print("inside of process")
    try:
        print("trying to get cloud event")
        print(f"data: {cloud_event.data}")
        message_data = cloud_event.data.get("data", {}).get("message", {})
        m = message_data.get("data", "")
        if not m:
            raise ValueError("Received empty message")
        decoded_message = json.loads(base64.b64decode(m).decode("utf-8"))
        set_id = decoded_message.get("set_id")
        if not set_id:
            raise ValueError("set_id was not set")
        print(f"set_id {set_id}")
        
        try:
            ProductAttributeSet = container.get_model('product_attribute_set')
            Product = container.get_model('product')
            attribute_set = ProductAttributeSet.objects.get(pk=set_id)
            attributes = {attr.code: attr.default_value for attr in attribute_set.attributes.all()}
        except ProductAttributeSet.DoesNotExist:
            print(f"Product attribute set does not exist for {set_id}")
            return {"error": f"Product attribute set does not exist for {set_id}"}, 500
        
        products = Product.objects.filter(attribute_set=attribute_set)
        if not products.exists:
            print(f"No products found for {set_id}")
            return {"error": f"No products found for {set_id}"}
        for p in products:
            print("getting product attribute keys")
            product_attributes = p.attributes_data.keys() if hasattr(p.attributes_data ,'keys') else []
            print("calculating remove_attributes")
            remove_attributes = set(product_attributes) - set(attributes.keys())
            for k in remove_attributes:
                print(f"trying to pop {k} attribute")
                p.attributes_data.pop(k)
            print("updating new attributes")
            p.attributes_data.update(attributes)
            print("trying to save new updated product")
            p.save()
            print(f"Updated attributes for product: {p.name}")
        print(f"Processed products for set_id: {set_id}")
    except Exception as e:
        print(f"Error processing message: {e}")
        return {"error": str(e)}, 500