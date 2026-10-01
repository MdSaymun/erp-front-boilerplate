import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { fromSearchParams, LIST_QUERY_KEYS, toSearchParams } from '@/services/api/listQuery';
import type { Filter, ListQuery, Sort } from '@/types/api';

type QueryUpdater = ListQuery | ((previous: ListQuery) => ListQuery);

/**
 * Keeps a list's paging, sorting, filtering and search in the URL so views are
 * shareable, bookmarkable and back-button safe. Non-list params (e.g. `tab`) are
 * preserved. State is derived from the URL during render; nothing is mirrored.
 */
export function useListQueryState(defaults: Partial<ListQuery> = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(() => fromSearchParams(searchParams, defaults), [searchParams, defaults]);

  const setQuery = useCallback(
    (updater: QueryUpdater) => {
      setSearchParams(
        (previous) => {
          const current = fromSearchParams(previous, defaults);
          const next = typeof updater === 'function' ? updater(current) : updater;
          const params = toSearchParams(next);
          for (const [key, value] of previous) {
            if (!LIST_QUERY_KEYS.has(key)) params.append(key, value);
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams, defaults],
  );

  const setPage = useCallback(
    (page: number, pageSize?: number) =>
      setQuery((q) => ({ ...q, page, pageSize: pageSize ?? q.pageSize })),
    [setQuery],
  );
  const setSearch = useCallback(
    (search: string) => setQuery((q) => ({ ...q, search: search || undefined, page: 1 })),
    [setQuery],
  );
  const setSort = useCallback(
    (sort: Sort[]) => setQuery((q) => ({ ...q, sort: sort.length ? sort : undefined, page: 1 })),
    [setQuery],
  );
  const setFilters = useCallback(
    (filters: Filter[]) =>
      setQuery((q) => ({ ...q, filters: filters.length ? filters : undefined, page: 1 })),
    [setQuery],
  );
  const reset = useCallback(
    () => setQuery({ page: 1, pageSize: query.pageSize, ...defaults }),
    [setQuery, query.pageSize, defaults],
  );

  return { query, setQuery, setPage, setSearch, setSort, setFilters, reset };
}
