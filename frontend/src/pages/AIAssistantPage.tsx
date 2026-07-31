import React, { useState } from 'react';
import { Sparkles, Send, Bot, User as UserIcon, Video, Compass } from 'lucide-react';
import { ChatMessage, Event } from '../types/event';
import { MOCK_EVENTS } from '../services/api';
import { Button } from '../components/ui/Button';

interface AIAssistantPageProps {
  onSelectEvent: (event: Event) => void;
  onBookEvent: (event: Event) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ onSelectEvent, onBookEvent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Hello! I am your AI Event Assistant powered by LangChain & LangGraph. What type of tech, AI, or developer events are you looking for today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendedEvents: [MOCK_EVENTS[0], MOCK_EVENTS[1]],
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    'Recommend top AI & LLM Summits 2026',
    'Show me virtual workshops with low price',
    'Which web dev conference has React 19 sessions?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    // Simulate Agent response based on query keywords
    setTimeout(() => {
      let recs: Event[] = [];
      const lower = query.toLowerCase();
      if (lower.includes('ai') || lower.includes('llm')) {
        recs = [MOCK_EVENTS[0]];
      } else if (lower.includes('react') || lower.includes('web')) {
        recs = [MOCK_EVENTS[1]];
      } else if (lower.includes('virtual') || lower.includes('devops')) {
        recs = [MOCK_EVENTS[2]];
      } else {
        recs = MOCK_EVENTS.slice(0, 2);
      }

      const assistantReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `Based on your request "${query}", I analyzed available event schedules using our LangChain tool pipeline. Here are the best matching sessions:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedEvents: recs,
      };

      setMessages((prev) => [...prev, assistantReply]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-140px)]">
      {/* Page Header */}
      <div className="glass-panel p-5 rounded-3xl flex items-center justify-between border border-purple-500/30 bg-gradient-to-r from-purple-950/40 to-brand-950/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-brand-600 text-white shadow-glow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">AI Event Assistant</h1>
            <p className="text-xs text-gray-400">Powered by LangChain, LangGraph & OpenAI API</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
          Agent Active
        </span>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 glass-panel rounded-3xl p-6 overflow-y-auto space-y-5 border border-gray-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-9 h-9 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 mt-1 shadow-md">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div className={`max-w-2xl space-y-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`inline-block p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                    : 'glass-card border border-gray-800 text-gray-200'
                }`}
              >
                <p>{msg.text}</p>
                <span className="block text-[10px] text-gray-400 mt-1 font-mono">{msg.timestamp}</span>
              </div>

              {/* Recommended Event Cards in Assistant Messages */}
              {msg.recommendedEvents && msg.recommendedEvents.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {msg.recommendedEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="glass-card p-3.5 rounded-xl border border-purple-500/30 text-left space-y-2 hover:border-purple-400/60 transition-all"
                    >
                      <div className="flex items-center justify-between text-[11px] text-purple-300">
                        <span className="font-semibold">{evt.category}</span>
                        {evt.is_virtual && (
                          <span className="flex items-center gap-1 text-purple-400">
                            <Video className="w-3 h-3" /> Virtual
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{evt.title}</h4>
                      <p className="text-[11px] text-gray-400 line-clamp-2">{evt.description}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-800 text-xs">
                        <span className="font-extrabold text-brand-400">${evt.price}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectEvent(evt)}
                            className="px-2 py-1 rounded-lg text-[10px] bg-gray-800 text-gray-300 hover:text-white"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onBookEvent(evt)}
                            className="px-2.5 py-1 rounded-lg text-[10px] bg-brand-600 text-white font-semibold"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-9 h-9 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3 text-gray-400 text-xs pl-2">
            <Bot className="w-4 h-4 text-purple-400 animate-bounce" />
            <span>AI Agent thinking...</span>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
        <Compass className="w-4 h-4 text-purple-400 shrink-0" />
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-xl text-xs bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-gray-300 whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="glass-panel p-3 rounded-2xl border border-gray-800 flex items-center gap-3 shrink-0">
        <input
          type="text"
          placeholder="Ask AI agent to recommend events, compare agendas, or check seat availability..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none px-2"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleSendMessage()}
          icon={<Send className="w-4 h-4" />}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
