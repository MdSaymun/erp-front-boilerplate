import { describe, expect, it } from 'vitest';

import { formatDate, formatDateTime, toUtcIso } from '@/utils/format/date';
import { formatCurrency, formatDecimal, roundTo } from '@/utils/format/number';

const settings = {
  timeZone: 'Asia/Dhaka',
  dateFormat: 'DD/MM/YYYY',
  dateTimeFormat: 'DD/MM/YYYY HH:mm',
};

describe('date formatting', () => {
  it('formats UTC instants in the configured time zone', () => {
    expect(formatDateTime('2026-09-30T20:30:00Z', settings)).toBe('01/10/2026 02:30');
    expect(formatDate('2026-09-30T20:30:00Z', settings)).toBe('01/10/2026');
    expect(formatDate('2026-09-30T20:30:00Z', { ...settings, timeZone: 'UTC' })).toBe('30/09/2026');
  });

  it('serializes zoned input back to UTC', () => {
    expect(toUtcIso('2026-10-01 02:30', 'Asia/Dhaka')).toBe('2026-09-30T20:30:00.000Z');
  });

  it('returns an empty string for missing or invalid values', () => {
    expect(formatDate(null, settings)).toBe('');
    expect(formatDate('not a date', settings)).toBe('');
  });
});

describe('number formatting', () => {
  it('formats currency per locale without hard-coded defaults', () => {
    expect(formatCurrency(1234.5, { locale: 'en-US', currency: 'USD' })).toBe('$1,234.50');
    // Intl uses a non-breaking space between amount and symbol in de-DE.
    expect(formatCurrency(1234.5, { locale: 'de-DE', currency: 'EUR' })).toMatch(/^1\.234,50\s€$/);
    expect(formatCurrency(1234.5, { locale: 'en-US', currency: 'BDT', display: 'code' })).toMatch(
      /BDT/,
    );
  });

  it('formats decimals and rounds half away from zero', () => {
    expect(formatDecimal(1234.5678, { locale: 'en-US', decimals: 2 })).toBe('1,234.57');
    expect(formatDecimal(undefined, { locale: 'en-US', decimals: 2 })).toBe('');
    expect(roundTo(2.675, 2)).toBe(2.68);
    expect(roundTo(-2.675, 2)).toBe(-2.68);
  });
});
