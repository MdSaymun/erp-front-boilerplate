import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearCommands,
  getCommands,
  registerCommands,
  searchCommands,
} from '@/services/commands/commandRegistry';

describe('command registry', () => {
  afterEach(() => clearCommands());

  it('ranks title prefix above contains above keywords', () => {
    const run = vi.fn();
    registerCommands([
      { id: 'a', title: 'Products', keywords: ['inventory'], run },
      { id: 'b', title: 'Sales orders', keywords: ['products'], run },
      { id: 'c', title: 'New product', run },
    ]);
    expect(searchCommands(getCommands(), 'prod').map((c) => c.id)).toEqual(['a', 'c', 'b']);
    expect(searchCommands(getCommands(), '')).toHaveLength(3);
    expect(searchCommands(getCommands(), 'zzz')).toEqual([]);
  });
});
