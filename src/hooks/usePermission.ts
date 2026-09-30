import { useCallback } from 'react';

import { authConfig } from '@/config/auth';
import { useAuthStore } from '@/stores/authStore';
import type { PermissionKey } from '@/types/permission';

/**
 * Permission checks for UX decisions (menus, buttons, routes).
 *
 * While authentication is not enforced (see config/auth.ts) every check passes so
 * the shell can be developed. This hook must never gate anything that matters:
 * the backend authorizes every request.
 */
export function usePermission() {
  const permissions = useAuthStore((state) => state.permissions);

  const hasPermission = useCallback(
    (permission: PermissionKey): boolean => {
      if (!authConfig.enforceAuthentication) {
        return true;
      }
      return permissions.has(permission);
    },
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (keys: PermissionKey[]): boolean => keys.some((key) => hasPermission(key)),
    [hasPermission],
  );

  return { hasPermission, hasAnyPermission };
}
