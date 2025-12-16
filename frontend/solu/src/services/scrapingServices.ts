

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
        website: typedItem.website || '',
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
