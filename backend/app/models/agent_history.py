import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey, Index
from app.models.event import GUID
from app.db.session import Base


class AgentConversation(Base):
    __tablename__ = "agent_conversations"

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), nullable=False, index=True)
    conversation_id = Column(String(255), unique=True, nullable=False, index=True)
    workflow_status = Column(String(50), nullable=False, default="ACTIVE", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "conversation_id": self.conversation_id,
            "workflow_status": self.workflow_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(255), ForeignKey("agent_conversations.conversation_id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(50), nullable=False, default="user")
    message_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "conversation_id": self.conversation_id,
            "sender": self.sender,
            "message_text": self.message_text,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(255), ForeignKey("agent_conversations.conversation_id", ondelete="CASCADE"), nullable=False, index=True)
    tool_name = Column(String(100), nullable=False, index=True)
    tool_input = Column(JSON, default=dict)
    tool_result = Column(JSON, default=dict)
    confirmation_status = Column(String(50), nullable=False, default="NONE", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_agent_actions_conv_tool', 'conversation_id', 'tool_name'),
    )

    def to_dict(self):
        return {
            "id": str(self.id),
            "conversation_id": self.conversation_id,
            "tool_name": self.tool_name,
            "tool_input": self.tool_input or {},
            "tool_result": self.tool_result or {},
            "confirmation_status": self.confirmation_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
