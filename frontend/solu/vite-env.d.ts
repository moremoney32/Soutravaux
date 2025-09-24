/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLUTRAVO_API_URL: string;
  // ajoute ici d'autres variables si besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
