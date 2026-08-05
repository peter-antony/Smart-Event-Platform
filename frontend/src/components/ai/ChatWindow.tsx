import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { ChatMessage as ChatMessageType, Event } from '../../types/event';
import { ChatMessage } from './ChatMessage';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  onSelectEvent: (event: Event) => void;
  onConfirmAction?: (action: 'CONFIRM' | 'CANCEL' | 'CHANGE_EVENT') => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isTyping, onSelectEvent, onConfirmAction }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 glass-panel rounded-2xl p-5 lg:p-6 overflow-y-auto space-y-5 border border-gray-800/80">
      {messages.map((msg, idx) => (
        <ChatMessage
          key={msg.id || `msg-${idx}`}
          message={msg}
          onSelectEvent={onSelectEvent}
          onConfirmAction={onConfirmAction}
        />
      ))}

      {isTyping && (
        <div className="flex items-center gap-3 text-purple-300 text-xs pl-2 py-1 animate-pulse">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-center gap-1.5 bg-gray-900/80 px-3 py-2 rounded-2xl border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] font-medium text-gray-400 ml-1">LangGraph Agent resuming workflow...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
