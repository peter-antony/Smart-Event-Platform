import logging
from typing import Dict, Any
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Depends, status
from app.services.agent_service import AgentService
from app.schemas.agent import AgentChatRequest, AgentChatResponse
from app.core.auth_deps import get_current_user

logger = logging.getLogger("agent_routes")
router = APIRouter()


@router.post("/chat", response_model=AgentChatResponse, summary="POST /api/agent/chat - Send message to AI Event Assistant")
async def chat_with_agent(
    payload: AgentChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Endpoint for AI Event Assistant chat turns and HITL confirmation actions.
    SECURITY: The authenticated user_id is extracted directly from the verified Bearer JWT context,
    ignoring any user ID parameters passed from the frontend for booking actions.
    """
    try:
        # Extract authenticated user ID from JWT context (Backend-enforced)
        authenticated_user_id = current_user["id"]
        conv_id = payload.conversationId or payload.conversation_id
        action = payload.confirmationAction or payload.confirmation_action

        response = await AgentService.process_chat(
            message=payload.message,
            user_id=authenticated_user_id,
            conversation_id=conv_id,
            confirmation_action=action
        )
        return response
    except Exception as err:
        logger.exception(f"Agent chat processing failed: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent process error: {str(err)}"
        )
