import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/authStore';
import { useCompanyStore } from '@/stores/companyStore';

import { authApi } from './endpoints/auth';
import { normalizeApiError } from './errors';
import { registerTokenRefresh } from './tokenRefresh';

/** Header carrying the UI-selected company. The backend validates membership; the value is a hint, not an authority. */
export const COMPANY_HEADER = 'X-Company-Id';

export function attachRequestContext(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const { accessToken } = useAuthStore.getState();
  const { currentCompanyId } = useCompanyStore.getState();

  if (accessToken && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (currentCompanyId) {
    config.headers.set(COMPANY_HEADER, currentCompanyId);
  }

  return config;
}

export function registerInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(attachRequestContext);

  // Response interceptors run in registration order: normalize first so the
  // refresh handler receives an `ApiError` (with the original config attached).
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const apiError = normalizeApiError(error);
      const config = (error as { config?: InternalAxiosRequestConfig }).config;
      return Promise.reject(config ? { ...apiError, config } : apiError);
    },
  );

  registerTokenRefresh(client, () => authApi.refresh());
}
