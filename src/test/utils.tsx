import { QueryClient } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { QueryProvider } from '@/app/providers/QueryProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { routes } from '@/app/router/routes';

/** Fresh client per test: no retries, no cache bleed between tests. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function Providers({ children, client }: { children: ReactNode; client: QueryClient }) {
  return (
    <ThemeProvider>
      <QueryProvider client={client}>{children}</QueryProvider>
    </ThemeProvider>
  );
}

/** Renders a component inside the global providers (theme + query). */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const client = createTestQueryClient();
  return {
    client,
    ...render(ui, {
      wrapper: ({ children }) => <Providers client={client}>{children}</Providers>,
      ...options,
    }),
  };
}

/** Renders the real application routes at a given URL using a memory router. */
export function renderApp(initialPath = '/dashboard') {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  const client = createTestQueryClient();
  const result = render(
    <Providers client={client}>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { router, client, ...result };
}
