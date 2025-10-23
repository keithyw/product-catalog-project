from pydantic import BaseModel, Field

class ProductDescriptionSchema(BaseModel):
    """A product description generated from the gen AI"""
    description: str = Field(
        ...,
        description="A description of the product that is the official description, one generated from the given product values or enhances a previous one"
    )