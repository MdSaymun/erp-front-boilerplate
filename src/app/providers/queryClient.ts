import { QueryClient } from '@tanstack/react-query';

import { isApiError, NON_RETRYABLE_CODES } from '@/services/api/errors';

const MAX_QUERY_RETRIES = 2;

/**
 * Retry only transient failures. Validation, authentication and authorization
 * failures are deterministic and must not be retried.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) return false;
  if (isApiError(error)) {
    return !NON_RETRYABLE_CODES.has(error.code);
  }
  return true;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetryQuery,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
        // ERP users keep many tabs open; refetching on every focus is noisy.
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/** Application-wide client, created once outside React. */
export const queryClient = createQueryClient();
