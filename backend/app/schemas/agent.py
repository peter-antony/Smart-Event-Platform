import uuid
from typing import Optional, List, Any, Dict
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.event import EventResponse


class AgentChatRequest(BaseModel):
    message: str = Field(..., description="User prompt message for AI agent")
    userId: Optional[str] = Field("user_default", description="User ID or email")
    conversationId: Optional[str] = Field(None, description="Active conversation session ID")
    confirmationAction: Optional[str] = Field(None, description="Human confirmation action e.g. CONFIRM, CANCEL, CHANGE_EVENT, CHANGE_TICKET_QUANTITY")
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    confirmation_action: Optional[str] = None


class AgentStepSchema(BaseModel):
    id: str
    step: str
    status: str = "completed"


class AgentChatResponse(BaseModel):
    message: str
    extracted_parameters: Dict[str, Any] = Field(default_factory=dict, description="Structured NLU extracted parameters")
    event_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    agent_status: str = "completed"
    agent_steps: List[AgentStepSchema] = Field(default_factory=list)
    requires_confirmation: bool = False
    confirmation_data: Optional[Dict[str, Any]] = None
    confirmation_options: List[str] = Field(default_factory=list, description="Available HITL action buttons e.g. CONFIRM, CANCEL, CHANGE_EVENT")
    conversation_id: str

    model_config = ConfigDict(from_attributes=True)
