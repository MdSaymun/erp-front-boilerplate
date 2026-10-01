import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import type { SavedView } from '@/types/views';

interface TablePreferences {
  hiddenColumns: string[];
  savedViews: SavedView[];
}

interface TableState {
  tables: Record<string, TablePreferences>;
  setHiddenColumns: (tableId: string, columns: string[]) => void;
  saveView: (view: SavedView) => void;
  deleteView: (tableId: string, viewId: string) => void;
  resetTable: (tableId: string) => void;
}

const EMPTY: TablePreferences = { hiddenColumns: [], savedViews: [] };

/** Per-table UI preferences (column visibility, personal saved views). Not business data. */
export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      tables: {},
      setHiddenColumns: (tableId, columns) =>
        set((state) => ({
          tables: {
            ...state.tables,
            [tableId]: { ...(state.tables[tableId] ?? EMPTY), hiddenColumns: columns },
          },
        })),
      saveView: (view) =>
        set((state) => {
          const current = state.tables[view.tableId] ?? EMPTY;
          const savedViews = [...current.savedViews.filter((v) => v.id !== view.id), view];
          return { tables: { ...state.tables, [view.tableId]: { ...current, savedViews } } };
        }),
      deleteView: (tableId, viewId) =>
        set((state) => {
          const current = state.tables[tableId] ?? EMPTY;
          return {
            tables: {
              ...state.tables,
              [tableId]: {
                ...current,
                savedViews: current.savedViews.filter((v) => v.id !== viewId),
              },
            },
          };
        }),
      resetTable: (tableId) =>
        set((state) => {
          const { [tableId]: _removed, ...rest } = state.tables;
          return { tables: rest };
        }),
    }),
    { name: STORAGE_KEYS.tablePreferences, storage: createJSONStorage(() => localStorage) },
  ),
);

export function selectTablePreferences(tableId: string) {
  return (state: TableState): TablePreferences => state.tables[tableId] ?? EMPTY;
}
