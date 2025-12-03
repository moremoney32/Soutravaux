// // // src/services/scrapingApi.ts

// import axios from 'axios';
// import type { ScrapingFilters, EntrepriseScraped } from '../types/scraping.type';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// // ============================================
// // INTERFACE DE RÉPONSE API
// // ============================================
// interface ScrapingApiResponse {
//   success: boolean;
//   message: string;
//   stats: {
//     total_vise: number;
//     total_trouve: number;
//     avec_telephone: number;
//     avec_email: number;
//     avec_siret: number;
//     avec_gerant: number;
//     duree_secondes: number;
//   };
//   data: Array<{
//     id: string;
//     nom_societe: string;
//     nom_gerant?: string;
//     telephone?: string;
//     email?: string;
//     adresse: string;
//     code_postal: string;
//     ville: string;
//     departement: string;
//     activite: string;
//     siret?: string;
//     siren?: string;
//     site_web?: string;
//     note?: number;
//     nombre_avis?: number;
//     etat_administratif?: string;
//     scraped_at: string;
//   }>;
// }

// // ============================================
// // TRANSFORMER LES DONNÉES API → FRONTEND
// // ============================================
// const transformApiDataToFrontend = (apiData: ScrapingApiResponse['data']): EntrepriseScraped[] => {
//   return apiData.map(entreprise => ({
//     id: entreprise.id,
//     nom_societe: entreprise.nom_societe,
//     nom: entreprise.nom_gerant?.split(' ').pop() || '',  // Nom de famille
//     prenom: entreprise.nom_gerant?.split(' ')[0] || '',  // Prénom
//     telephone: entreprise.telephone || 'Non disponible',
//     email: entreprise.email || 'Non disponible',
//     adresse: entreprise.adresse,
//     code_postal: entreprise.code_postal,
//     ville: entreprise.ville,
//     departement: entreprise.departement,
//     activite: entreprise.activite,
//     siret: entreprise.siret || 'Non disponible',
//     site_web: entreprise.site_web,
//     note: entreprise.note ?? null,
//     nombre_avis: entreprise.nombre_avis ?? null
//   }));
// };

// // ============================================
// // FONCTION PRINCIPALE : SCRAPER GOOGLE MAPS
// // ============================================
// export const scrapeGoogleMaps = async (filters: ScrapingFilters): Promise<{
//   entreprises: EntrepriseScraped[];
//   stats: ScrapingApiResponse['stats'];
// }> => {
//   try {
//     console.log('🚀 Envoi requête scraping:', filters);

//     const response = await axios.post<ScrapingApiResponse>(
//       `${API_BASE_URL}/google-maps`,
//       {
//         region: filters.region || undefined,
//         departement: filters.departement || undefined,
//         ville: filters.ville,
//         activite: filters.activite || undefined,
//         nombre_resultats: filters.nombre_resultats
//       },
//       {
//         timeout: 300000, // 5 minutes (scraping peut être long)
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     console.log('Réponse API:', response.data);

//     // Transformer les données
//     const entreprises = transformApiDataToFrontend(response.data.data);

//     return {
//       entreprises,
//       stats: response.data.stats
//     };

//   } catch (error: any) {
//     console.error('❌ Erreur API scraping:', error);

//     if (axios.isAxiosError(error)) {
//       if (error.response) {
//         // Erreur du serveur (4xx, 5xx)
//         throw new Error(error.response.data?.message || 'Erreur serveur lors du scraping');
//       } else if (error.request) {
//         // Pas de réponse du serveur
//         throw new Error('Le serveur ne répond pas. Vérifiez votre connexion.');
//       }
//     }

//     throw new Error('Erreur inconnue lors du scraping');
//   }
// };



// src/services/scrapingServices.ts

import axios from 'axios';
import type { ScrapingFilters, EntrepriseScraped } from '../types/scraping.type';
import { mockRegions, mockVilles, mockActivites } from '../data/scrapingData';

 //const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
 const API_BASE_URL = 'http://46.202.130.175:3002/api';

// ============================================
// INTERFACE DE RÉPONSE API
// ============================================
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

// ============================================
// TRANSFORMER LES DONNÉES API → FRONTEND
// ============================================
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

// ============================================
// SCRAPER GOOGLE MAPS
// ============================================
export const scrapeGoogleMaps = async (
  filters: ScrapingFilters
): Promise<{
  entreprises: EntrepriseScraped[];
  stats: ScrapingApiResponse['stats'];
}> => {
  try {
    console.log('🚀 Envoi requête scraping:', filters);

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

    console.log('📡 Payload envoyé:', payload);

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

    console.log('Réponse API:', response.data);

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


// src/services/scrapingApi.ts

// import { mockActivites, mockRegions, mockVilles } from '../data/scrapingData';
// import type { ScrapingFilters, EntrepriseScraped } from '../types/scraping.type';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backendstaging.solutravo-compta.fr/api';

// // ============================================
// // INTERFACE DE RÉPONSE SSE
// // ============================================
// interface SSEEntreprise {
//   id: string;
//   nom_societe: string;
//   nom_gerant?: string;
//   telephone?: string;
//   email?: string;
//   adresse: string;
//   code_postal: string;
//   ville: string;
//   departement: string;
//   activite: string;
//   siret?: string;
//   siren?: string;
//   site_web?: string;
//   note?: number;
//   nombre_avis?: number;
//   etat_administratif?: string;
//   scraped_at: string;
// }

// interface SSEStats {
//   total_vise: number;
//   total_trouve: number;
//   avec_telephone: number;
//   avec_email: number;
//   avec_siret: number;
//   avec_gerant: number;
//   duree_secondes: number;
// }

// // ============================================
// // TRANSFORMER LES DONNÉES API → FRONTEND
// // ============================================
// const transformApiDataToFrontend = (entreprise: SSEEntreprise): EntrepriseScraped => {
//   return {
//     id: entreprise.id,
//     nom_societe: entreprise.nom_societe,
//     nom: entreprise.nom_gerant?.split(' ').pop() || '',
//     prenom: entreprise.nom_gerant?.split(' ')[0] || '',
//     telephone: entreprise.telephone || 'Non disponible',
//     email: entreprise.email || 'Non disponible',
//     adresse: entreprise.adresse,
//     code_postal: entreprise.code_postal,
//     ville: entreprise.ville,
//     departement: entreprise.departement,
//     activite: entreprise.activite,
//     siret: entreprise.siret || 'Non disponible',
//     site_web: entreprise.site_web,
//     note: entreprise.note ?? null,
//     nombre_avis: entreprise.nombre_avis ?? null
//   };
// };



// // ============================================
// // SCRAPER AVEC SSE (TEMPS RÉEL)
// // ============================================
// // src/services/scrapingApi.ts

// export const scrapeGoogleMaps = async (
//   filters: ScrapingFilters,
//   onProgress?: (entreprises: EntrepriseScraped[], stats: SSEStats | null) => void
// ): Promise<{
//   entreprises: EntrepriseScraped[];
//   stats: SSEStats;
// }> => {
//   return new Promise((resolve, reject) => {
//     console.log('🚀 Démarrage scraping SSE:', filters);

//     const regionNom = mockRegions.find(r => r.code === filters.region)?.nom || '';
//     const villeNom = mockVilles.find(v => v.code === filters.ville)?.nom || filters.ville;
//     const activiteNom = mockActivites.find(a => a.id === filters.activite)?.nom || '';

//     const params = new URLSearchParams({
//       recherche: activiteNom,
//       ville: villeNom,
//       region: regionNom,
//       departement: filters.departement || '',
//       provinces: 'France',
//       nombre: String(filters.nombre_resultats || 20)
//     });

//     const url = `${API_BASE_URL}/scraper/store-sse?${params.toString()}`;

//     console.log('📡 URL SSE:', url);

//     const eventSource = new EventSource(url);

//     let allEntreprises: EntrepriseScraped[] = [];
//     let finalStats: SSEStats | null = null;
//     let objectif = filters.nombre_resultats || 20;

//     // ==========================================
//     //EVENT : batch (données reçues par lot de 5)
//     // ==========================================
//     eventSource.addEventListener('batch', (event: MessageEvent) => {
//       try {
//         const data = JSON.parse(event.data);

//         console.log('📥 SSE batch reçu:', data);

//         // Transformer les résultats du backend
//         if (data.results && Array.isArray(data.results)) {
//           const newEntreprises = data.results.map((item: any) => ({
//             id: `${Date.now()}-${Math.random()}`,
//             nom_societe: item.business_name || 'Non disponible',
//             nom: item.business_name?.split(' ').pop() || '',
//             prenom: item.business_name?.split(' ')[0] || '',
//             telephone: item.phone_number || 'Non disponible',
//             email: item.email || 'Non disponible',
//             adresse: item.address || 'Non disponible',
//             code_postal: item.address?.match(/\b\d{5}\b/)?.[0] || '',
//             ville: filters.ville,
//             departement: filters.departement || '',
//             activite: filters.activite || '',
//             siret: item.siret || 'Non disponible',
//             site_web: item.url,
//             note: null,
//             nombre_avis: null
//           }));

//           allEntreprises = [...allEntreprises, ...newEntreprises];

//           console.log(`✅ +${newEntreprises.length} entreprises (Total: ${allEntreprises.length}/${objectif})`);

//           // Callback de progression
//           if (onProgress) {
//             onProgress(allEntreprises, {
//               total_vise: objectif,
//               total_trouve: allEntreprises.length,
//               avec_telephone: allEntreprises.filter(e => e.telephone !== 'Non disponible').length,
//               avec_email: allEntreprises.filter(e => e.email !== 'Non disponible').length,
//               avec_siret: allEntreprises.filter(e => e.siret !== 'Non disponible').length,
//               avec_gerant: 0,
//               duree_secondes: Math.round(data.progress || 0)
//             });
//           }
//         }
//       } catch (error) {
//         console.error('❌ Erreur parsing batch:', error);
//       }
//     });

//     // ==========================================
//     //EVENT : status (progression)
//     // ==========================================
//     eventSource.addEventListener('status', (event: MessageEvent) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log('📊 Status:', data.message, `(${data.progress}%)`);
//       } catch (error) {
//         console.error('❌ Erreur parsing status:', error);
//       }
//     });

//     // ==========================================
//     //EVENT : close (fin du scraping)
//     // ==========================================
//     eventSource.addEventListener('close', (event: MessageEvent) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log('🏁 Scraping terminé:', data.message);

//         eventSource.close();

//         resolve({
//           entreprises: allEntreprises.slice(0, objectif),
//           stats: {
//             total_vise: objectif,
//             total_trouve: allEntreprises.length,
//             avec_telephone: allEntreprises.filter(e => e.telephone !== 'Non disponible').length,
//             avec_email: allEntreprises.filter(e => e.email !== 'Non disponible').length,
//             avec_siret: allEntreprises.filter(e => e.siret !== 'Non disponible').length,
//             avec_gerant: 0,
//             duree_secondes: data.duration || 0
//           }
//         });
//       } catch (error) {
//         console.error('❌ Erreur parsing close:', error);
//       }
//     });

//     // ==========================================
//     //EVENT : error (erreur backend)
//     // ==========================================
//     eventSource.addEventListener('error', (event: MessageEvent) => {
//       console.error('❌ Erreur SSE backend:', event.data);
//       eventSource.close();
//       reject(new Error(event.data || 'Erreur backend'));
//     });

//     // ==========================================
//     // EVENT : open (connexion établie)
//     // ==========================================
//     eventSource.onopen = () => {
//       console.log('✅ Connexion SSE établie');
//     };

//     // ==========================================
//     // EVENT : onerror (erreur de connexion)
//     // ==========================================
//     eventSource.onerror = (error) => {
//       console.error('❌ Erreur SSE:', error);
//       eventSource.close();

//       // Si on a déjà des résultats, les retourner
//       if (allEntreprises.length > 0) {
//         resolve({
//           entreprises: allEntreprises.slice(0, objectif),
//           stats: {
//             total_vise: objectif,
//             total_trouve: allEntreprises.length,
//             avec_telephone: allEntreprises.filter(e => e.telephone !== 'Non disponible').length,
//             avec_email: allEntreprises.filter(e => e.email !== 'Non disponible').length,
//             avec_siret: allEntreprises.filter(e => e.siret !== 'Non disponible').length,
//             avec_gerant: 0,
//             duree_secondes: 0
//           }
//         });
//       } else {
//         reject(new Error('Erreur de connexion SSE. Vérifiez votre réseau.'));
//       }
//     };

//     // ==========================================
//     // TIMEOUT : 5 minutes
//     // ==========================================
//     setTimeout(() => {
//       if (eventSource.readyState !== EventSource.CLOSED) {
//         console.warn('⏱️ Timeout SSE (5 minutes)');
//         eventSource.close();

//         resolve({
//           entreprises: allEntreprises.slice(0, objectif),
//           stats: {
//             total_vise: objectif,
//             total_trouve: allEntreprises.length,
//             avec_telephone: allEntreprises.filter(e => e.telephone !== 'Non disponible').length,
//             avec_email: allEntreprises.filter(e => e.email !== 'Non disponible').length,
//             avec_siret: allEntreprises.filter(e => e.siret !== 'Non disponible').length,
//             avec_gerant: 0,
//             duree_secondes: 300
//           }
//         });
//       }
//     }, 300000);
//   });
// };