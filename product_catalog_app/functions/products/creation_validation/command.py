from asgiref.sync import sync_to_async
import json
from django.forms.models import model_to_dict
from google.genai import types
from pydantic import BaseModel
from product_catalog_app.commands.base_agent import AbstractAgentCommand
from product_catalog_app.commands.results import CommandResults
from .search_tool import create_search_tool
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
        self._tools = [create_search_tool()]
        self._prompt_template = 'verification_agent.txt'
        model = self.container.get_model('product')
        self.internal_data['model'] = model
        product = await sync_to_async(
            lambda: model.objects.get(pk=self.parameters.get_value('product_id'))
        )()
        self._prompt_data = { "product": product }
        self._internal_data['product'] = product
        
    async def _handle(self) -> CommandResults:
        discrepancies = self._parsed_output.get('discrepancies', [])
        if len(discrepancies) > 0 and 'product_id' in self._parsed_output:
            return CommandResults(self._parsed_output)
        elif 'product_id' in self._parsed_output and self._parsed_output['verification_status'] == 'PASS':
            return CommandResults({}, '', True)
        return CommandResults({}, f"AI Parsing failed. Raw: {self._output}", False)

    async def _post_process(self):
        if self._results.success and not self._results.errors:
            product = self._internal_data['product']
            if 'discrepancies' in self._results.data:                
                product.suggested_corrections = self._results.data['discrepancies']
                product.verification_status = 'FAILED'
            else:
                product.verification_status = 'VERIFIED'
            await sync_to_async(lambda: product.save())()
            self._internal_data['product'] = product