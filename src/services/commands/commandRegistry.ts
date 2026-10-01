import type { ReactNode } from 'react';

import type { ModuleKey } from '@/config/modules';
import type { PermissionKey } from '@/types/permission';

export interface Command {
  id: string;
  title: string;
  /** Extra search terms. */
  keywords?: string[];
  /** Group label in the palette, e.g. "Navigation", "Inventory". */
  group?: string;
  icon?: ReactNode;
  permission?: PermissionKey;
  module?: ModuleKey;
  run: () => void;
}

type Listener = () => void;

const commands = new Map<string, Command>();
const listeners = new Set<Listener>();
let snapshot: Command[] = [];

function notify(): void {
  snapshot = [...commands.values()];
  listeners.forEach((listener) => listener());
}

/** Registers commands (navigation, record actions, module shortcuts). Returns an unregister function. */
export function registerCommands(items: Command[]): () => void {
  items.forEach((command) => commands.set(command.id, command));
  notify();
  return () => {
    items.forEach((command) => {
      if (commands.get(command.id) === command) commands.delete(command.id);
    });
    notify();
  };
}

export function getCommands(): Command[] {
  return snapshot;
}

export function subscribeCommands(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Simple ranked fuzzy-ish match: title prefix > title contains > keyword contains. */
export function searchCommands(items: Command[], query: string): Command[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items
    .map((command) => {
      const title = command.title.toLowerCase();
      let score = 0;
      if (title.startsWith(needle)) score = 3;
      else if (title.includes(needle)) score = 2;
      else if (command.keywords?.some((k) => k.toLowerCase().includes(needle))) score = 1;
      return { command, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.command);
}

/** Test hook. */
export function clearCommands(): void {
  commands.clear();
  notify();
}
