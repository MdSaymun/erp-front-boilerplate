import { defineConfig, mergeConfig, type ViteUserConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig as ViteUserConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // Same origin as the mock API base URL so jsdom sends no CORS preflights.
      environmentOptions: { jsdom: { url: 'http://localhost:5000/' } },
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'e2e'],
      css: false,
      // Environment values used by src/config/env.ts during unit tests.
      env: {
        VITE_APP_NAME: 'ERP (test)',
        VITE_API_BASE_URL: 'http://localhost:5000/api',
        VITE_ENVIRONMENT: 'test',
        VITE_MOCK_API: 'false',
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/test/**', 'src/**/*.d.ts', 'src/main.tsx', 'src/**/index.ts'],
      },
    },
  }),
);
