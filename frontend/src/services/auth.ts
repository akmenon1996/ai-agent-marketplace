import axios from 'axios';
import type { ApiResponse } from '../types/api';
import type { User, LoginCredentials, RegisterCredentials } from '../types/user';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create an axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // Changed to false since we're using token-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AuthResponseData {
  token: string;
  user: User;
}

const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponseData>> => {
  try {
    // Use URLSearchParams for form data
    const params = new URLSearchParams();
    params.append('username', credentials.username);
    params.append('password', credentials.password);
    
    // First get the token
    const tokenResponse = await api.post('/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!tokenResponse.data || !tokenResponse.data.access_token) {
      throw new Error('Invalid token response format');
    }

    const { access_token } = tokenResponse.data;

    // Set the token in the api instance
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

    // Then get the user data
    const userResponse = await api.get('/users/me');

    return {
      data: {
        token: access_token,
        user: userResponse.data,
      },
      status: 'success',
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      error: error.response?.data?.detail || error.message || 'Login failed',
      status: 'error',
    };
  }
};

const register = async (credentials: RegisterCredentials): Promise<ApiResponse<AuthResponseData>> => {
  try {
    const response = await api.post('/users/register', credentials);
    
    if (!response.data) {
      throw new Error('Invalid response format');
    }

    // After registration, log the user in
    return login({
      username: credentials.username,
      password: credentials.password,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      error: error.response?.data?.detail || error.message || 'Registration failed',
      status: 'error',
    };
  }
};

const getCurrentUser = async (token: string): Promise<ApiResponse<User>> => {
  try {
    const response = await api.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      data: response.data,
      status: 'success',
    };
  } catch (error: any) {
    console.error('Get current user error:', error);
    return {
      error: error.response?.data?.detail || error.message || 'Failed to get user data',
      status: 'error',
    };
  }
};

const updateUser = async (token: string, data: Partial<User>): Promise<ApiResponse<User>> => {
  try {
    const response = await api.patch('/users/me', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      data: response.data,
      status: 'success',
    };
  } catch (error: any) {
    console.error('Update user error:', error);
    return {
      error: error.response?.data?.detail || error.message || 'Failed to update user',
      status: 'error',
    };
  }
};

const logout = async (): Promise<void> => {
  // Clear the Authorization header
  delete api.defaults.headers.common['Authorization'];
};

const refreshToken = async (token: string): Promise<ApiResponse<AuthResponseData>> => {
  try {
    const response = await api.post(
      '/token/refresh',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      data: {
        token: response.data.access_token,
        user: response.data.user,
      },
      status: 'success',
    };
  } catch (error: any) {
    return {
      error: error.response?.data?.detail || 'Token refresh failed',
      status: 'error',
    };
  }
};

const updatePassword = async (
  token: string,
  data: { current_password: string; new_password: string }
): Promise<ApiResponse<void>> => {
  try {
    await api.put(`${BASE_URL}/users/password`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      status: 'success',
    };
  } catch (error: any) {
    return {
      error: error.response?.data?.detail || 'Failed to update password',
      status: 'error',
    };
  }
};

const resetPassword = async (token: string, password: string): Promise<ApiResponse<void>> => {
  try {
    await api.post(`${BASE_URL}/users/reset-password`, { token, password });
    return {
      status: 'success',
    };
  } catch (error: any) {
    return {
      error: error.response?.data?.detail || 'Failed to reset password',
      status: 'error',
    };
  }
};

const requestPasswordReset = async (email: string): Promise<ApiResponse<void>> => {
  try {
    await api.post(`${BASE_URL}/users/forgot-password`, { email });
    return {
      status: 'success',
    };
  } catch (error: any) {
    return {
      error: error.response?.data?.detail || 'Failed to request password reset',
      status: 'error',
    };
  }
};

export const authService = {
  login,
  register,
  getCurrentUser,
  updateUser,
  logout,
  refreshToken,
  updatePassword,
  resetPassword,
  requestPasswordReset,
};
