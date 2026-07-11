import api from '@/services/api';
import { API_BASE_URL, API_PREFIX } from '@/constants/api';

export async function checkApiConnection(): Promise<{ connected: boolean; version?: string; error?: string }> {
  try {
    const res = await api.get('/health', { timeout: 5000 });
    return { connected: true, version: res.data?.version || '1.0.0' };
  } catch (error: any) {
    return {
      connected: false,
      error: error?.message || 'No se pudo conectar con el servidor',
    };
  }
}

export function getApiBaseUrl(): string {
  return `${API_BASE_URL}${API_PREFIX}`;
}

export function buildImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}/storage/${path}`;
}

export function handleApiError(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstError = Object.values(errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0];
    }
  }
  if (error?.message === 'Network Error') {
    return 'Error de conexión. Verifica tu internet.';
  }
  return 'Error inesperado. Intenta de nuevo.';
}

export function isAuthError(error: any): boolean {
  return error?.response?.status === 401;
}

export function isForbidden(error: any): boolean {
  return error?.response?.status === 403;
}

export function isValidationError(error: any): boolean {
  return error?.response?.status === 422;
}
