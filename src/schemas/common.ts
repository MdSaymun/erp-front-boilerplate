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
