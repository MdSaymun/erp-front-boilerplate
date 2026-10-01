import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router';

import type { ModuleKey } from '@/config/modules';
import type { Command } from '@/services/commands/commandRegistry';
import type { PermissionKey } from '@/types/permission';

import type { DashboardWidget } from './widgets/types';

/** Navigation entry contributed by a module (absolute paths). */
export interface ModuleNavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  path?: string;
  module: ModuleKey;
  permission?: PermissionKey;
  children?: ModuleNavItem[];
}

/**
 * Everything a business module plugs into the shell. Register the manifest in
 * `src/features/registry.ts`; the router, navigation, dashboard and command
 * palette read from there. Modules never edit the shell directly.
 */
export interface ModuleManifest {
  key: ModuleKey;
  label: string;
  icon?: ReactNode;
  /** Absolute base path, e.g. "/sales". Module routes are mounted under it. */
  basePath: string;
  /** Permission required to enter the module (UX only; backend authorizes). */
  permission?: PermissionKey;
  /** Permission keys the module exposes (catalogue for admin screens and docs). */
  permissions?: PermissionKey[];
  /** Routes relative to `basePath` (index, "new", ":id", ":id/edit", ...). */
  routes: RouteObject[];
  /** Menu entries shown under the module in the sidebar. */
  navigation?: ModuleNavItem[];
  widgets?: DashboardWidget[];
  commands?: Command[];
  /** Mounted only when developer tools are enabled (never in production). */
  devOnly?: boolean;
}
