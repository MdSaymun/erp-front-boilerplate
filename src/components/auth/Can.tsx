import type { PropsWithChildren, ReactNode } from 'react';

import { usePermission } from '@/hooks/usePermission';
import type { PermissionKey } from '@/types/permission';

interface CanProps extends PropsWithChildren {
  /** Single permission key required. */
  permission?: PermissionKey;
  /** Any of these keys is enough. */
  anyOf?: PermissionKey[];
  /** Rendered when the check fails (default: nothing). */
  fallback?: ReactNode;
}

/**
 * Shows children only when the user holds the permission. UX only: the backend
 * still authorizes every request.
 */
export function Can({ permission, anyOf, fallback = null, children }: CanProps) {
  const { hasPermission, hasAnyPermission } = usePermission();
  const allowed = permission ? hasPermission(permission) : anyOf ? hasAnyPermission(anyOf) : true;
  return <>{allowed ? children : fallback}</>;
}
