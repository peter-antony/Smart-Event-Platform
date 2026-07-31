import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { sendAgentMessage } from '../services/agentApi';

vi.mock('axios');

describe('agentApi Service Tests', () => {
  it('sends message payload and returns response data with conversation ID', async () => {
    const mockResponse = {
      data: {
        message: 'Found events matching criteria',
        event_recommendations: [],
        agent_status: 'completed',
        agent_steps: [],
        requires_confirmation: false,
        conversation_id: 'conv-test-999'
      }
    };

    (axios.post as any).mockResolvedValueOnce(mockResponse);

    const result = await sendAgentMessage({ message: 'Find music events' });
    expect(result.success).toBe(true);
    expect(result.data?.conversation_id).toBe('conv-test-999');
  });
});
