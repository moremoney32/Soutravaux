/// <reference types="vite/client" />

// === Images ===
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}



// === Variables d'environnement Vite ===
interface ImportMetaEnv {
  readonly VITE_SOLUTRAVO_API_URL: string;
  // ajoute ici toutes tes autres variables VITE_...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  unlockedFeatures: number;
  popular: boolean;
  color: string;
  stripeLink: string;
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due';
  startDate: Date;
  nextBilling: Date;
}

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
}
