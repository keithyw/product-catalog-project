import asyncio
import functions_framework
from cloudevents.http import CloudEvent
from product_catalog_app.commands.results import CommandResults
from product_catalog_app.containers.django_container import DjangoContainer
from product_catalog_app.core.utils.cloud import decode_message
from .command import AgentValidationCommand
from .params import ProductValidationAgentParams

container = DjangoContainer.get_instance()

@functions_framework.cloud_event
def process(cloud_event: CloudEvent) -> None:
    id = decode_message(cloud_event).get("product_id")
    cmd = AgentValidationCommand(
        container,
        ProductValidationAgentParams(
            agent_name='product_creation_verification_agent',
            description='Expert agent for verifying data fields against external sources.',
            user_id='product_creation_user',
            params={ "product_id": int(id) },
        )
    )
    try:
        results: CommandResults = asyncio.run(cmd.execute())
    except Exception as e:
        container.logger.info(f"execute failed: {e}")