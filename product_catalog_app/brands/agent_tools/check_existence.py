from asgiref.sync import sync_to_async
from django.db.models.functions import Lower
from google.adk.tools import FunctionTool, BaseTool
from product_catalog_app.containers.django_container import DjangoContainer
from .schema import BrandExistenceBatchInput, BrandExistenceBatchOutput

def _find_existing_brands_sync(model, names: list):
    """Performs the case-insensitive batch check synchronously using annotate."""
    existing_records = model.objects.annotate(
        name_lower_db=Lower('name')
    ).filter(
        name_lower_db__in=names
    ).values_list('name', flat=True)    
    return list(existing_records)

async def check_brand_existence(input_data: BrandExistenceBatchInput) -> BrandExistenceBatchOutput:
    """
    Checks if a given brand name already exists in the system.
    This function performs a fast database query (e.g., using your Brand model).
    """
    container = DjangoContainer.get_instance()
    model = container.get_model('brand')
    brand_names = [name.strip().lower() for name in input_data.brands]
    try:
        brands = await sync_to_async(_find_existing_brands_sync)(model, brand_names)
        brand_set = {name.strip().title() for name in brands}
        missing_brands = []
        existing_brands = []
        for name in brand_names:
            if name.strip().title() in brand_set:
                existing_brands.append(name)
            else:
                missing_brands.append(name)
        return BrandExistenceBatchOutput(
            missing_brands=missing_brands,
            existing_brands=existing_brands,
        )
    except Exception as e:
        return BrandExistenceBatchOutput(
            missing_brands=[],
            existing_brands=[],
        )

def create_brand_check_tool() -> BaseTool:
    """Creates the FunctionTool for checking brand existence."""
    return FunctionTool(
        func=check_brand_existence,
    )