import { Drawer, Form, Segmented, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES } from '@/i18n';
import { useUiStore } from '@/stores/uiStore';

interface PreferencesDrawerProps {
  open: boolean;
  onClose: () => void;
}

const LANGUAGE_LABELS: Record<string, string> = { en: 'English', bn: 'বাংলা' };

/** Per-user presentation preferences. Persisted locally; ready to sync to the profile later. */
export function PreferencesDrawer({ open, onClose }: PreferencesDrawerProps) {
  const { t } = useTranslation();
  const themeMode = useUiStore((state) => state.themeMode);
  const setThemeMode = useUiStore((state) => state.setThemeMode);
  const density = useUiStore((state) => state.tableDensity);
  const setDensity = useUiStore((state) => state.setTableDensity);
  const language = useUiStore((state) => state.language);
  const setLanguage = useUiStore((state) => state.setLanguage);

  return (
    <Drawer title={t('preferences.title')} open={open} onClose={onClose} width={360}>
      <Form layout="vertical">
        <Form.Item label={t('preferences.theme')}>
          <Segmented
            value={themeMode}
            onChange={(value) => setThemeMode(value as typeof themeMode)}
            options={[
              { value: 'system', label: t('preferences.themeSystem') },
              { value: 'light', label: t('preferences.themeLight') },
              { value: 'dark', label: t('preferences.themeDark') },
            ]}
          />
        </Form.Item>
        <Form.Item label={t('preferences.density')}>
          <Segmented
            value={density}
            onChange={(value) => setDensity(value as typeof density)}
            options={[
              { value: 'compact', label: t('preferences.densityCompact') },
              { value: 'comfortable', label: t('preferences.densityComfortable') },
            ]}
          />
        </Form.Item>
        <Form.Item label={t('preferences.language')}>
          <Select
            value={language ?? 'auto'}
            onChange={(value) => setLanguage(value === 'auto' ? null : value)}
            options={[
              { value: 'auto', label: t('preferences.languageAuto') },
              ...SUPPORTED_LANGUAGES.map((code) => ({
                value: code,
                label: LANGUAGE_LABELS[code] ?? code,
              })),
            ]}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
