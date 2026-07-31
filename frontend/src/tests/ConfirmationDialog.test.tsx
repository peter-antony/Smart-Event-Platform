import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationDialog } from '../components/ai/ConfirmationDialog';
import { Event } from '../types/event';

describe('ConfirmationDialog Component Tests', () => {
  const mockEvent: Event = {
    id: 'evt-200',
    title: 'Modern UI/UX Design Systems Workshop',
    description: 'Design workshop',
    category: 'UI/UX Workshop',
    city: 'Austin',
    location: 'Austin Tech Hub',
    is_virtual: false,
    start_time: '2026-08-15T10:00:00Z',
    end_time: '2026-08-15T16:00:00Z',
    price: 49.0,
    capacity: 500,
    available_seats: 85,
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12',
    tags: ['UI/UX']
  };

  it('renders modal dialog with ticket pricing summary', () => {
    render(
      <ConfirmationDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirmBooking={vi.fn()}
      />
    );

    expect(screen.getByText('Confirm Ticket Reservation')).toBeDefined();
    expect(screen.getByText('Modern UI/UX Design Systems Workshop')).toBeDefined();
  });
});
