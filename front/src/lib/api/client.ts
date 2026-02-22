import type { ApiResponse, ErrorResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions extends RequestInit {
  retry?: number;
  retryDelay?: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: ErrorResponse
  ) {
    super(data?.message || statusText);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

const isMobile = !!import.meta.env.VITE_API_URL;

/**
 * Récupère le token JWT depuis localStorage (mobile uniquement)
 * Sur web, le cookie httpOnly est envoyé automatiquement via credentials: 'include'
 */
function getAuthToken(): string | null {
  if (!isMobile) return null;
  return localStorage.getItem('token');
}

/**
 * Construit les headers par défaut avec auth si disponible
 */
function getDefaultHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Attend un certain délai (pour retry)
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fonction de retry avec backoff exponentiel
 */
async function fetchWithRetry(
  url: string,
  options: RequestOptions = {},
  attemptsLeft: number = 3,
  retryDelay: number = 1000
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (response.ok || (response.status >= 400 && response.status < 500)) {
      return response;
    }

    if (attemptsLeft > 1) {
      await delay(retryDelay);
      return fetchWithRetry(url, options, attemptsLeft - 1, retryDelay * 2);
    }

    return response;
  } catch (error) {
    if (attemptsLeft > 1) {
      await delay(retryDelay);
      return fetchWithRetry(url, options, attemptsLeft - 1, retryDelay * 2);
    }
    throw new NetworkError('Network request failed');
  }
}

/**
 * Parse la réponse et gère les erreurs
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    const errorData: ErrorResponse | undefined = isJson
      ? await response.json()
      : undefined;

    throw new ApiError(response.status, response.statusText, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = isJson ? await response.json() : await response.text();

  return data as T;
}

export const apiClient = {
  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const { retry = 2, retryDelay = 1000, ...fetchOptions } = options;

    const response = await fetchWithRetry(
      url,
      {
        ...fetchOptions,
        method: 'GET',
        headers: {
          ...getDefaultHeaders(),
          ...fetchOptions.headers,
        },
        credentials: 'include',
      },
      retry,
      retryDelay
    );

    return handleResponse<T>(response);
  },

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const { retry = 2, retryDelay = 1000, ...fetchOptions } = options;

    const response = await fetchWithRetry(
      url,
      {
        ...fetchOptions,
        method: 'POST',
        headers: {
          ...getDefaultHeaders(),
          ...fetchOptions.headers,
        },
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined,
      },
      retry,
      retryDelay
    );

    return handleResponse<T>(response);
  },

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const { retry = 2, retryDelay = 1000, ...fetchOptions } = options;

    const response = await fetchWithRetry(
      url,
      {
        ...fetchOptions,
        method: 'PUT',
        headers: {
          ...getDefaultHeaders(),
          ...fetchOptions.headers,
        },
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined,
      },
      retry,
      retryDelay
    );

    return handleResponse<T>(response);
  },

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const { retry = 2, retryDelay = 1000, ...fetchOptions } = options;

    const response = await fetchWithRetry(
      url,
      {
        ...fetchOptions,
        method: 'DELETE',
        headers: {
          ...getDefaultHeaders(),
          ...fetchOptions.headers,
        },
        credentials: 'include',
      },
      retry,
      retryDelay
    );

    return handleResponse<T>(response);
  },

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const { retry = 2, retryDelay = 1000, ...fetchOptions } = options;

    const response = await fetchWithRetry(
      url,
      {
        ...fetchOptions,
        method: 'PATCH',
        headers: {
          ...getDefaultHeaders(),
          ...fetchOptions.headers,
        },
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined,
      },
      retry,
      retryDelay
    );

    return handleResponse<T>(response);
  },
};

/**
 * Helper pour les requêtes qui retournent ApiResponse<T>
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  switch (method) {
    case 'GET':
      return apiClient.get<ApiResponse<T>>(endpoint, options);
    case 'POST':
      return apiClient.post<ApiResponse<T>>(endpoint, data, options);
    case 'PUT':
      return apiClient.put<ApiResponse<T>>(endpoint, data, options);
    case 'DELETE':
      return apiClient.delete<ApiResponse<T>>(endpoint, options);
    case 'PATCH':
      return apiClient.patch<ApiResponse<T>>(endpoint, data, options);
  }
}

export default apiClient;
