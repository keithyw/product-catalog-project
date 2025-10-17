from django.apps import AppConfig
from django.db.models.signals import post_save
class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'products'

    def ready(self):
        from .models import ProductAttributeSet
        from .signals import attribute_set_updated

        post_save.connect(
            receiver=attribute_set_updated,
            sender=ProductAttributeSet
        )