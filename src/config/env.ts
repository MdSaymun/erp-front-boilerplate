import { z } from 'zod';

/**
 * Single access point for client configuration.
 *
 * Every VITE_* value is embedded in the shipped bundle and is visible to anyone
 * who opens the browser devtools. Never put secrets here. Do not read
 * `import.meta.env` anywhere else in the codebase; import `env` instead.
 */

const environmentSchema = z.enum(['development', 'test', 'staging', 'production']);

const booleanString = z
  .union([z.literal('true'), z.literal('false'), z.literal('1'), z.literal('0'), z.literal('')])
  .optional()
  .transform((value) => value === 'true' || value === '1');

const envSchema = z.object({
  VITE_APP_NAME: z.string().trim().min(1).default('ERP'),
  VITE_API_BASE_URL: z.url({ error: 'VITE_API_BASE_URL must be an absolute URL' }),
  VITE_ENVIRONMENT: environmentSchema.default('development'),
  /** Serve API responses from Mock Service Worker instead of a backend. Never true in production. */
  VITE_MOCK_API: booleanString,
  /** SignalR hub base URL. Empty disables real-time features. */
  VITE_REALTIME_URL: z.union([z.url(), z.literal('')]).optional(),
});

export type AppEnvironment = z.infer<typeof environmentSchema>;

export interface AppEnv {
  readonly appName: string;
  readonly appVersion: string;
  readonly apiBaseUrl: string;
  readonly environment: AppEnvironment;
  readonly mockApi: boolean;
  readonly realtimeUrl: string | null;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;
  /** Developer-only routes and tools (pattern showcase) are mounted when true. */
  readonly devToolsEnabled: boolean;
}

function readEnv(): AppEnv {
  const result = envSchema.safeParse({
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
    VITE_MOCK_API: import.meta.env.VITE_MOCK_API,
    VITE_REALTIME_URL: import.meta.env.VITE_REALTIME_URL,
  });

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid frontend environment configuration. ${details}`);
  }

  const parsed = result.data;
  const isProduction = parsed.VITE_ENVIRONMENT === 'production';

  if (isProduction && parsed.VITE_MOCK_API) {
    throw new Error('VITE_MOCK_API must not be enabled in production.');
  }

  return Object.freeze({
    appName: parsed.VITE_APP_NAME,
    appVersion: __APP_VERSION__,
    apiBaseUrl: parsed.VITE_API_BASE_URL.replace(/\/+$/, ''),
    environment: parsed.VITE_ENVIRONMENT,
    mockApi: parsed.VITE_MOCK_API,
    realtimeUrl: parsed.VITE_REALTIME_URL ? parsed.VITE_REALTIME_URL : null,
    isDevelopment: parsed.VITE_ENVIRONMENT === 'development',
    isProduction,
    isTest: parsed.VITE_ENVIRONMENT === 'test',
    devToolsEnabled: !isProduction && parsed.VITE_ENVIRONMENT !== 'staging',
  });
}

export const env: AppEnv = readEnv();
