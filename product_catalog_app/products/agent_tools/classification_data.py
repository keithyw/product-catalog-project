from asgiref.sync import sync_to_async
from google.adk.tools import FunctionTool, BaseTool
from product_catalog_app.containers.django_container import DjangoContainer
from .schema import Category, ClassificationData, ProductType

def _get_childless_subcategories():
    model = DjangoContainer.get_instance().get_model('category')
    categories = model.objects.filter(
        numchild=0
    ).values('id', 'name', 'parent_id')
    return list(categories)

def _get_types_without_categories():
    model = DjangoContainer.get_instance().get_model('product_attribute_set')
    types = model.objects.filter(
        category=None
    ).values('id', 'name')
    return list(types)

async def fetch_categories_and_types():
    categories = await sync_to_async(_get_childless_subcategories)()
    types = await sync_to_async(_get_types_without_categories)()
    
    return ClassificationData(
        categories=[Category(**c) for c in categories],
        product_types=[ProductType(**p) for p in types],
    )

def retrieve_categories_and_types_tool() -> BaseTool:
    """Retrieves existing subcategories and product types that have no categories"""
    return FunctionTool(
        func=fetch_categories_and_types,
    )