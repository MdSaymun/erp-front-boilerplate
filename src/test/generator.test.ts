/// <reference types="node" />
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * Runs the module generator against a throw-away project skeleton containing
 * only the marker files it edits, and checks the output shape.
 */
describe('create-module generator', () => {
  let root = '';

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'erp-generator-'));
    mkdirSync(join(root, 'src', 'features'), { recursive: true });
    mkdirSync(join(root, 'src', 'mocks', 'handlers'), { recursive: true });
    mkdirSync(join(root, 'src', 'config'), { recursive: true });
    writeFileSync(
      join(root, 'src', 'features', 'registry.ts'),
      "import { developerModule } from './developer/module';\n// <module-imports>\n\nexport const MODULE_MANIFESTS = [\n  developerModule,\n  // <module-manifests>\n];\n",
    );
    writeFileSync(
      join(root, 'src', 'mocks', 'handlers', 'index.ts'),
      '// <mock-imports>\nexport const handlers = [\n  // <mock-handlers>\n];\nexport function resetMockData(): void {\n  // <mock-resets>\n}\n',
    );
    writeFileSync(
      join(root, 'src', 'config', 'modules.ts'),
      "export const MODULE_KEYS = [\n  'dashboard',\n  // <module-keys>\n] as const;\nexport const MODULES = {\n  dashboard: {},\n  // <module-definitions>\n};\n",
    );
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  function run(args: string[]): string {
    return execFileSync(
      'node',
      ['scripts/create-module.mjs', ...args, '--root', root, '--no-format'],
      { encoding: 'utf8' },
    );
  }

  it('creates a document module wired into the registry, mocks and module config', () => {
    const output = run(['purchasing', '--entity', 'PurchaseOrder', '--path', '/purchasing/orders']);

    expect(output).toContain('Module "purchasing" generated');
    for (const file of [
      'src/features/purchasing/module.tsx',
      'src/features/purchasing/index.ts',
      'src/features/purchasing/types/purchaseOrder.ts',
      'src/features/purchasing/schemas/purchaseOrderSchema.ts',
      'src/features/purchasing/services/purchaseOrderApi.ts',
      'src/features/purchasing/hooks/usePurchaseOrder.ts',
      'src/features/purchasing/pages/PurchaseOrderListPage.tsx',
      'src/features/purchasing/pages/PurchaseOrderDetailPage.tsx',
      'src/features/purchasing/pages/PurchaseOrderFormPage.tsx',
      'src/features/purchasing/pages/purchaseOrder.test.tsx',
      'src/mocks/handlers/purchasing.ts',
    ]) {
      expect(existsSync(join(root, file)), file).toBe(true);
    }

    const registry = readFileSync(join(root, 'src', 'features', 'registry.ts'), 'utf8');
    expect(registry).toContain("import { purchasingModule } from './purchasing/module';");
    expect(registry).toContain('  purchasingModule,\n  // <module-manifests>');

    const mocks = readFileSync(join(root, 'src', 'mocks', 'handlers', 'index.ts'), 'utf8');
    expect(mocks).toContain('...purchaseOrderHandlers,');
    expect(mocks).toContain('resetPurchaseOrders();');

    const modules = readFileSync(join(root, 'src', 'config', 'modules.ts'), 'utf8');
    expect(modules).toContain("'purchasing',\n  // <module-keys>");
    expect(modules).toContain("purchasing: { key: 'purchasing'");

    const manifest = readFileSync(
      join(root, 'src', 'features', 'purchasing', 'module.tsx'),
      'utf8',
    );
    expect(manifest).toContain("key: 'purchasing'");
    expect(manifest).toContain("basePath: '/purchasing'");
    expect(manifest).toContain("permission: 'purchasing.module.view'");
  });

  it('creates a master-data module without workflow pieces and refuses to overwrite', () => {
    run(['crm', '--entity', 'Customer', '--kind', 'master']);

    const hooks = readFileSync(
      join(root, 'src', 'features', 'crm', 'hooks', 'useCustomer.ts'),
      'utf8',
    );
    expect(hooks).not.toContain('TRANSITIONS');
    const types = readFileSync(
      join(root, 'src', 'features', 'crm', 'types', 'customer.ts'),
      'utf8',
    );
    expect(types).toContain('RecordStatus');

    expect(() => run(['crm', '--entity', 'Customer'])).toThrow();
  });
});
