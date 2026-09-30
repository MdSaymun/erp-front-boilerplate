import { z } from 'zod';

/**
 * Single access point for client configuration.
 *
 * Every VITE_* value is embedded in the shipped bundle and is visible to anyone
 * who opens the browser devtools. Never put secrets here. Do not read
 * `import.meta.env` anywhere else in the codebase; import `env` instead.
 */

const environmentSchema = z.enum(['development', 'test', 'staging', 'production']);

const envSchema = z.object({
  VITE_APP_NAME: z.string().trim().min(1).default('Inventory SaaS'),
  VITE_API_BASE_URL: z.url({ error: 'VITE_API_BASE_URL must be an absolute URL' }),
  VITE_ENVIRONMENT: environmentSchema.default('development'),
});

export type AppEnvironment = z.infer<typeof environmentSchema>;

export interface AppEnv {
  readonly appName: string;
  readonly apiBaseUrl: string;
  readonly environment: AppEnvironment;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;
}

function readEnv(): AppEnv {
  const result = envSchema.safeParse({
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
  });

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid frontend environment configuration. ${details}`);
  }

  const parsed = result.data;

  return Object.freeze({
    appName: parsed.VITE_APP_NAME,
    apiBaseUrl: parsed.VITE_API_BASE_URL.replace(/\/+$/, ''),
    environment: parsed.VITE_ENVIRONMENT,
    isDevelopment: parsed.VITE_ENVIRONMENT === 'development',
    isProduction: parsed.VITE_ENVIRONMENT === 'production',
    isTest: parsed.VITE_ENVIRONMENT === 'test',
  });
}

export const env: AppEnv = readEnv();
