import type { ModuleKey } from '@/config/modules';
import type { PermissionKey } from '@/types/permission';

/** Metadata attached to routes via `handle`; read with `useMatches()`. */
export interface RouteHandle {
  /** Breadcrumb label for this segment. */
  breadcrumb?: string;
  /** Document/page title. */
  title?: string;
  /** Owning ERP module (drives placeholders and module availability). */
  module?: ModuleKey;
  /** Permission required to view (UX only; enforced by PermissionRoute). */
  permission?: PermissionKey;
  /** Mark developer-only routes. */
  dev?: boolean;
}

export function isRouteHandle(value: unknown): value is RouteHandle {
  return typeof value === 'object' && value !== null;
}
