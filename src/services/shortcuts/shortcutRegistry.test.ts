import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearShortcuts,
  formatShortcut,
  getShortcuts,
  matchesShortcut,
  registerShortcut,
} from '@/services/shortcuts/shortcutRegistry';

describe('shortcut registry', () => {
  afterEach(() => clearShortcuts());

  it('matches modifier combinations', () => {
    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, metaKey: true });
    expect(matchesShortcut(event, 'mod+s')).toBe(true);
    expect(matchesShortcut(event, 's')).toBe(false);
    expect(
      matchesShortcut(new KeyboardEvent('keydown', { key: '?', shiftKey: true }), 'shift+?'),
    ).toBe(true);
  });

  it('dispatches to registered handlers and unregisters cleanly', () => {
    const handler = vi.fn();
    const unregister = registerShortcut({
      id: 'save',
      keys: 'mod+s',
      description: 'Save',
      scope: 'form',
      handler,
    });
    expect(getShortcuts()).toHaveLength(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, metaKey: true }));
    expect(handler).toHaveBeenCalledTimes(1);

    unregister();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, metaKey: true }));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(getShortcuts()).toHaveLength(0);
  });

  it('formats keys for display', () => {
    expect(formatShortcut('mod+k')).toMatch(/K$/);
  });
});
