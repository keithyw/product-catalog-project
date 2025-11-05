from product_catalog_app.commands.agent_params import AbstractAgentCommandParameters

class ProductValidationAgentParams(AbstractAgentCommandParameters):
    def validate_params(self) -> bool:
        if 'product_id' not in self.data:
            return False
        return True