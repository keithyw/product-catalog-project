from product_catalog_app.commands.agent_params import AbstractAgentCommandParameters

class BrandCheckAgentParams(AbstractAgentCommandParameters):
    def validate_params(self) -> bool:
        if 'category' not in self.data:
            return False
        if 'product_type' not in self.data:
            return False
        return True