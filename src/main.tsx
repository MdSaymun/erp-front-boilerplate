import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/global.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found in index.html');
}

const root = createRoot(container);

/**
 * The app module validates environment configuration on import (src/config/env.ts).
 * Loading it dynamically lets a misconfigured deployment show a readable message
 * instead of a blank page. No configuration details are rendered; see the console.
 */
async function bootstrap() {
  const { env } = await import('./config/env');
  document.title = env.appName;
  if (env.mockApi) {
    // Development/test only: serve the API contract from Mock Service Worker.
    const { startMockApi } = await import('./mocks/browser');
    await startMockApi();
  }
  return import('./app/App');
}

bootstrap()
  .then(({ App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    console.error('Application failed to start', error);
    root.render(
      <main role="alert" style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 20 }}>The application could not start</h1>
        <p>
          It is not configured correctly for this environment. Please contact your administrator.
        </p>
      </main>,
    );
  });
