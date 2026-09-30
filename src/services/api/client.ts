import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { env } from '@/config/env';
import { HTTP } from '@/constants/app';

import { registerInterceptors } from './interceptors';

/**
 * The single HTTP client for the application.
 *
 * All module services must use this instance so authentication, company context,
 * timeouts and error normalization are applied consistently. Rejections are always
 * `ApiError` (see errors.ts).
 */
export function createApiClient(config: AxiosRequestConfig = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: HTTP.timeoutMs,
    headers: {
      Accept: 'application/json, application/problem+json',
      'Content-Type': 'application/json',
    },
    // Cookies are sent when the backend opts into cookie-based sessions.
    withCredentials: true,
    ...config,
  });

  registerInterceptors(instance);
  return instance;
}

export const apiClient = createApiClient();

/** Typed helpers so modules do not depend on Axios response envelopes directly. */
export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    (await apiClient.get<T>(url, config)).data,
  post: async <T, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<T> => (await apiClient.post<T>(url, body, config)).data,
  put: async <T, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<T> => (await apiClient.put<T>(url, body, config)).data,
  patch: async <T, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<T> => (await apiClient.patch<T>(url, body, config)).data,
  delete: async <T = void>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    (await apiClient.delete<T>(url, config)).data,
};
