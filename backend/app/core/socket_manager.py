import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("socket_manager")


class SocketManager:
    """
    Real-Time Socket.IO & WebSocket event broadcaster managing live client connections,
    in-app notifications, and AI Agent progress steps.
    """
    _connected_clients: List[Any] = []
    _sio: Any = None
    _progress_history: Dict[str, List[Dict[str, Any]]] = {}

    @classmethod
    def set_sio_server(cls, sio_server: Any):
        cls._sio = sio_server

    @classmethod
    async def broadcast_notification(cls, notification_data: Dict[str, Any]):
        """Broadcasts notification payload to connected clients in real-time."""
        logger.info(f"[SocketManager] Broadcasting real-time notification: '{notification_data.get('title')}'")
        if cls._sio:
            try:
                await cls._sio.emit('new_notification', notification_data)
            except Exception as err:
                logger.warning(f"[SocketManager] Socket.IO emit exception: {err}")
        else:
            logger.info(f"[SocketManager] Notification ready for client poll: {notification_data.get('id')}")

    @classmethod
    async def broadcast_agent_progress(
        cls,
        step_name: str,
        conversation_id: str,
        status: str = "active",  # "completed", "active", "pending", "failed"
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Emits real-time agent execution progress step events to connected frontend clients.
        Supported step_name:
        UNDERSTANDING_REQUEST, SEARCHING_EVENTS, FILTERING_EVENTS, CHECKING_AVAILABILITY,
        WAITING_FOR_SELECTION, WAITING_FOR_CONFIRMATION, CREATING_BOOKING,
        ADDING_TO_CALENDAR, SENDING_NOTIFICATION, COMPLETED, FAILED
        """
        payload = {
            "step": step_name,
            "conversation_id": conversation_id,
            "status": status,
            "description": description or f"Agent step: {step_name}",
            "timestamp": str(logging.Formatter.default_msec_format)
        }

        logger.info(f"[SocketManager] Agent Progress [{conversation_id}] -> {step_name} ({status})")

        if conversation_id not in cls._progress_history:
            cls._progress_history[conversation_id] = []
        cls._progress_history[conversation_id].append(payload)

        if cls._sio:
            try:
                await cls._sio.emit('agent_progress', payload)
            except Exception as err:
                logger.warning(f"[SocketManager] Socket.IO progress emit exception: {err}")

        return payload

    @classmethod
    def get_progress_history(cls, conversation_id: str) -> List[Dict[str, Any]]:
        return cls._progress_history.get(conversation_id, [])


# Singleton instance
socket_manager = SocketManager()
