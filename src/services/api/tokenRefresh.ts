import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/authStore';

import { AUTH_API } from './endpoints/auth';
import { isApiError } from './errors';

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

interface TokenRefresher {
  (): Promise<{ accessToken: string } | null>;
}

let refreshInFlight: Promise<string | null> | null = null;

function isAuthEndpoint(url: string | undefined): boolean {
  return Boolean(url && url.includes(AUTH_API.base + '/'));
}

/**
 * Single-flight refresh: many concurrent 401s trigger one refresh call, and
 * every waiting request is retried once with the new token. If refresh fails,
 * the session is cleared and the original errors propagate.
 */
export async function refreshAccessToken(refresher: TokenRefresher): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = refresher()
      .then((result) => {
        const token = result?.accessToken ?? null;
        if (token) {
          useAuthStore.setState({ accessToken: token, status: 'authenticated' });
        } else {
          useAuthStore.getState().clearSession();
        }
        return token;
      })
      .catch(() => {
        useAuthStore.getState().clearSession();
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/** Test hook: forget an in-flight refresh. */
export function resetTokenRefreshState(): void {
  refreshInFlight = null;
}

/**
 * Registers the 401 → refresh → retry behaviour on a client. Must run before the
 * error-normalizing interceptor so it sees the normalized `ApiError`.
 */
export function registerTokenRefresh(client: AxiosInstance, refresher: TokenRefresher): void {
  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!isApiError(error) || error.code !== 'unauthorized') {
        return Promise.reject(error);
      }

      const config = (error as { config?: RetriableConfig }).config;
      if (!config || config._retried || isAuthEndpoint(config.url)) {
        useAuthStore.getState().markExpired();
        return Promise.reject(error);
      }

      // Only attempt a refresh when we had a session to begin with.
      if (useAuthStore.getState().status !== 'authenticated') {
        return Promise.reject(error);
      }

      const token = await refreshAccessToken(refresher);
      if (!token) {
        return Promise.reject(error);
      }

      config._retried = true;
      config.headers.set('Authorization', `Bearer ${token}`);
      return client.request(config);
    },
  );
}
