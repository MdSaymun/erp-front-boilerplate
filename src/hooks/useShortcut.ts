import { useEffect, useEffectEvent, useSyncExternalStore } from 'react';

import {
  getShortcuts,
  registerShortcut,
  type ShortcutDefinition,
  subscribeShortcuts,
} from '@/services/shortcuts/shortcutRegistry';

type ShortcutOptions = Omit<ShortcutDefinition, 'handler'> & {
  handler: ShortcutDefinition['handler'];
  enabled?: boolean;
};

/** Registers a keyboard shortcut for the component's lifetime. */
export function useShortcut({ enabled = true, handler, ...definition }: ShortcutOptions): void {
  const onTrigger = useEffectEvent((event: KeyboardEvent) => handler(event));

  useEffect(() => {
    if (!enabled) return undefined;
    return registerShortcut({ ...definition, handler: (event) => onTrigger(event) });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- definition fields are primitives
  }, [
    enabled,
    definition.id,
    definition.keys,
    definition.scope,
    definition.description,
    definition.allowInInput,
  ]);
}

/** Reactive list of registered shortcuts (for the help modal). */
export function useRegisteredShortcuts(): ShortcutDefinition[] {
  return useSyncExternalStore(subscribeShortcuts, getShortcuts, getShortcuts);
}
