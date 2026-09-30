# CLAUDE.md — Inventory SaaS frontend

Permanent rules for anyone (human or AI) working in this repository.

## Product

Inventory SaaS is the **first module of a complete ERP SaaS platform**. Do not design
anything as if inventory were the whole product. CRM, Sales, Purchasing, Accounting, POS,
Manufacturing, HR, Payroll, Expenses, Projects, Assets, Helpdesk, E-commerce, Reports,
Settings and Administration will reuse everything built here.

## Architecture

- React 19 + TypeScript (strict) + Vite 8
- Ant Design 6 is the **only** UI component framework (no MUI, Tailwind, Bootstrap)
- Feature-based ERP architecture: `src/features/<module>/{components,hooks,schemas,services,types,pages}`
- Shared ERP foundation: `src/types/erp.ts` (Party, Address, Currency, Tax, UOM, Document*, Audit,
  Attachment, Activity, Notification…) and `src/components/documents/` (document UI patterns)
- Path alias `@/` → `src/` (tsconfig.app.json paths + vite.config.ts alias)
- See `docs/frontend-architecture.md`, `docs/frontend-development-rules.md`,
  `docs/frontend-module-strategy.md`, `docs/frontend-testing-strategy.md`

## State

- **TanStack Query = server state** (queries, mutations, cache, invalidation). Never copy API
  datasets into Zustand.
- **Zustand = client/UI state only** (`authStore`, `tenantStore`, `companyStore`, `uiStore`).

## Forms

- React Hook Form + Zod 4 + `@hookform/resolvers`. Use `ControlledFormItem` to bind Ant Design
  inputs. Zod messages use `{ error: '...' }` (Zod 4 syntax).

## HTTP

- Axios via the single client in `src/services/api/client.ts` (`http` helpers). Never import
  axios in features. All failures are normalized `ApiError` objects (`src/services/api/errors.ts`).
- Endpoint groups live in `src/services/api/endpoints/`. Return plain data, not Axios responses.

## Routing

- React Router 8 (data mode, `createBrowserRouter`). Central config in `src/app/router/routes.tsx`.
  Route metadata (breadcrumb, title, module) goes in `handle`. Pages are lazy-loaded.
- Route path constants live in `src/constants/routes.ts`; navigation in `src/config/navigation.tsx`.

## Security

- The **backend is the authority** for tenant, company and permission security.
- Frontend permission checks (`usePermission`, `PermissionRoute`, hidden menu items) are **UX only**.
- **Never trust TenantId or CompanyId** from query params, URL, forms or client state. Never send
  them as if they granted access; the backend validates the user's membership on every request.
- Never store secrets in `VITE_*` variables. Never render backend exception details, stack traces
  or SQL to users (`ErrorState`/`normalizeApiError` handle this).
- `authConfig.enforceAuthentication` is `false` until the auth API exists; do not fake sessions.

## ERP rules

- Keep modules loosely coupled: a feature imports from `@/components`, `@/services`, `@/types`,
  `@/hooks`, `@/stores`, `@/features/core`, never from another business feature.
- Extend shared ERP types instead of creating module-specific copies of Party, Address, Currency,
  Tax, Product reference, Document status, etc.
- Never hard-code currency, time zone or locale. Use `useLocaleSettings()` and `utils/format`.
- Statuses must show text, never colour alone.

## Quality

- `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test:run`, `npm run build`
  must all pass before a commit. Husky + lint-staged run ESLint/Prettier on staged files.
- Tests: Vitest + Testing Library (`*.test.ts(x)` next to the code), Playwright smoke in `e2e/`.
- Small files, small components; no thousand-line page components. Avoid premature abstraction.
- Read `import.meta.env` only in `src/config/env.ts`.

## Scope discipline

Do not implement future business modules (Product CRUD, stock engine, purchasing/sales workflows,
accounting, CRM, POS, HR, payroll, billing, real authentication) unless explicitly requested.
Placeholders and shared foundations only, until a phase asks for more.
