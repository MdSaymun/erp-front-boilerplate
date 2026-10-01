---
description: Generate a business module with the boilerplate generator and verify it
argument-hint: <key> <Entity> [document|master] [--path /x/y]
allowed-tools: Bash(npm run *), Bash(node scripts/*), Read, Edit, Grep, Glob
---

Create a new ERP module from: `$ARGUMENTS`

Interpret the arguments as `<module-key> <EntityName> [kind] [extra flags]`. `kind` defaults to
`document` (status, workflow, lines); use `master` for simple records such as customers,
products or warehouses. If the key or entity is missing, ask for it.

Steps:

1. Read `docs/getting-started-new-erp.md` and `docs/frontend-ui-patterns.md` if you have not
   in this session.
2. Run `npm run generate:module -- <key> --entity <Entity> --kind <kind>` plus any extra flags
   given (`--label`, `--entity-label`, `--path`, `--resource`).
3. Run `npm run typecheck`, `npm run lint` and `npm run test:run`; fix anything the generated
   code needs.
4. Summarise what was created (manifest, types, schema, API, hooks, pages, mock handler), the
   URL to open, and the first three edits the developer should make (types/schema to match the
   backend contract, columns and filters, workflow transitions).

Rules: never re-run the generator for an existing module, keep the marker comments in
`src/features/registry.ts`, `src/mocks/handlers/index.ts` and `src/config/modules.ts`, and do
not commit.
