# Frontend architecture

## Purpose

The frontend is a modular ERP client. Inventory is the first module; the architecture is
designed so CRM, Sales, Purchasing, Accounting, POS, Manufacturing, HR, Payroll, Expenses,
Projects, Assets, Helpdesk, E-commerce, Reports, Settings and Administration slot in without
reworking the shell.

## Application layers

| Layer         | Location                          | Responsibility                                             |
| ------------- | --------------------------------- | ---------------------------------------------------------- |
| Bootstrap     | `src/main.tsx`, `src/app/App.tsx` | Mount React, compose providers, mount router               |
| Providers     | `src/app/providers/`              | Error boundary, Ant Design theme/App, TanStack QueryClient |
| Routing       | `src/app/router/`                 | Route table, guards, route metadata (`handle`)             |
| Layouts       | `src/layouts/`                    | Auth, Dashboard (shell), Error                             |
| Shared UI     | `src/components/`                 | Common, feedback, navigation, forms, document patterns     |
| Features      | `src/features/<module>/`          | Module-owned pages, hooks, services, schemas, types        |
| Services      | `src/services/api/`               | Axios client, interceptors, error normalization, endpoints |
| State         | `src/stores/`                     | Zustand UI/session stores                                  |
| Domain types  | `src/types/`                      | API contracts, tenant/company/user/permission, shared ERP  |
| Configuration | `src/config/`                     | env, module availability, navigation, auth switch, locale  |
| Theme         | `src/theme/`                      | Ant Design tokens and mode resolution                      |
| Utilities     | `src/utils/`                      | Formatting (dates, time zones, currency, decimals)         |

Dependency direction: features → shared (components, hooks, services, stores, types, utils).
Shared code never imports from a business feature. `features/core` is the only feature other
features may import from.

## Folder structure

See README.md for the tree. Notable decisions:

- `pages/` holds route components that are not owned by a business module yet (auth, dashboard,
  errors, placeholders). When a module is implemented its pages move to `features/<module>/pages/`
  and the route table points there.
- `components/documents/` holds the document-oriented UI patterns (status tag, header, action
  bar, line-item table, totals, confirm button) that every transactional module reuses.
- `types/erp.ts` defines the shared ERP vocabulary (Party, Contact, Address, Currency, Money,
  Tax, UnitOfMeasure, ProductRef, DocumentType, DocumentStatus, DocumentNumber, DocumentHeaderBase,
  DocumentLineBase, DocumentTotals, FiscalPeriod, Attachment, Comment, Activity, AuditEntry,
  AppNotification). Modules extend these instead of redefining them.

## Feature modules

Each module is self-contained:

```
features/<module>/
  components/  hooks/  schemas/  services/  types/  pages/  index.ts  README.md
```

Modules expose a small public surface via `index.ts`. Cross-module needs go through shared
types or `features/core`, never through direct imports between business modules.

## Shared ERP foundation

- **Documents**: `DocumentStatus` and `DOCUMENT_STATUS_META` (in `features/core`) give every
  document type the same status semantics and presentation.
- **Money and locale**: `Money`, `Currency`, `LocaleSettings`; formatting goes through
  `utils/format` with settings from `useLocaleSettings()` (company → tenant → fallback).
- **Parties**: customers, vendors and employees are all `Party` records with typed roles.
- **Audit/collaboration**: `AuditFields`, `Attachment`, `Comment`, `Activity` are shared so
  detail pages across modules can use the same tabs.

## Ant Design strategy

- Ant Design 6 is the only component framework. `ConfigProvider` (in `ThemeProvider`) applies a
  central theme built by `buildTheme(mode)`, with light and dark algorithms and ERP-oriented
  component tokens (compact tables, 32px controls, restrained header/sider).
- `App` from antd wraps the tree so `App.useApp()` provides context-aware `message`,
  `notification` and `modal`.
- Global CSS is minimal (`src/styles/global.css`); component styling is antd CSS-in-JS.
- Layout patterns: list page = Breadcrumb → PageHeader → actions → filters → table → pagination;
  detail page = Breadcrumb → PageHeader → summary → tabs → related → actions; form page =
  Breadcrumb → PageHeader → form → Save/Cancel. `PageContainer` provides the frame.

## State management

- **TanStack Query** owns all server data. Query keys are module-scoped; defaults: 30s staleTime,
  5min gcTime, no refetch on window focus, retries only for transient errors (never for 4xx
  auth/validation), mutations never retried.
- **Zustand** owns client state only:
  - `authStore`: session status, user, permission set, in-memory access token
  - `tenantStore`: current tenant display data
  - `companyStore`: available companies and the selected company id
  - `uiStore`: sidebar, mobile drawer, theme mode, table density (persisted to localStorage)
- Nothing in the stores is a security boundary.

## Routing

- React Router 8 in data mode: `createBrowserRouter(routes)` created once at module scope.
- `routes.tsx` is the single route table. Every page is lazy-loaded; route `handle` carries
  breadcrumb, title and owning module. Module routes are `path/*` so a module owns its
  sub-paths.
- Guards (`routeGuards.tsx`): `ProtectedRoute` (session), `PermissionRoute` (permission key),
  `ModuleRoute` (module availability). Guards decide what is shown, not what is allowed.
- Errors: `RouteErrorBoundary` as `errorElement`; explicit `/unauthorized`, `/forbidden`,
  `/server-error` and `*` routes under `ErrorLayout`.

## API architecture

- One Axios instance (`services/api/client.ts`) with base URL from `env`, JSON headers, timeout,
  request interceptor (bearer token, `X-Company-Id` hint) and response interceptor that rejects
  with a normalized `ApiError`.
- `errors.ts` understands ASP.NET Core `ProblemDetails` and `ValidationProblemDetails`, maps
  status codes to stable `ApiErrorCode`s, and never surfaces server internals for 5xx.
- `endpoints/` holds one file per backend module; they are placeholders until the backend exists.
- The `http` helper returns plain data so modules do not depend on Axios types.

## Tenant / company context

- The backend resolves TenantId from the authenticated principal. The frontend never sends or
  trusts TenantId from URL, query, forms or state.
- Company selection is a UI hint sent as `X-Company-Id`; the backend validates membership.
- `useCurrentContext()` exposes tenant/company/user for display (header context switcher).

## Environment

`src/config/env.ts` is the only reader of `import.meta.env`; it validates `VITE_APP_NAME`,
`VITE_API_BASE_URL` and `VITE_ENVIRONMENT` with Zod and throws on misconfiguration.

## Testing

Vitest + Testing Library for units/components (jsdom, antd shims in `src/test/setup.ts`),
`renderApp()` renders the real route table through a memory router, Playwright smoke tests run
against a production build. See `frontend-testing-strategy.md`.

## Performance

Pages are lazy-loaded per route so future modules do not load eagerly. Global state is minimal.
Server data is cached by TanStack Query. Wide tables scroll inside `.erp-table-wrapper`.

## Tooling notes (versions chosen on 2026-09-30)

- **TypeScript is pinned to `~6.0`** although 7.x is published: `typescript-eslint` 8.x supports
  `<6.1`, and the official Vite react-ts template pins 6.0 as well. Upgrade both together.
- **Vite 8 uses rolldown**; object-form `manualChunks` is not supported. Rely on default
  chunking (pages are already split by lazy routes).
- **Ant Design 6** enables CSS variables by default; `cssVar` accepts an object, not `true`.
  `componentSize` accepts `'small' | 'middle' | 'large'` (`'medium'` is the newer alias).
- **React Router 8** dropped `react-router-dom`; everything imports from `react-router`.
- **Zod 4** uses `{ error }` instead of `{ message }` and `z.url()` instead of `z.string().url()`.
- **Vitest 5** requires `mergeConfig(viteConfig as ViteUserConfig, …)` when reusing the Vite config.
- **eslint-plugin-react-hooks 7** ships React Compiler rules (e.g. no `setState` in effects);
  Playwright fixtures' `use` callback is exempted from `rules-of-hooks` in `eslint.config.js`.
- **Playwright** has a built-in `isMobile` fixture; custom fixtures must not reuse that name.
