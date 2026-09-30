import type { CurrencyCode, LocaleTag } from '@/types/common';

export interface DecimalFormatOptions {
  locale: LocaleTag;
  decimals: number;
  /** Show trailing zeros (true) or trim them (false). */
  fixed?: boolean;
}

export interface CurrencyFormatOptions {
  locale: LocaleTag;
  currency: CurrencyCode;
  decimals?: number;
  /** 'symbol' ($), 'code' (USD) or 'name' (US dollars). */
  display?: 'symbol' | 'code' | 'name';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function formatDecimal(
  value: number | null | undefined,
  options: DecimalFormatOptions,
): string {
  if (!isFiniteNumber(value)) return '';
  return new Intl.NumberFormat(options.locale, {
    minimumFractionDigits: options.fixed === false ? 0 : options.decimals,
    maximumFractionDigits: options.decimals,
  }).format(value);
}

export function formatCurrency(
  value: number | null | undefined,
  options: CurrencyFormatOptions,
): string {
  if (!isFiniteNumber(value)) return '';
  const formatter = new Intl.NumberFormat(options.locale, {
    style: 'currency',
    currency: options.currency,
    currencyDisplay: options.display ?? 'symbol',
    ...(options.decimals !== undefined
      ? { minimumFractionDigits: options.decimals, maximumFractionDigits: options.decimals }
      : {}),
  });
  return formatter.format(value);
}

export function formatPercent(
  value: number | null | undefined,
  locale: LocaleTag,
  decimals = 2,
): string {
  if (!isFiniteNumber(value)) return '';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/** Rounds half away from zero to a fixed number of decimals, avoiding float drift. */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return (Math.sign(value) * Math.round(Math.abs(value) * factor + Number.EPSILON)) / factor;
}
