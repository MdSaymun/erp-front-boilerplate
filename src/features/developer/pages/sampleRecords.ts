import { z } from 'zod';

import type { FilterDefinition } from '@/components/data-table/types';
import type { WorkflowActionSpec } from '@/features/core/workflow';
import { createResourceHooks } from '@/hooks/resource/createResourceHooks';
import type { SampleRecord } from '@/features/developer/types/sampleRecord';
import { currencyCodeSchema, isoDateSchema } from '@/schemas/common';
import { createResourceApi } from '@/services/api/resource';
import type { DocumentStatus } from '@/types/erp';

/**
 * Wiring for the showcase entity. Everything here is the pattern a real module
 * repeats: resource api → hooks → schema → columns/filters → workflow.
 */
export const SAMPLE_RECORDS_PATH = '/dev/sample-records';

export const sampleRecordsApi = createResourceApi<SampleRecord, SampleRecordBody, SampleRecordBody>(
  SAMPLE_RECORDS_PATH,
);
export const sampleRecordHooks = createResourceHooks('sample-records', sampleRecordsApi);

export const SAMPLE_STAGES: DocumentStatus[] = [
  'draft',
  'pending',
  'confirmed',
  'in_progress',
  'done',
];

export const SAMPLE_TRANSITIONS: WorkflowActionSpec[] = [
  {
    from: 'draft',
    to: 'pending',
    action: 'submit',
    label: 'Submit for approval',
    primary: true,
    permission: 'dev.patterns.update',
  },
  {
    from: 'pending',
    to: 'confirmed',
    action: 'confirm',
    label: 'Confirm',
    primary: true,
    permission: 'dev.patterns.update',
  },
  {
    from: 'pending',
    to: 'draft',
    action: 'reset',
    label: 'Back to draft',
    permission: 'dev.patterns.update',
  },
  {
    from: 'confirmed',
    to: 'in_progress',
    action: 'start',
    label: 'Start',
    primary: true,
    permission: 'dev.patterns.update',
  },
  {
    from: 'in_progress',
    to: 'done',
    action: 'complete',
    label: 'Complete',
    primary: true,
    permission: 'dev.patterns.update',
    confirm: { title: 'Mark as done?', description: 'The record becomes read-only.' },
  },
  {
    from: 'draft',
    to: 'cancelled',
    action: 'cancel',
    label: 'Cancel',
    danger: true,
    permission: 'dev.patterns.update',
    confirm: { title: 'Cancel this record?' },
  },
  {
    from: 'pending',
    to: 'cancelled',
    action: 'cancel',
    label: 'Cancel',
    danger: true,
    permission: 'dev.patterns.update',
    confirm: { title: 'Cancel this record?' },
  },
  {
    from: 'confirmed',
    to: 'cancelled',
    action: 'cancel',
    label: 'Cancel',
    danger: true,
    permission: 'dev.patterns.update',
    confirm: { title: 'Cancel this record?' },
  },
  {
    from: 'cancelled',
    to: 'draft',
    action: 'reset',
    label: 'Reopen as draft',
    permission: 'dev.patterns.update',
  },
];

export const SAMPLE_FILTERS: FilterDefinition[] = [
  {
    field: 'status',
    label: 'Status',
    type: 'select',
    multiple: true,
    options: ['draft', 'pending', 'confirmed', 'in_progress', 'done', 'cancelled'].map((s) => ({
      value: s,
      label: s.replace('_', ' '),
    })),
  },
  {
    field: 'category',
    label: 'Category',
    type: 'select',
    options: ['alpha', 'beta', 'gamma'].map((c) => ({ value: c, label: c })),
  },
  { field: 'date', label: 'Date', type: 'date-range' },
];

const lineSchema = z.object({
  id: z.string().optional(),
  description: z.string().trim().min(1, { error: 'Description is required' }).max(200),
  quantity: z
    .number({ error: 'Enter a quantity' })
    .positive({ error: 'Quantity must be greater than zero' }),
  unitPrice: z.number({ error: 'Enter a price' }).min(0, { error: 'Price cannot be negative' }),
});

export const sampleRecordSchema = z.object({
  code: z.string().trim().min(1, { error: 'Code is required' }).max(30),
  name: z.string().trim().min(2, { error: 'Name must be at least 2 characters' }).max(120),
  category: z.enum(['alpha', 'beta', 'gamma'], { error: 'Select a category' }),
  date: isoDateSchema,
  currency: currencyCodeSchema,
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  lines: z.array(lineSchema).min(1, { error: 'Add at least one line' }),
  rowVersion: z.string().optional(),
});

export type SampleRecordInput = z.input<typeof sampleRecordSchema>;
export type SampleRecordValues = z.output<typeof sampleRecordSchema>;

/** Body the (mock) backend accepts. */
export type SampleRecordBody = Pick<
  SampleRecord,
  'code' | 'name' | 'category' | 'date' | 'notes' | 'amount' | 'lines'
>;

export function toBody(values: SampleRecordValues): SampleRecordBody {
  const lines = values.lines.map((line, index) => ({
    id: line.id ?? '',
    lineNumber: index + 1,
    description: line.description,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    lineTotal: Math.round(line.quantity * line.unitPrice * 100) / 100,
  }));
  return {
    code: values.code,
    name: values.name,
    category: values.category,
    date: values.date,
    notes: values.notes || undefined,
    amount: { amount: lines.reduce((sum, l) => sum + l.lineTotal, 0), currency: values.currency },
    lines,
  };
}

export function toFormValues(record: SampleRecord): SampleRecordInput {
  return {
    code: record.code,
    name: record.name,
    category: record.category,
    date: record.date,
    currency: record.amount.currency,
    notes: record.notes ?? '',
    lines: record.lines.map((l) => ({
      id: l.id,
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice ?? 0,
    })),
    rowVersion: record.rowVersion,
  };
}

export const EMPTY_LINE = { description: '', quantity: 1, unitPrice: 0 };

export const DEFAULT_FORM_VALUES: SampleRecordInput = {
  code: '',
  name: '',
  category: 'alpha',
  date: new Date().toISOString().slice(0, 10),
  currency: 'USD',
  notes: '',
  lines: [EMPTY_LINE],
};
