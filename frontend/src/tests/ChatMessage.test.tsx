import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMessage } from '../components/ai/ChatMessage';
import { ChatMessage as ChatMessageType } from '../types/event';

describe('ChatMessage Component Tests', () => {
  it('renders user text message correctly', () => {
    const userMsg: ChatMessageType = {
      id: 'm1',
      sender: 'user',
      text: 'Find music events in Bengaluru',
      timestamp: '12:00 PM'
    };

    render(<ChatMessage message={userMsg} onSelectEvent={vi.fn()} />);
    expect(screen.getByText('Find music events in Bengaluru')).toBeDefined();
  });

  it('renders assistant action buttons when confirmation is required', () => {
    const assistantMsg: ChatMessageType & { confirmationOptions?: string[]; requiresConfirmation?: boolean } = {
      id: 'm2',
      sender: 'assistant',
      text: 'Booking Confirmation Required: Acoustic Harmony Music Concert',
      timestamp: '12:01 PM',
      requiresConfirmation: true,
      confirmationOptions: ['CONFIRM', 'CANCEL', 'CHANGE_EVENT']
    };

    const handleConfirmAction = vi.fn();
    render(
      <ChatMessage
        message={assistantMsg}
        onSelectEvent={vi.fn()}
        onConfirmAction={handleConfirmAction}
      />
    );

    const confirmBtn = screen.getByText('Confirm Booking');
    const cancelBtn = screen.getByText('Cancel');
    const changeBtn = screen.getByText('Change Event');

    expect(confirmBtn).toBeDefined();
    expect(cancelBtn).toBeDefined();
    expect(changeBtn).toBeDefined();

    fireEvent.click(confirmBtn);
    expect(handleConfirmAction).toHaveBeenCalledWith('CONFIRM');
  });
});
