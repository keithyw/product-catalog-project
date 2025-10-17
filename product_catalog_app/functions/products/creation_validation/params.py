from product_catalog_app.commands.agent_params import AbstractAgentCommandParameters

class ProductValidationAgentParams(AbstractAgentCommandParameters):
    def validate_params(self) -> bool:
        if not self.data['product_id']:
            return False
        return True

