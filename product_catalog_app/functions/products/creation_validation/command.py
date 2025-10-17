from asgiref.sync import sync_to_async
import json
from django.forms.models import model_to_dict
from google.genai import types
from pydantic import BaseModel
from product_catalog_app.commands.base_agent import AbstractAgentCommand
from product_catalog_app.commands.results import CommandResults
from .schema import VerificationSchema

class AgentValidationCommand(AbstractAgentCommand):
    def _generate_session_key(self) -> str:
        return f"create_product_{self._internal_data['product'].id}"
    
    def _get_input_content(self) -> types.Content:
        product = model_to_dict(self._internal_data['product'])
        return types.Content(role='user', parts=[types.Part(text=json.dumps(product))])

    def _get_schema(self) -> BaseModel:
        return VerificationSchema
    
    async def _pre_process(self):
        self._prompt_template = 'verification_agent.txt'
        model = self.container.get_model('product')
        product_id = self.parameters.get_value('product_id')
        self.container.logger.info(f"from _preprocess: {product_id}")
        product = await sync_to_async(
            lambda: model.objects.get(pk=self.parameters.get_value('product_id'))
        )()
        self._prompt_data = { "product": product }
        self._internal_data = { "product": product }
        
    async def _handle(self) -> CommandResults:
        if 'discrepancies' in self._parsed_output and 'product_id' in self._parsed_output:
            # don't do anything further for now
            return CommandResults(self._parsed_output)
        return CommandResults(None, f"AI Parsing failed. Raw: {self._output}", False)