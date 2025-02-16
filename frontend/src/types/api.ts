export interface ApiResponse<T = void> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ErrorResponse {
  detail: string;
  code?: string;
  params?: Record<string, any>;
}
