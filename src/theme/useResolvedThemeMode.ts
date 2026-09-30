import { useSyncExternalStore } from 'react';

import { useUiStore } from '@/stores/uiStore';

import type { ResolvedThemeMode } from './theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSystemSnapshot(): ResolvedThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

function getServerSnapshot(): ResolvedThemeMode {
  return 'light';
}

/** Resolves the user's theme preference ('system' follows the OS) to light or dark. */
export function useResolvedThemeMode(): ResolvedThemeMode {
  const themeMode = useUiStore((state) => state.themeMode);
  const systemMode = useSyncExternalStore(subscribe, getSystemSnapshot, getServerSnapshot);

  return themeMode === 'system' ? systemMode : themeMode;
}
