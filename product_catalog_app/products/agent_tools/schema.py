from pydantic import BaseModel, Field
from typing import List

class Category(BaseModel):
    id: int
    name: str
    
class ProductType(BaseModel):
    id: int
    name: str
    
class ClassificationData(BaseModel):
    categories: List[Category] = Field(
        description="List of available subcategories from the product catalog",
    )
    product_types: List[ProductType] = Field(
        description="List of available product types that are missing a category and require one from either the existing subcategories or is provided a new suggested one",
    )