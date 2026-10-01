import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';

import type { ResourceApi, UpdateOptions } from '@/services/api/resource';
import { useCompanyStore } from '@/stores/companyStore';
import type { ApiError, ListQuery, PagedResult } from '@/types/api';
import type { Id } from '@/types/common';

import { resourceKeys } from './resourceKeys';

type QueryOverrides<TData> = Omit<UseQueryOptions<TData, ApiError>, 'queryKey' | 'queryFn'>;
type MutationOverrides<TData, TVariables> = Omit<
  UseMutationOptions<TData, ApiError, TVariables>,
  'mutationFn'
>;

/**
 * Generates the standard TanStack Query hooks for a resource. Mutations invalidate
 * the resource's lists and the affected detail so every screen stays consistent.
 */
export function createResourceHooks<T extends { id: Id }, TCreate = Partial<T>, TUpdate = TCreate>(
  name: string,
  api: ResourceApi<T, TCreate, TUpdate>,
) {
  function useKeys() {
    const companyId = useCompanyStore((state) => state.currentCompanyId);
    return resourceKeys(name, companyId);
  }

  function useList(query: Partial<ListQuery>, overrides?: QueryOverrides<PagedResult<T>>) {
    const keys = useKeys();
    return useQuery<PagedResult<T>, ApiError>({
      queryKey: keys.list(query),
      queryFn: ({ signal }) => api.list(query, { signal }),
      placeholderData: keepPreviousData,
      ...overrides,
    });
  }

  function useDetail(id: Id | null | undefined, overrides?: QueryOverrides<T>) {
    const keys = useKeys();
    return useQuery<T, ApiError>({
      queryKey: keys.detail(id ?? ''),
      queryFn: ({ signal }) => api.get(id as Id, { signal }),
      enabled: Boolean(id),
      ...overrides,
    });
  }

  function useInvalidate() {
    const client = useQueryClient();
    const keys = useKeys();
    return async (id?: Id) => {
      await client.invalidateQueries({ queryKey: keys.lists() });
      if (id) await client.invalidateQueries({ queryKey: keys.detail(id) });
    };
  }

  function useCreate(overrides?: MutationOverrides<T, TCreate>) {
    const invalidate = useInvalidate();
    return useMutation<T, ApiError, TCreate>({
      mutationFn: (body) => api.create(body),
      ...overrides,
      onSuccess: async (data, variables, context, mutation) => {
        await invalidate();
        await overrides?.onSuccess?.(data, variables, context, mutation);
      },
    });
  }

  type UpdateVariables = { id: Id; body: TUpdate; options?: UpdateOptions };

  function useUpdate(overrides?: MutationOverrides<T, UpdateVariables>) {
    const invalidate = useInvalidate();
    return useMutation<T, ApiError, UpdateVariables>({
      mutationFn: ({ id, body, options }) => api.update(id, body, options),
      ...overrides,
      onSuccess: async (data, variables, context, mutation) => {
        await invalidate(variables.id);
        await overrides?.onSuccess?.(data, variables, context, mutation);
      },
    });
  }

  type DeleteVariables = { id: Id; options?: UpdateOptions };

  function useDelete(overrides?: MutationOverrides<void, DeleteVariables>) {
    const invalidate = useInvalidate();
    return useMutation<void, ApiError, DeleteVariables>({
      mutationFn: ({ id, options }) => api.remove(id, options),
      ...overrides,
      onSuccess: async (data, variables, context, mutation) => {
        await invalidate(variables.id);
        await overrides?.onSuccess?.(data, variables, context, mutation);
      },
    });
  }

  type ActionVariables = { id: Id; action: string; body?: unknown; options?: UpdateOptions };

  function useAction(overrides?: MutationOverrides<T, ActionVariables>) {
    const invalidate = useInvalidate();
    return useMutation<T, ApiError, ActionVariables>({
      mutationFn: ({ id, action, body, options }) => api.action<T>(id, action, body, options),
      ...overrides,
      onSuccess: async (data, variables, context, mutation) => {
        await invalidate(variables.id);
        await overrides?.onSuccess?.(data, variables, context, mutation);
      },
    });
  }

  return { useKeys, useList, useDetail, useCreate, useUpdate, useDelete, useAction, useInvalidate };
}

export type ResourceHooks<
  T extends { id: Id },
  TCreate = Partial<T>,
  TUpdate = TCreate,
> = ReturnType<typeof createResourceHooks<T, TCreate, TUpdate>>;
