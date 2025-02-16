import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse } from '../types/api';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const defaultConfig = {
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

export const api = axios.create(defaultConfig);

export const createAuthenticatedApi = (token: string): AxiosInstance => {
  return axios.create({
    ...defaultConfig,
    headers: {
      ...defaultConfig.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

// Add response interceptor to standardize success responses
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse<ApiResponse<any>> => {
    const apiResponse: ApiResponse<any> = {
      status: 'success',
      data: response.data,
    };
    return {
      ...response,
      data: apiResponse,
    };
  },
  (error) => {
    // Handle API errors
    const apiResponse: ApiResponse<any> = {
      status: 'error',
      error: error.response?.data?.detail || error.message || 'An unexpected error occurred',
    };
    return Promise.reject(apiResponse);
  }
);
