import { useMemo } from 'react';

import { FALLBACK_LOCALE_SETTINGS } from '@/config/locale';
import { selectCurrentCompany, useCompanyStore } from '@/stores/companyStore';
import { useTenantStore } from '@/stores/tenantStore';
import type { LocaleSettings } from '@/types/common';

/**
 * Resolves formatting settings in priority order:
 * company -> tenant -> fallback. Nothing tenant-specific is hard-coded.
 */
export function useLocaleSettings(): LocaleSettings {
  const company = useCompanyStore(selectCurrentCompany);
  const tenant = useTenantStore((state) => state.currentTenant);

  return useMemo(
    () => ({
      ...FALLBACK_LOCALE_SETTINGS,
      locale: tenant?.defaultLocale ?? FALLBACK_LOCALE_SETTINGS.locale,
      timeZone: tenant?.defaultTimeZone ?? FALLBACK_LOCALE_SETTINGS.timeZone,
      currency: company?.baseCurrency ?? FALLBACK_LOCALE_SETTINGS.currency,
    }),
    [company?.baseCurrency, tenant?.defaultLocale, tenant?.defaultTimeZone],
  );
}
