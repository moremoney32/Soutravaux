
import type { EntrepriseScraped } from '../types/scraping.type'
import axios from 'axios'

const SCRAPIO_BASE_URL = 'https://scrap.io/api/v1'
const API_KEY = import.meta.env.VITE_SCRAPIO_API_KEY

interface ScrapioType {
  id: string
  text: string
}

interface ScrapIoApiResponse {
  meta: {
    count: string
    status: string
    next_cursor?: string
    previous_cursor: null | string
    per_page: number
    has_more_pages: boolean
  }
  data: any[]
}

/**
 * ÉTAPE 1 : Chercher le type Scrap.io pour l'activité
 */
async function findScrapioType(activite: string): Promise<string | null> {
  console.log(` Recherche du type pour "${activite}"...`)
  
  try {
    const response = await axios.get<ScrapioType[]>(
      `${SCRAPIO_BASE_URL}/gmap/types`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`
        },
        params: {
          search_term: activite,
          locale: 'fr'
        }
      }
    )

    if (response.data.length === 0) {
      console.warn(` Aucun type trouvé pour "${activite}"`)
      return null
    }

    const scrapioType = response.data[0]
    console.log(`Type trouvé: "${scrapioType.text}" (${scrapioType.id})`)
    
    return scrapioType.id

  } catch (error: any) {
    console.error(' Erreur recherche type:', error.response?.data || error.message)
    return null
  }
}

/**
 * ÉTAPE 2 : Scraper avec le type trouvé
 */
export const scrapeScrapIo = async (
  activite: string,
  ville: string,
  limit: number
): Promise<EntrepriseScraped[]> => {
  const results: EntrepriseScraped[] = []
  const seen = new Set<string>()
  
  // ÉTAPE 1 : Trouver le type Scrap.io
  const scrapioType = await findScrapioType(activite)
  
  if (!scrapioType) {
    throw new Error(`Impossible de trouver un type Scrap.io pour "${activite}"`)
  }

  console.log(` Scraping: type="${scrapioType}", ville="${ville}", limite=${limit}`)

  // ÉTAPE 2 : PAGINATION - Boucle pour récupérer plusieurs pages
  let cursor: string | undefined = undefined
  let pageNumber = 1

  do {
    // Construire le payload avec cursor si pagination
    const params: any = {
      country_code: 'FR',
      city: ville,
      type: scrapioType
    }

    if (cursor) {
      params.cursor = cursor
    }

    try {
      const response = await axios.get<ScrapIoApiResponse>(
        `${SCRAPIO_BASE_URL}/gmap/search`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`
          },
          params: params
        }
      )

      const { data, meta } = response.data

      console.log(` Page ${pageNumber}: ${data.length} résultats (Total: ${results.length}/${limit})`)

      if (!data || data.length === 0) {
        console.log(' Aucun résultat dans cette page')
        break
      }

      // MAPPING DES RÉSULTATS
      for (const item of data) {
        if (results.length >= limit) break
        if (seen.has(item.google_id)) continue
        
        seen.add(item.google_id)

        // EMAIL
        let email = 'Non disponible'
        if (item.website_data?.emails && Array.isArray(item.website_data.emails)) {
          const firstEmail = item.website_data.emails[0]
          if (typeof firstEmail === 'object' && firstEmail.email) {
            email = firstEmail.email
          }
        }

        // REVIEWS
        const rating = typeof item.reviews_rating === 'number' ? item.reviews_rating : undefined
        const reviewCount = typeof item.reviews_count === 'number' ? item.reviews_count : 0

        // DESCRIPTION
        const description = Array.isArray(item.descriptions) && item.descriptions.length > 0
          ? item.descriptions[0]
          : ''

        results.push({
          id: item.google_id,
          nom_societe: item.name,
          prenom: '',
          nom: '',
          telephone: item.phone || item.phone_international || 'Non disponible',
          email,
          site_web: item.website || '',
          adresse: item.location_street_1 || item.location_full_address || '',
          adresse_etablissement: item.location_full_address || '',
          code_postal: item.location_postal_code || '',
          code_postal_etablissement: item.location_postal_code || '',
          ville: item.location_city || ville,
          ville_etablissement: item.location_city || '',
          departement: '',
          activite: scrapioType,
          siret: 'Non disponible',
          note: rating,
          nombre_avis: reviewCount,
          description
        })
      }

      // VÉRIFIER SI ON A ATTEINT LA LIMITE
      if (results.length >= limit) {
        console.log(`Limite atteinte: ${results.length}/${limit}`)
        break
      }

      // VÉRIFIER S'IL Y A UNE PAGE SUIVANTE
      if (!meta.has_more_pages || !meta.next_cursor) {
        console.log(`Fin de pagination: ${results.length} résultats au total`)
        break
      }

      // PRÉPARER LA PAGE SUIVANTE
      cursor = meta.next_cursor
      pageNumber++

      // Petite pause pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))

    } catch (error: any) {
      console.error(' Erreur Scrap.io:', error.response?.data || error.message)
      
      if (error.response?.status === 401) {
        throw new Error('Clé API Scrap.io invalide')
      }
      if (error.response?.status === 429) {
        throw new Error('Limite de requêtes atteinte')
      }
      if (error.response?.status === 400) {
        throw new Error(`Paramètres invalides: ${JSON.stringify(error.response?.data)}`)
      }
      
      throw new Error(`Erreur API Scrap.io: ${error.message}`)
    }
  } while (true) // Continue tant qu'il y a des pages

  console.log(`TOTAL FINAL: ${results.length} entreprises`)
  return results
}