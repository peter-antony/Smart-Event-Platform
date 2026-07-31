import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-2.5 rounded-2xl border border-gray-800 flex items-center gap-3">
      <div className="pl-3 text-purple-400">
        <Sparkles className="w-4 h-4" />
      </div>
      <input
        type="text"
        placeholder="Ask AI assistant: 'Show music events this weekend' or 'Find workshops in Bengaluru'..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1 bg-transparent text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none px-2 py-1.5 disabled:opacity-50"
      />
      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={!text.trim() || disabled}
        icon={<Send className="w-4 h-4" />}
      >
        Send
      </Button>
    </form>
  );
};
