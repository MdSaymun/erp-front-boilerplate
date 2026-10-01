import { env } from '@/config/env';

/** Absolute URL for a backend path, matching what the Axios client requests. */
export function api(path: string): string {
  return `${env.apiBaseUrl}${path}`;
}
