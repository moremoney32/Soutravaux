

export interface CampagneData {
  nom: string;
  marketingPurpose: boolean;
  contacts: string[]; 
  contactsValides: number;
  contactType?: 'manuelle' | 'enregistres';
  list_contact_id?: string[] | null; 
  expediteur: string;
  message: string;
  messageLength: number;
  smsCount: number;
  liens?: string[];
  fichiers?: string[];
  planification: {
    type: 'differe' | 'instantane';
    date?: string;
    heure?: string;
  };
}

export interface StepperStep {
  numero: number;
  titre: string;
  soustitre: string;
  isActive: boolean;
  isCompleted: boolean;
}

export interface Contact {
  id: string;
  name: string | null;
  email: string | null;
  phone_number: string;
}

export interface ContactList {
  id: string;
  name: string;
  membre_id: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  contacts_count: number;
  contacts: Contact[];
}



export interface CampagneStatistiques {
  id: string;
  nom: string;
  date_envoi: string;
  expediteur: string;
  message: string;
  nb_sms_total: number;
  nb_sms_recu: number;
  nb_sms_non_recu: number;
  nb_clics: number;
  nb_desabonnements: number;
  taux_reussite: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface ClickStatistique {
  numero: string;
  nom: string | null;
  email: string | null;
  date_clic: string;
}

export interface CampagneFilters {
  telephone: string;
  smsMin: string;
  smsMax: string;
  message: string;
  dateDebut: string;
  dateFin: string;
  supprimees: boolean;
}


// src/types/campagne.types.ts (ajouter à la fin)

// STATISTIQUES DÉTAILLÉES D'UNE CAMPAGNE
export interface CampagneDetailsStatistiques {
  id: string;
  nom: string;
  date_envoi: string;
  expediteur: string;
  message: string;
  
  // Destinataires
  destinataire_type: string; // "Liste manuelle" ou nom de la liste
  nb_contacts_initiaux: number;
  nb_contacts_finaux: number;
  
  // SMS
  nb_sms_total: number;
  nb_sms_envoyes: number;
  nb_sms_recus: number;
  nb_sms_non_recus: number;
  taux_reception: number;
  
  // Engagement
  nb_clics: number;
  taux_clics: number;
  nb_desabonnements: number;
  taux_desabonnements: number;
  nb_reponses: number;
  
  // AR non disponibles
  nb_ar_non_disponibles: number;
  
  // Détails des non-reçus
  non_recus_details: Array<{
    numero: string;
    nom: string | null;
    email: string | null;
    raison: string;
  }>;
}

export interface CliqueurStatistique {
  id: string;
  numero: string;
  nom: string | null;
  email: string | null;
  date_clic: string;
  heure_clic: string;
  nb_clics: number;
}

export interface ReponseStatistique {
  id: string;
  numero: string;
  nom: string | null;
  email: string | null;
  date_reponse: string;
  contenu_reponse: string;
}

export interface CampagneRecipient {
  id: string;
  campaign_id: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  delivered_at: string | null;
  clicked: string | null;
  sent_at: string;
  stop: string | null;
}

export interface CampagneAPI {
  id: string;
  name: string;
  status: string; // Ne pas utiliser (c'est pour SMS Factor)
  sender: string;
  message: string;
  total_recipients: number;
  scheduled_at: string;
  sent_count: number;
  created_at: string;
  created_by: number;
  recipients: CampagneRecipient[];
}

export interface CampagnesResponse {
  success: boolean;
  data: {
    current_page: number;
    data: CampagneAPI[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface CampagneFiltersAPI {
  telephone?: string;
  smsMin?: string;
  smsMax?: string;
  message?: string;
  dateDebut?: string;
  dateFin?: string;
  supprimees?: boolean;
}
// src/types/achat-sms.types.ts

export interface SMSPack {
  id: string;
  name: string;
  price_id: string;
  sms_quantity: number;
  unit_price: string;
  total_price_ht: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface SMSPacksResponse {
  success: boolean;
  data: SMSPack[];
}

export interface CreateCheckoutSessionPayload {
  pack_id: string;
  membre_id: number;
}

export interface CreateCheckoutSessionResponse {
  success: boolean;
  url: string; // URL de redirection vers Stripe
}

export interface BillingData {
  email: string;
  entreprise: string;
  prenom: string;
  nom: string;
  telephone: string;
  adresse: string;
  complement?: string;
  ville: string;
  codePostal: string;
  pays: string;
  numeroTVA?: string;
}

export interface AchatSMSData {
  selectedPack: SMSPack | null;
  billingData: BillingData;
}


export interface CampagneDetailResponse {
  campaign: {
    id: string;
    name: string;
    sender: string;
    message: string;
    scheduled_at: string;
    status: string;
  };
  stats: {
    total_recipients: number;
    total_sent: number;
    total_delivered: number;
    total_failed: number;
    total_clicked: number;
    total_stop: number;
  };
  detail_stat: {
    failed: Array<{
      id: string;
      phone: string;
      name?: string | null;
      email?: string | null;
      failed_at: string;
      reason: string;
    }>;
    clicked: Array<{
      id: string;
      phone_number: string;
      nom?: string | null;
      email?: string | null;
      clicked_at: string;
      click_count?: number;
      total_clicked?:number;
      sent_at: string;
    }>;
  };
}

export interface UserCreditsResponse {
  status: number;
  credits: number;
  membre_nom: string;
  membre_prenom: string;
  membre_phone: string | null;
  societe: {
    id: number;
    nom: string;
    email: string;
    code_postal: string;
    ville: string;
    pays: string;
    siret: string;
    tva: string;
  };
}


