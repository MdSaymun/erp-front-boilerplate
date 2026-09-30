import { useMatches, useParams } from 'react-router';

import { isRouteHandle, type RouteHandle } from '@/app/router/routeHandle';
import { MODULES } from '@/config/modules';

function humanize(segment: string): string {
  return segment
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Resolves module metadata from the nearest matched route carrying `handle.module`. */
export function useModuleRouteMeta() {
  const matches = useMatches();
  const params = useParams();
  const handle = [...matches]
    .reverse()
    .map((m) => m.handle)
    .find((h): h is RouteHandle => isRouteHandle(h) && Boolean(h.module));

  const subPath = params['*'] ?? '';
  const section = subPath ? humanize(subPath.split('/')[0] ?? '') : undefined;
  const moduleKey = handle?.module;
  const module = moduleKey ? MODULES[moduleKey] : undefined;

  return { handle, module, section };
}
