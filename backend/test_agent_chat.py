import asyncio
from app.services.agent_service import AgentService


async def run_agent_chat_tests():
    print("--- 1. Testing Agent Chat: Music Prompt ---")
    res1 = await AgentService.process_chat(
        message="Show music events this weekend",
        user_id="user_test_123"
    )
    print(f"Conversation ID: {res1['conversation_id']}")
    print(f"AI Message: {res1['message']}")
    print(f"Recommended Events: {len(res1['event_recommendations'])}")
    assert len(res1["event_recommendations"]) >= 1
    assert "music" in res1["message"].lower() or "concert" in res1["message"].lower()

    print("\n--- 2. Testing Agent Chat: Bengaluru Workshops ---")
    res2 = await AgentService.process_chat(
        message="Find workshops in Bengaluru",
        user_id="user_test_123",
        conversation_id=res1["conversation_id"]
    )
    print(f"Conversation ID Preserved: {res2['conversation_id']}")
    print(f"AI Message: {res2['message']}")
    print(f"Recommended Events: {len(res2['event_recommendations'])}")
    assert res2["conversation_id"] == res1["conversation_id"]

    print("\n--- 3. Testing Agent Chat: Ticket Booking Intent ---")
    res3 = await AgentService.process_chat(
        message="Book two tickets for a music event",
        user_id="user_test_123",
        conversation_id=res1["conversation_id"]
    )
    print(f"Requires Confirmation: {res3['requires_confirmation']}")
    print(f"Confirmation Data: {res3['confirmation_data']}")
    assert res3["requires_confirmation"] is True
    assert res3["confirmation_data"] is not None

    print("\nSUCCESS: ALL FASTAPI AGENT CHAT TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_agent_chat_tests())
