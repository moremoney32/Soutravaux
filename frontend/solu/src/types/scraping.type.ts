// src/types/scraping.types.ts

export interface ScrapingFilters {
  region: string;        
departement: string[];  
  ville: string[];
  activite: string;
  nombre_resultats: number;
}

export interface EntrepriseScraped {
  id: string;
  nom: string;
  prenom?: string;
  nom_societe: string;
  activite: string;
  telephone: string;
  email: string;
  siret: string;
  adresse: string;
  code_postal: string;
  ville: string;
  departement: string;
  note?: number;
  site_web?:string;
  description?:string;
  website?:string;
  // response?:string[];
  // site_web?:string;
  nombre_avis?: number;
  adresse_etablissement?: string;
  code_postal_etablissement?: string;
  ville_etablissement?: string;
}

export interface ScrapingResponse {
  success: boolean;
  count: number;
  data: EntrepriseScraped[];
}

export interface DepartementOption {
  code: string;
  nom: string;
  region: string;
}

export interface VilleOption {
  code: string;
  nom: string;
  departement: string;
  region: string;
}

export interface ActiviteOption {
  id: string;
  nom: string;
  categorie: string;
}
export interface RegionOption {
  code: string;
  nom: string;
}

