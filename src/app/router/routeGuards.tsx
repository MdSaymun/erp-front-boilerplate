import { Button, Result } from 'antd';
import { Link, Navigate, Outlet, useLocation } from 'react-router';

import { authConfig } from '@/config/auth';
import { isModuleEnabled, type ModuleKey } from '@/config/modules';
import { ROUTES } from '@/constants/routes';
import { usePermission } from '@/hooks/usePermission';
import { useAuthStore } from '@/stores/authStore';
import type { PermissionKey } from '@/types/permission';

/**
 * Route guards.
 *
 * These decide what the user SEES, not what they are ALLOWED to do. The backend
 * authorizes every API call independently. While `authConfig.enforceAuthentication`
 * is false (no auth backend yet) the guards let everything through.
 */

/** Requires an authenticated session; otherwise redirects to /login. */
export function ProtectedRoute() {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (!authConfig.enforceAuthentication || status === 'authenticated') {
    return <Outlet />;
  }

  return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
}

interface PermissionRouteProps {
  permission: PermissionKey;
}

/** Requires a permission key (UX only); otherwise redirects to /forbidden. */
export function PermissionRoute({ permission }: PermissionRouteProps) {
  const { hasPermission } = usePermission();

  if (hasPermission(permission)) {
    return <Outlet />;
  }

  return <Navigate to={ROUTES.forbidden} replace />;
}

interface ModuleRouteProps {
  module: ModuleKey;
}

/** Renders the module's routes only when the module is enabled for this deployment. */
export function ModuleRoute({ module }: ModuleRouteProps) {
  if (isModuleEnabled(module)) {
    return <Outlet />;
  }

  return (
    <Result
      status="info"
      title="Module not available"
      subTitle="This module is not enabled for your subscription."
      extra={
        <Link to={ROUTES.dashboard}>
          <Button type="primary">Go to dashboard</Button>
        </Link>
      }
    />
  );
}
