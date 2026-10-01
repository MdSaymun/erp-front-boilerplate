import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from './locales/en/common.json';

export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'bn'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const resources = {
  en: { common },
} as const;

/**
 * i18next is initialised synchronously with the bundled English resources so
 * the first render (and tests) never see untranslated keys. Other languages are
 * loaded on demand by `loadLanguage`.
 */
export function initI18n(): i18n {
  if (!i18next.isInitialized) {
    void i18next.use(initReactI18next).init({
      resources,
      lng: DEFAULT_LANGUAGE,
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS: 'common',
      ns: ['common'],
      interpolation: { escapeValue: false },
      initAsync: false,
      returnNull: false,
    });
  }
  return i18next;
}

const LANGUAGE_LOADERS: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  bn: () => import('./locales/bn/common.json'),
};

/** Loads a language bundle on demand and activates it. Unknown languages fall back to English. */
export async function loadLanguage(language: string): Promise<string> {
  const base = language.split('-')[0] ?? DEFAULT_LANGUAGE;
  const target = (SUPPORTED_LANGUAGES as readonly string[]).includes(base)
    ? base
    : DEFAULT_LANGUAGE;
  const loader = LANGUAGE_LOADERS[target];
  if (loader && !i18next.hasResourceBundle(target, 'common')) {
    const bundle = await loader();
    i18next.addResourceBundle(target, 'common', bundle.default, true, true);
  }
  await i18next.changeLanguage(target);
  return target;
}

export { i18next };
