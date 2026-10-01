# Frontend module strategy

How to add an ERP module (e.g. Purchasing). Fast path: `npm run generate:module -- purchasing --entity PurchaseOrder`, which produces every step below and registers the manifest. The manual steps explain what the generator wrote.

## 1. Create the feature module

```
src/features/purchasing/
  components/   PurchaseOrderLines.tsx, VendorSelect.tsx …
  hooks/        usePurchaseOrders.ts (queries/mutations + keys)
  schemas/      purchaseOrderSchema.ts (Zod)
  services/     purchaseOrdersApi.ts (built on @/services/api)
  types/        purchaseOrder.ts (extends DocumentHeaderBase / DocumentLineBase)
  pages/        PurchaseOrderListPage.tsx, PurchaseOrderDetailPage.tsx, PurchaseOrderFormPage.tsx
  index.ts      public surface
  README.md     scope and status
```

## 2. Add module routes

Declare them in the module manifest (`features/purchasing/module.tsx`, `routes`), relative
to `basePath`: index, `orders`, `orders/new`, `orders/:id`, `orders/:id/edit`. Keep `handle`
metadata (breadcrumb). The shell wraps the manifest with `ModuleRoute` and, when
`permission` is set, `PermissionRoute`. Pages stay lazy-loaded via `lazyPage`.

## 3. Add module navigation

Declare `navigation` in the manifest (absolute paths). It replaces the placeholder entry in
`src/config/navigation.tsx`. Widgets and command-palette commands are declared the same way.

## 4. Add the module API layer

Create the resource clients with `createResourceApi<T>(path)` in the feature's `services/`
(or `src/services/api/endpoints/purchasing.ts`). Custom verbs go through `api.action()`.
Lists use `ListQuery` / `PagedResult<T>` from `@/types/api`. While the backend endpoint
does not exist, add an MSW handler under `src/mocks/handlers/` and delete it later.

## 5. Add module types

Define DTOs in `features/purchasing/types/`, extending shared ERP types (`DocumentHeaderBase`,
`DocumentLineBase`, `Party`, `Address`, `Money`). Never duplicate shared concepts.

## 6. Add module hooks

`createResourceHooks('purchase-orders', purchaseOrdersApi)` gives list/detail/create/update/
delete/action hooks with company-scoped keys and invalidation. Add custom hooks next to it
for anything beyond CRUD. No API data in Zustand.

## 7. Add module components

- List page: `DataTable` + `useListQueryState` (columns, filters, bulk actions, export).
- Record page: `RecordPage` + `DocumentHeader` + `RecordStageBar` + `useWorkflowActions`
  - `RecordTabs` + `Chatter`.
- Form page: `FormPage` + `ControlledFormItem` + shared inputs + `EditableLinesTable`
  - `applyServerErrors` + `ConcurrencyConflictModal`.
- Register dashboard widgets (`registerWidgets`) and palette commands (`registerCommands`)
  from the module's `index.ts`.
  See `frontend-ui-patterns.md` and the `/_dev/patterns` showcase.

## 8. Add tests

- Schema tests for Zod validation.
- Hook/service tests with mocked `http`.
- Component tests with `renderWithProviders` / `renderApp`.
- A Playwright smoke test only if the module changes shell-level navigation.

## 9. Integrate with the shared ERP infrastructure

- Statuses through `DocumentStatus` + `DocumentStatusTag`.
- Formatting through `useLocaleSettings()` + `utils/format`.
- Permissions through `usePermission()` (UX only).
- Module availability through `src/config/modules.ts` (`enabled`, `stage`).
- Errors through `ErrorState` and `forEachValidationError`.

## Module availability and feature flags

`src/config/modules.ts` is the single switch for enabling modules. Disabled modules disappear
from navigation and `ModuleRoute` renders a "not available" result. This is a product/plan
mechanism, not authorization. Later the flags can be populated from the tenant's subscription
returned by the backend.

## Shared concepts checklist

Before adding a type, check `src/types/erp.ts` for: Party, Contact, Address, Currency, Money,
Tax, UnitOfMeasure, ProductRef, DocumentType, DocumentStatus, DocumentNumber,
DocumentHeaderBase, DocumentLineBase, DocumentTotals, FiscalPeriod, Attachment, Comment,
Activity, AuditEntry, AppNotification. Accounting, CRM, Sales and POS all consume these.
