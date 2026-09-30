import { z } from 'zod';

import { currencyCodeSchema, timeZoneSchema } from '@/schemas/common';

/** Demonstration schema proving React Hook Form + Zod integration. */
export const companyProfileSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, { error: 'Company name must be at least 2 characters' })
    .max(120, { error: 'Company name must be at most 120 characters' }),
  currency: currencyCodeSchema,
  timeZone: timeZoneSchema,
});

export type CompanyProfileInput = z.input<typeof companyProfileSchema>;
export type CompanyProfileValues = z.output<typeof companyProfileSchema>;
