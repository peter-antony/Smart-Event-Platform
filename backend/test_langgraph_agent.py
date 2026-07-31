import asyncio
import json
from app.services.agent_service import AgentService


async def run_langgraph_agent_tests():
    print("--- 1. Testing LangGraph Search Workflow ---")
    prompt1 = "Find music events in Los Angeles"
    res1 = await AgentService.process_chat(message=prompt1, user_id="test_user_777")

    print(f"Conversation ID: {res1['conversation_id']}")
    print(f"Agent Step: {res1['agent_status']}")
    print(f"Response Text:\n{res1['message']}")
    print(f"Discovered Events: {len(res1['event_recommendations'])}")

    assert len(res1["event_recommendations"]) >= 1
    conv_id = res1["conversation_id"]

    print("\n--- 2. Testing LangGraph Booking Confirmation Request ---")
    prompt2 = "Book two tickets for this music event"
    res2 = await AgentService.process_chat(
        message=prompt2,
        user_id="test_user_777",
        conversation_id=conv_id
    )

    print(f"Agent Step: {res2['agent_status']}")
    print(f"Requires Confirmation: {res2['requires_confirmation']}")
    print(f"Response Text:\n{res2['message']}")

    assert res2["requires_confirmation"] is True
    assert res2["conversation_id"] == conv_id

    print("\n--- 3. Testing LangGraph Booking Confirmation Grant (Multi-turn) ---")
    prompt3 = "Yes, please confirm and proceed with booking"
    res3 = await AgentService.process_chat(
        message=prompt3,
        user_id="test_user_777",
        conversation_id=conv_id
    )

    print(f"Agent Step: {res3['agent_status']}")
    print(f"Response Text:\n{res3['message']}")

    assert "Confirmed" in res3["message"] or "Ref" in res3["message"] or "BK-" in res3["message"]
    assert res3["conversation_id"] == conv_id

    print("\nSUCCESS: ALL 11-NODE LANGGRAPH AGENT WORKFLOW TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_langgraph_agent_tests())
