import os
import logging
from django.conf import settings
from google.genai import Client, types

logger = logging.getLogger(__name__)

class GeminiAIClient:
    _client = None
    
    @classmethod
    def get_client(cls):
        if cls._client is None:
            api_key = getattr(settings, 'GEMINI_API_KEY', '')
            if not api_key:
                logger.error("GEMINI_API_KEY is not configured in settings")
            api_version = getattr(settings, 'GEMINI_API_VERSION')
            logging.info(f"api_key {api_key} version {api_version}")
            cls._client = Client(
                api_key=api_key,
                http_options=types.HttpOptions(api_version=api_version),
            )
            logger.info(f"Gemini AI Client initialized with API version: {api_version}")
        return cls._client