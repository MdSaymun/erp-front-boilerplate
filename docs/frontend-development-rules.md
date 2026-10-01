# Frontend development rules

## Naming

- Files: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils/stores (`useX.ts`,
  `xStore.ts`), `kebab-case.md` for docs. Tests: `<name>.test.ts(x)` next to the code.
- Components and types: PascalCase. Hooks: `useSomething`. Zustand stores: `useSomethingStore`.
- Route paths come from `ROUTES` in `src/constants/routes.ts`; never inline string paths.
- Permission keys follow `module.resource.action` (`inventory.products.view`).

## Components

- One component per file; keep files under ~200 lines. Split by responsibility, not by size.
- Only Ant Design components for UI. No new UI libraries.
- Use `PageContainer` for pages; use `components/documents/*` for document workflows.
- Prefer composition over configuration props. Avoid premature abstraction: extract on the
  second real reuse, not the first imagined one.
- No inline business logic in JSX; move it to hooks or pure functions.

## Standard patterns (use, do not reinvent)

- Lists: `DataTable` + `useListQueryState`; never hand-roll paging/sorting state.
- Records: `RecordPage`, `DocumentActionBar` driven by `useWorkflowActions`.
- Forms: `FormPage`, `ControlledFormItem`, shared inputs, `EditableLinesTable`,
  `applyServerErrors`, `ConcurrencyConflictModal`.
- Data: `createResourceApi` + `createResourceHooks`; company-scoped query keys only.
- Strings shown to users go through `useTranslation()`; add keys to `src/i18n/locales`.
- Mock endpoints live in `src/mocks/handlers` and are never imported by app code.

## Hooks

- Server data: TanStack Query hooks in `features/<module>/hooks/`, one file per resource, with a
  `keys` object for query keys.
- UI state: Zustand selectors (`useUiStore((s) => s.x)`) to avoid re-renders.
- Never call `setState` synchronously inside `useEffect`; derive or adjust during render.
- Never write `ref.current` during render; use `useEffectEvent` or effects (lint-enforced).

## Feature rules

- A feature imports only from shared folders and `features/core`, never from another business
  feature. Cross-module data goes through shared types and API contracts.
- Extend `src/types/erp.ts` types rather than creating module-specific copies of Party,
  Address, Currency, Tax, Product reference or Document status.
- Register routes in `src/app/router/routes.tsx` and navigation in `src/config/navigation.tsx`.

## API rules

- Use `http` from `@/services/api/client`; never import axios in a feature.
- Endpoint functions live in `src/services/api/endpoints/<module>.ts` or
  `features/<module>/services/`, return plain typed data and accept typed params.
- All errors are `ApiError`. Use `ErrorState` to render them and `forEachValidationError` to map
  validation errors to form fields.
- Never put TenantId/CompanyId in request bodies or URLs as an authorization mechanism.

## Forms

- React Hook Form + Zod 4 (`zodResolver`). Schemas live in `schemas/` (shared) or
  `features/<module>/schemas/`.
- Bind antd inputs with `ControlledFormItem`; errors render through `Form.Item` `help`.
- Zod messages use `{ error: 'text' }`. Compose shared building blocks from `src/schemas/common.ts`.
- Use `mode: 'onBlur'` for data-entry forms; show server validation errors on the matching field.

## State

- TanStack Query for anything fetched from the API. Zustand only for UI/session state.
- Persist only presentation preferences (`uiStore`). Never persist tokens or business data.
- Reset stores in tests (`store.getState().clear()`).

## Error handling

- `ErrorBoundary` (render errors), `RouteErrorBoundary` (router), `ErrorState` (API errors),
  antd `message`/`notification` via `App.useApp()` for transient feedback.
- Never display stack traces, SQL, exception types or server implementation details.
- Log details to the console (later: monitoring), show generic text to users, include `traceId`
  as a support reference when available.

## Loading / empty / success

- Page loading: `PageLoading`; table loading: antd `loading` prop; sections: `Skeleton`.
- Empty lists: `EmptyState` with a primary action.
- Success: `message.success` for quick confirmations, `notification` for longer-lived info.

## Accessibility

- Semantic elements: `main`, `nav`, `header`; headings in order.
- Every input has a label (`Form.Item label` + `htmlFor`), every icon-only button an `aria-label`.
- Keyboard: everything reachable by Tab; visible focus is defined globally.
- Status is always text plus colour (`DocumentStatusTag`), never colour alone.
- Dialogs/drawers use antd (focus trapping, escape to close).

## Security

- The backend is the authority for authentication, tenant isolation and permissions.
- Frontend permission checks (`usePermission`, `PermissionRoute`, hidden menu items) are UX only.
- Never trust TenantId/CompanyId from client input; never treat a hidden button as protection.
- No secrets in `VITE_*` variables or in the repository. `.env.production` is git-ignored.
- Do not fake authentication. `authConfig.enforceAuthentication` stays `false` until the real
  auth API exists; flip it and remove placeholders in the auth phase.

## Formatting and locale

- Never hard-code currency, time zone or locale. Use `useLocaleSettings()` and `utils/format`.
- Dates from the API are UTC ISO strings; convert with `toZoned`/`formatDate`.

## Tooling

- `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run test:run` and
  `npm run build` must pass. Husky runs lint-staged on commit.
- Read `import.meta.env` only in `src/config/env.ts`.
