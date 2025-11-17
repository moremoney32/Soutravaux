// src/types/create-liste.types.ts

export interface CreateListeData {
  nom: string;
  pays: string;
  numeros: string[];
  numerosValides: number;
  numerosInvalides: ContactInvalide[];
  contactsParPays: ContactParPays[];
}

export interface ContactInvalide {
  numero: string;
  motif: string;
}

export interface ContactParPays {
  pays: string;
  flagCode: string;
  count: number;
}