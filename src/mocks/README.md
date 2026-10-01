# Mock API (Mock Service Worker)

Serves the backend contract in the browser (development, Playwright) and in Node
(Vitest) until the real ASP.NET Core API exists.

- `handlers/` one file per backend area; URLs are built with `api(path)` so they
  match `env.apiBaseUrl` exactly.
- `data/` fixtures. `sampleRecords.ts` is a neutral showcase entity, not business data.
- `utils/applyListQuery.ts` implements the list contract (search, filters, sort, paging).
- `utils/problem.ts` builds ASP.NET-shaped ProblemDetails / ValidationProblemDetails.

Rules: never import from `src/mocks` in application code except the dynamic
import in `src/main.tsx`. Remove a handler as soon as the real endpoint ships.
Regenerate `public/mockServiceWorker.js` after upgrading msw: `npx msw init public/ --save`.
