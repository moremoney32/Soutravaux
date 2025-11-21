// src/types/create-liste.types.ts

// export interface CreateListeData {
//   nom: string;
//   pays: string;
//   numeros: string[];
//   numerosValides: number;
//   numerosInvalides: ContactInvalide[];
//   contactsParPays: ContactParPays[];
// }

// export interface ContactInvalide {
//   numero: string;
//   motif: string;
// }

export interface ContactParPays {
  pays: string;
  flagCode: string;
  count: number;
}

export interface Contact {
  name: string;
  phone_number: string;
  email: string;
}

export interface CreateListeData {
  nom: string;
  pays: string;
  contacts: Contact[]; // ← Changer de 'numeros' à 'contacts'
  contactsValides: number; // ← Changer de 'numerosValides'
  contactsInvalides: ContactInvalide[];
  contactsParPays: ContactParPays[];
}

export interface ContactInvalide {
  numero: string;
  motif: string;
  name?: string;
  email?: string;
}