import { describe, expect, it } from 'vitest';

import { companyProfileSchema } from '@/features/organization/schemas/companyProfileSchema';

describe('companyProfileSchema', () => {
  it('accepts valid input and normalizes the currency code', () => {
    const result = companyProfileSchema.safeParse({
      companyName: '  ABC Electronics Ltd ',
      currency: 'bdt',
      timeZone: 'Asia/Dhaka',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        companyName: 'ABC Electronics Ltd',
        currency: 'BDT',
        timeZone: 'Asia/Dhaka',
      });
    }
  });

  it('rejects an invalid time zone and short names with field-specific messages', () => {
    const result = companyProfileSchema.safeParse({
      companyName: 'A',
      currency: 'US',
      timeZone: 'Mars/Olympus',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const byField = Object.fromEntries(
        result.error.issues.map((i) => [i.path.join('.'), i.message]),
      );
      expect(byField.companyName).toBe('Company name must be at least 2 characters');
      expect(byField.currency).toBe('Currency must be a 3-letter ISO 4217 code');
      expect(byField.timeZone).toBe('Enter a valid IANA time zone, e.g. Asia/Dhaka');
    }
  });
});
