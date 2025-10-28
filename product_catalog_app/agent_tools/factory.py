from google.adk.tools import AgentTool, BaseTool
from product_catalog_app.agents.factory import create_agent
from product_catalog_app.core.utils.prompt_render import render

def create_tool(name: str, description: str, template: str, params: dict, tools: list[BaseTool]) -> BaseTool:
    prompt = render(template, params)
    agent = create_agent(
        name,
        description,
        prompt,
        None,
        tools,
    )
    return AgentTool(
        agent=agent,
    )