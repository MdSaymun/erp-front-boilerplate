import { CodeOutlined } from '@ant-design/icons';
import { lazy } from 'react';

import type { RouteHandle } from '@/app/router/routeHandle';
import { ROUTES } from '@/constants/routes';
import type { ModuleManifest } from '@/features/core/moduleManifest';

import { lazyPage } from '@/app/router/lazyPage';

const base = ROUTES.devPatterns;

/**
 * Developer showcase module: the living reference for every shared pattern.
 * Mounted only when `env.devToolsEnabled` (never in production builds).
 */
export const developerModule: ModuleManifest = {
  key: 'developer',
  label: 'Developer',
  icon: <CodeOutlined />,
  basePath: base,
  devOnly: true,
  permissions: [
    'dev.patterns.view',
    'dev.patterns.create',
    'dev.patterns.update',
    'dev.patterns.delete',
    'dev.patterns.export',
  ],
  routes: [
    { index: true, lazy: lazyPage(() => import('./pages/PatternsIndexPage')) },
    {
      path: 'list',
      handle: { breadcrumb: 'List' } satisfies RouteHandle,
      lazy: lazyPage(() => import('./pages/SampleRecordListPage')),
    },
    {
      path: 'records/new',
      handle: { breadcrumb: 'New record' } satisfies RouteHandle,
      lazy: lazyPage(() => import('./pages/SampleRecordFormPage')),
    },
    {
      path: 'records/:id',
      handle: { breadcrumb: 'Record' } satisfies RouteHandle,
      lazy: lazyPage(() => import('./pages/SampleRecordDetailPage')),
    },
    {
      path: 'records/:id/edit',
      handle: { breadcrumb: 'Edit' } satisfies RouteHandle,
      lazy: lazyPage(() => import('./pages/SampleRecordFormPage')),
    },
    {
      path: 'inputs',
      handle: { breadcrumb: 'Form inputs' } satisfies RouteHandle,
      lazy: lazyPage(() => import('./pages/FormInputsPage')),
    },
    {
      path: 'import',
      handle: { breadcrumb: 'Import' } satisfies RouteHandle,
      lazy: lazyPage(() => import('./pages/ImportPage')),
    },
    {
      path: 'widgets',
      handle: { breadcrumb: 'Widgets' } satisfies RouteHandle,
      lazy: lazyPage(() => import('./pages/WidgetsPage')),
    },
    {
      path: 'report',
      handle: { breadcrumb: 'Report' } satisfies RouteHandle,
      lazy: lazyPage(() => import('./pages/ReportPage')),
    },
  ],
  navigation: [
    { key: 'dev-patterns', label: 'Patterns', path: base, module: 'developer' },
    { key: 'dev-patterns-list', label: 'List pattern', path: `${base}/list`, module: 'developer' },
    {
      key: 'dev-patterns-inputs',
      label: 'Form inputs',
      path: `${base}/inputs`,
      module: 'developer',
    },
    {
      key: 'dev-patterns-import',
      label: 'Import wizard',
      path: `${base}/import`,
      module: 'developer',
    },
    { key: 'dev-patterns-widgets', label: 'Widgets', path: `${base}/widgets`, module: 'developer' },
    {
      key: 'dev-patterns-report',
      label: 'Report viewer',
      path: `${base}/report`,
      module: 'developer',
    },
  ],
  widgets: [
    {
      key: 'demo-kpis',
      module: 'dashboard',
      title: 'Key figures (demo)',
      size: 'xl',
      order: 0,
      component: lazy(() => import('./widgets/DemoKpiWidget')),
    },
    {
      key: 'demo-recent',
      module: 'dashboard',
      title: 'Recent documents (demo)',
      size: 'lg',
      order: 1,
      component: lazy(() => import('./widgets/DemoRecentDocumentsWidget')),
    },
    {
      key: 'demo-notes',
      module: 'dashboard',
      title: 'Getting started',
      size: 'lg',
      order: 2,
      component: lazy(() => import('./widgets/DemoNotesWidget')),
    },
  ],
};
