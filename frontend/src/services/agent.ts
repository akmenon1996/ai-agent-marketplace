import { createAuthenticatedApi } from './api';
import axios from 'axios';
import type { ApiResponse } from '../types/api';
import type { 
  Agent, 
  AgentInvocationRequest, 
  AgentInvocationResponse, 
  AgentAnalytics, 
  AgentPurchaseResponse
} from '../types/agent';

const API_BASE_URL = 'http://localhost:8000'; // replace with your actual API base URL

const agentService = {
  getAgent: async (token: string, id: number): Promise<ApiResponse<Agent>> => {
    try {
      const api = createAuthenticatedApi(token);
      const response = await api.get<Agent>(`/agents/${id}`);
      return { data: response.data, status: 'success' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail;
      return {
        error: typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch agent',
        status: 'error'
      };
    }
  },

  listAgents: async (token: string): Promise<ApiResponse<Agent[]>> => {
    try {
      const api = createAuthenticatedApi(token);
      const response = await api.get<Agent[]>('/agents');
      return { data: response.data, status: 'success' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail;
      return {
        error: typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch agents',
        status: 'error'
      };
    }
  },

  createAgent: async (token: string, agentData: Partial<Agent>): Promise<ApiResponse<Agent>> => {
    try {
      const api = createAuthenticatedApi(token);
      const response = await api.post<Agent>('/agents/create', agentData);
      return { data: response.data, status: 'success' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail;
      return {
        error: typeof errorMessage === 'string' ? errorMessage : 'Failed to create agent',
        status: 'error'
      };
    }
  },

  updateAgent: async (token: string, id: number, agentData: Partial<Agent>): Promise<ApiResponse<Agent>> => {
    try {
      const api = createAuthenticatedApi(token);
      const response = await api.put<Agent>(`/agents/${id}`, agentData);
      return { data: response.data, status: 'success' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail;
      return {
        error: typeof errorMessage === 'string' ? errorMessage : 'Failed to update agent',
        status: 'error'
      };
    }
  },

  deleteAgent: async (token: string, id: number): Promise<ApiResponse<void>> => {
    try {
      const api = createAuthenticatedApi(token);
      await api.delete(`/agents/${id}`);
      return { status: 'success' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail;
      return {
        error: typeof errorMessage === 'string' ? errorMessage : 'Failed to delete agent',
        status: 'error'
      };
    }
  },

  purchaseAgent: async (token: string, agentId: number, price: number): Promise<ApiResponse<AgentPurchaseResponse>> => {
    try {
      const api = createAuthenticatedApi(token);
      const response = await api.post<AgentPurchaseResponse>('/agents/purchase', { 
        agent_id: agentId,
        purchase_price: price
      });
      return { data: response.data, status: 'success' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail;
      return {
        error: typeof errorMessage === 'string' ? errorMessage : 'Failed to purchase agent',
        status: 'error'
      };
    }
  },

  invokeAgent: async (
    token: string,
    agentId: number,
    request: AgentInvocationRequest
  ): Promise<ApiResponse<AgentInvocationResponse>> => {
    try {
      const api = createAuthenticatedApi(token);
      const response = await api.post<AgentInvocationResponse>(`/agents/invoke/${agentId}`, request);
      return { data: response.data, status: 'success' };
    } catch (error: any) {
      console.error('Detailed error information:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestConfig: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      const errorMessage = error.response?.data?.detail;
      return {
        error: typeof errorMessage === 'string' ? errorMessage : 'Failed to invoke agent',
        status: 'error'
      };
    }
  },

  listInvocations: async (token: string): Promise<ApiResponse<AgentInvocationResponse[]>> => {
    try {
      const api = createAuthenticatedApi(token);
      const response = await api.get<AgentInvocationResponse[]>('/users/me/invocations');
      return { data: response.data, status: 'success' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail;
      return {
        error: typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch invocations',
        status: 'error'
      };
    }
  },

  getAgentAnalytics: async (token: string, agentId: number): Promise<ApiResponse<AgentAnalytics>> => {
    try {
      const api = createAuthenticatedApi(token);
      const response = await api.get<AgentAnalytics>(`/agents/${agentId}/analytics`);
      return { data: response.data, status: 'success' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail;
      return {
        error: typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch agent analytics',
        status: 'error'
      };
    }
  },

  async summarizeConversation(token: string, input: string, output: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/agents/summarize`,
        {
          input_text: input,
          output_text: output
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      return {
        status: 'error',
        error: 'Failed to summarize conversation',
      };
    }
  },
};

export { agentService };
