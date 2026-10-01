import { listQueryKey } from '@/services/api/listQuery';
import type { ListQuery } from '@/types/api';
import type { Id } from '@/types/common';

/**
 * Query-key factory. The company id is part of every key so switching company
 * can never serve another company's cached rows.
 */
export function resourceKeys(resource: string, companyId: Id | null) {
  const root = ['company', companyId ?? 'none', resource] as const;
  return {
    all: root,
    lists: () => [...root, 'list'] as const,
    list: (query: Partial<ListQuery>) => [...root, 'list', listQueryKey(query)] as const,
    details: () => [...root, 'detail'] as const,
    detail: (id: Id) => [...root, 'detail', id] as const,
  };
}

export type ResourceKeys = ReturnType<typeof resourceKeys>;
