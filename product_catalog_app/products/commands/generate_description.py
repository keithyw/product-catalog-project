from product_catalog_app.commands.base_genai import AbstractGenAICommand
from product_catalog_app.commands.results import CommandResults
from product_catalog_app.products.schema import ProductDescriptionSchema

class GenerateDescriptionCommand(AbstractGenAICommand):
    
    @property
    def function_name(self) -> str:
        return "suggest_product_description"
    
    @property
    def function_description(self) -> str:
        return "Suggest a production description based on an official description, the attributes and/or enhancing the existing description"

    @property
    def _response_schema(self) -> type[ProductDescriptionSchema]:
        return ProductDescriptionSchema
    
    @property
    def prompt(self) -> str:
        self._prompt_template = 'generate_product_description.txt'
        self._prompt_data['product'] = self.parameters.get_value("product")
        return self._generate_prompt()

    def _handle(self) -> CommandResults:
        try:
            description = self._function_call.args.get('description')
            return CommandResults({"description": description})
        except Exception as e:
            return CommandResults(None, f"Function parsing failed: {e}", False)