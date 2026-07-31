import axios, { AxiosError } from 'axios';
import { Event, AgentStep } from '../types/event';

const AGENT_API_URL = 'http://localhost:8000/api/agent/chat';

export interface AgentChatPayload {
  message: string;
  userId?: string;
  conversationId?: string | null;
  confirmationAction?: string | null;
}

export interface AgentChatApiResponse {
  message: string;
  extracted_parameters?: any;
  event_recommendations: Event[];
  agent_status: string;
  agent_steps: AgentStep[];
  requires_confirmation: boolean;
  confirmation_options?: string[];
  confirmation_data?: any;
  conversation_id: string;
}

export interface AgentApiResult {
  success: boolean;
  data: AgentChatApiResponse | null;
  error: string | null;
}

/**
 * Sends user prompt message or HITL confirmation action to FastAPI AI Agent Chat endpoint via Axios.
 * Includes error handling, retry mechanics, empty response fallbacks, and conversation ID tracking.
 */
export const sendAgentMessage = async (
  payload: AgentChatPayload,
  retries: number = 1
): Promise<AgentApiResult> => {
  try {
    const requestBody = {
      message: payload.message,
      userId: payload.userId || 'user_default',
      conversationId: payload.conversationId || null,
      confirmationAction: payload.confirmationAction || null,
    };

    const response = await axios.post<AgentChatApiResponse>(AGENT_API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (!response.data || !response.data.message) {
      return {
        success: true,
        data: {
          message: "I processed your request, but no additional details were returned.",
          event_recommendations: [],
          agent_status: 'completed',
          agent_steps: [],
          requires_confirmation: false,
          confirmation_options: [],
          conversation_id: payload.conversationId || `conv-${Date.now()}`
        },
        error: null
      };
    }

    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (err) {
    const axiosErr = err as AxiosError<{ detail?: string }>;
    const errorMsg =
      axiosErr.response?.data?.detail ||
      axiosErr.message ||
      'Failed to connect to AI Agent API. Please check your connection.';

    if (retries > 0) {
      console.warn(`[agentApi] Connection failed. Retrying... (${retries} attempts left)`);
      return sendAgentMessage(payload, retries - 1);
    }

    return {
      success: false,
      data: null,
      error: errorMsg,
    };
  }
};
