import type { PropsWithChildren } from 'react';

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

/** Composition root for global providers. Order: error boundary > theme > server state. */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>{children}</QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
