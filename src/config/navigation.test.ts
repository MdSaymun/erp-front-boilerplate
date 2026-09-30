import { describe, expect, it } from 'vitest';

import { getVisibleNavigation, NAVIGATION, resolveActiveNavigation } from '@/config/navigation';

describe('navigation configuration', () => {
  it('hides modules that are disabled in module configuration', () => {
    const keys = getVisibleNavigation().map((item) => item.key);

    expect(keys).toContain('inventory');
    expect(keys).not.toContain('helpdesk');
  });

  it('filters items by permission for UX-only menu rendering', () => {
    const visible = getVisibleNavigation(NAVIGATION, (permission) =>
      permission.startsWith('inventory.'),
    );
    const keys = visible.map((item) => item.key);

    expect(keys).toContain('inventory');
    expect(keys).toContain('dashboard'); // no permission required
    expect(keys).not.toContain('accounting');
  });

  it('resolves the deepest matching item and its parent section', () => {
    expect(resolveActiveNavigation('/inventory/locations')).toEqual({
      selectedKeys: ['inventory-locations'],
      openKeys: ['inventory'],
    });
    expect(resolveActiveNavigation('/products')).toEqual({
      selectedKeys: ['inventory-products'],
      openKeys: ['inventory'],
    });
    expect(resolveActiveNavigation('/dashboard')).toEqual({
      selectedKeys: ['dashboard'],
      openKeys: [],
    });
    expect(resolveActiveNavigation('/nowhere')).toEqual({ selectedKeys: [], openKeys: [] });
  });
});
