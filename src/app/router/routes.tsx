import type { ComponentType } from 'react';
import { Navigate, type RouteObject } from 'react-router';

import { RouteErrorBoundary } from '@/components/feedback/RouteErrorBoundary';
import { MODULE_KEYS, type ModuleKey, MODULES } from '@/config/modules';
import { ROUTES } from '@/constants/routes';
import type { ModuleManifest } from '@/features/core/moduleManifest';
import { MODULE_MANIFESTS } from '@/features/registry';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ErrorLayout } from '@/layouts/ErrorLayout';

import { lazyPage } from './lazyPage';
import { ModuleRoute, PermissionRoute, ProtectedRoute } from './routeGuards';
import type { RouteHandle } from './routeHandle';

const placeholder = () => import('@/pages/placeholders/ModulePlaceholderPage');

interface PlaceholderRouteSpec {
  path: string;
  module: ModuleKey;
  breadcrumb: string;
  permission?: string;
  importer?: () => Promise<{ default: ComponentType }>;
}

/**
 * Placeholder entry routes for modules that have no manifest yet. Once a module
 * is generated (`npm run generate:module`) its manifest replaces the placeholder.
 */
const PLACEHOLDER_ROUTES: PlaceholderRouteSpec[] = [
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
  {
    path: ROUTES.administration,
    module: 'administration',
    breadcrumb: 'Administration',
    permission: 'administration.module.manage',
  },
];

function placeholderRoute(spec: PlaceholderRouteSpec): RouteObject {
  const handle: RouteHandle = {
    breadcrumb: spec.breadcrumb,
    title: spec.breadcrumb,
    module: spec.module,
  };
  const route: RouteObject = {
    path: `${spec.path}/*`,
    handle,
    lazy: lazyPage(spec.importer ?? placeholder),
  };
  if (!spec.permission) return route;
  return {
    element: <PermissionRoute permission={spec.permission as RouteHandle['permission'] & string} />,
    children: [route],
  };
}

/** Mounts a module manifest under its base path with module and permission guards. */
function manifestRoute(manifest: ModuleManifest): RouteObject {
  const handle: RouteHandle = {
    breadcrumb: manifest.label,
    title: manifest.label,
    module: manifest.key,
    permission: manifest.permission,
    dev: manifest.devOnly,
  };
  const route: RouteObject = { path: manifest.basePath, handle, children: manifest.routes };
  const permissionGuarded: RouteObject = manifest.permission
    ? { element: <PermissionRoute permission={manifest.permission} />, children: [route] }
    : route;
  return { element: <ModuleRoute module={manifest.key} />, children: [permissionGuarded] };
}

const manifestKeys = new Set(MODULE_MANIFESTS.map((m) => m.key));
const knownKeys = new Set<string>(MODULE_KEYS);

const moduleRoutes: RouteObject[] = [
  ...MODULE_MANIFESTS.filter((m) => knownKeys.has(m.key) && MODULES[m.key]).map(manifestRoute),
  ...PLACEHOLDER_ROUTES.filter((spec) => !manifestKeys.has(spec.module)).map(placeholderRoute),
];

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
              ...moduleRoutes,
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
