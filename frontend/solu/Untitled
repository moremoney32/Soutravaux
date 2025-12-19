import axios from 'axios'

const API_KEY = 'import.meta.env.VITE_SCRAPIO_API_KEY' // ← Remplacez par votre vraie clé
const BASE_URL = 'https://scrap.io/api/v1'

interface ScrapioType {
  id: string
  text: string
}

// VOTRE MAPPING ACTUEL
const CURRENT_MAPPING: Record<string, string> = {
  'maçon': 'general-contractor',
  'maconnerie': 'general-contractor',
  'terrassement': 'general-contractor',
  'demolition': 'general-contractor',
  'charpentier': 'carpenter',
  'couvreur': 'roofing-contractor',
  'zingueur': 'roofing-contractor',
  'construction-bois': 'home-builder',
  'constructeur-maison': 'home-builder',
  'constructeur': 'general-contractor',
  'plombier': 'plumber',
  'plombier-chauffagiste': 'plumber',
  'electricien': 'electrician',
  'chauffagiste': 'hvac-contractor',
  'climatisation': 'hvac-contractor',
  'menuisier': 'carpenter',
  'menuiserie-alu': 'window-installation-service',
  'menuiserie-pvc': 'window-installation-service',
  'plaquiste': 'drywall-contractor',
  'peintre': 'painter',
  'carreleur': 'tile-contractor',
  'parqueteur': 'flooring-contractor',
  'platrier': 'drywall-contractor',
  'isolation': 'insulation-contractor',
  'etancheite': 'waterproofing-service',
  'vitrerie': 'glass-repair-service',
  'miroiterie': 'glass-repair-service',
  'garage': 'auto-repair-shop',
  'carrosserie': 'auto-body-shop',
  'peinture-auto': 'auto-body-shop',
  'mecanique': 'car-repair',
  'pneumatique': 'tire-shop',
  'pare-brise': 'auto-glass-shop',
  'controle-technique': 'car-inspection-station',
  'depannage-auto': 'towing-service',
  'lavage-auto': 'car-wash',
  'vente-voiture': 'car-dealer',
  'medecin': 'doctor',
  'dentiste': 'dentist',
  'pharmacie': 'pharmacy',
  'kine': 'physiotherapist',
  'osteopathe': 'osteopath',
  'infirmier': 'nurse',
  'podologue': 'podiatrist',
  'opticien': 'optician',
  'audioprothesiste': 'hearing-aid-store',
  'psychologue': 'psychologist',
  'veterinaire': 'veterinarian',
  'coiffeur': 'hair-salon',
  'salon-coiffure': 'hair-salon',
  'esthetique': 'beauty-salon',
  'massage': 'massage-therapist',
  'manucure': 'nail-salon',
  'spa': 'spa',
  'tatouage': 'tattoo-shop',
  'pressing': 'dry-cleaner',
  'cordonnerie': 'shoe-repair-shop',
  'retouche': 'tailor',
  'restaurant': 'restaurant',
  'pizzeria': 'pizza-restaurant',
  'creperie': 'creperie',
  'kebab': 'kebab-shop',
  'sushi': 'sushi-restaurant',
  'cafe': 'cafe',
  'bar': 'bar',
  'brasserie': 'brasserie',
  'traiteur': 'caterer',
  'food-truck': 'food-truck',
  'boulangerie': 'bakery',
  'patisserie': 'pastry-shop',
  'agence-immobiliere': 'real-estate-agency',
  'syndic': 'property-management-company',
  'gestion-locative': 'property-management-company',
  'expert-immobilier': 'real-estate-appraiser',
  'promoteur': 'real-estate-developer',
  'home-staging': 'interior-designer',
  'avocat': 'lawyer',
  'notaire': 'notary-public',
  'expert-comptable': 'accountant',
  'assurance': 'insurance-agency',
  'banque': 'bank',
  'architecte': 'architect',
  'geometre': 'land-surveyor',
  'huissier': 'bailiff',
  'informatique': 'computer-support-and-services',
  'reparation-pc': 'computer-repair-service',
  'reparation-smartphone': 'cell-phone-store',
  'reseau': 'telecommunications-service-provider',
  'web-agency': 'software-company',
  'telephonie': 'telecommunications-service-provider',
  'demenagement': 'moving-company',
  'transport': 'logistics-service',
  'taxi': 'taxi-service',
  'vtc': 'taxi-service',
  'ambulance': 'ambulance-service',
  'location-vehicule': 'car-rental-agency',
  'coursier': 'courier-service',
  'nettoyage': 'cleaning-service',
  'menage': 'house-cleaning-service',
  'vitrerie-nettoyage': 'window-cleaning-service',
  'desinfection': 'cleaning-service',
  'debarras': 'waste-management-service',
  'serrurier': 'locksmith',
  'vigile': 'security-service',
  'videosurveillance': 'security-system-installer',
  'paysagiste': 'landscape-designer',
  'jardinier': 'landscaper',
  'elagage': 'tree-service',
  'piscine': 'swimming-pool-contractor',
  'cloture': 'fence-contractor',
  'portail': 'fence-contractor',
  'pergola': 'deck-builder',
  'terrasse': 'deck-builder',
  'allees': 'paving-contractor',
  'assainissement': 'septic-system-service',
  'forage': 'drilling-contractor',
  'ramonage': 'chimney-sweep',
  'domotique': 'home-automation-company',
  'alarme': 'security-system-installer',
  'antenne': 'antenna-service',
  'panneau-solaire': 'solar-energy-equipment-supplier',
  'pompe-chaleur': 'hvac-contractor',
  'ventilation': 'hvac-contractor',
}

async function searchType(searchTerm: string): Promise<ScrapioType[]> {
  try {
    const response = await axios.get<ScrapioType[]>(
      `${BASE_URL}/gmap/types`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
        params: { search_term: searchTerm, locale: 'fr' }
      }
    )
    return response.data
  } catch (error) {
    return []
  }
}

async function verifyAllTypes() {
  console.log('🔍 VÉRIFICATION DE VOS 155 TYPES SCRAP.IO\n')
  console.log('=' .repeat(80) + '\n')

  const correctedMapping: Record<string, string> = {}
  const errors: string[] = []
  let correctCount = 0
  let incorrectCount = 0
  let notFoundCount = 0

  for (const [activite, currentType] of Object.entries(CURRENT_MAPPING)) {
    // Rechercher le type auprès de Scrap.io
    const results = await searchType(activite)
    
    if (results.length === 0) {
      notFoundCount++
      errors.push(`⚠️ "${activite}" → AUCUN TYPE TROUVÉ (gardé: ${currentType})`)
      correctedMapping[activite] = currentType
    } else {
      const scrapioType = results[0].id
      
      if (scrapioType === currentType) {
        correctCount++
        console.log(`✅ "${activite}" → ${currentType}`)
        correctedMapping[activite] = currentType
      } else {
        incorrectCount++
        console.log(`❌ "${activite}" → ERREUR`)
        console.log(`   Vous aviez: ${currentType}`)
        console.log(`   Le vrai est: ${scrapioType}`)
        correctedMapping[activite] = scrapioType
      }
    }

    // Pause pour éviter rate limiting (300ms entre chaque requête)
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  // AFFICHER LES RÉSULTATS
  console.log('\n' + '='.repeat(80))
  console.log('\n📊 RÉSULTATS:\n')
  console.log(`✅ Corrects: ${correctCount}`)
  console.log(`❌ Incorrects (corrigés): ${incorrectCount}`)
  console.log(`⚠️ Non trouvés (gardés): ${notFoundCount}`)
  console.log(`📋 Total: ${Object.keys(CURRENT_MAPPING).length}`)

  if (errors.length > 0) {
    console.log('\n⚠️ ACTIVITÉS NON TROUVÉES:\n')
    errors.forEach(err => console.log(err))
  }

  // GÉNÉRER LE NOUVEAU MAPPING
  console.log('\n' + '='.repeat(80))
  console.log('\n📝 NOUVEAU MAPPING À COPIER-COLLER:\n')
  console.log('export const ACTIVITE_TO_SCRAPIO_TYPE: Record<string, string> = {')
  
  Object.entries(correctedMapping).forEach(([key, value]) => {
    console.log(`  '${key}': '${value}',`)
  })
  
  console.log('}')
}

// LANCER LA VÉRIFICATION
verifyAllTypes().then(() => {
  console.log('\n✅ Vérification terminée!')
})