// export type GroupType = 'artisan' | 'annonceur' | 'fournisseur';

// export type FilterType = 'presocietes' | 'societes' | 'activites' | 'departements';

// export type NotificationType = 'push' | 'internal';

// export interface PreSociete {
//   id: string;
//   name: string;
//   email: string;
//   createdDate: string;
//   isNotified: boolean;
//   group: GroupType;
// }

// export interface Societe {
//   id: string;
//   name: string;
//   email: string;
//   createdDate: string;
//   isNotified: boolean;
//   group: GroupType;
//   activite?: string;
//   departement?: string;
// }

// export interface Activite {
//   id: string;
//   name: string;
// }

// export interface Departement {
//   id: string;
//   name: string;
//   code: string;
// }

// export interface NotificationData {
//   emoji: string;
//   message: string;
//   notificationType: NotificationType[];
//   recipients: string[];
// }


// Types pour les notifications push - Frontend

export type GroupType = 'artisan' | 'annonceur' | 'fournisseur';

export type FilterType = 'presocietes' | 'societes' | 'activites' | 'departements';

export type NotificationType = 'push' | 'internal';

export interface PreSociete {
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

export interface Societe {
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

export interface Activite {
  id: string;
  name: string;
}

export interface Departement {
  id: string;
  name: string;
  code: string;
}

export interface NotificationData {
  emoji: string;
  message: string;
  notificationType: NotificationType[];
  recipients: string[];
}