from pydantic import BaseModel, Field
from typing import List

class BrandExistenceBatchInput(BaseModel):
    """Input for checking multiple brand names against the internal system in one call."""
    brands: List[str] = Field(description="A list of potential brand names discovered externally.")

class BrandExistenceBatchOutput(BaseModel):
    """Result of the batched existence check, showing which brands are missing."""
    missing_brands: List[str] = Field(description="A filtered list of brands that are NOT found in the internal database (i.e., the gaps).")
    existing_brands: List[str] = Field(description="A list of names that ARE already in the internal database.")