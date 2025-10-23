from product_catalog_app.commands.genai_params import AbstractGenAICommandParameters

class GenerateDescriptionParams(AbstractGenAICommandParameters):
    def validate_params(self) -> bool:
        if not self.get_value("product"):
            return False
        return super().validate_params()
