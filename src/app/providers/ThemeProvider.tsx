import { App as AntApp, ConfigProvider } from 'antd';
import { type PropsWithChildren, useMemo } from 'react';

import { useTenantStore } from '@/stores/tenantStore';
import { buildTheme } from '@/theme/theme';
import { useResolvedThemeMode } from '@/theme/useResolvedThemeMode';

import { useResolvedLocale } from './LocaleProvider';

/**
 * Ant Design global configuration: theme (mode + tenant branding) and locale.
 * `AntApp` provides context-aware message/notification/modal via `App.useApp()`.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const mode = useResolvedThemeMode();
  const branding = useTenantStore((state) => state.currentTenant?.branding);
  const { antdLocale, language } = useResolvedLocale();
  const theme = useMemo(() => buildTheme(mode, branding), [mode, branding]);

  return (
    <ConfigProvider
      theme={theme}
      locale={antdLocale}
      componentSize="middle"
      form={{ requiredMark: true }}
      direction="ltr"
      key={language}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
