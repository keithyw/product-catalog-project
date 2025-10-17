from google.genai import types
from pydantic import BaseModel, Field

VERIFICATION_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "verification_status": types.Schema(type=types.Type.STRING, description="PASS if all checked fields match external source, FAIL otherwise."),
        "product_sku_or_name": types.Schema(type=types.Type.STRING),
        "discrepancies": types.Schema(
            type=types.Type.ARRAY, 
            description="List of fields that were incorrect, showing the original value and the corrected value.",
            items=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "field": types.Schema(type=types.Type.STRING, description="The field name, e.g., part_count"),
                    "original_value": types.Schema(type=types.Type.STRING),
                    "corrected_value": types.Schema(type=types.Type.STRING),
                    "source": types.Schema(type=types.Type.STRING, description="Source of correction (e.g., official website)."),
                },
                required=["field", "original_value", "corrected_value", "source"]
            )
        )
    },
    required=["verification_status", "product_sku_or_name", "discrepancies"]
)

class Discrepancy(BaseModel):
    """Details of a single data field discrepancy."""
    field: str = Field(description="The field name, e.g., 'part_count' or 'minifigure_count'")
    original_value: str = Field(description="The incorrect value found in the internal database.")
    corrected_value: str = Field(description="The correct value found via web search.")
    source: str = Field(description="Source of correction (e.g., 'official Lego website').")

class VerificationSchema(BaseModel):
    """The structured output for the product data verification agent."""
    # Renamed from product_id to match Django model's structure if possible, using int
    product_id: int = Field(description="The unique ID of the product being verified.")
    verification_status: str = Field(description="PASS if all checked fields match external source, FAIL otherwise.")
    discrepancies: list[Discrepancy] = Field(description="List of fields that were incorrect.")    
    message: str = Field(description="A meaningful, descriptive message of what went wrong with the operation")