# ERP Frontend Boilerplate

A production-grade, product-agnostic frontend for a **multi-tenant ERP SaaS**. Copy it to
start any ERP product (inventory, sales, accounting, HR, POS, ...): the application shell,
routing, data layer, standard list/record/form patterns, i18n, mock API, tests and tooling
are already in place. You add business modules.

**Start here:** [docs/getting-started-new-erp.md](docs/getting-started-new-erp.md).

```bash
npm install
npm run init:project -- --name "Acme ERP"            # name the product
npm run dev                                           # runs on mock data
npm run generate:module -- sales --entity SalesOrder  # first business module
```

## ERP vision

Modules (CRM, Sales, Purchasing, Inventory, Accounting, POS, Manufacturing, HR, Payroll,
Expenses, Projects, Assets, Helpdesk, E-commerce, Reporting/BI, Administration, SaaS
billing) plug into one shell through **module manifests** (`src/features/<key>/module.tsx`,
registered in `src/features/registry.ts`). They share one API client, one set of ERP domain
types (`src/types/erp.ts`), one design language and one set of UI patterns. Concepts follow
established ERP workflows (documents, workflow states, parties, warehouses) with our own
implementation.

Multi-tenancy: **Tenant → Company → Branch → Warehouse → Location → Inventory**. The backend
(ASP.NET Core, EF Core, SQL Server, shared database with TenantId isolation) enforces all
security; the frontend only displays context.

## Technology stack

| Concern       | Choice                                          |
| ------------- | ----------------------------------------------- |
| Core          | React 19, TypeScript 6 (strict), Vite 8         |
| UI            | Ant Design 6, @ant-design/icons                 |
| Routing       | React Router 8 (data mode)                      |
| Server state  | TanStack Query 5                                |
| Client state  | Zustand 5                                       |
| HTTP          | Axios                                           |
| Forms         | React Hook Form, Zod 4, @hookform/resolvers     |
| Dates/numbers | dayjs (utc + timezone), Intl APIs               |
| Unit tests    | Vitest 5, Testing Library, jest-dom, user-event |
| E2E           | Playwright                                      |
| Quality       | ESLint 10 (flat), Prettier, Husky, lint-staged  |

## Prerequisites

- Node.js **≥ 22.22** (developed on Node 26)
- npm (lockfile is `package-lock.json`)

## Installation

```bash
npm install
npx playwright install chromium   # only needed for E2E
```

## Development

```bash
npm run dev          # http://localhost:5173
```

## Environment variables

Configuration is read **only** in `src/config/env.ts` and validated with Zod at startup.

| Variable            | Purpose                                     | Example                     |
| ------------------- | ------------------------------------------- | --------------------------- |
| `VITE_APP_NAME`     | Display name in the shell                   | `Acme ERP`                  |
| `VITE_API_BASE_URL` | Backend REST base URL (absolute)            | `http://localhost:5000/api` |
| `VITE_ENVIRONMENT`  | `development` `test` `staging` `production` | `development`               |

Files: `.env.example` (template), `.env.development` (tracked, local defaults),
`.env.production.example` (shape only; real production values come from CI). `VITE_*` values
are public; never put secrets in them.

`npm run build` reads `.env.production` (git-ignored) or the variables exported by CI. If
`VITE_API_BASE_URL` is missing, the built app shows a configuration error instead of the shell.
The Playwright config passes explicit values to its web server, so `npm run e2e` works without
a local `.env.production`.

## Build

```bash
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve dist/ on http://localhost:4173
```

## Test

```bash
npm run test         # Vitest watch mode
npm run test:run     # single run
npm run test:coverage
```

## Lint & formatting

```bash
npm run lint         # ESLint
npm run lint:fix
npm run typecheck    # tsc -b
npm run format       # Prettier write
npm run format:check
```

## E2E

```bash
npm run e2e          # builds, serves dist/ via vite preview, runs Playwright smoke suite
npm run e2e:ui
```

No backend is required for the smoke suite.

## Folder structure

```
src/
  app/            App.tsx, providers (theme, query), router (routes, guards)
  components/     shared UI: common, feedback, navigation, forms(+inputs), documents,
                  data-table, records, chatter, auth, dashboard, import-export, reports,
                  notifications, preferences, command-palette, shortcuts, about
  i18n/           i18next setup and locale bundles
  mocks/          Mock Service Worker handlers and fixtures
  layouts/        AuthLayout, DashboardLayout, ErrorLayout
  features/       one folder per ERP module; registry.ts lists module manifests;
                  core/ = shared ERP foundation; developer/ = pattern showcase
  pages/          auth, dashboard, errors, placeholders, dev/patterns (showcase)
  services/api/   axios client, interceptors, token refresh, error normalization,
                  list query contract, resource factory, chatter, endpoint groups
  services/       shortcuts registry, command registry, realtime client
  stores/         zustand: auth, tenant, company, ui
  hooks/          usePermission, useCurrentContext, useLocaleSettings, useIsMobile…
  schemas/        shared Zod building blocks
  types/          api, auth, tenant, company, user, permission, common, erp
  config/         env, modules (availability), navigation, auth, locale
  theme/          Ant Design theme + theme-mode hook
  utils/format/   date/time/timezone, currency/decimal formatting
  constants/      routes, storage keys, shell constants
  test/           Vitest setup, render helpers, fixtures
e2e/              Playwright smoke tests and fixtures
docs/             architecture, rules, module strategy, testing strategy
```

## Scripts for new products and modules

| Script                                                                                       | What it does                                                                                         |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run init:project -- --name "Acme ERP" [--key acme-erp]`                                 | Renames the boilerplate into a product (package name, title, env, storage prefix, i18n)              |
| `npm run generate:module -- <key> --entity <Entity> [--kind document\|master] [--path /x/y]` | Generates a module (manifest, types, schema, API, hooks, pages, test, mock handler) and registers it |

## Developer showcase

With `VITE_MOCK_API=true` the app runs entirely on mock data. Open **Developer → Patterns**
(`/_dev/patterns`) to see the list, record, form, inputs, import, widgets and report
patterns every module reuses. The route is excluded from production builds.

## Architecture

See `docs/frontend-architecture.md` and `docs/frontend-ui-patterns.md`. Key points:

- Feature-based modules with a shared ERP core (`src/types/erp.ts`, `src/components/documents/`).
- TanStack Query for server state; Zustand for UI state only.
- One Axios client; every error is a normalized `ApiError` prepared for ASP.NET ProblemDetails.
- Central route config with lazy pages, `ProtectedRoute`, `PermissionRoute`, `ModuleRoute`.
- Navigation and module availability are configuration (`src/config/navigation.tsx`, `modules.ts`).
- Ant Design `ConfigProvider` theme with light/dark modes (`src/theme/theme.ts`).

## Future ERP modules

`src/features/<module>/README.md` describes each module's scope. Adding a module is documented
step-by-step in `docs/frontend-module-strategy.md`.

## Development workflow

1. Create a branch; keep changes small and module-scoped.
2. Run `npm run lint`, `npm run typecheck`, `npm run test:run` locally (Husky runs lint-staged on commit).
3. Add tests next to the code you change; add E2E only for shell-level flows.
4. Follow `CLAUDE.md` and `docs/frontend-development-rules.md`.
