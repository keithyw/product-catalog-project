from google.adk.agents import Agent
from pydantic import BaseModel
from containers.django_container import DjangoContainer

def create_agent(name: str, description: str, prompt: str, schema: BaseModel):
    """Wrapper function/factory around the Google ADK"""
    container = DjangoContainer.get_instance()
    return Agent(
        name=name,
        model=container.get_config_property("GEMINI_SEARCH_MODEL"),
        description=description,
        instruction=prompt,
        output_schema=schema,
    )