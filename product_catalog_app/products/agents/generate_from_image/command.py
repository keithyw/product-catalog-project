import magic
from asgiref.sync import sync_to_async
from pydantic import BaseModel
from google.adk.artifacts import InMemoryArtifactService
from google.genai import types
from product_catalog_app.agent_tools.search_tool import create_search_tool
from product_catalog_app.commands.base_agent import AbstractAgentCommand
from product_catalog_app.commands.results import CommandResults
# from .schema import create_product_schema
from .product_schema import create_product_schema

class GenerateProductFromImageCommand(AbstractAgentCommand):
    
    def _generate_session_key(self) -> str:
        return f"generate_product_from_image_{self.internal_data['product_type'].id}"
    
    def _get_input_content(self) -> types.Content:
        # would like to eventually convert this into
        # a reusable function
        image_bytes = self._internal_data['image'].read()
        mime_type = magic.from_buffer(image_bytes, mime=True)
        inline_image = types.Part(
            inline_data=types.Blob(
                data=image_bytes,
                mime_type=mime_type,
            )
        )
        return types.Content(role='user', parts=[inline_image])
    
    def _get_schema(self) -> BaseModel:
        return create_product_schema(self._internal_data['product_type'].name, self._internal_data['attributes'])

    async def _pre_process(self):
        self._tools = [create_search_tool()]
        # there's got to be a better way to handle the part below
        self._artifact_service = InMemoryArtifactService()
        self._disallow_transfer = True
        self._internal_data['image'] = self.parameters.get_value('image')
        self._prompt_template = 'generate_product_from_image.txt'
        self._internal_data['product_type'] = await sync_to_async(
            lambda: self.container.
                get_model('product_attribute_set').objects.filter(name=self.parameters.get_value('product_type')).first()
        )()
        self.container.logger.info(f"product type {self._internal_data['product_type'].name}")
        # self._internal_data['attributes'] = self._internal_data['product_type'].attributes.all()
        self._internal_data['attributes'] = await sync_to_async(
            lambda: list(self._internal_data['product_type'].attributes.all())
        )()
        self._prompt_data['product_type'] = self._internal_data['product_type']
        self._prompt_data['attributes'] = self._internal_data['attributes']
        
    async def _handle(self) -> CommandResults:
        return CommandResults(self._parsed_output)