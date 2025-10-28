from google.adk.agents import Agent
from pydantic import BaseModel
from typing import Optional #
from containers.django_container import DjangoContainer

def create_agent(name: str, description: str, prompt: str, schema: Optional[BaseModel], tools: list):
    """Wrapper function/factory around the Google ADK"""
    container = DjangoContainer.get_instance()
    kwargs = {}
    if schema is not None:
        kwargs['output_schema'] = schema

    return Agent(
        name=name,
        model=container.get_config_property("GEMINI_SEARCH_MODEL"),
        description=description,
        instruction=prompt,
        tools=tools,
        **kwargs,
    )