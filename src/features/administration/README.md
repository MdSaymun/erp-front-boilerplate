# administration module

Users, roles, permissions, audit log and SaaS subscription management.

Status: **placeholder**. No business functionality is implemented in the foundation phase.

Expected structure when implemented (see docs/frontend-module-strategy.md):

```
features/administration/
  components/   module-specific UI
  hooks/        TanStack Query hooks (queries, mutations, keys)
  schemas/      Zod schemas for forms and query params
  services/     API functions built on @/services/api
  types/        module DTOs extending shared types from @/types
  pages/        route components registered in app/router/routes.tsx
  index.ts      public surface of the module
```
