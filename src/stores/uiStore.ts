import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type TableDensity = 'compact' | 'comfortable';

/** Layout and presentation preferences. Persisted per browser; contains no business data. */
interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  themeMode: ThemeMode;
  tableDensity: TableDensity;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setTableDensity: (density: TableDensity) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      themeMode: 'system',
      tableDensity: 'compact',

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      setTableDensity: (density) => set({ tableDensity: density }),
    }),
    {
      name: STORAGE_KEYS.uiPreferences,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        themeMode: state.themeMode,
        tableDensity: state.tableDensity,
      }),
    },
  ),
);
