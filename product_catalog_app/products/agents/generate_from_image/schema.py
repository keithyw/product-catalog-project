import re
from pydantic import create_model, BaseModel, Field
from typing import Optional, List, Type, Any, Union

class BaseProductSchema(BaseModel):
    """Product Definition"""
    name: str = Field(description="The product name")
    description: Optional[str] = Field(description="An optional official product description")
    brand: Optional[str] = Field(description="An optional brand associated with the product")
    
TYPE_MAP = {
    "text": str,
    "textarea": str,
    "json": str,
    "number": Union[int, float],
    "boolean": bool,
    "select": str,
    "multiselect": List[str],
    "date": str,
    "datetime": str,
}

def sanitize_code(code: str) -> str:
    """Converts a code (e.g., 'lego-set-piece-count') to a clean Python field name (e.g., 'lego_set_piece_count')."""
    # Replace hyphens/spaces/non-alphanumeric with a single underscore
    name = re.sub(r'[\W-]+', '_', code)
    # Remove leading/trailing underscores
    name = name.strip('_')
    return name.lower() if name else 'dynamic_attr'
    
def create_product_schema(product_type: str, attributes: list) -> Type[BaseModel]:
    dynamic_fields = {}
    for attr in attributes:
        # clean_name = sanitize_code(attr.code) if hasattr(attr, 'code') and attr.code else sanitize_code(attr.name)
        field_key = sanitize_code(getattr(attr, 'code', attr.name))
        type = TYPE_MAP.get(attr.type, str)
        description = f"Value for the attribute '{attr.name}' (Code: '{getattr(attr, 'code', 'N/A')}') for {product_type}"
        if attr.sample_values:
            description += f" (e.g., {attr.sample_values})"
        default_value: Any = ...
        if not attr.is_required:
            type = Optional[type]
            default_value = None
            
        field_kwargs = { "description": description }
        if attr.type in ['text', 'textarea', 'json']:
            if 'min_length' in attr.validation_rules:
                field_kwargs['min_length'] = attr.validation_rules['min_length']
            if 'max_length' in attr.validation_rules:
                field_kwargs['max_length'] = attr.validation_rules['max_length']
            if 'pattern' in attr.validation_rules:
                field_kwargs['pattern'] = attr.validation_rules['pattern']
        elif attr.type in ['number']:
            if "min" in attr.validation_rules:
                field_kwargs['ge'] = attr.validation_rules["min"]
            if "max" in attr.validation_rules:
                field_kwargs['le'] = attr.validation_rules["max"]
        elif attr.type == 'select' and attr.options:
            enum_values = [o['value'] for o in attr.options]
            field_kwargs['json_schema_extra'] = {'enum': enum_values}
        elif attr.type == 'multiselect' and attr.options:
            enum_values = [o['value'] for o in attr.options]
            field_kwargs['json_schema_extra'] = {
                'items': {'type': 'string', 'enum': enum_values}
            }
        
        if field_kwargs:
            dynamic_fields[field_key] = (type, Field(default=default_value, **field_kwargs))
        else:
            dynamic_fields[field_key] = (type, default_value)
    

    # AttributeSchema = create_model(
    #     'DynAttributeSchema',
    #     __base__=BaseModel,
    #     **dynamic_fields,
    # )

    # return create_model(
    #     'ProductSchema',
    #     __base__=BaseProductSchema,
    #     attributes=(
    #         AttributeSchema,
    #         Field(description='A container for required dynamic product attributes.')
    #     )
    # )