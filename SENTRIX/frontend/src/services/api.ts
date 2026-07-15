import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_PREFIX } from '@/constants/api';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API] ${response.config?.method?.toUpperCase()} ${response.config?.url} → ${response.status}`);
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    if (__DEV__) {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.status,
        error.response?.data?.message || error.message
      );
    }

    if (error.response?.status === 401) {
      const hadToken = error.config?.headers?.Authorization;
      if (hadToken) useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export interface ApiError {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export default api;
