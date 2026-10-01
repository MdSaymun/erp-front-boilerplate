---
description: Add or extend a Mock Service Worker handler for a backend endpoint that does not exist yet
argument-hint: <METHOD> <path> [description of the response]
allowed-tools: Read, Edit, Write, Grep, Glob, Bash(npm run *)
---

Add a mock for: `$ARGUMENTS`

1. Find the handler file for that area in `src/mocks/handlers/` (create one and register it at
   the `// <mock-imports>`, `// <mock-handlers>` and `// <mock-resets>` markers in
   `src/mocks/handlers/index.ts` if none exists).
2. Build URLs with `api(path)` from `src/mocks/utils/api.ts`; import `http`/`HttpResponse` from
   `msw/http`.
3. Lists must go through `applyListQuery`; errors must use `problem()` / `validationProblem()`
   from `src/mocks/utils/problem.ts` so they look like ASP.NET ProblemDetails.
4. Keep data in memory with a `reset…()` function called from `resetMockData()`.
5. Add or update a test that exercises the endpoint through the resource API or a page.
6. Run `npm run typecheck` and `npm run test:run`.

Never import from `src/mocks` in application code.
