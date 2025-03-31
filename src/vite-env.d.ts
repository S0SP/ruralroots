/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_API_URL: string; // Add the API URL variable definition
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
