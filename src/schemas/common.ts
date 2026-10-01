import { z } from 'zod';

import { isValidTimeZone } from '@/utils/format/date';

/** Reusable Zod building blocks. Module schemas compose these instead of redefining them. */

export const idSchema = z.string().trim().min(1, { error: 'Identifier is required' });

export const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, { error: 'Currency must be a 3-letter ISO 4217 code' });

export const timeZoneSchema = z
  .string()
  .trim()
  .min(1, { error: 'Time zone is required' })
  .refine(isValidTimeZone, { error: 'Enter a valid IANA time zone, e.g. Asia/Dhaka' });

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(500).default(25),
});

export const sortSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']),
});

export const listQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  sort: z.array(sortSchema).optional(),
});

export type ListQueryInput = z.input<typeof listQuerySchema>;
export type ListQueryValues = z.output<typeof listQuerySchema>;

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Enter a valid date' });

export const isoDateTimeSchema = z.iso.datetime({
  offset: true,
  error: 'Enter a valid date and time',
});

export const countryCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, { error: 'Select a country' });

export const addressSchema = z.object({
  type: z.enum(['billing', 'shipping', 'registered', 'other']).optional(),
  line1: z.string().trim().min(1, { error: 'Address line 1 is required' }).max(200),
  line2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().min(1, { error: 'City is required' }).max(100),
  state: z.string().trim().max(100).optional().or(z.literal('')),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')),
  countryCode: countryCodeSchema,
});

export const moneySchema = z.object({
  amount: z.number({ error: 'Enter an amount' }).finite(),
  currency: currencyCodeSchema,
});

export const quantitySchema = z.object({
  quantity: z
    .number({ error: 'Enter a quantity' })
    .positive({ error: 'Quantity must be greater than zero' }),
  uomId: z.string().min(1, { error: 'Select a unit' }),
});

export const percentSchema = z
  .number()
  .min(0, { error: 'Minimum 0%' })
  .max(100, { error: 'Maximum 100%' });

/** Hidden concurrency token carried by edit forms. */
export const rowVersionSchema = z.string().min(1);
