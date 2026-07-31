import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventRecommendationCard } from '../components/ai/EventRecommendationCard';
import { Event } from '../types/event';

describe('EventRecommendationCard Component Tests', () => {
  const mockEvent: Event = {
    id: 'evt-100',
    title: 'Acoustic Harmony Music Concert',
    description: 'Live concert',
    category: 'Music',
    city: 'Los Angeles',
    location: 'Hollywood Bowl',
    is_virtual: false,
    start_time: '2026-08-10T12:00:00Z',
    end_time: '2026-08-10T16:00:00Z',
    price: 85.0,
    capacity: 1000,
    available_seats: 250,
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    tags: ['Music', 'Concert']
  };

  it('renders event title, location, and price tag', () => {
    render(<EventRecommendationCard event={mockEvent} onSelectEvent={vi.fn()} />);
    expect(screen.getByText('Acoustic Harmony Music Concert')).toBeDefined();
    expect(screen.getByText('Los Angeles • Hollywood Bowl')).toBeDefined();
    expect(screen.getByText('$85')).toBeDefined();
  });

  it('triggers onSelectEvent when Select Event button is clicked', () => {
    const handleSelect = vi.fn();
    render(<EventRecommendationCard event={mockEvent} onSelectEvent={handleSelect} />);

    const selectBtn = screen.getByText('Select Event');
    fireEvent.click(selectBtn);
    expect(handleSelect).toHaveBeenCalledWith(mockEvent);
  });
});
