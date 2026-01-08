/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_USUARIOS_URL: string;
  readonly VITE_API_CITAS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
