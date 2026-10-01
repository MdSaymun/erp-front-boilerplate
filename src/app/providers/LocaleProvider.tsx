import type { Locale } from 'antd/es/locale';
import { type PropsWithChildren, useEffect, useState } from 'react';

import { useAppLanguage } from '@/hooks/useAppLanguage';
import { initI18n, loadLanguage } from '@/i18n';
import { defaultAntdLocale, loadAntdLocale } from '@/i18n/antdLocales';

initI18n();

interface LocaleContextValue {
  antdLocale: Locale;
  language: string;
}

/**
 * Keeps i18next, antd and dayjs on the same language. Non-English bundles are
 * fetched on demand; until they arrive the previous locale stays active.
 */
export function useResolvedLocale(): LocaleContextValue {
  const language = useAppLanguage();
  const [state, setState] = useState<LocaleContextValue>({
    antdLocale: defaultAntdLocale,
    language: 'en',
  });

  useEffect(() => {
    let cancelled = false;
    void Promise.all([loadLanguage(language), loadAntdLocale(language)]).then(
      ([resolved, antdLocale]) => {
        if (!cancelled) setState({ antdLocale, language: resolved });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [language]);

  return state;
}

export function LocaleProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}
