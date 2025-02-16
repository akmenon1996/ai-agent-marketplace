import { createAuthenticatedApi } from './api';
import type { ApiResponse } from '../types/api';
import type { User } from '../types/user';

export interface TokenPurchaseRequest {
  amount: number;
}

export interface TokenPurchaseResponse {
  status: string;
  new_balance: number;
  amount_added: number;
}

export interface TokenBalance {
  balance: number;
}

export const tokenService = {
  purchaseTokens: async (token: string, amount: number): Promise<ApiResponse<TokenPurchaseResponse>> => {
    try {
      const api = createAuthenticatedApi(token);
      const response = await api.post<TokenPurchaseResponse>('/tokens/purchase', { amount });
      return {
        data: response.data,
        status: 'success'
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to purchase tokens',
        status: 'error'
      };
    }
  },

  getBalance: async (token: string): Promise<ApiResponse<TokenBalance>> => {
    try {
      const api = createAuthenticatedApi(token);
      const response = await api.get<User>('/users/me');
      return {
        data: { balance: response.data.token_balance },
        status: 'success'
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.detail || 'Failed to get token balance',
        status: 'error'
      };
    }
  },
};
