import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AgentProgress } from '../components/ai/AgentProgress';
import { AgentStep } from '../types/event';

describe('AgentProgress Component Tests', () => {
  it('renders progress steps timeline with completed and active status labels', () => {
    const steps: AgentStep[] = [
      { id: 's1', step: 'UNDERSTANDING_REQUEST', status: 'completed' },
      { id: 's2', step: 'SEARCHING_EVENTS', status: 'active' }
    ];

    render(<AgentProgress steps={steps} />);

    expect(screen.getByText('AI Agent Execution Progress')).toBeDefined();
    expect(screen.getByText('Understanding prompt request')).toBeDefined();
    expect(screen.getByText('Searching event database')).toBeDefined();
  });
});
