import type { Id } from './common';

/**
 * Permission keys follow `module.resource.action`, e.g. `inventory.products.view`.
 *
 * The backend is the authority on what a user may do. Frontend permission checks
 * only decide what to show (menus, buttons, routes) and must never be treated as
 * a security control.
 */
export type PermissionKey = `${string}.${string}.${string}`;

export type PermissionAction =
  'view' | 'create' | 'update' | 'delete' | 'approve' | 'post' | 'export' | 'manage';

export interface Permission {
  key: PermissionKey;
  module: string;
  resource: string;
  action: PermissionAction | string;
  description?: string;
}

export interface Role {
  id: Id;
  name: string;
  description?: string;
  /** Permission keys granted by this role. */
  permissions: PermissionKey[];
  isSystem?: boolean;
}
