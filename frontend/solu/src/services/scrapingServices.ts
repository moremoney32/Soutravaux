
// import axios from 'axios';
// import type { ScrapingFilters, EntrepriseScraped } from '../types/scraping.type';
// import { mockRegions, mockVilles, mockActivites } from '../data/scrapingData';

//  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
//  //const API_BASE_URL = 'https://solutravo-scraping.elyfthosting.tech/api';
//  //const API_BASE_URL = 'http://46.202.130.175:3002/api';


// // INTERFACE DE RÉPONSE API

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
//     villes_scrappees?: string[];
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
//     adresse_etablissement?: string;
//   code_postal_etablissement?: string;
//   ville_etablissement?: string;
//   }>;
// }


// // TRANSFORMER LES DONNÉES API → FRONTEND

// const transformApiDataToFrontend = (
//   apiData: ScrapingApiResponse['data']
// ): EntrepriseScraped[] => {
//   return apiData.map(entreprise => ({
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
//     note: entreprise.note ?? undefined,
//     nombre_avis: entreprise.nombre_avis ?? undefined,
//     adresse_etablissement: entreprise.adresse_etablissement,
//     code_postal_etablissement: entreprise.code_postal_etablissement,
//     ville_etablissement: entreprise.ville_etablissement
    
//   }));
// };


// // SCRAPER GOOGLE MAPS

// export const scrapeGoogleMaps = async (
//   filters: ScrapingFilters
// ): Promise<{
//   entreprises: EntrepriseScraped[];
//   stats: ScrapingApiResponse['stats'];
// }> => {
//   try {
//     // console.log(' Envoi requête scraping:', filters);

//     //CONVERTIR LES CODES EN NOMS POUR L'API
//     const regionNom = mockRegions.find(r => r.code === filters.region)?.nom || filters.region;
//     const activiteNom = mockActivites.find(a => a.id === filters.activite)?.nom || filters.activite;

//     //CONVERTIR LES CODES VILLES EN NOMS
//     const villesNoms = filters.ville.length > 0
//       ? filters.ville.map(code => mockVilles.find(v => v.code === code)?.nom || code)
//       : undefined;

//     const payload = {
//       region: regionNom,
//       departement: filters.departement.length > 0 ? filters.departement : undefined,
//       ville: villesNoms,
//       activite: activiteNom || undefined,
//       nombre_resultats: filters.nombre_resultats
//     };

//     // console.log('📡 Payload envoyé:', payload);

//     //CORRECTION : Route correcte
//     const response = await axios.post<ScrapingApiResponse>(
//       `${API_BASE_URL}/google-maps`,  ///scraper/google-maps
//       payload,
//       {
//         timeout: 300000,
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     // console.log('Réponse API:', response.data);

//     const entreprises = transformApiDataToFrontend(response.data.data);

//     return {
//       entreprises,
//       stats: response.data.stats
//     };

//   } catch (error: any) {
//     console.error('❌ Erreur API:', error);

//     if (axios.isAxiosError(error)) {
//       if (error.response) {
//         throw new Error(error.response.data?.message || 'Erreur serveur');
//       } else if (error.request) {
//         throw new Error('Le serveur ne répond pas');
//       }
//     }

//     throw new Error('Erreur inconnue');
//   }
// };


// import axios from 'axios'
// import type { EntrepriseScraped } from '../types/scraping.type'
// import axios from 'axios';

// const SCRAPIO_BASE_URL = 'https://scrap.io/api/v1'
// const API_KEY = import.meta.env.VITE_SCRAPIO_API_KEY

// if (!API_KEY) {
//   console.warn('⚠️ Clé Scrap.io absente')
// }

// // VRAIE structure de la réponse Scrap.io
// interface ScrapIoApiResponse {
//   meta: {
//     count: string
//     status: string
//     per_page: number
//     has_more_pages: boolean
//   }
//   data: Array<{
//     google_id: string
//     name: string
//     types?: Array<{ type: string; is_main: boolean }>
//     phone?: string
//     phone_international?: string
//     website?: string
//     location_full_address?: string
//     location_street_1?: string
//     location_city?: string
//     location_postal_code?: string
//     reviews_count?: number | string  // "*** available from professional plan ***"
//     reviews_rating?: number | string
//     website_data?: {
//       emails?: Array<{ email: string; sources: string[] }> | string[]
//       phones?: Array<{ phone: string; sources: string[] }>
//     }
//   }>
// }

// export const scrapeScrapIo = async (
//   activite: string,
//   ville: string,
//   limit: number
// ): Promise<EntrepriseScraped[]> => {
//   try {
//     console.log(`🔍 Scraping: ${activite} à ${ville} (limite: ${limit})`)
    
//     const response = await axios.get<ScrapIoApiResponse>(
//       `${SCRAPIO_BASE_URL}/gmap/search`,
//       {
//         headers: {
//           Authorization: `Bearer ${API_KEY}`
//         },
//         params: {
//           query: activite,
//           city: ville,
//           country_code: 'FR',
//           limit
//         }
//       }
//     )

//     console.log(`✅ API Status: ${response.data.meta.status}`)
//     console.log(`📊 Résultats trouvés: ${response.data.data.length}`)

//     if (!response.data.data || response.data.data.length === 0) {
//       console.warn('⚠️ Aucune donnée retournée par Scrap.io')
//       return []
//     }

//     // MAPPING CORRECT selon la structure réelle de Scrap.io
//     return response.data.data.map(item => {
//       // Extraction de l'email depuis website_data
//       let email = 'Non disponible'
//       if (item.website_data?.emails) {
//         const firstEmail = item.website_data.emails[0]
//         if (typeof firstEmail === 'object' && 'email' in firstEmail) {
//           email = firstEmail.email
//         }
//       }

//       // Extraction de l'activité principale
//       const activitePrincipale = item.types?.find(t => t.is_main)?.type || activite

//       // Gestion des reviews (peut être string "*** available..." ou number)
//       const reviewsCount = typeof item.reviews_count === 'number' 
//         ? item.reviews_count 
//         : 0
      
//       const rating = typeof item.reviews_rating === 'number'
//         ? item.reviews_rating
//         : undefined

//       return {
//         id: item.google_id,
//         nom_societe: item.name,
//         prenom: '',
//         nom: '',
//         telephone: item.phone || item.phone_international || 'Non disponible',
//         email: email,
//         site_web: item.website,
//         adresse: item.location_street_1 || item.location_full_address || '',
//         adresse_etablissement: item.location_full_address,
//         code_postal: item.location_postal_code || '',
//         code_postal_etablissement: item.location_postal_code,
//         ville: item.location_city || ville,
//         ville_etablissement: item.location_city,
//         departement: '',  // Scrap.io ne retourne pas le département directement
//         activite: activitePrincipale,
//         siret: 'Non disponible',  // Scrap.io ne fournit pas le SIRET
//         note: rating,
//         nombre_avis: reviewsCount
//       }
//     })

//   } catch (error: any) {
//     console.error('❌ Erreur Scrap.io:', error.response?.data || error.message)
    
//     if (error.response?.status === 401) {
//       throw new Error('Clé API Scrap.io invalide')
//     }
//     if (error.response?.status === 429) {
//       throw new Error('Limite de requêtes Scrap.io atteinte')
//     }
    
//     throw new Error(`Erreur API Scrap.io: ${error.message}`)
//   }
// }



// import type { EntrepriseScraped } from '../types/scraping.type'
// import axios from 'axios'

// const SCRAPIO_BASE_URL = 'https://scrap.io/api/v1'
// const API_KEY = import.meta.env.VITE_SCRAPIO_API_KEY

// interface ScrapIoApiResponse {
//   meta: {
//     status: string
//     per_page: number
//     has_more_pages: boolean
//     next_cursor?: string
//   }
//   data: any[]
// }

// export const scrapeScrapIo = async (
//   activite: string,
//   ville: string,
//   limit: number
// ): Promise<EntrepriseScraped[]> => {

//   const results: EntrepriseScraped[] = []
//   const seen = new Set<string>()
//   let cursor: string | undefined = undefined

//   console.log(`🔍 Scrap.io: ${activite} à ${ville} (objectif ${limit})`)

//   while (results.length < limit) {
//     const response = await axios.get<ScrapIoApiResponse>(
//       `${SCRAPIO_BASE_URL}/gmap/search`,
//       {
//         headers: {
//           Authorization: `Bearer ${API_KEY}`
//         },
//         params: {
//           query: activite,
//           city: ville,
//           country_code: 'FR',
//           cursor
//         }
//       }
//     )

//     const { data, meta } = response.data

//     for (const item of data) {
//       if (results.length >= limit) break
//       if (seen.has(item.google_id)) continue

//       seen.add(item.google_id)

//       // EMAIL
//       let email = 'Non disponible'
//       const emails = item.website_data?.emails
//       if (Array.isArray(emails) && emails[0]?.email) {
//         email = emails[0].email
//       }

//       // DESCRIPTION (Google Maps)
//       const description =
//         Array.isArray(item.descriptions) && item.descriptions.length > 0
//           ? item.descriptions[0]
//           : ''

//       results.push({
//         id: item.google_id,
//         nom_societe: item.name,
//         prenom: '',
//         nom: '',
//         telephone: item.phone || item.phone_international || 'Non disponible',
//         email,
//         site_web: item.website,
//         adresse: item.location_street_1 || item.location_full_address || '',
//         adresse_etablissement: item.location_full_address,
//         code_postal: item.location_postal_code || '',
//         code_postal_etablissement: item.location_postal_code,
//         ville: item.location_city || ville,
//         ville_etablissement: item.location_city,
//         departement: '',
//         activite,
//         siret: 'Non disponible',
//         note: typeof item.reviews_rating === 'number' ? item.reviews_rating : undefined,
//         nombre_avis: typeof item.reviews_count === 'number' ? item.reviews_count : 0,
//         description
//       })
//     }

//     if (!meta.has_more_pages || !meta.next_cursor) {
//       break
//     }

//     cursor = meta.next_cursor
//   }

//   console.log(`✅ Scrap.io terminé: ${results.length} résultats`)
//   return results
// }


import type { EntrepriseScraped } from '../types/scraping.type'
import axios from 'axios'

const SCRAPIO_BASE_URL = 'https://scrap.io/api/v1'
const API_KEY = import.meta.env.VITE_SCRAPIO_API_KEY

interface ScrapIoApiResponse {
  meta: {
    status: string
    per_page: number
    has_more_pages: boolean
    next_cursor?: string
  }
  data: any[]
}

/**
 * Scrape Scrap.io par activité et ville, avec pagination et déduplication
 */
export const scrapeScrapIo = async (
  activite: string,
  ville: string,
  limit: number
): Promise<EntrepriseScraped[]> => {
  const results: EntrepriseScraped[] = []
  const seen = new Set<string>()
  let cursor: string | undefined = undefined

  console.log(`🔍 Scrap.io: ${activite} à ${ville} (objectif ${limit})`)

  do {
    // Solution 1: Type explicite pour la réponse
    const axiosResponse = await axios.get<ScrapIoApiResponse>(
      `${SCRAPIO_BASE_URL}/gmap/search`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
        params: { query: activite, city: ville, country_code: 'FR', cursor }
      }
    )

    // Solution 2: Extraction avec typage explicite
    const responseData: ScrapIoApiResponse = axiosResponse.data
    const data = responseData.data
    const meta = responseData.meta

    for (const item of data) {
      if (results.length >= limit) break
      
      // Solution 3: Typage pour l'item
      const typedItem = item as {
        google_id: string
        name: string
        phone?: string
        phone_international?: string
        website?: string
        website_data?: {
          emails?: Array<{ email?: string }>
        }
        descriptions?: string[]
        types?: Array<{
          is_main?: boolean
          deleted?: boolean
          type?: string
        }>
        location_street_1?: string
        location_full_address?: string
        location_postal_code?: string
        location_city?: string
        reviews_rating?: number
        reviews_count?: number
      }
      
      if (seen.has(typedItem.google_id)) continue
      seen.add(typedItem.google_id)

      // Email
      let email = 'Non disponible'
      const emails = typedItem.website_data?.emails
      if (Array.isArray(emails) && emails[0]?.email) email = emails[0].email

      // Description
      const description =
        Array.isArray(typedItem.descriptions) && typedItem.descriptions.length > 0
          ? typedItem.descriptions[0]
          : ''

      // Activité principale
      let mainType = activite
      if (Array.isArray(typedItem.types)) {
        const mainTypeItem = typedItem.types.find((t) => t.is_main && !t.deleted)
        if (mainTypeItem?.type) {
          mainType = mainTypeItem.type
        } else if (typedItem.types[0]?.type) {
          mainType = typedItem.types[0].type
        }
      }

      results.push({
        id: typedItem.google_id,
        nom_societe: typedItem.name,
        prenom: '',
        nom: '',
        telephone: typedItem.phone || typedItem.phone_international || 'Non disponible',
        email,
        website: typedItem.website || '', // Utilise 'website' au lieu de 'site_web'
        adresse: typedItem.location_street_1 || typedItem.location_full_address || '',
        adresse_etablissement: typedItem.location_full_address || '',
        code_postal: typedItem.location_postal_code || '',
        code_postal_etablissement: typedItem.location_postal_code || '',
        ville: typedItem.location_city || ville,
        ville_etablissement: typedItem.location_city || '',
        departement: '',
        activite: mainType,
        siret: 'Non disponible',
        note: typeof typedItem.reviews_rating === 'number' ? typedItem.reviews_rating : undefined,
        nombre_avis: typeof typedItem.reviews_count === 'number' ? typedItem.reviews_count : 0,
        description
      })
    }

    // Pagination
    if (!meta.has_more_pages || !meta.next_cursor || results.length >= limit) break
    cursor = meta.next_cursor
  } while (true)

  console.log(`✅ Scrap.io terminé: ${results.length} résultats`)
  return results
}
