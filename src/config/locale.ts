import type { LocaleSettings } from '@/types/common';

/**
 * Fallback formatting settings used only when neither the current company nor
 * the tenant has supplied locale configuration. Tenant/company values always
 * take precedence; see `useLocaleSettings`.
 */
export const FALLBACK_LOCALE_SETTINGS: LocaleSettings = {
  locale: typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  currency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  dateTimeFormat: 'YYYY-MM-DD HH:mm',
  currencyDecimals: 2,
  quantityDecimals: 2,
};
