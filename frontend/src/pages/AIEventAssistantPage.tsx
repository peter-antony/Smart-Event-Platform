import React, { useState } from 'react';
import { Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { ChatMessage, Event } from '../types/event';
import { sendAgentMessage } from '../services/agentApi';
import { createBooking } from '../services/api';
import { ChatWindow } from '../components/ai/ChatWindow';
import { ChatInput } from '../components/ai/ChatInput';
import { ConfirmationDialog } from '../components/ai/ConfirmationDialog';

interface AIEventAssistantPageProps {
  onNavigateToBookings?: () => void;
}

export const AIEventAssistantPage: React.FC<AIEventAssistantPageProps> = ({
  onNavigateToBookings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Hello! I am your AI Event Assistant. Ask me to search events or book ticket passes. I will pause and ask for your explicit confirmation before issuing any booking.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentSteps: [
        { id: 'step-1', step: 'LangGraph checkpointer initialized', status: 'completed' }
      ]
    },
  ]);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const [selectedEventForModal, setSelectedEventForModal] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const suggestedPrompts = [
    'Show music events this weekend',
    'Find workshops in Bengaluru',
    'Book two tickets for a music event',
    'Show my upcoming bookings',
  ];

  const handleSendMessage = async (userText: string, confirmationAction?: string | null) => {
    if (!userText.trim() && !confirmationAction) return;

    setErrorMessage(null);
    setLastFailedQuery(null);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: confirmationAction ? `Action: ${confirmationAction}` : userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Call FastAPI Agent Endpoint via Axios agentApi (resuming conversationId thread)
    const apiResult = await sendAgentMessage({
      message: userText || `Execute ${confirmationAction}`,
      userId: 'user@example.com',
      conversationId: conversationId,
      confirmationAction: confirmationAction || null
    });

    setIsTyping(false);

    if (apiResult.success && apiResult.data) {
      const data = apiResult.data;

      // Maintain persistent Conversation ID across thread steps
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const assistantMsg: ChatMessage & { confirmationOptions?: string[]; requiresConfirmation?: boolean } = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentSteps: data.agent_steps || [],
        recommendedEvents: data.event_recommendations || [],
        requiresConfirmation: data.requires_confirmation,
        confirmationOptions: data.confirmation_options || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } else {
      const err = apiResult.error || 'Failed to communicate with FastAPI Agent Service.';
      setErrorMessage(err);
      setLastFailedQuery(userText);
    }
  };

  const handleConfirmAction = (action: 'CONFIRM' | 'CANCEL' | 'CHANGE_EVENT') => {
    handleSendMessage(action === 'CONFIRM' ? 'Confirming booking request' : action === 'CANCEL' ? 'Cancel booking request' : 'Change event selection', action);
  };

  const handleRetry = () => {
    if (lastFailedQuery) {
      handleSendMessage(lastFailedQuery);
    }
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEventForModal(event);
    setIsModalOpen(true);
  };

  const handleConfirmBookingInModal = async (
    event: Event,
    ticketsCount: number,
    name: string,
    email: string
  ) => {
    const bookingResult = await createBooking(event.id, name, email, ticketsCount);

    const confirmationMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `🎉 Booking Confirmed! Reserved ${ticketsCount} ticket pass(es) for "${event.title}". Reference Code: ${bookingResult.booking_reference}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentSteps: [
        { id: 'b1', step: 'Atomically deducted seats from PostgreSQL database', status: 'completed' },
        { id: 'b2', step: `Issued reference code ${bookingResult.booking_reference}`, status: 'completed' }
      ]
    };

    setMessages((prev) => [...prev, confirmationMsg]);
    if (onNavigateToBookings) {
      setTimeout(() => {
        onNavigateToBookings();
      }, 1800);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 flex flex-col h-[calc(100vh-130px)] animate-in fade-in duration-200">
      {/* API Error Notification with Retry Option */}
      {errorMessage && (
        <div className="glass-panel p-3.5 rounded-2xl border border-red-500/40 bg-red-500/10 dark:bg-red-950/30 flex items-center justify-between gap-3 text-xs text-red-700 dark:text-red-200 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {lastFailedQuery && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-700 dark:text-white font-semibold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          )}
        </div>
      )}

      {/* Main Chat Window */}
      <ChatWindow
        messages={messages}
        isTyping={isTyping}
        onSelectEvent={handleSelectEvent}
        onConfirmAction={handleConfirmAction}
      />

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 shrink-0 font-semibold pr-1">
          <Compass className="w-4 h-4" /> Prompts:
        </div>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isTyping}
            className="px-3.5 py-1.5 rounded-xl text-xs bg-white dark:bg-gray-900/90 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800/80 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white whitespace-nowrap transition-all shrink-0 hover:border-purple-500/40 disabled:opacity-50 shadow-sm"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="shrink-0">
        <ChatInput onSendMessage={(msg) => handleSendMessage(msg)} disabled={isTyping} />
      </div>

      {/* Confirmation Modal Dialog */}
      <ConfirmationDialog
        event={selectedEventForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmBooking={handleConfirmBookingInModal}
      />
    </div>
  );
};
