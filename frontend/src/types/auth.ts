export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_developer: boolean;
  token_balance: number;
  agent_purchases: number[];
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  is_developer?: boolean;
}

export interface RegisterCredentials extends RegisterData {
  confirm_password: string;
}
