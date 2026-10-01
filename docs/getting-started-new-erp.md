# Starting a new ERP from this boilerplate

This repository is a product-agnostic frontend for a multi-tenant ERP. Copy it, name it,
and add business modules; the shell, data layer, patterns, tests and tooling are already
there.

## 1. Copy and name the product

```bash
cp -R erp-frontend-boilerplate my-erp-frontend && cd my-erp-frontend
rm -rf .git && git init -b main
npm install
npm run init:project -- --name "Acme ERP" --key acme-erp
```

`init:project` rewrites the package name, page title, `VITE_APP_NAME`, the storage-key
prefix (`src/config/app.ts`), the i18n app name and the README heading.

## 2. Run it on mock data

```bash
npm run dev          # http://localhost:5173, VITE_MOCK_API=true in .env.development
```

Open **Developer → Patterns** to see every shared pattern working. Sign-in is not enforced
yet (`src/config/auth.ts`).

## 3. Generate your first module

```bash
npm run generate:module -- sales --entity SalesOrder --label "Sales" \
  --entity-label "Sales order" --path /sales/sales-orders --kind document
```

You get `src/features/sales/` (manifest, types, schema, resource API, hooks, list/detail/form
pages, a test) and `src/mocks/handlers/sales.ts`, all registered automatically. Use
`--kind master` for simple records (customers, products, warehouses). Run
`npm run typecheck && npm run lint && npm run test:run` and open `/sales/sales-orders`.

Then make it yours:

- `types/` and `schemas/`: match the backend contract.
- `pages/`: add columns, filters, tabs, inputs. Everything is composed from
  `src/components/*`; see `docs/frontend-ui-patterns.md`.
- `hooks/`: declare the workflow (`*_TRANSITIONS`, `*_STAGES`) and extra queries.
- `module.tsx`: navigation children, permissions, dashboard widgets, palette commands.

## 4. Connect the backend

- Set `VITE_API_BASE_URL`; delete the module's mock handler once the endpoint exists.
- The client expects RFC 7807 ProblemDetails with `traceId`, 422 for validation, bearer
  tokens, the `X-Company-Id` hint header, `If-Match` row versions and paged lists
  (`items, page, pageSize, totalCount, totalPages`). See `src/types/api.ts`.
- Wire `authApi` (`src/services/api/endpoints/auth.ts`) to the real session endpoint,
  then set `authConfig.enforceAuthentication = true`.
- Set `VITE_REALTIME_URL` when a SignalR hub exists.

## 5. Tune the product

- Modules and availability: `src/config/modules.ts` (plan/subscription flags).
- Theme and branding: `src/theme/theme.ts`, `tenant.branding`.
- Languages: `src/i18n/locales/<lang>/common.json` plus the loader map in `src/i18n/index.ts`.
- Permission keys: `module.resource.action`, catalogued in each manifest.
- Remove modules you will never ship from `MODULE_KEYS`, placeholder navigation and
  placeholder routes.

## 6. Keep the quality gates

`npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run test:run`,
`npm run build`, `npm run e2e`. Husky runs lint-staged on every commit.
