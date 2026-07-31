import React from 'react';
import { Bot, User as UserIcon, Check, X, RefreshCw } from 'lucide-react';
import { ChatMessage as ChatMessageType, Event } from '../../types/event';
import { AgentProgress } from './AgentProgress';
import { EventRecommendationCard } from './EventRecommendationCard';
import { Button } from '../ui/Button';

interface ChatMessageProps {
  message: ChatMessageType & { confirmationOptions?: string[]; requiresConfirmation?: boolean };
  onSelectEvent: (event: Event) => void;
  onConfirmAction?: (action: 'CONFIRM' | 'CANCEL' | 'CHANGE_EVENT') => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSelectEvent, onConfirmAction }) => {
  const isAssistant = message.sender === 'assistant';

  return (
    <div className={`flex gap-3.5 ${isAssistant ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}>
      {isAssistant && (
        <div className="w-9 h-9 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 mt-1 shadow-md">
          <Bot className="w-5 h-5" />
        </div>
      )}

      <div className={`max-w-2xl space-y-3 ${isAssistant ? 'text-left' : 'text-right'}`}>
        {/* Message Bubble */}
        <div
          className={`inline-block p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
            isAssistant
              ? 'glass-card border border-gray-800 text-gray-200'
              : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>

          {/* Interactive Action Buttons for HITL Confirmation */}
          {isAssistant && (message.requiresConfirmation || (message.confirmationOptions && message.confirmationOptions.length > 0)) && onConfirmAction && (
            <div className="mt-3 pt-3 border-t border-purple-500/20 flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md py-1.5 px-3 text-xs"
                onClick={() => onConfirmAction('CONFIRM')}
                icon={<Check className="w-3.5 h-3.5" />}
              >
                Confirm Booking
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 py-1.5 px-3 text-xs"
                onClick={() => onConfirmAction('CHANGE_EVENT')}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Change Event
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-950/40 py-1.5 px-3 text-xs"
                onClick={() => onConfirmAction('CANCEL')}
                icon={<X className="w-3.5 h-3.5" />}
              >
                Cancel
              </Button>
            </div>
          )}

          <span className="block text-[10px] text-gray-400 mt-1 font-mono">{message.timestamp}</span>
        </div>

        {/* Agent Execution Pipeline Steps */}
        {message.agentSteps && message.agentSteps.length > 0 && (
          <AgentProgress steps={message.agentSteps} />
        )}

        {/* Event Recommendation Cards */}
        {message.recommendedEvents && message.recommendedEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {message.recommendedEvents.map((evt, idx) => (
              <EventRecommendationCard
                key={evt.id || (evt as any).event_id || `evt-rec-${idx}`}
                event={evt}
                onSelectEvent={onSelectEvent}
              />
            ))}
          </div>
        )}
      </div>

      {!isAssistant && (
        <div className="w-9 h-9 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
          <UserIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
