from product_catalog_app.commands.agent_params import AbstractAgentCommandParameters

class GenerateProductFromImageParams(AbstractAgentCommandParameters):
    def validate_params(self):
        if not self.get_value("image"):
            return False
        if not self.get_value("product_type"):
            return False
        return super().validate_params()