import { fromSearchParams } from '@/services/api/listQuery';
import type { Filter, ListQuery, PagedResult } from '@/types/api';

function readPath(record: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, record);
}

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return -1;
  if (b === undefined || b === null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function matchesFilter(record: unknown, filter: Filter): boolean {
  const actual = readPath(record, filter.field);
  const expected = filter.value;
  switch (filter.operator) {
    case 'eq':
      return String(actual) === String(expected);
    case 'neq':
      return String(actual) !== String(expected);
    case 'contains':
      return String(actual ?? '')
        .toLowerCase()
        .includes(String(expected).toLowerCase());
    case 'startsWith':
      return String(actual ?? '')
        .toLowerCase()
        .startsWith(String(expected).toLowerCase());
    case 'gt':
      return compare(actual, Number(expected)) > 0;
    case 'gte':
      return compare(actual, Number(expected)) >= 0;
    case 'lt':
      return compare(actual, Number(expected)) < 0;
    case 'lte':
      return compare(actual, Number(expected)) <= 0;
    case 'in':
      return (Array.isArray(expected) ? expected : [expected]).map(String).includes(String(actual));
    case 'between': {
      const [from, to] = Array.isArray(expected) ? expected : [expected, expected];
      return compare(actual, from) >= 0 && compare(actual, to) <= 0;
    }
    default:
      return true;
  }
}

/**
 * In-memory implementation of the list contract (search, filters, sort, paging)
 * so mocks behave like the backend will.
 */
export function applyListQuery<T>(
  rows: T[],
  query: ListQuery,
  searchFields: Array<keyof T & string>,
): PagedResult<T> {
  let result = rows;

  if (query.search) {
    const needle = query.search.toLowerCase();
    result = result.filter((row) =>
      searchFields.some((field) =>
        String(readPath(row, field) ?? '')
          .toLowerCase()
          .includes(needle),
      ),
    );
  }

  for (const filter of query.filters ?? []) {
    result = result.filter((row) => matchesFilter(row, filter));
  }

  if (query.sort?.length) {
    const sorts = query.sort;
    result = [...result].sort((a, b) => {
      for (const sort of sorts) {
        const cmp = compare(readPath(a, sort.field), readPath(b, sort.field));
        if (cmp !== 0) return sort.direction === 'desc' ? -cmp : cmp;
      }
      return 0;
    });
  }

  const totalCount = result.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;

  return {
    items: result.slice(start, start + query.pageSize),
    page,
    pageSize: query.pageSize,
    totalCount,
    totalPages,
  };
}

export function listQueryFromUrl(url: string): ListQuery {
  return fromSearchParams(new URL(url).searchParams);
}
