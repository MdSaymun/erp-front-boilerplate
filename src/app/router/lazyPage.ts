import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router';

/** Adapts a default-exported page module to React Router's lazy route object. */
export function lazyPage(importer: () => Promise<{ default: ComponentType }>): RouteObject['lazy'] {
  return async () => ({ Component: (await importer()).default });
}
