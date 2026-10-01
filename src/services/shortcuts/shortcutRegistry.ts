export type ShortcutScope = 'global' | 'form' | 'list' | 'record';

export interface ShortcutDefinition {
  id: string;
  /** e.g. "mod+s", "mod+k", "?", "escape". `mod` is Cmd on macOS, Ctrl elsewhere. */
  keys: string;
  description: string;
  scope: ShortcutScope;
  handler: (event: KeyboardEvent) => void;
  /** Fire even when focus is in an input/textarea/select. */
  allowInInput?: boolean;
}

type Listener = () => void;

const registry = new Map<string, ShortcutDefinition>();
const listeners = new Set<Listener>();
let snapshot: ShortcutDefinition[] = [];
let attached = false;

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

function notify(): void {
  snapshot = [...registry.values()];
  listeners.forEach((listener) => listener());
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export function matchesShortcut(event: KeyboardEvent, keys: string): boolean {
  const parts = keys.toLowerCase().split('+');
  const key = parts.at(-1) ?? '';
  const wantMod = parts.includes('mod');
  const wantShift = parts.includes('shift');
  const wantAlt = parts.includes('alt');
  const modPressed = IS_MAC ? event.metaKey : event.ctrlKey;
  if (wantMod !== modPressed) return false;
  if (wantShift !== event.shiftKey && key !== '?') return false;
  if (wantAlt !== event.altKey) return false;
  return event.key.toLowerCase() === key;
}

function onKeyDown(event: KeyboardEvent): void {
  for (const shortcut of registry.values()) {
    if (!matchesShortcut(event, shortcut.keys)) continue;
    if (!shortcut.allowInInput && isTypingTarget(event.target) && !shortcut.keys.includes('mod'))
      continue;
    event.preventDefault();
    shortcut.handler(event);
    return;
  }
}

function attach(): void {
  if (attached || typeof window === 'undefined') return;
  window.addEventListener('keydown', onKeyDown);
  attached = true;
}

/** Registers a shortcut; returns an unregister function. Later registrations win on conflicts. */
export function registerShortcut(definition: ShortcutDefinition): () => void {
  attach();
  registry.set(definition.id, definition);
  notify();
  return () => {
    if (registry.get(definition.id) === definition) {
      registry.delete(definition.id);
      notify();
    }
  };
}

export function getShortcuts(): ShortcutDefinition[] {
  return snapshot;
}

export function subscribeShortcuts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Human-readable key label for help screens. */
export function formatShortcut(keys: string): string {
  return keys
    .split('+')
    .map((part) => {
      if (part === 'mod') return IS_MAC ? '⌘' : 'Ctrl';
      if (part === 'shift') return IS_MAC ? '⇧' : 'Shift';
      if (part === 'alt') return IS_MAC ? '⌥' : 'Alt';
      return part.length === 1 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(IS_MAC ? '' : '+');
}

/** Test hook. */
export function clearShortcuts(): void {
  registry.clear();
  notify();
}
