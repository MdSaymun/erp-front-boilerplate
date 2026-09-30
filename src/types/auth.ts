import type { CompanySummary } from './company';
import type { IsoDateTimeString } from './common';
import type { PermissionKey } from './permission';
import type { Tenant } from './tenant';
import type { User } from './user';

export type AuthStatus = 'unknown' | 'anonymous' | 'authenticated' | 'expired';

/**
 * What the backend will return once a session is established.
 * The frontend stores this in memory for UI behaviour only; the backend enforces
 * every authorization decision on every request.
 */
export interface AuthSession {
  user: User;
  tenant: Tenant;
  companies: CompanySummary[];
  /** Company the backend considers current for this session. */
  currentCompanyId?: string;
  permissions: PermissionKey[];
  expiresAt?: IsoDateTimeString;
}

/** Placeholder credential shape for the future login form. */
export interface LoginCredentials {
  email: string;
  password: string;
}
