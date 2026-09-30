# accounting module

Chart of accounts, journal entries, invoices, payments and financial reports.

Status: **placeholder**. No business functionality is implemented in the foundation phase.

Expected structure when implemented (see docs/frontend-module-strategy.md):

```
features/accounting/
  components/   module-specific UI
  hooks/        TanStack Query hooks (queries, mutations, keys)
  schemas/      Zod schemas for forms and query params
  services/     API functions built on @/services/api
  types/        module DTOs extending shared types from @/types
  pages/        route components registered in app/router/routes.tsx
  index.ts      public surface of the module
```
