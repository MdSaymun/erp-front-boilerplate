import type { PropsWithChildren } from 'react';

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

import { QueryProvider } from './QueryProvider';
import { RealtimeProvider } from './RealtimeProvider';
import { ThemeProvider } from './ThemeProvider';

/** Composition root for global providers. Order: error boundary > theme/locale > server state > realtime. */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <RealtimeProvider>{children}</RealtimeProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
