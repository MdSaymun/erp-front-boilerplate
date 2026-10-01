import { lazy } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  clearWidgets,
  getVisibleWidgets,
  registerWidgets,
} from '@/features/core/widgets/widgetRegistry';

const component = lazy(() => Promise.resolve({ default: () => null }));

describe('widget registry', () => {
  afterEach(() => clearWidgets());

  it('filters by module availability and permission, ordered by `order`', () => {
    registerWidgets([
      { key: 'b', module: 'inventory', title: 'B', size: 'sm', order: 2, component },
      { key: 'a', module: 'inventory', title: 'A', size: 'sm', order: 1, component },
      { key: 'hidden-module', module: 'helpdesk', title: 'H', size: 'sm', component },
      {
        key: 'needs-perm',
        module: 'sales',
        title: 'S',
        size: 'sm',
        permission: 'sales.module.view',
        component,
      },
    ]);

    expect(getVisibleWidgets(() => false).map((w) => w.key)).toEqual(['a', 'b']);
    expect(getVisibleWidgets(() => true).map((w) => w.key)).toEqual(['a', 'b', 'needs-perm']);
  });
});
