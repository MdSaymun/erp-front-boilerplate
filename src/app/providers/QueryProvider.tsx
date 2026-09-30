import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { queryClient as defaultClient } from './queryClient';

interface QueryProviderProps extends PropsWithChildren {
  /** Override for tests; defaults to the shared application client. */
  client?: QueryClient;
}

export function QueryProvider({ children, client = defaultClient }: QueryProviderProps) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
