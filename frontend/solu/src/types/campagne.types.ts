
// export interface CampagneData {
//   nom: string;
//   marketingPurpose: boolean;
//   contacts: string[];
//   contactsValides: number;
//   expediteur: string;
//   message: string;
//   messageLength: number;
//   smsCount: number;
//   planification: {
//     type: 'differe' | 'instantane';
//     date: string;
//     heure: string;
//   };
// }

// src/types/campagne.types.ts

export interface CampagneData {
  nom: string;
  marketingPurpose: boolean;
  contacts: string[];
  contactsValides: number;
  contactType?: 'manuelle' | 'enregistres'; 
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