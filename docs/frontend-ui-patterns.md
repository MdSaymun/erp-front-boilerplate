# Frontend UI patterns

Reference for the shared building blocks every ERP module composes. All of them are
demonstrated on the developer showcase at `/_dev/patterns` (dev/test builds only).

## Data access

| Piece                                 | Location                                    | Purpose                                                                       |
| ------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| `createResourceApi<T>(path)`          | `src/services/api/resource.ts`              | list/get/create/update/patch/remove/action/export/import for one resource     |
| `toSearchParams` / `fromSearchParams` | `src/services/api/listQuery.ts`             | One wire + URL format: `page, pageSize, search, sort=f:dir, filter=f:op:v`    |
| `resourceKeys(name, companyId)`       | `src/hooks/resource/resourceKeys.ts`        | Query keys rooted at the current company                                      |
| `createResourceHooks(name, api)`      | `src/hooks/resource/createResourceHooks.ts` | `useList/useDetail/useCreate/useUpdate/useDelete/useAction` with invalidation |
| `useMutationFeedback`                 | `src/hooks/useMutationFeedback.ts`          | Success message / error notification (validation and conflicts excluded)      |
| Token refresh                         | `src/services/api/tokenRefresh.ts`          | Single-flight refresh on 401, retries queued requests once                    |
| `createChatterApi(recordPath)`        | `src/services/api/chatter.ts`               | activities / comments / attachments sub-resources                             |

Module pattern:

```ts
export const ordersApi = createResourceApi<SalesOrder, SalesOrderBody>('/sales/orders');
export const orderHooks = createResourceHooks('sales-orders', ordersApi);
```

## List pages

`DataTable` (`src/components/data-table/`) + `useListQueryState` (`src/hooks/useListQueryState.ts`).

- Query state lives in the URL; other params (e.g. `tab`) are preserved.
- Columns declare `sortField`, `defaultHidden`, `alwaysVisible`. Visibility is persisted per `tableId` in `tableStore`.
- Filters are declared (`FilterDefinition[]`): text, select (single/multi), date-range, number-range.
- Selection + `bulkActions` (permission-filtered), export (`onExport` → blob download), saved views (client-side for now), density, refresh, sticky header, horizontal scroll, optional `virtual` for very large pages.
- Loading, empty (`EmptyState`) and error (`ErrorState` inline with retry) states are built in.

## Record pages

`RecordPage` (`src/components/records/`) frames: `DocumentHeader` → `RecordStageBar` → content (`RecordTabs`, active tab in `?tab=`) with `Chatter` as side panel.

- Workflow: declare `WorkflowActionSpec[]` once per document type; `useWorkflowActions` turns the transitions available from the current status into `DocumentAction[]` for `DocumentActionBar` (permission, confirm, overflow, loading).
- `AuditInfo`, `RelatedRecordsTab`, `PrintButton` (print stylesheet hides chrome via `.erp-no-print`).
- `DOCUMENT_STATUS_META` (`src/features/core/documentStatus.ts`) gives every status its label, colour, editability and stage order.

## Form pages

`FormPage` (`src/components/forms/FormPage.tsx`) provides breadcrumb, header, Save/Cancel, Ctrl/Cmd+S and the unsaved-changes guard (`useUnsavedChangesGuard`, React Router `useBlocker` + `beforeunload`). Call `allowNext()` (via `guardRef`) before navigating after a successful save.

- Bind antd inputs with `ControlledFormItem` (`compact` for grid cells).
- Server validation: `applyServerErrors(error, setError)` maps ValidationProblemDetails (`Lines[0].Quantity` → `lines.0.quantity`) to fields and returns form-level messages for `FormErrorSummary`.
- Concurrency: send `rowVersion` via `update(id, body, { rowVersion })`; a 409 becomes `ApiError.code === 'conflict'` → `ConcurrencyConflictModal`.
- Lines: `EditableLinesTable` (React Hook Form `useFieldArray` + antd Table; add/remove/move; never mix with antd `Form.List`).
- Inputs (`src/components/forms/inputs/`): `MoneyInput`, `QuantityInput` (+UOM), `PercentInput`, `LocalDatePicker` (`kind="date"` keeps ISO dates untouched; `kind="datetime"` converts UTC ↔ zone), `LocalDateRangePicker`, `AddressFields`, `LookupSelect` (server search, hydration, "Create new…").
- Shared Zod blocks: `src/schemas/common.ts` (`addressSchema`, `moneySchema`, `quantitySchema`, `isoDateSchema`, `percentSchema`, `rowVersionSchema`).

## Authorization UX

`Can`, `PermissionButton` (`src/components/auth/`), `usePermission`, `DocumentAction.permission`, `BulkAction.permission`, navigation `permission`. `useCompanySwitch` clears company-scoped caches and reloads the session. All of this is presentation; the backend authorizes every request.

## Platform

- i18n: `src/i18n/` (i18next, English bundled, others lazy, antd + dayjs locale kept in sync by `useResolvedLocale`). Use `useTranslation()`; keys live in `locales/<lang>/common.json`; add module namespaces as modules arrive.
- Shortcuts: `useShortcut` + `shortcutRegistry`; `?` opens the help modal.
- Command palette: Ctrl/Cmd+K; modules add commands with `registerCommands`.
- Notifications: `useNotifications` + `NotificationsDrawer` (polling until realtime).
- Preferences: theme, density, language (`uiStore`, persisted).
- Tenant branding: `tenant.branding.{logoUrl,primaryColor}` → theme and sider logo (colour validated).
- Realtime: `RealtimeProvider` + `useRealtimeEvent`; no-op until `VITE_REALTIME_URL` is set, then SignalR (lazy-loaded).
- Dashboard widgets: `registerWidgets` + `WidgetGrid`; modules contribute lazy widgets.
- Import wizard and report viewer: typed shells wired to resource `import`/report definitions.

## Mock API

`src/mocks/` (MSW 3). Enabled by `VITE_MOCK_API=true` in dev/preview and always in Vitest (`src/test/setup.ts`). Add one handler file per backend area and remove it when the real endpoint ships.
