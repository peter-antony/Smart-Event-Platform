import asyncio
import json
from app.core.socket_manager import SocketManager
from app.services.agent_service import AgentService


async def run_progress_tests():
    print("--- 1. Testing SocketManager Progress Broadcasting ---")
    p1 = await SocketManager.broadcast_agent_progress(
        step_name="UNDERSTANDING_REQUEST",
        conversation_id="conv-prog-111",
        status="active",
        description="Parsing user query"
    )
    print("Emitted Payload:")
    print(json.dumps(p1, indent=2))
    assert p1["step"] == "UNDERSTANDING_REQUEST"
    assert p1["status"] == "active"

    print("\n--- 2. Testing LangGraph Graph Progress Workflow Execution ---")
    res = await AgentService.process_chat(
        message="Search music events in Los Angeles",
        user_id="user_prog_888"
    )

    conv_id = res["conversation_id"]
    history = SocketManager.get_progress_history(conv_id)

    print(f"Conversation ID: {conv_id}")
    print(f"Recorded Progress History Count: {len(history)} steps")
    for step in history:
        print(f"  - [{step['status']}] {step['step']}: {step['description']}")

    assert len(history) >= 2
    steps_list = [h["step"] for h in history]
    assert "UNDERSTANDING_REQUEST" in steps_list
    assert "SEARCHING_EVENTS" in steps_list or "FILTERING_EVENTS" in steps_list or "COMPLETED" in steps_list

    print("\nSUCCESS: ALL REAL-TIME AI AGENT PROGRESS BROADCASTING TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_progress_tests())
