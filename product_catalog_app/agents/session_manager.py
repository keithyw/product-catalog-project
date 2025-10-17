import uuid
from google.adk.sessions import InMemorySessionService

class AgentSessionManager:
    """Manages the creation and state of an ADK session."""
    def __init__(self, name: str, user: str, key: str):
        self._name = name
        self._user = user
        self._key = key
        self._session_id = None
        self._session_service = InMemorySessionService()

    @property
    def session_id(self) -> str:
        return self._session_id

    @property
    def session_service(self) -> InMemorySessionService:
        return self._session_service 

    def generate_session_id(self) -> str:
        """Generates a unique session ID based on UUID and input keys."""
        parts = [
            str(uuid.uuid4())[:8],
            self._name.replace(':', '_'),
            self._key.replace(':', '_'),
        ]
        self._session_id = ":".join(parts)
        return self._session_id

    async def start_session(self):
        """Initializes a new session in the SessionService."""
        # Ensure ID is generated before starting session
        if not self._session_id:
            self.generate_session_id() 
            
        await self.session_service.create_session(
            app_name=self._name,
            user_id=self._user,
            session_id=self._session_id,        
        )
        return self