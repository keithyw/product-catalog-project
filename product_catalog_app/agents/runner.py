from google.adk.agents import Agent
from google.adk.runners import Runner
from google.genai import types
from .session_manager import AgentSessionManager

class RunnerService:
    def __init__(self, agent: Agent, app_name: str, user_id: str, manager: AgentSessionManager):
        self._agent = agent
        self._app_name = app_name
        self._manager = manager
        self._user_id = user_id
        self._runner = Runner(
            agent=agent,
            app_name=app_name,
            session_service=manager.session_service,
        )

    @property
    def runner(self):
        return self._runner
    
    async def run(self, message: types.Content) -> str | None:
        if not self._manager.session_id:
            raise ValueError("Session id not set and/or AgentSessionManager has not started via start_session()")
        res = None
        async for e in self._runner.run_async(
            user_id=self._user_id,
            session_id=self._manager.session_id,
            new_message=message
        ):
            if e.is_final_response() and e.content and e.content.parts:
                res = e.content.parts[0].text
                break
        return res

            
    