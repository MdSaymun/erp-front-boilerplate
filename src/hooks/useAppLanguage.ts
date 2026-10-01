import { useAuthStore } from '@/stores/authStore';
import { useTenantStore } from '@/stores/tenantStore';
import { useUiStore } from '@/stores/uiStore';

import { DEFAULT_LANGUAGE } from '@/i18n';

/** Resolves the UI language: explicit preference → user profile → tenant default → English. */
export function useAppLanguage(): string {
  const explicit = useUiStore((state) => state.language);
  const userLocale = useAuthStore((state) => state.user?.preferredLocale);
  const tenantLocale = useTenantStore((state) => state.currentTenant?.defaultLocale);
  return explicit ?? userLocale ?? tenantLocale ?? DEFAULT_LANGUAGE;
}
