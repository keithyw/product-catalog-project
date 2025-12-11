from asgiref.sync import sync_to_async
from pydantic import BaseModel, Field
from typing import List
from google.genai import types
from product_catalog_app.agent_tools.search_tool import create_search_tool
from product_catalog_app.commands.base_agent import AbstractAgentCommand
from product_catalog_app.commands.results import CommandResults
from product_catalog_app.brands.agent_tools.check_existence import create_brand_check_tool

class BrandDetails(BaseModel):
    """Brand model schema"""
    name: str = Field(description="The brand name")
    description: str = Field(description="Contains info about the product line for the brand")
    logo_url: str = Field(description="The official logo image URL. If not use a substitute if a brand no longer exist. Should be properly formatted as a URL with https:// prefix")
    website_url: str = Field(description="The official homepage URL. If the brand no longer exist, use a wikipedia entry URL. Should be properly formatted as a URL with https:// prefix")

class BrandCheckOutput(BaseModel):
    brands: List[BrandDetails] = Field(description="A list of brand names that are missing from the system")
    summary: str = Field(description="A brief summary of the external search results.")

class BrandCheckCommand(AbstractAgentCommand):

    def _generate_session_key(self) -> str:
        return f"brand_check_{self.internal_data['category']}"

    def _get_input_content(self) -> types.Content:
        # return types.Content(role='user', parts=[types.Part(text=json.dumps(product))])
        return types.Content(role='user', parts=[types.Part(text=f"Generate and validate a brand names for the '{self._prompt_data['category'].name}' category.")])

    def _get_schema(self) -> BaseModel:
        return BrandCheckOutput

    async def _pre_process(self):
        self._internal_data['category'] = await sync_to_async(
            lambda: self.container.get_model('category').objects.get(pk=self.parameters.get_value('category_id'))
        )()
        self._internal_data['product_type'] = await sync_to_async(
            lambda: self.container.get_model('product_attribute_set').objects.get(pk=self.parameters.get_value('product_attribute_set_id'))
        )()
        self._prompt_template = 'brand_check.txt'
        # being super lazy lulz
        self._prompt_data = self._internal_data
        self._tools = [create_brand_check_tool(), create_search_tool()]
        
    async def _handle(self) -> CommandResults:
        if self._parsed_output:
            return CommandResults(self._parsed_output['brands'], None, True)
        return CommandResults(None, "No output from agent", False)
        
    