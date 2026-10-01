import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/** Browser worker for development and Playwright; started from main.tsx when env.mockApi is true. */
export const worker = setupWorker(...handlers);

declare global {
  interface Window {
    __mswReady?: boolean;
  }
}

export async function startMockApi(): Promise<void> {
  await worker.start({
    onUnhandledFrame: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
  window.__mswReady = true;
}
