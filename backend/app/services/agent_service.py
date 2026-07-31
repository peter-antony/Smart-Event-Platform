import logging
from typing import Optional, Dict, Any
from app.agents.event_agent import EventAgent

logger = logging.getLogger("agent_service")
agent_instance = EventAgent()


class AgentService:
    """
    Agent Service Layer delegating chat turns and HITL confirmation actions to the LangGraph EventAgent engine.
    """

    @staticmethod
    async def process_chat(
        message: str,
        user_id: Optional[str] = "user_default",
        conversation_id: Optional[str] = None,
        confirmation_action: Optional[str] = None
    ) -> Dict[str, Any]:
        action_log = f" with Action '{confirmation_action}'" if confirmation_action else ""
        logger.info(f"[AgentService] Forwarding message to LangGraph engine{action_log}: '{message}'")
        return await agent_instance.process_message(
            message=message,
            user_id=user_id or "user_default",
            conversation_id=conversation_id,
            confirmation_action=confirmation_action
        )
