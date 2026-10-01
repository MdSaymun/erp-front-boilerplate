import { describe, expect, it } from 'vitest';

import { fromSearchParams, listQueryKey, toSearchParams } from '@/services/api/listQuery';

describe('list query serialization', () => {
  it('round-trips paging, search, sort and filters through URL params', () => {
    const query = {
      page: 3,
      pageSize: 50,
      search: 'abc',
      sort: [
        { field: 'name', direction: 'asc' as const },
        { field: 'code', direction: 'desc' as const },
      ],
      filters: [
        { field: 'status', operator: 'in' as const, value: ['draft', 'done'] },
        { field: 'date', operator: 'between' as const, value: ['2026-01-01', '2026-01-31'] },
        { field: 'name', operator: 'contains' as const, value: 'x:y' },
      ],
    };

    const params = toSearchParams(query);
    expect(params.toString()).toBe(
      'page=3&pageSize=50&search=abc&sort=name%3Aasc&sort=code%3Adesc&filter=status%3Ain%3Adraft%2Cdone&filter=date%3Abetween%3A2026-01-01%2C2026-01-31&filter=name%3Acontains%3Ax%3Ay',
    );
    expect(fromSearchParams(params)).toEqual(query);
  });

  it('omits defaults and falls back on invalid values', () => {
    expect(toSearchParams({ page: 1, pageSize: 25 }).toString()).toBe('');
    const parsed = fromSearchParams(
      new URLSearchParams('page=abc&pageSize=99999&sort=:asc&filter=status:bogus:x'),
    );
    expect(parsed).toEqual({ page: 1, pageSize: 500 });
  });

  it('applies caller defaults when the URL is silent', () => {
    const parsed = fromSearchParams(new URLSearchParams(''), {
      pageSize: 10,
      sort: [{ field: 'code', direction: 'asc' }],
    });
    expect(parsed.pageSize).toBe(10);
    expect(parsed.sort).toEqual([{ field: 'code', direction: 'asc' }]);
    expect(listQueryKey(parsed)).toBe('pageSize=10&sort=code%3Aasc');
  });
});
