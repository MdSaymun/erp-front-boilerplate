import { create } from 'zustand';

import type { AuthSession, AuthStatus } from '@/types/auth';
import type { PermissionKey } from '@/types/permission';
import type { User } from '@/types/user';

/**
 * Session/UI state for authentication.
 *
 * Holds what the backend told us about the signed-in user so the shell can render
 * menus, names and permission-aware controls. It is never persisted to storage and
 * it is NOT a security boundary: every request is authorized by the backend.
 */
interface AuthState {
  status: AuthStatus;
  user: User | null;
  permissions: ReadonlySet<PermissionKey>;
  /** Short-lived access token kept in memory only. Wired when the auth API exists. */
  accessToken: string | null;

  setSession: (session: AuthSession, accessToken?: string) => void;
  markExpired: () => void;
  clearSession: () => void;
  hasPermission: (permission: PermissionKey) => boolean;
}

const EMPTY_PERMISSIONS: ReadonlySet<PermissionKey> = new Set();

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: 'unknown',
  user: null,
  permissions: EMPTY_PERMISSIONS,
  accessToken: null,

  setSession: (session, accessToken) =>
    set({
      status: 'authenticated',
      user: session.user,
      permissions: new Set(session.permissions),
      accessToken: accessToken ?? null,
    }),

  markExpired: () => set({ status: 'expired', accessToken: null }),

  clearSession: () =>
    set({ status: 'anonymous', user: null, permissions: EMPTY_PERMISSIONS, accessToken: null }),

  hasPermission: (permission) => get().permissions.has(permission),
}));
