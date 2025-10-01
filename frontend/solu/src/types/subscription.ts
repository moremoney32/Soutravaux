export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
//   unlockedFeatures: number;
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
  planName?: string;
}

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
}