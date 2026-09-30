import { App as AntApp, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import { type PropsWithChildren, useMemo } from 'react';

import { buildTheme } from '@/theme/theme';
import { useResolvedThemeMode } from '@/theme/useResolvedThemeMode';

/**
 * Ant Design global configuration. `AntApp` provides context-aware
 * message/notification/modal via `App.useApp()`.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const mode = useResolvedThemeMode();
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ConfigProvider
      theme={theme}
      locale={enUS}
      componentSize="middle"
      form={{ requiredMark: true }}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
