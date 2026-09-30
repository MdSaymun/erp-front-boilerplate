# Frontend module strategy

How to add an ERP module (e.g. Purchasing) once its backend exists.

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

In `src/app/router/routes.tsx` replace the placeholder entry for the module with real child
routes (list, detail `:id`, new/edit). Keep `handle` metadata (breadcrumb, title, module).
Wrap with `PermissionRoute` where a permission key applies. Pages stay lazy-loaded.

## 3. Add module navigation

Update the module's children in `src/config/navigation.tsx` with keys, labels, paths and
optional permission keys. Do not hard-code menu items in layouts.

## 4. Add the module API layer

Implement typed functions in `src/services/api/endpoints/purchasing.ts` (or the feature's
`services/`) using `http`. Return plain DTOs. Use `ListQuery` / `PagedResult<T>` from
`@/types/api` for lists.

## 5. Add module types

Define DTOs in `features/purchasing/types/`, extending shared ERP types (`DocumentHeaderBase`,
`DocumentLineBase`, `Party`, `Address`, `Money`). Never duplicate shared concepts.

## 6. Add module hooks

TanStack Query hooks with a `purchasingKeys` object; mutations invalidate the relevant keys.
No API data in Zustand.

## 7. Add module components

Compose `PageContainer`, `components/documents/*` (DocumentHeader, DocumentActionBar,
LineItemsTable, DocumentTotals, ConfirmActionButton) and antd Table/Form. Follow the list /
detail / form page patterns.

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
