/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENVIRONMENT?: string;
  readonly VITE_MOCK_API?: string;
  readonly VITE_REALTIME_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Injected by vite.config.ts from package.json. Read only through src/config/env.ts. */
declare const __APP_VERSION__: string;
