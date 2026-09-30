import type { ComponentType } from 'react';
import { Navigate, type RouteObject } from 'react-router';

import { RouteErrorBoundary } from '@/components/feedback/RouteErrorBoundary';
import type { ModuleKey } from '@/config/modules';
import { ROUTES } from '@/constants/routes';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ErrorLayout } from '@/layouts/ErrorLayout';

import { PermissionRoute, ProtectedRoute } from './routeGuards';
import type { RouteHandle } from './routeHandle';

/** Adapts a default-exported page module to React Router's lazy route object. */
function lazyPage(importer: () => Promise<{ default: ComponentType }>): RouteObject['lazy'] {
  return async () => ({ Component: (await importer()).default });
}

const placeholder = () => import('@/pages/placeholders/ModulePlaceholderPage');

interface ModuleRouteSpec {
  path: string;
  module: ModuleKey;
  breadcrumb: string;
  importer?: () => Promise<{ default: ComponentType }>;
}

/** Module entry routes. `path/*` lets a module own its sub-paths (e.g. /inventory/locations). */
const MODULE_ROUTES: ModuleRouteSpec[] = [
  { path: ROUTES.products, module: 'inventory', breadcrumb: 'Products' },
  { path: ROUTES.inventory, module: 'inventory', breadcrumb: 'Inventory' },
  { path: ROUTES.warehouses, module: 'inventory', breadcrumb: 'Warehouses' },
  { path: ROUTES.purchasing, module: 'purchasing', breadcrumb: 'Purchasing' },
  { path: ROUTES.sales, module: 'sales', breadcrumb: 'Sales' },
  { path: ROUTES.crm, module: 'crm', breadcrumb: 'CRM' },
  { path: ROUTES.accounting, module: 'accounting', breadcrumb: 'Accounting' },
  { path: ROUTES.pos, module: 'pos', breadcrumb: 'POS' },
  { path: ROUTES.manufacturing, module: 'manufacturing', breadcrumb: 'Manufacturing' },
  { path: ROUTES.hr, module: 'hr', breadcrumb: 'HR' },
  { path: ROUTES.payroll, module: 'payroll', breadcrumb: 'Payroll' },
  { path: ROUTES.expenses, module: 'expenses', breadcrumb: 'Expenses' },
  { path: ROUTES.projects, module: 'projects', breadcrumb: 'Projects' },
  { path: ROUTES.assets, module: 'assets', breadcrumb: 'Assets' },
  { path: ROUTES.helpdesk, module: 'helpdesk', breadcrumb: 'Helpdesk' },
  { path: ROUTES.reports, module: 'reports', breadcrumb: 'Reports' },
  {
    path: ROUTES.settings,
    module: 'settings',
    breadcrumb: 'Settings',
    importer: () => import('@/pages/placeholders/SettingsPage'),
  },
];

function moduleRoute(spec: ModuleRouteSpec): RouteObject {
  const handle: RouteHandle = {
    breadcrumb: spec.breadcrumb,
    title: spec.breadcrumb,
    module: spec.module,
  };
  return {
    path: `${spec.path}/*`,
    handle,
    lazy: lazyPage(spec.importer ?? placeholder),
  };
}

/**
 * Central route configuration. Consumed by `createBrowserRouter` in AppRouter and
 * by `createMemoryRouter` in tests.
 */
export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: ROUTES.root, element: <Navigate to={ROUTES.dashboard} replace /> },

      // Public routes
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.login,
            handle: { title: 'Sign in' } satisfies RouteHandle,
            lazy: lazyPage(() => import('@/pages/auth/LoginPage')),
          },
        ],
      },

      // Protected application shell
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: ROUTES.dashboard,
                handle: {
                  breadcrumb: 'Dashboard',
                  title: 'Dashboard',
                  module: 'dashboard',
                } satisfies RouteHandle,
                lazy: lazyPage(() => import('@/pages/dashboard/DashboardPage')),
              },
              ...MODULE_ROUTES.map(moduleRoute),
              {
                // Permission-aware route example (UX only; backend authorizes).
                element: <PermissionRoute permission="administration.module.manage" />,
                children: [
                  moduleRoute({
                    path: ROUTES.administration,
                    module: 'administration',
                    breadcrumb: 'Administration',
                  }),
                ],
              },
            ],
          },
        ],
      },

      // Error routes
      {
        element: <ErrorLayout />,
        children: [
          {
            path: ROUTES.unauthorized,
            lazy: lazyPage(() => import('@/pages/errors/UnauthorizedPage')),
          },
          { path: ROUTES.forbidden, lazy: lazyPage(() => import('@/pages/errors/ForbiddenPage')) },
          {
            path: ROUTES.serverError,
            lazy: lazyPage(() => import('@/pages/errors/ServerErrorPage')),
          },
          { path: '*', lazy: lazyPage(() => import('@/pages/errors/NotFoundPage')) },
        ],
      },
    ],
  },
];
