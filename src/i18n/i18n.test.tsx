import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { afterEach, describe, expect, it } from 'vitest';

import { initI18n, loadLanguage } from '@/i18n';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { useUiStore } from '@/stores/uiStore';

function Probe() {
  const { t } = useTranslation();
  return <span>{t('actions.save')}</span>;
}

describe('i18n', () => {
  afterEach(async () => {
    useUiStore.getState().setLanguage(null);
    await loadLanguage('en');
  });

  it('is initialised synchronously with English resources', () => {
    const i18n = initI18n();
    expect(i18n.t('actions.save')).toBe('Save');
    expect(i18n.t('nav.userMenu', { name: 'Jane' })).toBe('User menu for Jane');
  });

  it('switches language on demand and falls back to English for unknown languages', async () => {
    expect(await loadLanguage('bn-BD')).toBe('bn');
    expect(initI18n().t('actions.save')).toBe('সংরক্ষণ');
    expect(await loadLanguage('xx')).toBe('en');
    expect(initI18n().t('actions.save')).toBe('Save');
  });

  it('follows the user preference inside the providers', async () => {
    useUiStore.getState().setLanguage('bn');
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(await screen.findByText('সংরক্ষণ')).toBeInTheDocument();
  });
});
