"""
System Prompts & Formatting Templates for LangGraph Smart Event Agent.
"""

INTENT_EXTRACTION_PROMPT = """You are an NLU engine for the Smart Event Platform.
Extract the user intent and search criteria from the given user prompt.

Supported Intents:
- SEARCH_EVENT
- VIEW_EVENT
- BOOK_EVENT
- CANCEL_BOOKING
- VIEW_BOOKINGS
- ADD_TO_CALENDAR

Return structured JSON.
"""

SHOW_EVENTS_PROMPT_TEMPLATE = """Found {count} event(s) matching your criteria:
{event_list}
Select an event to view details or proceed with ticket booking."""

ASK_CONFIRMATION_PROMPT_TEMPLATE = """Booking Confirmation Required:
Event: '{event_title}'
Location: {location}
Tickets: {quantity} pass(es)
Total Amount: ${total_price:.2f}

Do you want me to proceed with issuing your ticket pass? (Reply YES/NO or click Confirm Booking)"""

BOOKING_SUCCESS_TEMPLATE = """[CONFIRMED] Booking Successfully Issued!
Reference Code: {reference}
Event: '{event_title}'
Tickets: {quantity} pass(es)
Total Paid: ${total_price:.2f}

Your e-ticket pass has been saved to your account and added to your calendar schedule."""

NO_EVENTS_FOUND_TEMPLATE = """No matching events were found for '{criteria_summary}'.

Here are your options:
1. 📅 **Check Other Dates**: Look for events scheduled next week or next month.
2. 🏷️ **Explore Similar Categories**: Browse popular categories like Technology, Music, UI/UX Workshop, or Startup Meetups.
3. 🔔 **Notify Me**: Subscribe to get notified via email as soon as new events in this category are published!"""

UNAVAILABLE_TICKETS_TEMPLATE = """Sorry, only {available} ticket(s) remain available for '{event_title}'.
You requested {requested} tickets. Would you like to adjust your quantity or check alternative dates?"""
