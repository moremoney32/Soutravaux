// Types pour les notifications push

export type GroupType = 'artisan' | 'annonceur' | 'fournisseur';

export type NotificationType = 'push' | 'internal' | 'sse';

export interface PreSocieteDB {
  id: number;
  name: string | null;
  size: string | null;
  legal_form: string | null;
  siret: string | null;
  role: GroupType;
  address: string | null;
  rue: string | null;
  ville: string | null;
  cp: string | null;
  capital: number | null;
  phonenumber: string | null;
  createdAt: Date;
  membre_id: number;
  activity: string | null;
  how_did_you_know: string | null;
  sector: string | null;
  message: string | null;
  position: string | null;
}

export interface SocieteDB {
  id: number;
  nomsociete: string;
  taille: string | null;
  role: GroupType;
  adresse: string | null;
  cp: string | null;
  ville: string | null;
  pays: string | null;
  telephone: string | null;
  email: string;
  nom_responsable: string | null;
  prenom_responsable: string | null;
  siret: string | null;
  tva_intracomm: string | null;
  logo: string | null;
  date_creation: Date;
  date_modification: Date;
  refmembre: string;
}

export interface ActiviteDB {
  id: number;
  nom: string;
  cpl_achat: number;
  cpl_vente: number;
  nb_max_acheteur: number;
  date_creation: Date;
  date_modification: Date;
}

export interface DepartementDB {
  id: number;
  numero: string;
  nom: string;
  date_creation: Date;
  date_modification: Date;
}

export interface ActiviteDepartementSociete {
  activite_id: number;
  departement_id: number;
  societe_id: number;
  credit: number;
}

// DTOs pour l'API
export interface PreSocieteDTO {
  id: string;
  name: string;
  siret: string | null;
  createdDate: string;
  isNotified: boolean;
  group: GroupType;
  ville: string | null;
  cp: string | null;
  activity: string | null;
}

export interface SocieteDTO {
  id: string;
  name: string;
  email: string;
  createdDate: string;
  isNotified: boolean;
  group: GroupType;
  activites: number[];
  departements: number[];
  siret: string | null;
}

export interface ActiviteDTO {
  id: string;
  name: string;
}

export interface DepartementDTO {
  id: string;
  name: string;
  code: string;
}

// Payload pour envoyer une notification


export interface SendNotificationPayload {
  message: string;
  emoji?: string;
  notificationTypes: ('push' | 'internal' | 'sse')[];
  recipients: {
    preSocieteIds?: string[];
    societeIds?: string[];
  };
  filters?: {
    group?: GroupType;
    activiteIds?: string[];
    departementIds?: string[];
  };
}

export interface SendNotificationResponse {
  success: boolean;
  message: string;
  sentCount: number;
  failedCount: number;
  details?: {
    pushSent?: number;
     sseSent?: number;
    internalSent?: number;
  };
}

