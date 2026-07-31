import asyncio
import json
from app.agents.event_agent import EventAgent, AgentIntent
from app.services.agent_service import AgentService


async def run_openai_agent_tests():
    agent = EventAgent()

    print("--- 1. Testing Sample Input from Prompt ---")
    prompt1 = "Find a music event in Bengaluru this weekend for two people."
    extracted1 = await agent.extract_intent_and_params(prompt1)
    print("Input Prompt:", prompt1)
    print("Extracted Structured JSON:")
    print(json.dumps(extracted1, indent=2))

    assert extracted1["intent"] == AgentIntent.SEARCH_EVENT.value
    assert extracted1["category"] == "Music"
    assert extracted1["city"] == "Bengaluru"
    assert extracted1["dateRange"] == "THIS_WEEKEND"
    assert extracted1["ticketQuantity"] == 2

    print("\n--- 2. Testing Booking Intent Extraction ---")
    prompt2 = "Book two tickets for a tech conference in San Francisco."
    extracted2 = await agent.extract_intent_and_params(prompt2)
    print("Input Prompt:", prompt2)
    print("Extracted Structured JSON:")
    print(json.dumps(extracted2, indent=2))

    assert extracted2["intent"] == AgentIntent.BOOK_EVENT.value
    assert extracted2["city"] == "San Francisco"
    assert extracted2["ticketQuantity"] == 2

    print("\n--- 3. Testing View Bookings Intent Extraction ---")
    prompt3 = "Show my upcoming bookings"
    extracted3 = await agent.extract_intent_and_params(prompt3)
    print("Input Prompt:", prompt3)
    print("Extracted Intent:", extracted3["intent"])
    assert extracted3["intent"] == AgentIntent.VIEW_BOOKINGS.value

    print("\n--- 4. Testing End-to-End Agent Service Response ---")
    response = await AgentService.process_chat(prompt1)
    print("API Response Extracted Parameters Payload:")
    print(json.dumps(response["extracted_parameters"], indent=2))
    assert response["extracted_parameters"]["intent"] == "SEARCH_EVENT"
    assert len(response["event_recommendations"]) >= 1

    print("\nSUCCESS: OPENAI EVENT AGENT STRUCTURED JSON EXTRACTION VERIFIED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_openai_agent_tests())
