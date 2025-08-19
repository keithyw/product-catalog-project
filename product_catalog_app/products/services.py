import logging
import json
import re
from django.conf import settings
from google.genai import types
from ai_tools.client import GeminiAIClient
from brands.models import Brand
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
        self.brands = None
        
    def _load_brands(self):
        brands = Brand.objects.all()
        self.brands = brands

    def _load_product_attribute_set(self, name):
        set = ProductAttributeSet.objects.filter(name=name).first()
        if not set:
            raise ProductAIGenerationServiceError(f"Product attribute set '{name}' not found.")
        self.product_attribute_set = set

    def _get_top_five_attributes(self, product_attributes: list) -> list:
        ordered_attributes = sorted(
            [attr for attr in product_attributes if attr.display_order is not None],
            key=lambda x: x.display_order
        )
        unordered_attributes = sorted(
            [attr for attr in product_attributes if attr.display_order is None],
            key=lambda x: x.name
        )

        top_five = ordered_attributes[:5]
        remaining_slots = 5 - len (top_five)

        if remaining_slots > 0:
            top_five.extend(unordered_attributes[:remaining_slots])

        return top_five

    def _generate_definition(self, product_type, product_attributes):
        logger.info(f"Generating AI tool definition for product type: {product_type}")
        attributes = {}
        required_fields = []
        unique_brands = [
            b.name for b in self.brands if b.id in self.product_attribute_set.product_type_brands.values_list('id', flat=True)
        ]
        product_type_brands = list(set(unique_brands))
        gen_attributes = self._get_top_five_attributes(product_attributes.all())

        for attr in gen_attributes:
            if attr.is_required:
                required_fields.append(attr.name)
                
            property = {
                "description": f"{attr.name} for {product_type}",
            }
            
            if attr.type == 'text' or attr.type == 'textarea' or attr.type == 'json':
                property["type"] = "string"
                if attr.sample_values:
                    property["description"] += f" for example: {attr.sample_values}"
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
                property['enum'] = [o['value'] for o in attr.options]

            elif attr.type == 'multiselect' and attr.options:
                property['type'] = 'array'
                property['items'] = {
                    'type': 'string',
                    'enum': [o['value'] for o in attr.options]
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
                            "brand": {
                                "type": "string",
                                "description": "An optional product brand from the list of available brands.",
                                "enum": product_type_brands,
                            },
                            "attributes": {
                                "type": "object",
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

    def generate(self, prompt: str, product_type: str) -> dict:
        self._load_brands()
        self._load_product_attribute_set(product_type)
        tool_object = self._generate_definition(product_type, self.product_attribute_set.attributes)
        try:
            res = self.client.models.generate_content(
                model=self.model_name,
                contents=[types.Part.from_text(text=prompt)],
                config=types.GenerateContentConfig(tools=[tool_object]),
            )
            function_calls = res.candidates[0].content.parts[0].function_call
            if function_calls:
                logger.info(f"Found tool call: {function_calls}")
                logger.info("Trying to get the expected name")
                expected_name = tool_object.function_declarations[0].name
                logger.info(f"Expected name {expected_name}")
                logger.info(f"Tool call name: {function_calls.name}")
                if function_calls.name != expected_name:
                    raise ProductAIGenerationServiceError(
                        message=f"Function call name mismatch: expected {expected_name}, got {function_calls.name}",
                        details={"called_tool": function_calls.name, "expected_tool": expected_name},
                    )

                logger.info("Trying to get content from function call")
                content = function_calls.args.get('products')
            else:
                text_res = res.candidates[0].content.parts[0].text
                logger.info("No function call found. Checking for text response.")
                if not text_res:
                    raise ProductAIGenerationServiceError(
                        message="AI could not generate structured data. It returned no content.",
                        details={"ai_response_text": text_res},
                    )

                logger.info(f"Found text response. Trying to extract JSON: {text_res[:100]}...")
                json_match = re.search(r'```json\n(.*?)\n```', text_res, re.DOTALL)
                if not json_match:
                    raise ProductAIGenerationServiceError(
                        message="AI response did not contain a valid JSON object.",
                        details={"ai_response_text": text_res},
                    )
                json_content = json_match.group(1).strip()
                try:
                    content = json.loads(json_content)
                    logger.info("Successfully parsed JSON from text response.")
                except json.JSONDecodeError as e:
                    raise ProductAIGenerationServiceError(
                        message=f"Failed to decode JSON from AI response: {str(e)}",
                        details={"json_content": json_content, "original_error": str(e)},
                    )
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