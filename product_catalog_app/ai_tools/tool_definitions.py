# src/ai_tools/tool_definitions.py

# IMPORTANT: Using 'google.genai.types' as confirmed by user's successful local environment setup.
# In some environments, 'google.generativeai.types' might be used.
from google.genai import types

# --- Tool Definitions (JSON Schemas for AI Function Calling) ---

# Tool for suggesting Brand data
# This schema tells the LLM to generate a list of objects, each with 'name' and 'description' for a brand.
SUGGEST_BRANDS_TOOL = types.Tool( # Using types.Tool
    function_declarations=[
        types.FunctionDeclaration( # Using types.FunctionDeclaration
            name="suggest_brands_for_review",
            description="Suggests a list of brand names and descriptions for user review before actual creation. Use this when the user asks for brands, companies, or manufacturers.",
            parameters={
                "type": "object",
                "properties": {
                    "brands": {
                        "type": "array",
                        "description": "A list of brand objects, each requiring a name and a description.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "description": "The name of the brand. This should be unique."
                                },
                                "description": {
                                    "type": "string",
                                    "description": "A brief, concise description of the brand, its origin, or key characteristics."
                                }
                            },
                            "required": ["name", "description"] # Fields required for each individual brand object
                        }
                    }
                },
                "required": ["brands"] # The 'brands' array itself is required in the tool call arguments
            }
        )
    ]
)

# Tool for suggesting Category data
# FIX: Removed recursive $ref and definitions due to Pydantic validation issues in FunctionDeclaration.
# This schema now supports categories with one level of children.
SUGGEST_CATEGORIES_TOOL = types.Tool( # Using types.Tool
    function_declarations=[
        types.FunctionDeclaration( # Using types.FunctionDeclaration
            name="suggest_categories_for_review",
            description="Suggests a hierarchical list of categories with names and descriptions for user review before creation. This schema supports top-level categories and one level of nested children.",
            parameters={
                "type": "object",
                "properties": {
                    "categories": {
                        "type": "array",
                        "description": "A list of category objects, which can contain one level of sub-categories.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "description": "The name of the category."
                                },
                                "description": {
                                    "type": "string",
                                    "description": "A brief description of the category."
                                },
                                "children": { # Define children directly, without recursion via $ref
                                    "type": "array",
                                    "description": "Optional: Sub-categories nested directly under this category.",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "name": {
                                                "type": "string",
                                                "description": "The name of the sub-category."
                                            },
                                            "description": {
                                                "type": "string",
                                                "description": "A brief description of the sub-category."
                                            }
                                        },
                                        "required": ["name", "description"]
                                    }
                                }
                            },
                            "required": ["name", "description"]
                        }
                    }
                },
                "required": ["categories"]
            }
        )
    ]
)

# Tool for suggesting Product Attributes
# This schema is more complex, defining attributes with types and options.
SUGGEST_PRODUCT_ATTRIBUTES_TOOL = types.Tool( # Using types.Tool
    function_declarations=[
        types.FunctionDeclaration( # Using types.FunctionDeclaration
            name="suggest_product_attributes_for_review",
            description="Suggests a list of product attribute definitions suitable for a given product type (e.g., 'books', 'lingerie', 'Lego'). Includes name, code, type, and options if applicable. Use this when the user asks for product attributes, fields, or specifications.",
            parameters={
                "type": "object",
                "properties": {
                    "attributes": {
                        "type": "array",
                        "description": "A list of product attribute definitions.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string", "description": "The display name of the attribute (e.g., 'Color', 'Material')."},
                                "code": {"type": "string", "description": "A unique, machine-readable code for the attribute (e.g., 'color', 'material_type'). Use snake_case."},
                                "type": {
                                    "type": "string",
                                    "description": "The data type of the attribute.",
                                    "enum": ["text", "number", "boolean", "multiselect", "richtext", "date"] # Ensure these match your frontend types
                                },
                                "is_required": {"type": "boolean", "description": "Whether this attribute is mandatory for products."},
                                "default_value": {"type": "string", "description": "Optional default value for the attribute."},
                                "options": {
                                    "type": "array",
                                    "description": "Required for 'multiselect' type: A list of predefined options for the attribute.",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "label": {"type": "string", "description": "Display label for the option."},
                                            "value": {"type": "string", "description": "Machine-readable value for the option."}
                                        },
                                        "required": ["label", "value"]
                                    }
                                }
                            },
                            "required": ["name", "code", "type", "is_required"] # Fields required for each individual attribute definition
                        }
                    }
                },
                "required": ["attributes"] # The 'attributes' array itself is required in the tool call arguments
            }
        )
    ]
)


# --- Registry and Mappings ---

# A registry to map entity types (from frontend requests) to their corresponding AI Tool objects.
# This allows the backend to dynamically select the correct tool for the LLM based on the request.
AI_TOOLS_REGISTRY = {
    'brand': SUGGEST_BRANDS_TOOL,
    'category': SUGGEST_CATEGORIES_TOOL,
    'product_attribute': SUGGEST_PRODUCT_ATTRIBUTES_TOOL,
    # Add more mappings here as you expand to other entity types
}

# A mapping to extract the actual list of data from the LLM's tool call arguments.
# The key is the tool's function name, and the value is the key within the tool's arguments
# that holds the list of generated items (e.g., 'brands', 'categories', 'attributes').
TOOL_DATA_KEY_MAP = {
    'suggest_brands_for_review': 'brands',
    'suggest_categories_for_review': 'categories',
    'suggest_product_attributes_for_review': 'attributes',
    # Add more mappings here
}

# A mapping to determine which backend API endpoint to call for final bulk import
# after user review and approval on the frontend.
# You will need to create these bulk-create endpoints in your respective Django apps
# (e.g., 'brands', 'categories', 'product_attributes').
FINAL_IMPORT_API_MAP = {
    'brand': '/api/brands/bulk-create/',
    'category': '/api/categories/bulk-create/',
    'product_attribute': '/api/product-attributes/bulk-create/',
}
