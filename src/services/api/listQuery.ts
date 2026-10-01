import type { Filter, FilterOperator, ListQuery, Sort, SortDirection } from '@/types/api';

/**
 * Single place that defines how a ListQuery travels over the wire and in the URL:
 *
 *   ?page=2&pageSize=25&search=abc&sort=name:asc&sort=code:desc&filter=status:eq:active
 *
 * Both the backend query-string binding and the browser URL use this format, so
 * a list URL can be pasted straight into an API call.
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 500;

const FILTER_OPERATORS: ReadonlySet<FilterOperator> = new Set([
  'eq',
  'neq',
  'contains',
  'startsWith',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'between',
]);

export function serializeSort(sort: Sort): string {
  return `${sort.field}:${sort.direction}`;
}

export function parseSort(value: string): Sort | null {
  const [field, direction] = value.split(':');
  if (!field) return null;
  const dir: SortDirection = direction === 'desc' ? 'desc' : 'asc';
  return { field, direction: dir };
}

export function serializeFilter(filter: Filter): string {
  const value = Array.isArray(filter.value) ? filter.value.join(',') : String(filter.value);
  return `${filter.field}:${filter.operator}:${value}`;
}

export function parseFilter(value: string): Filter | null {
  const [field, operator, ...rest] = value.split(':');
  if (!field || !operator || !FILTER_OPERATORS.has(operator as FilterOperator)) return null;
  const raw = rest.join(':');
  const op = operator as FilterOperator;
  const parsed: Filter['value'] =
    op === 'in' || op === 'between' ? raw.split(',').filter(Boolean) : raw;
  return { field, operator: op, value: parsed };
}

/** Keys owned by the list contract; other URL params (e.g. `tab`) are left untouched. */
export const LIST_QUERY_KEYS: ReadonlySet<string> = new Set([
  'page',
  'pageSize',
  'search',
  'sort',
  'filter',
  'groupBy',
]);

export function toSearchParams(query: Partial<ListQuery>): URLSearchParams {
  const params = new URLSearchParams();
  if (query.page && query.page !== DEFAULT_PAGE) params.set('page', String(query.page));
  if (query.pageSize && query.pageSize !== DEFAULT_PAGE_SIZE)
    params.set('pageSize', String(query.pageSize));
  if (query.search?.trim()) params.set('search', query.search.trim());
  for (const sort of query.sort ?? []) params.append('sort', serializeSort(sort));
  for (const filter of query.filters ?? []) params.append('filter', serializeFilter(filter));
  if (query.groupBy) params.set('groupBy', query.groupBy);
  return params;
}

function clampInt(value: string | null, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

export function fromSearchParams(
  params: URLSearchParams,
  defaults: Partial<ListQuery> = {},
): ListQuery {
  const sort = params
    .getAll('sort')
    .map(parseSort)
    .filter((s): s is Sort => s !== null);
  const filters = params
    .getAll('filter')
    .map(parseFilter)
    .filter((f): f is Filter => f !== null);
  const search = params.get('search')?.trim();
  const groupBy = params.get('groupBy')?.trim();

  return {
    ...defaults,
    page: clampInt(params.get('page'), defaults.page ?? DEFAULT_PAGE, 1, Number.MAX_SAFE_INTEGER),
    pageSize: clampInt(
      params.get('pageSize'),
      defaults.pageSize ?? DEFAULT_PAGE_SIZE,
      1,
      MAX_PAGE_SIZE,
    ),
    ...(search ? { search } : {}),
    ...(sort.length ? { sort } : {}),
    ...(filters.length ? { filters } : {}),
    ...(groupBy ? { groupBy } : {}),
  };
}

export function defaultListQuery(overrides: Partial<ListQuery> = {}): ListQuery {
  return { page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE, ...overrides };
}

/** Stable string for query keys and equality checks. */
export function listQueryKey(query: Partial<ListQuery>): string {
  return toSearchParams(query).toString();
}
