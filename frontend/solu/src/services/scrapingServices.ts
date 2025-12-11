
import axios from 'axios';
import type { ScrapingFilters, EntrepriseScraped } from '../types/scraping.type';
import { mockRegions, mockVilles, mockActivites } from '../data/scrapingData';

 //const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
 const API_BASE_URL = 'https://solutravo-scraping.elyfthosting.tech/api';
 //const API_BASE_URL = 'http://46.202.130.175:3002/api';


// INTERFACE DE RÉPONSE API

interface ScrapingApiResponse {
  success: boolean;
  message: string;
  stats: {
    total_vise: number;
    total_trouve: number;
    avec_telephone: number;
    avec_email: number;
    avec_siret: number;
    avec_gerant: number;
    duree_secondes: number;
    villes_scrappees?: string[];
  };
  data: Array<{
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
    scraped_at: string;
    adresse_etablissement?: string;
  code_postal_etablissement?: string;
  ville_etablissement?: string;
  }>;
}


// TRANSFORMER LES DONNÉES API → FRONTEND

const transformApiDataToFrontend = (
  apiData: ScrapingApiResponse['data']
): EntrepriseScraped[] => {
  return apiData.map(entreprise => ({
    id: entreprise.id,
    nom_societe: entreprise.nom_societe,
    nom: entreprise.nom_gerant?.split(' ').pop() || '',
    prenom: entreprise.nom_gerant?.split(' ')[0] || '',
    telephone: entreprise.telephone || 'Non disponible',
    email: entreprise.email || 'Non disponible',
    adresse: entreprise.adresse,
    code_postal: entreprise.code_postal,
    ville: entreprise.ville,
    departement: entreprise.departement,
    activite: entreprise.activite,
    siret: entreprise.siret || 'Non disponible',
    site_web: entreprise.site_web,
    note: entreprise.note ?? undefined,
    nombre_avis: entreprise.nombre_avis ?? undefined,
    adresse_etablissement: entreprise.adresse_etablissement,
    code_postal_etablissement: entreprise.code_postal_etablissement,
    ville_etablissement: entreprise.ville_etablissement
    
  }));
};


// SCRAPER GOOGLE MAPS

export const scrapeGoogleMaps = async (
  filters: ScrapingFilters
): Promise<{
  entreprises: EntrepriseScraped[];
  stats: ScrapingApiResponse['stats'];
}> => {
  try {
    // console.log(' Envoi requête scraping:', filters);

    //CONVERTIR LES CODES EN NOMS POUR L'API
    const regionNom = mockRegions.find(r => r.code === filters.region)?.nom || filters.region;
    const activiteNom = mockActivites.find(a => a.id === filters.activite)?.nom || filters.activite;

    //CONVERTIR LES CODES VILLES EN NOMS
    const villesNoms = filters.ville.length > 0
      ? filters.ville.map(code => mockVilles.find(v => v.code === code)?.nom || code)
      : undefined;

    const payload = {
      region: regionNom,
      departement: filters.departement.length > 0 ? filters.departement : undefined,
      ville: villesNoms,
      activite: activiteNom || undefined,
      nombre_resultats: filters.nombre_resultats
    };

    // console.log('📡 Payload envoyé:', payload);

    //CORRECTION : Route correcte
    const response = await axios.post<ScrapingApiResponse>(
      `${API_BASE_URL}/google-maps`,  ///scraper/google-maps
      payload,
      {
        timeout: 300000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // console.log('Réponse API:', response.data);

    const entreprises = transformApiDataToFrontend(response.data.data);

    return {
      entreprises,
      stats: response.data.stats
    };

  } catch (error: any) {
    console.error('❌ Erreur API:', error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Erreur serveur');
      } else if (error.request) {
        throw new Error('Le serveur ne répond pas');
      }
    }

    throw new Error('Erreur inconnue');
  }
};


