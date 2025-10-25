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

   // 🎯 NOUVELLES PROPRIÉTÉS POUR LE FOOTER
    subtitle?: string;
    target_audience?: string;
    key_benefits?: string[];
    detailed_features?: {
        category: string;
        features: string[];
    }[];
    why_choose?: string;
    icon_name?: string;
    gradient?: string;
}


export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due';
  startDate: Date;
  nextBilling: Date;
  name?: string;
   price?: string | number;
}

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
}