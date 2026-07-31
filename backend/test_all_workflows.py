import sys
import os
import asyncio
import json
from app.services.agent_service import AgentService
from app.tools.event_tools import tool_create_booking

# Reconfigure stdout for UTF-8 emoji support
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


async def run_all_workflow_tests():
    print("=========================================================")
    print("       SMART EVENT AI AGENT WORKFLOW TEST SUITE          ")
    print("=========================================================")

    # -----------------------------------------------------------
    # WORKFLOW 1: Search Only
    # -----------------------------------------------------------
    print("\n--- Workflow 1: Search Only ---")
    w1_res = await AgentService.process_chat(message="Show music events in Los Angeles", user_id="wf_user_1")
    print(f"Workflow 1 Discovered Events: {len(w1_res['event_recommendations'])}")
    print(f"Requires Confirmation: {w1_res['requires_confirmation']}")
    assert len(w1_res["event_recommendations"]) >= 1
    assert w1_res["requires_confirmation"] is False

    # -----------------------------------------------------------
    # WORKFLOW 2: Search -> Select Event
    # -----------------------------------------------------------
    print("\n--- Workflow 2: Search -> Select Event ---")
    w2_res = await AgentService.process_chat(message="Show details for Acoustic Harmony Music Concert", user_id="wf_user_2")
    print(f"Workflow 2 Output:\n{w2_res['message'][:120]}...")
    assert "Acoustic" in w2_res["message"] or "Music" in w2_res["message"]

    # -----------------------------------------------------------
    # WORKFLOW 3: Search -> Select -> Confirm -> Book
    # -----------------------------------------------------------
    print("\n--- Workflow 3: Search -> Select -> Confirm -> Book ---")
    # Turn 1: Initiate booking (Pauses)
    w3_turn1 = await AgentService.process_chat(message="Book two tickets for music concert", user_id="wf_user_3")
    conv3_id = w3_turn1["conversation_id"]
    print(f"Turn 1 Paused for Confirmation: {w3_turn1['requires_confirmation']}")
    assert w3_turn1["requires_confirmation"] is True

    # Turn 2: User grants CONFIRM action
    w3_turn2 = await AgentService.process_chat(
        message="Confirming ticket purchase",
        user_id="wf_user_3",
        conversation_id=conv3_id,
        confirmation_action="CONFIRM"
    )
    print(f"Turn 2 Result Message:\n{w3_turn2['message']}")
    assert "[CONFIRMED]" in w3_turn2["message"] or "BK-" in w3_turn2["message"]
    assert w3_turn2["requires_confirmation"] is False

    # -----------------------------------------------------------
    # WORKFLOW 4: Search -> Select -> Cancel
    # -----------------------------------------------------------
    print("\n--- Workflow 4: Search -> Select -> Cancel ---")
    w4_turn1 = await AgentService.process_chat(message="Book two tickets for a tech conference", user_id="wf_user_4")
    conv4_id = w4_turn1["conversation_id"]
    assert w4_turn1["requires_confirmation"] is True

    # User clicks CANCEL button
    w4_turn2 = await AgentService.process_chat(
        message="Cancel request",
        user_id="wf_user_4",
        conversation_id=conv4_id,
        confirmation_action="CANCEL"
    )
    print(f"Workflow 4 Cancel Output: {w4_turn2['message']}")
    assert "cancelled" in w4_turn2["message"].lower()

    # -----------------------------------------------------------
    # WORKFLOW 5: Search -> No Results
    # -----------------------------------------------------------
    print("\n--- Workflow 5: Search -> No Results ---")
    w5_res = await AgentService.process_chat(message="Show underwater ballet events in Tokyo", user_id="wf_user_5")
    print(f"Workflow 5 Output:\n{w5_res['message']}")
    assert "No events" in w5_res["message"] or "popular" in w5_res["message"]

    # -----------------------------------------------------------
    # WORKFLOW 6: Booking -> No Tickets (Sold Out)
    # -----------------------------------------------------------
    print("\n--- Workflow 6: Booking -> No Tickets ---")
    w6_res = await tool_create_booking(
        user_id="wf_user_6",
        event_id="3df802ab-f7da-4357-9217-5aed4931d556",
        ticket_quantity=9999,
        confirmed_by_user=True
    )
    print(f"Workflow 6 Output: Status = {w6_res.get('status')}, Error = {w6_res.get('error')}")
    assert w6_res.get("status") == "ERROR" or "not enough" in w6_res.get("error", "").lower()

    # -----------------------------------------------------------
    # WORKFLOW 7: Booking -> API Error
    # -----------------------------------------------------------
    print("\n--- Workflow 7: Booking -> API Error ---")
    w7_res = await tool_create_booking(
        user_id="wf_user_7",
        event_id="invalid-uuid-999",
        ticket_quantity=1,
        confirmed_by_user=True
    )
    print(f"Workflow 7 API Error Output: Status = {w7_res.get('status')}")
    assert w7_res.get("status") == "ERROR"

    # -----------------------------------------------------------
    # WORKFLOW 8: Booking -> Calendar Error
    # -----------------------------------------------------------
    print("\n--- Workflow 8: Booking -> Calendar Error ---")
    from app.tools.event_tools import tool_add_event_to_calendar
    w8_res = await tool_add_event_to_calendar(event_id="non-existent-id", user_id="wf_user_8")
    print(f"Workflow 8 Calendar Output: Status = {w8_res.get('status')}")
    assert w8_res.get("status") == "ERROR"

    # -----------------------------------------------------------
    # CRITICAL SECURITY RULE: Explicit Unconfirmed Booking Block
    # -----------------------------------------------------------
    print("\n--- CRITICAL ASSERTION: Verify Unconfirmed Booking Block ---")
    unconfirmed_block = await tool_create_booking(
        user_id="wf_user_unconfirmed",
        event_id="3df802ab-f7da-4357-9217-5aed4931d556",
        ticket_quantity=2,
        confirmed_by_user=False
    )
    print("Unconfirmed Execution Response Payload:")
    print(json.dumps(unconfirmed_block, indent=2))
    assert unconfirmed_block["status"] == "REQUIRES_USER_CONFIRMATION"
    assert unconfirmed_block["confirmation_required"] is True
    print("PASSED SAFETY ASSERTION: NO BOOKING CAN BE CREATED WITHOUT EXPLICIT CONFIRMATION!")

    print("\n=========================================================")
    print(" SUCCESS: ALL 8 WORKFLOWS & CONFIRMATION RULES PASSED!   ")
    print("=========================================================")

if __name__ == "__main__":
    asyncio.run(run_all_workflow_tests())
