from product_catalog_app.commands.agent_params import AbstractAgentCommandParameters

class BrandCheckAgentParams(AbstractAgentCommandParameters):
    def validate_params(self) -> bool:
        if 'category_id' not in self.data:
            return False
        if 'product_attribute_set_id' not in self.data:
            return False
        return True