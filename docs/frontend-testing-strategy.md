# Frontend testing strategy

## Levels

| Level       | Tool                     | Scope                                                                                        |
| ----------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| Unit        | Vitest                   | pure functions: error normalization, formatting, schemas, navigation resolution, store logic |
| Component   | Vitest + Testing Library | one component with providers (`renderWithProviders`)                                         |
| Integration | Vitest + Testing Library | real route table via memory router (`renderApp`): routing, guards, navigation                |
| E2E (smoke) | Playwright               | production build in a real browser: shell, sidebar, dashboard, placeholder navigation        |

## Mock API in tests

`src/test/setup.ts` starts the MSW Node server with every handler from `src/mocks/handlers`
and `onUnhandledFrame: 'error'`, so a request without a handler fails the test. Override
per test with `server.use(http.get(api('/path'), ...))`; `resetMockData()` runs after each
test. Playwright runs the same handlers through the browser worker (`VITE_MOCK_API=true`).

## Unit testing

- Test behaviour, not implementation. No tests that merely assert a component renders without
  checking something meaningful.
- Reset Zustand stores in `beforeEach`; restore mutated config (e.g. `authConfig`) in `afterEach`.
- Vitest 5 defaults `clearMocks: true`; `vi.mock` calls must be top-level.

## Component testing

- Query by role/label/text as a user would. Prefer `findBy*` for lazy routes.
- `src/test/setup.ts` shims `matchMedia`, `ResizeObserver` and `getComputedStyle` for antd in
  jsdom. Keep shims minimal and documented.
- Provide antd context via `renderWithProviders` (ThemeProvider + QueryProvider with a fresh,
  non-retrying QueryClient).

## Integration testing

- `renderApp(path)` mounts the real `routes` through `createMemoryRouter`, so navigation, guards,
  breadcrumbs and lazy loading are exercised as in production.
- Cover: root redirect, dashboard, module placeholders, active menu item, protected and
  permission routes (with `authConfig.enforceAuthentication = true`), not-found, and the
  `/_dev/patterns` flows (list → record, create, server validation).

## E2E testing

- `e2e/smoke/` (shell) and `e2e/patterns/` (list/record/form flows) run against
  `vite preview` of a build with the mock API enabled; no backend required. Use the
  `gotoApp` fixture, which waits for the mock worker.
- Projects: desktop Chromium and a mobile viewport (drawer navigation).
- Screenshots on failure, trace on first retry, HTML report in `playwright-report/`.
- Keep smoke tests few and stable. Module-specific E2E is added with the module and may need a
  mocked API (Playwright `page.route`) until a test backend exists.

## Security-related frontend tests

- Error normalization never leaks server internals (5xx titles/details, unknown error messages).
- Guards redirect anonymous users and users lacking a permission when enforcement is on.
- Company selection rejects ids not provided by the backend.
- Retry policy never retries 401/403/422.
- No secrets in the bundle: environment validation covers only public `VITE_*` values.

## Naming and organization

- Tests live next to the code: `Component.test.tsx`, `module.test.ts`.
- Describe blocks name the unit (`describe('normalizeApiError')`), `it` names the behaviour in
  plain language.
- Fixtures in `src/test/mocks/`; render helpers in `src/test/utils.tsx`; Playwright fixtures in
  `e2e/fixtures/`.

## Commands

```bash
npm run test          # watch
npm run test:run      # CI
npm run test:coverage # v8 coverage (text + html)
npm run e2e           # Playwright smoke
npm run e2e:ui
```
