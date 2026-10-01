import type { SampleRecord } from '@/features/developer/types/sampleRecord';
import type { Id } from '@/types/common';
import type { Activity, Attachment, Comment, DocumentLineBase, DocumentStatus } from '@/types/erp';

export type { SampleRecord };

const STATUSES: DocumentStatus[] = [
  'draft',
  'pending',
  'confirmed',
  'in_progress',
  'done',
  'cancelled',
];
const CATEGORIES: SampleRecord['category'][] = ['alpha', 'beta', 'gamma'];

function makeRecord(index: number): SampleRecord {
  const n = index + 1;
  const lines: DocumentLineBase[] = Array.from({ length: (n % 3) + 1 }, (_, i) => ({
    id: `rec-${n}-line-${i + 1}`,
    lineNumber: i + 1,
    description: `Line ${i + 1} of record ${n}`,
    quantity: (i + 1) * 2,
    unitPrice: 10 * n,
    lineTotal: (i + 1) * 2 * 10 * n,
  }));
  const amount = lines.reduce((sum, line) => sum + (line.lineTotal ?? 0), 0);
  return {
    id: `rec-${n}`,
    code: `SMP/2026/${String(n).padStart(6, '0')}`,
    name: `Sample record ${n}`,
    status: STATUSES[n % STATUSES.length] ?? 'draft',
    category: CATEGORIES[n % CATEGORIES.length] ?? 'alpha',
    amount: { amount, currency: n % 2 === 0 ? 'USD' : 'BDT' },
    date: `2026-${String((n % 12) + 1).padStart(2, '0')}-${String((n % 27) + 1).padStart(2, '0')}`,
    notes: n % 5 === 0 ? 'Needs review' : undefined,
    lines,
    rowVersion: `v1-${n}`,
    createdAt: '2026-09-01T08:00:00Z',
    createdBy: 'user-1',
    updatedAt: '2026-09-15T10:30:00Z',
    updatedBy: 'user-1',
  };
}

export function createSampleRecords(count = 57): SampleRecord[] {
  return Array.from({ length: count }, (_, i) => makeRecord(i));
}

export function createSampleActivities(recordId: Id): Activity[] {
  return [
    {
      id: `${recordId}-act-1`,
      kind: 'created',
      actorId: 'user-1',
      occurredAt: '2026-09-01T08:00:00Z',
      summary: 'Record created',
    },
    {
      id: `${recordId}-act-2`,
      kind: 'status_changed',
      actorId: 'user-1',
      occurredAt: '2026-09-02T09:00:00Z',
      summary: 'Status changed from Draft to Pending approval',
    },
    {
      id: `${recordId}-act-3`,
      kind: 'commented',
      actorId: 'user-1',
      occurredAt: '2026-09-03T11:15:00Z',
      summary: 'Jane Doe commented',
    },
  ];
}

export function createSampleComments(recordId: Id): Comment[] {
  return [
    {
      id: `${recordId}-cmt-1`,
      authorId: 'user-1',
      body: 'Please double-check line 2 before confirming.',
      createdAt: '2026-09-03T11:15:00Z',
    },
  ];
}

export function createSampleAttachments(recordId: Id): Attachment[] {
  return [
    {
      id: `${recordId}-att-1`,
      fileName: 'specification.pdf',
      contentType: 'application/pdf',
      sizeBytes: 182_000,
      uploadedAt: '2026-09-01T08:05:00Z',
      uploadedBy: 'user-1',
    },
  ];
}
