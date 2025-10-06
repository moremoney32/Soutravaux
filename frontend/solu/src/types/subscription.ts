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
  stripe_link: string;
}


export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due';
  startDate: Date;
  nextBilling: Date;
  name?: string;
}

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
}