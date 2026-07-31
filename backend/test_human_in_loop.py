import asyncio
import json
from app.services.agent_service import AgentService


async def run_hitl_tests():
    print("--- 1. Step 1: Initiate Booking Prompt (Pauses Workflow) ---")
    res1 = await AgentService.process_chat(
        message="Book two tickets for music concert",
        user_id="user_hitl_999"
    )

    conv_id = res1["conversation_id"]
    print(f"Conversation Thread ID: {conv_id}")
    print(f"Requires Confirmation: {res1['requires_confirmation']}")
    print(f"Confirmation Options: {res1['confirmation_options']}")
    print(f"Response Message:\n{res1['message']}")

    assert res1["requires_confirmation"] is True
    assert "CONFIRM" in res1["confirmation_options"]
    assert "CANCEL" in res1["confirmation_options"]
    assert "CHANGE_EVENT" in res1["confirmation_options"]

    print("\n--- 2. Step 2: Resume Workflow with CONFIRM Action (Same Thread) ---")
    res2 = await AgentService.process_chat(
        message="Confirming ticket purchase",
        user_id="user_hitl_999",
        conversation_id=conv_id,
        confirmation_action="CONFIRM"
    )

    print(f"Conversation Thread Preserved: {res2['conversation_id']}")
    print(f"Response Message:\n{res2['message']}")

    assert res2["conversation_id"] == conv_id
    assert "CONFIRMED" in res2["message"] or "Ref" in res2["message"] or "BK-" in res2["message"]
    assert res2["requires_confirmation"] is False

    print("\n--- 3. Step 3: Test CANCEL Action ---")
    # Initiate another booking turn
    bkg_init = await AgentService.process_chat(message="Book two tickets for a tech conference", user_id="user_hitl_999")
    conv_id_2 = bkg_init["conversation_id"]

    cancel_res = await AgentService.process_chat(
        message="Cancel booking request",
        user_id="user_hitl_999",
        conversation_id=conv_id_2,
        confirmation_action="CANCEL"
    )
    print(f"Cancel Response Message: {cancel_res['message']}")
    assert "cancelled" in cancel_res["message"].lower()

    print("\n--- 4. Step 4: Test CHANGE_EVENT Action ---")
    bkg_init_3 = await AgentService.process_chat(message="Book two tickets for UI/UX workshop", user_id="user_hitl_999")
    conv_id_3 = bkg_init_3["conversation_id"]

    change_res = await AgentService.process_chat(
        message="Show other events",
        user_id="user_hitl_999",
        conversation_id=conv_id_3,
        confirmation_action="CHANGE_EVENT"
    )
    print(f"Change Event Response Message: {change_res['message']}")
    assert "alternative" in change_res["message"].lower() or "choose" in change_res["message"].lower()

    print("\nSUCCESS: ALL HUMAN-IN-THE-LOOP LANGGRAPH WORKFLOW TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_hitl_tests())
