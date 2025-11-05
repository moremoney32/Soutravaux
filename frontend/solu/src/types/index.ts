export interface Plan {
  id: number;
  name: string;
  role: 'artisan' | 'annonceur';
  price: number;
  period: string;
  color: string;
  is_enterprise?: boolean;
}

export interface Feature {
  id: number;
  name: string;
  page: string;
  parent_feature_id: number | null;
  role: 'artisan' | 'annonceur';
   description?: string; 
  image_url?: string;
}

export interface FeaturePlan {
  feature_id: number;
  plan_id: number;
}

export interface FeatureWithStatus extends Feature {
  enabled: boolean;
  inherited?: boolean;
}



export interface PreSociete {
  id: string;
  nom: string;
  email: string;
  dateCreation: Date;
  notificationEnvoyee: boolean;
}

export interface Societe {
  id: string;
  nom: string;
  email: string;
  artisans: number;
}

export interface Departement {
  id: string;
  numero: string;
  nom: string;
  nombreSocietes: number;
}

export interface NotificationForm {
  titre: string;
  emoji: string;
  description: string;
}


