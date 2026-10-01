#!/usr/bin/env node
/**
 * Generates a business module wired to every shared ERP pattern.
 *
 *   npm run generate:module -- sales --entity SalesOrder --label "Sales" \
 *       --entity-label "Sales order" --path /sales/orders --kind document
 *
 * Options
 *   --entity        PascalCase entity name (required), e.g. Product, SalesOrder
 *   --label         Module label (default: title-cased key)
 *   --entity-label  Human label for one record (default: title-cased entity)
 *   --path          URL base for the entity list (default: /<key>/<entities>)
 *   --resource      Backend resource path (default: same as --path)
 *   --kind          document (status, workflow, lines) | master (simple record). Default: document
 *   --root          Project root (default: cwd). Used by tests.
 *   --no-format     Skip running Prettier on generated files.
 *   --dry-run       Print the files that would be written.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';

import { buildTemplates } from './lib/moduleTemplates.mjs';
import { insertBeforeMarker, parseArgs, toCamel, toKebab, toPascal, toTitle } from './lib/text.mjs';

const { positional, options } = parseArgs(process.argv.slice(2));
const key = positional[0] ? toKebab(positional[0]) : undefined;

if (!key || !options.entity) {
  console.error(
    'Usage: npm run generate:module -- <key> --entity <EntityName> [--label] [--entity-label] [--path] [--resource] [--kind document|master]',
  );
  process.exit(1);
}

const root = resolve(options.root ?? process.cwd());
const entity = toPascal(options.entity);
const entityCamel = toCamel(entity);
const entityKebab = toKebab(entity);
const entities = `${entityKebab}s`;
const ctx = {
  key,
  keyCamel: toCamel(key),
  keyPascal: toPascal(key),
  label: options.label ?? toTitle(key),
  entity,
  entityCamel,
  entityKebab,
  entityLabel: options['entity-label'] ?? toTitle(entity),
  entitiesLabel: `${options['entity-label'] ?? toTitle(entity)}s`,
  path: options.path ?? `/${key}/${entities}`,
  resource: options.resource ?? options.path ?? `/${key}/${entities}`,
  kind: options.kind === 'master' ? 'master' : 'document',
};

const featureDir = join(root, 'src', 'features', key);
if (existsSync(join(featureDir, 'module.tsx'))) {
  console.error(`Module "${key}" already has a manifest at ${featureDir}/module.tsx. Aborting.`);
  process.exit(1);
}

const files = buildTemplates(ctx);
const edits = [
  {
    file: join(root, 'src', 'features', 'registry.ts'),
    changes: [
      ['// <module-imports>', `import { ${ctx.keyCamel}Module } from './${key}/module';`],
      ['// <module-manifests>', `${ctx.keyCamel}Module,`],
    ],
  },
  {
    file: join(root, 'src', 'mocks', 'handlers', 'index.ts'),
    changes: [
      [
        '// <mock-imports>',
        `import { ${ctx.entityCamel}Handlers, reset${entity}s } from './${key}';`,
      ],
      ['// <mock-handlers>', `...${ctx.entityCamel}Handlers,`],
      ['// <mock-resets>', `reset${entity}s();`],
    ],
  },
];

const modulesFile = join(root, 'src', 'config', 'modules.ts');
if (existsSync(modulesFile)) {
  const source = readFileSync(modulesFile, 'utf8');
  if (!new RegExp(`'${key}'`).test(source)) {
    edits.push({
      file: modulesFile,
      changes: [
        ['// <module-keys>', `'${key}',`],
        [
          '// <module-definitions>',
          `${ctx.keyCamel}: { key: '${key}', label: '${ctx.label}', enabled: true, stage: 'foundation' },`,
        ],
      ],
    });
  }
}

if (options['dry-run']) {
  console.log('Would write:');
  for (const relative of Object.keys(files)) console.log(`  ${relative}`);
  console.log('Would edit:');
  for (const edit of edits) console.log(`  ${edit.file}`);
  process.exit(0);
}

// Placeholder module folders ship a README.md and index.ts; those may be replaced.
const REPLACEABLE = new Set([`src/features/${key}/README.md`, `src/features/${key}/index.ts`]);

for (const relative of Object.keys(files)) {
  if (existsSync(join(root, relative)) && !REPLACEABLE.has(relative)) {
    console.error(`Refusing to overwrite existing file ${relative}`);
    process.exit(1);
  }
}

const written = [];
for (const [relative, content] of Object.entries(files)) {
  const target = join(root, relative);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  written.push(target);
}

for (const edit of edits) {
  if (!existsSync(edit.file)) continue;
  let source = readFileSync(edit.file, 'utf8');
  for (const [marker, text] of edit.changes)
    source = insertBeforeMarker(source, marker, text, edit.file);
  writeFileSync(edit.file, source);
  written.push(edit.file);
}

if (!options['no-format']) {
  const prettier = join(root, 'node_modules', '.bin', 'prettier');
  if (existsSync(prettier))
    spawnSync(prettier, ['--write', '--log-level', 'warn', ...written], { stdio: 'inherit' });
}

console.log(`\nModule "${key}" generated with entity "${entity}" (${ctx.kind}).\n`);
console.log('Files:');
for (const relative of Object.keys(files)) console.log(`  ${relative}`);
console.log(`\nNext steps:
  1. Open ${ctx.path} in the app (mock API serves ${ctx.resource}).
  2. Adjust src/features/${key}/types/${entityCamel}.ts and schemas/${entityCamel}Schema.ts to your contract.
  3. Replace src/mocks/handlers/${key}.ts with the real backend when it ships.
  4. Run: npm run typecheck && npm run lint && npm run test:run
`);
