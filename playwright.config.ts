import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Smoke suite for the frontend shell. It runs against a production build served
 * by `vite preview`, so no backend is required.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']],
  outputDir: 'test-results',
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // A production build reads .env.production (git-ignored) or CI variables; supply
    // explicit public values here so the smoke suite never depends on local files.
    env: {
      VITE_APP_NAME: 'ERP Boilerplate',
      VITE_API_BASE_URL: 'http://localhost:5000/api',
      VITE_ENVIRONMENT: 'test',
      VITE_MOCK_API: 'true',
    },
  },
});
