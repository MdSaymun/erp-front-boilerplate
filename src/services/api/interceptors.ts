import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/authStore';
import { useCompanyStore } from '@/stores/companyStore';

import { normalizeApiError } from './errors';

/** Header carrying the UI-selected company. The backend validates membership; the value is a hint, not an authority. */
export const COMPANY_HEADER = 'X-Company-Id';

export function attachRequestContext(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const { accessToken } = useAuthStore.getState();
  const { currentCompanyId } = useCompanyStore.getState();

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (currentCompanyId) {
    config.headers.set(COMPANY_HEADER, currentCompanyId);
  }

  return config;
}

export function registerInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(attachRequestContext);

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const apiError = normalizeApiError(error);

      if (apiError.code === 'unauthorized') {
        // Let the shell react (redirect to login) once real auth exists.
        useAuthStore.getState().markExpired();
      }

      return Promise.reject(apiError);
    },
  );
}
