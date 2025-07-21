/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_OUTLOOK_USER: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_CLIENT_SECRET: string;
  readonly VITE_TENANT_ID: string;
  readonly VITE_REDIRECT_URI: string;
  // add more here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
