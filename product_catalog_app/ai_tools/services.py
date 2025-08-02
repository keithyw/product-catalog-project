import logging
from django.conf import settings
from google.genai import types
from .client import GeminiAIClient
from .tool_definitions import AI_TOOLS_REGISTRY, TOOL_DATA_KEY_MAP

logger = logging.getLogger(__name__)

class AIGenerationError(Exception):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}
        
class AIGeneratorService:
    def __init__(self):
        self.client = GeminiAIClient.get_client()
        self.model_name = getattr(settings, 'GEMINI_MODEL')
        
    def generate(self, prompt: str, entity_type: str) -> dict:
        tool_object = AI_TOOLS_REGISTRY.get(entity_type)
        if not tool_object:
            raise AIGenerationError(
                message=f"No AI tool defined for {entity_type}",
                details={"entity_type": entity_type},
            )
        
        try:
            res = self.client.models.generate_content(
                model=self.model_name,
                contents=[types.Part.from_text(text=prompt)],
                config=types.GenerateContentConfig(tools=[tool_object]),
            )

            function_calls = []
            if res.candidates and res.candidates[0].content and res.candidates[0].content.parts:
                for part in res.candidates[0].content.parts:
                    if part.function_call:
                        function_calls.append(part.function_call)
            
            if not function_calls:
                text_res = res.text if res.text else "No text response from AI"
                raise AIGenerationError(
                    message=f"AI could not generate structured data. It responded with {text_res}",
                    details={"ai_response_text": text_res},
                )
                
            tool_call = function_calls[0]
            expected_name = tool_object.function_declarations[0].name
            if tool_call.name != expected_name:
                raise AIGenerationError(
                    message=f"AI called unexpected tool: {tool_call.name} instead of {expected_name}",
                    details={"called_tool": tool_call.name, "expected_tool": expected_name},
                )
                
            data_key = TOOL_DATA_KEY_MAP.get(tool_call.name)
            if not data_key or data_key not in tool_call.args:
                raise AIGenerationError(
                    message=f"AI tool call for {tool_call.name} missing expected key {data_key}",
                    details={"tool_args": tool_call.args, "expected_data_key": data_key},
                )
                
            content = tool_call.args.get(data_key)
            logger.info(f"AI generated for {entity_type}: {content}")
            return {
                "entity_type": entity_type,
                "data": content,
            }

        except Exception as e:
            logger.exception(f"An unexpected error occurred during generation for {entity_type}")
            raise AIGenerationError(
                message=f"An unexpected error occurred during generation: {str(e)}",
                details={"original_error": str(e), "entity_type": entity_type},
            )