from google.adk.tools import BaseTool, google_search
from .factory import create_tool

def create_search_tool() -> BaseTool:
    return create_tool(
        'google_product_search_agent',
        'searches for a product using google',
        'google_search_worker_instructions.txt',
        {},
        [google_search],
    )