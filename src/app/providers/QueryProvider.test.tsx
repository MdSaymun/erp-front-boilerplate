import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { shouldRetryQuery } from '@/app/providers/queryClient';
import { createApiError } from '@/services/api/errors';
import { renderWithProviders } from '@/test/utils';

function Probe() {
  const query = useQuery({
    queryKey: ['probe'],
    queryFn: async () => ({ message: 'server state resolved' }),
  });

  if (query.isPending) return <span>loading</span>;
  if (query.isError) return <span>error</span>;
  return <span>{query.data.message}</span>;
}

describe('QueryProvider', () => {
  it('provides a QueryClient so useQuery resolves data', async () => {
    renderWithProviders(<Probe />);

    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(await screen.findByText('server state resolved')).toBeInTheDocument();
  });
});

describe('shouldRetryQuery', () => {
  it('does not retry authentication, authorization or validation failures', () => {
    expect(shouldRetryQuery(0, createApiError({ code: 'unauthorized', message: '' }))).toBe(false);
    expect(shouldRetryQuery(0, createApiError({ code: 'forbidden', message: '' }))).toBe(false);
    expect(shouldRetryQuery(0, createApiError({ code: 'validation', message: '' }))).toBe(false);
    expect(shouldRetryQuery(0, createApiError({ code: 'not_found', message: '' }))).toBe(false);
  });

  it('retries transient failures a limited number of times', () => {
    const network = createApiError({ code: 'network', message: '' });
    expect(shouldRetryQuery(0, network)).toBe(true);
    expect(shouldRetryQuery(1, network)).toBe(true);
    expect(shouldRetryQuery(2, network)).toBe(false);
    expect(shouldRetryQuery(0, createApiError({ code: 'server', message: '' }))).toBe(true);
  });
});
