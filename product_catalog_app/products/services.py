import logging
from django.conf import settings
from google.genai import types
from ai_tools.client import GeminiAIClient
from .models import ProductAttributeSet

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class ProductAIGenerationServiceError(Exception):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}

class ProductAIGenerationService:
    def __init__(self):
        logger.info("Initializing ProductAIGenerationService")
        self.client = GeminiAIClient.get_client()
        self.model_name = getattr(settings, 'GEMINI_MODEL')
        self.product_attribute_set = None
        
    def _load_product_attribute_set(self, name):
        set = ProductAttributeSet.objects.filter(name=name).first()
        if not set:
            raise ProductAIGenerationServiceError(f"Product attribute set '{name}' not found.")
        self.product_attribute_set = set
        
    def _generate_definition(self, product_type, product_attributes):
        logger.info(f"Generating AI tool definition for product type: {product_type}")
        # attributes = {
            # "type": "object",
            # "description": "A list of product attributes",
            # "description": f"Product attributes for {product_type}, each with a set of properties",
        # }
        attributes = {}
        required_fields = []

        for attr in product_attributes.all():
            if attr.is_required:
                required_fields.append(attr.name)
                
            property = {
                "description": f"{attr.name} for {product_type}",
            }
            
            if attr.type == 'text' or attr.type == 'textarea' or attr.type == 'json':
                property["type"] = "string"
                if attr.sample_values:
                    property["description"] += f" for example: {attr.sample_values}"
                    # property["enum"] = [s.strip() for s in attr.sample_values.split(',')]
                if 'min_length' in attr.validation_rules:
                    property["minLength"] = attr.validation_rules['min_length']
                if 'max_length' in attr.validation_rules:
                    property["maxLength"] = attr.validation_rules['max_length']
                if 'pattern' in attr.validation_rules:
                    property["pattern"] = attr.validation_rules['pattern']

            elif attr.type == 'number':
                property["type"] = "number"
                if attr.sample_values:
                    property["description"] += f" for example: {attr.sample_values}"
                if "min" in attr.validation_rules:
                    property["minimum"] = attr.validation_rules["min"]
                if "max" in attr.validation_rules:
                    property["maximum"] = attr.validation_rules["max"]

            elif attr.type == 'boolean':
                property["type"] = "boolean"
                
            elif attr.type == 'select' and attr.options:
                property['type'] = 'string'
                property['enum'] = [o.value for o in attr.options]

            elif attr.type == 'multi_select' and attr.options:
                property['type'] = 'array'
                property['items'] = {
                    'type': 'string',
                    'enum': [o.value for o in attr.options]
                }

            elif attr.type == 'date':
                property["type"] = "string"
                property["format"] = "date"

            elif attr.type == 'datetime':
                property["type"] = "string"
                property["format"] = "date-time"
                
            attributes[attr.name] = property
            
        schema = {
            "type": "object",
            "properties": {
                "products": {
                    "type": "array",
                    "description": f"A list of product objects for {product_type} type, which requires and can have an optional description. In addition, each product object can have a set of attributes",
                    "items": {
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
                            "attributes": {
                                "type": "object",
                                # "description": "A list of product attributes",
                                "properties": attributes,
                                "required": required_fields,
                            },
                        }
                    }
                    
                }
            },
            "required": ["products"],
        }
        
        logger.info(f"Generated schema for {product_type}: {schema}")
        
        return types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="suggest_products_for_review",
                    description=f"Suggest products for {product_type} for user review. Use this when the user asks to generate products of a specific type.",
                    parameters=schema,
                )
            ]
        )
        
    def _clean_attribute_keys(self, products):
        for p in products:
            if 'attributes' in p:
                new_attributes = {}
                for key, val in p['attributes'].items():
                    cleaned_key = key.replace('___', ' - ')
                    cleaned_key = cleaned_key.replace('_', ' ')
                    new_attributes[cleaned_key] = val
                p['attributes'] = new_attributes
        return products

    def generate(self, prompt: str, product_type:str) -> dict:
        self._load_product_attribute_set(product_type)
        tool_object = self._generate_definition(product_type, self.product_attribute_set.attributes)
        
        try:
            res = self.client.models.generate_content(
                model=self.model_name,
                contents=[types.Part.from_text(text=prompt)],
                config=types.GenerateContentConfig(tools=[tool_object]),
            )
            
            function_calls = []
            
            logger.info(f"AI generation response: {res}")
            if res.candidates and res.candidates[0].content and res.candidates[0].content.parts:
                logger.info("Processing AI response parts")
                for part in res.candidates[0].content.parts:
                    logger.info(f"Processing part: {part}")
                    if part.function_call:
                        logger.info(f"Found function call: {part.function_call}")
                        function_calls.append(part.function_call)
                        
            if not function_calls:
                text_res = res.text if res.text else "No text response from AI"
                raise ProductAIGenerationServiceError(
                    message=f"AI could not generate structured data. It responded with {text_res}",
                    details={"ai_response_text": text_res},
                )
                
            tool_call = function_calls[0]
            logger.info(f"Found tool call: {tool_call}")
            logger.info("trying to get the expected name")
            expected_name = tool_object.function_declarations[0].name
            logger.info(f"Expected name {expected_name}")
            logger.info(f"Tool call name: {tool_call.name}")            
            if tool_call.name != expected_name:
                raise ProductAIGenerationServiceError(
                    message=f"Function call name mismatch: expected {expected_name}, got {tool_call.name}",
                    details={"called_tool": tool_call.name, "expected_tool": expected_name},
                )
                
            logger.info("trying to get content")
            content = tool_call.args.get('products')
            logger.info(f"AI generated for {product_type}: {content}")
            content = self._clean_attribute_keys(content)
            return {
                "product_type": product_type,
                "data": content,
            }

        except Exception as e:
            raise ProductAIGenerationServiceError(
                message=f"An error occurred while generating content: {str(e)}",
                details={"original_error": str(e), "product_type": product_type},
            )