import type { Locale } from 'antd/es/locale';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';

/** Lazily loads the antd + dayjs locale pair for a UI language. Only English is bundled. */
const ANTD_LOADERS: Record<string, () => Promise<{ default: Locale }>> = {
  bn: () => import('antd/locale/bn_BD'),
};

const DAYJS_LOADERS: Record<string, () => Promise<unknown>> = {
  bn: () => import('dayjs/locale/bn'),
};

export async function loadAntdLocale(language: string): Promise<Locale> {
  const base = language.split('-')[0] ?? 'en';
  const antdLoader = ANTD_LOADERS[base];
  const dayjsLoader = DAYJS_LOADERS[base];
  if (dayjsLoader) await dayjsLoader();
  dayjs.locale(antdLoader ? base : 'en');
  if (!antdLoader) return enUS;
  return (await antdLoader()).default;
}

export { enUS as defaultAntdLocale };
