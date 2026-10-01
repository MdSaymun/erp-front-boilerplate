import { APP_KEY } from '@/config/app';

/** localStorage keys. Only UI preferences are persisted; never tokens or business data. */
export const STORAGE_KEYS = {
  uiPreferences: `${APP_KEY}.ui`,
  tablePreferences: `${APP_KEY}.tables`,
} as const;
