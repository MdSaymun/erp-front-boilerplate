import { http, HttpResponse } from 'msw/http';

import type { ImportResult } from '@/types/api';
import type { Activity, Attachment, Comment, DocumentStatus } from '@/types/erp';

import {
  createSampleActivities,
  createSampleAttachments,
  createSampleComments,
  createSampleRecords,
  type SampleRecord,
} from '../data/sampleRecords';
import { api } from '../utils/api';
import { applyListQuery, listQueryFromUrl } from '../utils/applyListQuery';
import { problem, validationProblem } from '../utils/problem';

export const SAMPLE_RECORDS_PATH = '/dev/sample-records';

/** Reserved codes that make the mock backend misbehave on purpose (showcase + tests). */
export const SAMPLE_TRIGGERS = {
  validationError: 'ERR',
  conflict: 'CONFLICT',
  serverError: 'CRASH',
} as const;

const TRANSITIONS: Record<string, DocumentStatus> = {
  submit: 'pending',
  confirm: 'confirmed',
  start: 'in_progress',
  complete: 'done',
  cancel: 'cancelled',
  reset: 'draft',
};

interface Store {
  records: SampleRecord[];
  activities: Map<string, Activity[]>;
  comments: Map<string, Comment[]>;
  attachments: Map<string, Attachment[]>;
  counter: number;
}

let store: Store = createStore();

function createStore(): Store {
  return {
    records: createSampleRecords(),
    activities: new Map(),
    comments: new Map(),
    attachments: new Map(),
    counter: 1000,
  };
}

export function resetSampleRecords(): void {
  store = createStore();
}

function nextId(prefix: string): string {
  store.counter += 1;
  return `${prefix}-${store.counter}`;
}

function bumpVersion(record: SampleRecord): SampleRecord {
  const [, n = '0'] = record.rowVersion.split('-');
  record.rowVersion = `v${Number(record.rowVersion.slice(1, record.rowVersion.indexOf('-'))) + 1}-${n}`;
  record.updatedAt = new Date().toISOString();
  record.updatedBy = 'user-1';
  return record;
}

function activities(id: string): Activity[] {
  if (!store.activities.has(id)) store.activities.set(id, createSampleActivities(id));
  return store.activities.get(id) ?? [];
}

function logActivity(id: string, kind: Activity['kind'], summary: string): void {
  activities(id).push({
    id: nextId('act'),
    kind,
    actorId: 'user-1',
    occurredAt: new Date().toISOString(),
    summary,
  });
}

function validate(body: Partial<SampleRecord>): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (!body.name?.trim()) errors.Name = ['Name is required.'];
  if (body.code === SAMPLE_TRIGGERS.validationError) errors.Code = ['This code is reserved.'];
  (body.lines ?? []).forEach((line, i) => {
    if (!line.quantity || line.quantity <= 0)
      errors[`Lines[${i}].Quantity`] = ['Quantity must be greater than zero.'];
  });
  return errors;
}

function find(id: string | readonly string[] | undefined): SampleRecord | undefined {
  return store.records.find((r) => r.id === id);
}

export const sampleRecordHandlers = [
  http.get(api(SAMPLE_RECORDS_PATH), ({ request }) =>
    HttpResponse.json(
      applyListQuery(store.records, listQueryFromUrl(request.url), ['code', 'name', 'notes']),
    ),
  ),

  http.get(api(`${SAMPLE_RECORDS_PATH}/export`), ({ request }) => {
    const query = listQueryFromUrl(request.url);
    const rows = applyListQuery(store.records, { ...query, page: 1, pageSize: 500 }, [
      'code',
      'name',
    ]).items;
    const csv = [
      'code,name,status,amount,currency',
      ...rows.map((r) => `${r.code},${r.name},${r.status},${r.amount.amount},${r.amount.currency}`),
    ].join('\n');
    return new HttpResponse(csv, { headers: { 'Content-Type': 'text/csv' } });
  }),

  http.post(api(`${SAMPLE_RECORDS_PATH}/import`), async () => {
    const result: ImportResult = {
      imported: 3,
      failed: 1,
      errors: [{ row: 4, field: 'quantity', message: 'Quantity must be a number.' }],
    };
    return HttpResponse.json(result);
  }),

  http.get(api(`${SAMPLE_RECORDS_PATH}/:id`), ({ params }) => {
    const record = find(params.id);
    return record ? HttpResponse.json(record) : problem(404, 'Sample record not found.');
  }),

  http.post(api(SAMPLE_RECORDS_PATH), async ({ request }) => {
    const body = (await request.json()) as Partial<SampleRecord>;
    if (body.code === SAMPLE_TRIGGERS.serverError)
      return problem(500, 'Object reference not set to an instance of an object.');
    const errors = validate(body);
    if (Object.keys(errors).length) return validationProblem(errors);
    const id = nextId('rec');
    const record: SampleRecord = {
      id,
      code: body.code || `SMP/2026/${String(store.counter).padStart(6, '0')}`,
      name: body.name ?? '',
      status: 'draft',
      category: body.category ?? 'alpha',
      amount: body.amount ?? { amount: 0, currency: 'USD' },
      date: body.date ?? new Date().toISOString().slice(0, 10),
      notes: body.notes,
      lines: (body.lines ?? []).map((line, i) => ({
        ...line,
        id: line.id || nextId('line'),
        lineNumber: i + 1,
      })),
      rowVersion: 'v1-new',
      createdAt: new Date().toISOString(),
      createdBy: 'user-1',
    };
    store.records.unshift(record);
    logActivity(id, 'created', 'Record created');
    return HttpResponse.json(record, { status: 201 });
  }),

  http.put(api(`${SAMPLE_RECORDS_PATH}/:id`), async ({ params, request }) => {
    const record = find(params.id);
    if (!record) return problem(404, 'Sample record not found.');
    const body = (await request.json()) as Partial<SampleRecord>;
    if (
      body.code === SAMPLE_TRIGGERS.conflict ||
      (request.headers.get('If-Match') ?? record.rowVersion) !== record.rowVersion
    ) {
      return problem(409, 'The record was modified by another user. Reload and try again.');
    }
    const errors = validate(body);
    if (Object.keys(errors).length) return validationProblem(errors);
    Object.assign(record, body, {
      id: record.id,
      lines: (body.lines ?? record.lines).map((line, i) => ({
        ...line,
        id: line.id || nextId('line'),
        lineNumber: i + 1,
      })),
    });
    bumpVersion(record);
    logActivity(record.id, 'updated', 'Record updated');
    return HttpResponse.json(record);
  }),

  http.delete(api(`${SAMPLE_RECORDS_PATH}/:id`), ({ params }) => {
    const index = store.records.findIndex((r) => r.id === params.id);
    if (index < 0) return problem(404, 'Sample record not found.');
    store.records.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(api(`${SAMPLE_RECORDS_PATH}/:id/actions/:action`), ({ params }) => {
    const record = find(params.id);
    if (!record) return problem(404, 'Sample record not found.');
    const next = TRANSITIONS[String(params.action)];
    if (!next) return problem(400, `Unknown action "${String(params.action)}".`);
    const previous = record.status;
    record.status = next;
    bumpVersion(record);
    logActivity(record.id, 'status_changed', `Status changed from ${previous} to ${next}`);
    return HttpResponse.json(record);
  }),

  http.get(api(`${SAMPLE_RECORDS_PATH}/:id/activities`), ({ params, request }) =>
    HttpResponse.json(
      applyListQuery([...activities(String(params.id))].reverse(), listQueryFromUrl(request.url), [
        'summary',
      ]),
    ),
  ),

  http.get(api(`${SAMPLE_RECORDS_PATH}/:id/comments`), ({ params, request }) => {
    const id = String(params.id);
    if (!store.comments.has(id)) store.comments.set(id, createSampleComments(id));
    return HttpResponse.json(
      applyListQuery(store.comments.get(id) ?? [], listQueryFromUrl(request.url), ['body']),
    );
  }),

  http.post(api(`${SAMPLE_RECORDS_PATH}/:id/comments`), async ({ params, request }) => {
    const id = String(params.id);
    const body = (await request.json()) as { body?: string };
    if (!body.body?.trim()) return validationProblem({ Body: ['Comment cannot be empty.'] });
    const comment: Comment = {
      id: nextId('cmt'),
      authorId: 'user-1',
      body: body.body.trim(),
      createdAt: new Date().toISOString(),
    };
    if (!store.comments.has(id)) store.comments.set(id, createSampleComments(id));
    store.comments.get(id)?.push(comment);
    logActivity(id, 'commented', 'Jane Doe commented');
    return HttpResponse.json(comment, { status: 201 });
  }),

  http.get(api(`${SAMPLE_RECORDS_PATH}/:id/attachments`), ({ params, request }) => {
    const id = String(params.id);
    if (!store.attachments.has(id)) store.attachments.set(id, createSampleAttachments(id));
    return HttpResponse.json(
      applyListQuery(store.attachments.get(id) ?? [], listQueryFromUrl(request.url), ['fileName']),
    );
  }),

  http.post(api(`${SAMPLE_RECORDS_PATH}/:id/attachments`), async ({ params, request }) => {
    const id = String(params.id);
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return validationProblem({ File: ['A file is required.'] });
    const attachment: Attachment = {
      id: nextId('att'),
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'user-1',
    };
    if (!store.attachments.has(id)) store.attachments.set(id, createSampleAttachments(id));
    store.attachments.get(id)?.push(attachment);
    logActivity(id, 'attached', `Attached ${file.name}`);
    return HttpResponse.json(attachment, { status: 201 });
  }),

  http.delete(api(`${SAMPLE_RECORDS_PATH}/:id/attachments/:attachmentId`), ({ params }) => {
    const list = store.attachments.get(String(params.id)) ?? [];
    const index = list.findIndex((a) => a.id === params.attachmentId);
    if (index < 0) return problem(404, 'Attachment not found.');
    list.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
