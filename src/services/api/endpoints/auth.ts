import type { AuthSession, LoginCredentials } from '@/types/auth';
import type { IsoDateTimeString } from '@/types/common';

import { http } from '../client';

/**
 * Authentication and session endpoints.
 *
 * Contract agreed with the backend plan: access tokens travel in the JSON body
 * and are kept in memory; the refresh token is an httpOnly cookie managed by the
 * server, so `refresh()` sends no body.
 */
export const AUTH_API = {
  base: '/auth',
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  session: '/auth/session',
} as const;

export interface AccessTokenResponse {
  accessToken: string;
  expiresAt: IsoDateTimeString;
}

export interface LoginResponse extends AccessTokenResponse {
  session: AuthSession;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    http.post<LoginResponse, LoginCredentials>(AUTH_API.login, credentials),
  refresh: () => http.post<AccessTokenResponse>(AUTH_API.refresh),
  logout: () => http.post<void>(AUTH_API.logout),
  session: (signal?: AbortSignal) => http.get<AuthSession>(AUTH_API.session, { signal }),
};
