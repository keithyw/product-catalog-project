import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Type, Any, Union, Dict

class BaseProductSchema(BaseModel):
    """Product Definition"""
    name: str = Field(description="The product name")
    description: Optional[str] = Field(default=None, description="An optional official product description")
    brand: Optional[str] = Field(default=None, description="An optional brand associated with the product")
    
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
    name = re.sub(r'[\W-]+', '_', code)
    name = name.strip('_')
    return name.lower() if name else 'dynamic_attr'

def build_json_schema_for_attributes(product_type: str, attributes: list) -> tuple[dict, list]:
    """
    Builds JSON schema properties and required fields list for attributes.
    This mimics your working services.py logic.
    """
    properties = {}
    required_fields = []
    
    for attr in attributes:
        field_key = sanitize_code(getattr(attr, 'code', attr.name))
        
        if attr.is_required:
            required_fields.append(field_key)
        
        property_schema = {
            "description": f"{attr.name} for {product_type}",
        }
        
        if attr.type in ['text', 'textarea', 'json']:
            property_schema["type"] = "string"
            if attr.sample_values:
                property_schema["description"] += f" for example: {attr.sample_values}"
            if 'min_length' in attr.validation_rules:
                property_schema["minLength"] = attr.validation_rules['min_length']
            if 'max_length' in attr.validation_rules:
                property_schema["maxLength"] = attr.validation_rules['max_length']
            if 'pattern' in attr.validation_rules:
                property_schema["pattern"] = attr.validation_rules['pattern']
                
        elif attr.type == 'number':
            property_schema["type"] = "number"
            if attr.sample_values:
                property_schema["description"] += f" for example: {attr.sample_values}"
            if "min" in attr.validation_rules:
                property_schema["minimum"] = attr.validation_rules["min"]
            if "max" in attr.validation_rules:
                property_schema["maximum"] = attr.validation_rules["max"]
                
        elif attr.type == 'boolean':
            property_schema["type"] = "boolean"
            
        elif attr.type == 'select' and attr.options:
            property_schema['type'] = 'string'
            property_schema['enum'] = [o['value'] for o in attr.options]
            
        elif attr.type == 'multiselect' and attr.options:
            property_schema['type'] = 'array'
            property_schema['items'] = {
                'type': 'string',
                'enum': [o['value'] for o in attr.options]
            }
            
        elif attr.type == 'date':
            property_schema["type"] = "string"
            property_schema["format"] = "date"
            
        elif attr.type == 'datetime':
            property_schema["type"] = "string"
            property_schema["format"] = "date-time"
        
        properties[field_key] = property_schema
    
    return properties, required_fields

def create_product_schema(product_type: str, attributes: list) -> Type[BaseModel]:
    """
    Creates a Pydantic model with Dict[str, Any] for attributes,
    and overrides model_json_schema() to return the manually built JSON schema.
    This ensures the agent receives a clean, parseable schema.
    """
    
    # Build the JSON schema using your proven working logic
    attr_properties, required_fields = build_json_schema_for_attributes(product_type, attributes)
    
    # Store these for use in the custom json schema method
    class ProductSchema(BaseProductSchema):
        attributes: Dict[str, Any] = Field(
            description=f'Container for {product_type} attributes'
        )
        
        @classmethod
        def model_json_schema(cls, **kwargs):
            """Override to return the manually constructed JSON schema"""
            return {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The product name",
                    },
                    "description": {
                        "type": "string",
                        "description": "An optional product description",
                    },
                    "brand": {
                        "type": "string",
                        "description": "An optional product brand",
                    },
                    "attributes": {
                        "type": "object",
                        "properties": attr_properties,
                        "required": required_fields,
                    },
                },
                "required": ["name", "attributes"],
            }
    
    return ProductSchema