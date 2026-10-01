import { isModuleEnabled } from '@/config/modules';
import type { PermissionKey } from '@/types/permission';

import type { DashboardWidget } from './types';

const widgets = new Map<string, DashboardWidget>();

/** Modules call this once (e.g. from their index) to contribute dashboard widgets. */
export function registerWidgets(items: DashboardWidget[]): () => void {
  items.forEach((widget) => widgets.set(widget.key, widget));
  return () => items.forEach((widget) => widgets.delete(widget.key));
}

/** Widgets the current user can see, filtered by module availability and permission (UX only). */
export function getVisibleWidgets(
  hasPermission: (permission: PermissionKey) => boolean,
): DashboardWidget[] {
  return [...widgets.values()]
    .filter((w) => isModuleEnabled(w.module))
    .filter((w) => !w.permission || hasPermission(w.permission))
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

/** Test hook. */
export function clearWidgets(): void {
  widgets.clear();
}
