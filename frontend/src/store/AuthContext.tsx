import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import type { User, AuthState, LoginCredentials, RegisterData } from '../types/user';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await authService.getCurrentUser(storedToken);
          if (response.status === 'success' && response.data) {
            setUser(response.data);
            setToken(storedToken);
          }
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.status === 'success' && response.data) {
        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError('Failed to login');
    }
  };

  const register = async (data: RegisterData) => {
    setError(null);
    try {
      const response = await authService.register({ ...data, confirm_password: data.password });
      if (response.status === 'success' && response.data) {
        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to register');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    setError(null);
    if (!token) {
      setError('Not authenticated');
      return;
    }

    try {
      const response = await authService.updateUser(token, data);
      if (response.status === 'success' && response.data) {
        setUser(response.data);
      } else {
        setError(response.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
