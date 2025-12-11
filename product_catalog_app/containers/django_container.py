import os
import django
import sys
from django.conf import settings as django_settings
from ai_tools.client import GeminiAIClient
from pubsub.factory import get_pubsub_client
from .base import AbstractContainer

class DjangoContainer(AbstractContainer):
    
    def initialize(self):
        if not django_settings.configured:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(script_dir)
            if project_root not in sys.path:
                sys.path.insert(0, project_root)
            os.environ.setdefault(
                "DJANGO_SETTINGS_MODULE",
                "product_catalog_app.settings",
            )
            django.setup()
        from assets.models import Asset
        from brands.models import Brand
        from categories.models import Category
        from inventory.models import InventoryItem
        from prices.models import Price, PriceModifier, PriceRule
        from products.models import Product, ProductAttribute, ProductAttributeSet
        from users.models import User
        self._gen_client = GeminiAIClient.get_client()
        self._pubsub_client = get_pubsub_client("google", self)
        self._models = {
            "asset": Asset,
            "brand": Brand,
            "category": Category,
            "inventory_item": InventoryItem,
            "price": Price,
            "price_modifier": PriceModifier,
            "price_rule": PriceRule,
            "product": Product,
            "product_attribute": ProductAttribute,
            "product_attribute_set": ProductAttributeSet,
            "user": User,
        }
            
    @property
    def config(self):
        return django_settings
    
    def get_config_property(self, property):
        v = getattr(self.config, property, '')
        if not v:
            raise ValueError(f"{property} configuration property not set")
        return v