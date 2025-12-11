

export interface ScraperQuery {
  region: string;  // Obligatoire
  departement?: string[];  
  ville?: string | string[];       
  activite?: string;
  nombre_resultats?: number;
}

export interface EntrepriseScraped {
  id: string;
  nom_societe: string;
  nom_gerant?: string;
  telephone?: string;
  email?: string;
  adresse: string;
  code_postal: string;
  ville: string;
  departement: string;
  activite: string;
  siret?: string;
  siren?: string;
  site_web?: string;
  note?: number;
  nombre_avis?: number;
  etat_administratif?: string;
  adresse_etablissement?: string;
  code_postal_etablissement?: string;
  ville_etablissement?: string;
  scraped_at: Date;
}

export interface ScraperStats {
  total_vise: number;
  total_trouve: number;
  avec_telephone: number;
  avec_email: number;
  avec_siret: number;
  avec_gerant: number;
  duree_secondes: number;
  message?: string;
  villes_scrappees?: string[];  // ⭐ Liste des villes scrappées
}

export interface ScraperResponse {
  success: boolean;
  message: string;
  stats: ScraperStats;
  data: EntrepriseScraped[];
}

export interface GoogleMapsResult {
  nom_societe: string;
  telephone?: string;
  adresse: string;
  site_web?: string;
  activite: string;
  note?: number;
  nombre_avis?: number;
}

export interface InseeResult {
  siret?: string;
  siren?: string;
  nom_gerant?: string;
  etat_administratif?: string;
  adresse_etablissement?: string;
  code_postal_etablissement?: string;
  ville_etablissement?: string;
}