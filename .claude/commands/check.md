---
description: Run every quality gate (typecheck, lint, format, unit tests, build) and report failures
allowed-tools: Bash(npm run *), Read, Grep
---

Run the project's quality gates in this order and stop at the first failure:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run format:check`
4. `npm run test:run`
5. `npm run build`

If `$ARGUMENTS` contains `e2e`, also run `npm run e2e` at the end.

For each failure: show the failing file and line, explain the cause in one or two sentences,
and fix it if the fix is small and clearly correct. Re-run the failed gate after a fix.
Finish with a short table of gate results. Do not commit.
