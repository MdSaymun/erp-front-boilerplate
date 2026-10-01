import { env } from '@/config/env';
import { registerWidgets } from '@/features/core/widgets/widgetRegistry';
import { registerCommands } from '@/services/commands/commandRegistry';

import type { ModuleManifest } from './core/moduleManifest';
import { developerModule } from './developer/module';
// <module-imports>

/**
 * Module registry. `npm run generate:module <key>` adds a line here; the shell
 * mounts routes, navigation, widgets and commands from these manifests.
 */
export const MODULE_MANIFESTS: ModuleManifest[] = [
  developerModule,
  // <module-manifests>
].filter((manifest) => !manifest.devOnly || env.devToolsEnabled);

export function getModuleManifest(key: string): ModuleManifest | undefined {
  return MODULE_MANIFESTS.find((manifest) => manifest.key === key);
}

/** Registers widgets and commands contributed by modules. Idempotent. */
export function registerModuleContributions(): void {
  for (const manifest of MODULE_MANIFESTS) {
    if (manifest.widgets?.length) registerWidgets(manifest.widgets);
    if (manifest.commands?.length) registerCommands(manifest.commands);
  }
}

registerModuleContributions();
