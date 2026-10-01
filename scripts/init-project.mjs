#!/usr/bin/env node
/**
 * Turns the boilerplate into a named product.
 *
 *   npm run init:project -- --name "Acme ERP" [--key acme-erp] [--root dir]
 *
 * Rewrites: package.json name, index.html title, VITE_APP_NAME in .env files,
 * src/config/app.ts APP_KEY, the i18n app name, and the README heading.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

import { parseArgs, toKebab } from './lib/text.mjs';

const { options } = parseArgs(process.argv.slice(2));
if (!options.name || options.name === true) {
  console.error('Usage: npm run init:project -- --name "Product Name" [--key product-key]');
  process.exit(1);
}

const root = resolve(options.root ?? process.cwd());
const name = String(options.name).trim();
const key = toKebab(options.key ? String(options.key) : name);

function rewrite(relative, transform) {
  const file = join(root, relative);
  if (!existsSync(file)) return;
  const before = readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) {
    writeFileSync(file, after);
    console.log(`updated ${relative}`);
  }
}

rewrite('package.json', (s) => {
  const pkg = JSON.parse(s);
  pkg.name = `${key}-frontend`;
  pkg.description = `${name} frontend`;
  return `${JSON.stringify(pkg, null, 2)}\n`;
});
rewrite('index.html', (s) => s.replace(/<title>.*?<\/title>/, `<title>${name}</title>`));
for (const env of ['.env.example', '.env.development', '.env.production.example']) {
  rewrite(env, (s) => s.replace(/^VITE_APP_NAME=.*$/m, `VITE_APP_NAME=${name}`));
}
rewrite('src/config/app.ts', (s) =>
  s.replace(/export const APP_KEY = '.*?';/, `export const APP_KEY = '${key}';`),
);
for (const locale of ['en', 'bn']) {
  rewrite(`src/i18n/locales/${locale}/common.json`, (s) =>
    s.replace(/"name": ".*?"/, `"name": "${name}"`),
  );
}
rewrite('README.md', (s) => s.replace(/^# .*$/m, `# ${name} — Frontend`));

console.log(`\nProject initialised as "${name}" (key: ${key}).
Next: review .env.development, run "npm install" and "npm run dev", then
"npm run generate:module -- <key> --entity <Entity>" for your first business module.
`);
