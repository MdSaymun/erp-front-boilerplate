import { describe, expect, it } from 'vitest';

import { applyListQuery } from '@/mocks/utils/applyListQuery';

const rows = [
  { id: '1', name: 'Alpha', status: 'draft', amount: { amount: 10 } },
  { id: '2', name: 'Beta', status: 'done', amount: { amount: 30 } },
  { id: '3', name: 'Gamma', status: 'draft', amount: { amount: 20 } },
];

describe('applyListQuery (mock backend)', () => {
  it('searches, filters, sorts nested fields and pages', () => {
    const result = applyListQuery(
      rows,
      {
        page: 1,
        pageSize: 2,
        filters: [{ field: 'status', operator: 'eq', value: 'draft' }],
        sort: [{ field: 'amount.amount', direction: 'desc' }],
      },
      ['name'],
    );
    expect(result.items.map((r) => r.id)).toEqual(['3', '1']);
    expect(result.totalCount).toBe(2);

    const searched = applyListQuery(rows, { page: 1, pageSize: 25, search: 'ta' }, ['name']);
    expect(searched.items.map((r) => r.id)).toEqual(['2']);

    const paged = applyListQuery(rows, { page: 2, pageSize: 2 }, ['name']);
    expect(paged.items.map((r) => r.id)).toEqual(['3']);
    expect(paged.totalPages).toBe(2);
  });
});
