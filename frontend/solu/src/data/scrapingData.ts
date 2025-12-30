// src/mocks/scrapingData.ts

import type { DepartementOption, EntrepriseScraped, RegionOption, VilleOption } from "../types/scraping.type";

export const mockDepartements: DepartementOption[] = [
  // Île-de-France
  { code: '75', nom: 'Paris', region: 'IDF' },
  { code: '77', nom: 'Seine-et-Marne', region: 'IDF' },
  { code: '78', nom: 'Yvelines', region: 'IDF' },
  { code: '91', nom: 'Essonne', region: 'IDF' },
  { code: '92', nom: 'Hauts-de-Seine', region: 'IDF' },
  { code: '93', nom: 'Seine-Saint-Denis', region: 'IDF' },
  { code: '94', nom: 'Val-de-Marne', region: 'IDF' },
  { code: '95', nom: "Val-d'Oise", region: 'IDF' },
  
  // Auvergne-Rhône-Alpes
  { code: '01', nom: 'Ain', region: 'ARA' },
  { code: '03', nom: 'Allier', region: 'ARA' },
  { code: '07', nom: 'Ardèche', region: 'ARA' },
  { code: '15', nom: 'Cantal', region: 'ARA' },
  { code: '26', nom: 'Drôme', region: 'ARA' },
  { code: '38', nom: 'Isère', region: 'ARA' },
  { code: '42', nom: 'Loire', region: 'ARA' },
  { code: '43', nom: 'Haute-Loire', region: 'ARA' },
  { code: '63', nom: 'Puy-de-Dôme', region: 'ARA' },
  { code: '69', nom: 'Rhône', region: 'ARA' },
  { code: '73', nom: 'Savoie', region: 'ARA' },
  { code: '74', nom: 'Haute-Savoie', region: 'ARA' },
  
  // Provence-Alpes-Côte d'Azur
  { code: '04', nom: 'Alpes-de-Haute-Provence', region: 'PAC' },
  { code: '05', nom: 'Hautes-Alpes', region: 'PAC' },
  { code: '06', nom: 'Alpes-Maritimes', region: 'PAC' },
  { code: '13', nom: 'Bouches-du-Rhône', region: 'PAC' },
  { code: '83', nom: 'Var', region: 'PAC' },
  { code: '84', nom: 'Vaucluse', region: 'PAC' },
  
  // Occitanie
  { code: '09', nom: 'Ariège', region: 'OCC' },
  { code: '11', nom: 'Aude', region: 'OCC' },
  { code: '12', nom: 'Aveyron', region: 'OCC' },
  { code: '30', nom: 'Gard', region: 'OCC' },
  { code: '31', nom: 'Haute-Garonne', region: 'OCC' },
  { code: '32', nom: 'Gers', region: 'OCC' },
  { code: '34', nom: 'Hérault', region: 'OCC' },
  { code: '46', nom: 'Lot', region: 'OCC' },
  { code: '48', nom: 'Lozère', region: 'OCC' },
  { code: '65', nom: 'Hautes-Pyrénées', region: 'OCC' },
  { code: '66', nom: 'Pyrénées-Orientales', region: 'OCC' },
  { code: '81', nom: 'Tarn', region: 'OCC' },
  { code: '82', nom: 'Tarn-et-Garonne', region: 'OCC' },
  
  // Nouvelle-Aquitaine
  { code: '16', nom: 'Charente', region: 'NAQ' },
  { code: '17', nom: 'Charente-Maritime', region: 'NAQ' },
  { code: '19', nom: 'Corrèze', region: 'NAQ' },
  { code: '23', nom: 'Creuse', region: 'NAQ' },
  { code: '24', nom: 'Dordogne', region: 'NAQ' },
  { code: '33', nom: 'Gironde', region: 'NAQ' },
  { code: '40', nom: 'Landes', region: 'NAQ' },
  { code: '47', nom: 'Lot-et-Garonne', region: 'NAQ' },
  { code: '64', nom: 'Pyrénées-Atlantiques', region: 'NAQ' },
  { code: '79', nom: 'Deux-Sèvres', region: 'NAQ' },
  { code: '86', nom: 'Vienne', region: 'NAQ' },
  { code: '87', nom: 'Haute-Vienne', region: 'NAQ' },
  
  // Hauts-de-France
  { code: '02', nom: 'Aisne', region: 'HDF' },
  { code: '59', nom: 'Nord', region: 'HDF' },
  { code: '60', nom: 'Oise', region: 'HDF' },
  { code: '62', nom: 'Pas-de-Calais', region: 'HDF' },
  { code: '80', nom: 'Somme', region: 'HDF' },
  
  // Pays de la Loire
  { code: '44', nom: 'Loire-Atlantique', region: 'PDL' },
  { code: '49', nom: 'Maine-et-Loire', region: 'PDL' },
  { code: '53', nom: 'Mayenne', region: 'PDL' },
  { code: '72', nom: 'Sarthe', region: 'PDL' },
  { code: '85', nom: 'Vendée', region: 'PDL' },
  
  // Bretagne
  { code: '22', nom: "Côtes-d'Armor", region: 'BRE' },
  { code: '29', nom: 'Finistère', region: 'BRE' },
  { code: '35', nom: 'Ille-et-Vilaine', region: 'BRE' },
  { code: '56', nom: 'Morbihan', region: 'BRE' },
  
  // Grand Est
  { code: '08', nom: 'Ardennes', region: 'GES' },
  { code: '10', nom: 'Aube', region: 'GES' },
  { code: '51', nom: 'Marne', region: 'GES' },
  { code: '52', nom: 'Haute-Marne', region: 'GES' },
  { code: '54', nom: 'Meurthe-et-Moselle', region: 'GES' },
  { code: '55', nom: 'Meuse', region: 'GES' },
  { code: '57', nom: 'Moselle', region: 'GES' },
  { code: '67', nom: 'Bas-Rhin', region: 'GES' },
  { code: '68', nom: 'Haut-Rhin', region: 'GES' },
  { code: '88', nom: 'Vosges', region: 'GES' },
  
  // Bourgogne-Franche-Comté
  { code: '21', nom: "Côte-d'Or", region: 'BFC' },
  { code: '25', nom: 'Doubs', region: 'BFC' },
  { code: '39', nom: 'Jura', region: 'BFC' },
  { code: '58', nom: 'Nièvre', region: 'BFC' },
  { code: '70', nom: 'Haute-Saône', region: 'BFC' },
  { code: '71', nom: 'Saône-et-Loire', region: 'BFC' },
  { code: '89', nom: 'Yonne', region: 'BFC' },
  { code: '90', nom: 'Territoire de Belfort', region: 'BFC' },
  
  // Centre-Val de Loire
  { code: '18', nom: 'Cher', region: 'CVL' },
  { code: '28', nom: 'Eure-et-Loir', region: 'CVL' },
  { code: '36', nom: 'Indre', region: 'CVL' },
  { code: '37', nom: 'Indre-et-Loire', region: 'CVL' },
  { code: '41', nom: 'Loir-et-Cher', region: 'CVL' },
  { code: '45', nom: 'Loiret', region: 'CVL' },
  
  // Normandie
  { code: '14', nom: 'Calvados', region: 'NOR' },
  { code: '27', nom: 'Eure', region: 'NOR' },
  { code: '50', nom: 'Manche', region: 'NOR' },
  { code: '61', nom: 'Orne', region: 'NOR' },
  { code: '76', nom: 'Seine-Maritime', region: 'NOR' },
  
  // Corse
  { code: '2A', nom: 'Corse-du-Sud', region: 'COR' },
  { code: '2B', nom: 'Haute-Corse', region: 'COR' }
];

export const mockVilles: VilleOption[] = [
  // Île-de-France
  { code: '75056', nom: 'Paris', departement: '75', region: 'IDF' },
  { code: '92050', nom: 'Nanterre', departement: '92', region: 'IDF' },
  { code: '93066', nom: 'Saint-Denis', departement: '93', region: 'IDF' },
  { code: '94028', nom: 'Créteil', departement: '94', region: 'IDF' },
  { code: '78646', nom: 'Versailles', departement: '78', region: 'IDF' },
  
  // Auvergne-Rhône-Alpes
  { code: '69123', nom: 'Lyon', departement: '69', region: 'ARA' },
  { code: '38185', nom: 'Grenoble', departement: '38', region: 'ARA' },
  { code: '42218', nom: 'Saint-Étienne', departement: '42', region: 'ARA' },
  { code: '74010', nom: 'Annecy', departement: '74', region: 'ARA' },
  { code: '63113', nom: 'Clermont-Ferrand', departement: '63', region: 'ARA' },
  
  // Provence-Alpes-Côte d'Azur
  { code: '13055', nom: 'Marseille', departement: '13', region: 'PAC' },
  { code: '06088', nom: 'Nice', departement: '06', region: 'PAC' },
  { code: '83137', nom: 'Toulon', departement: '83', region: 'PAC' },
  { code: '13001', nom: 'Aix-en-Provence', departement: '13', region: 'PAC' },
  
  // Occitanie
  { code: '31555', nom: 'Toulouse', departement: '31', region: 'OCC' },
  { code: '34172', nom: 'Montpellier', departement: '34', region: 'OCC' },
  { code: '30189', nom: 'Nîmes', departement: '30', region: 'OCC' },
  { code: '66136', nom: 'Perpignan', departement: '66', region: 'OCC' },
  
  // Nouvelle-Aquitaine
  { code: '33063', nom: 'Bordeaux', departement: '33', region: 'NAQ' },
  { code: '87085', nom: 'Limoges', departement: '87', region: 'NAQ' },
  { code: '64445', nom: 'Pau', departement: '64', region: 'NAQ' },
  { code: '17300', nom: 'La Rochelle', departement: '17', region: 'NAQ' },
  
  // Hauts-de-France
  { code: '59350', nom: 'Lille', departement: '59', region: 'HDF' },
  { code: '80021', nom: 'Amiens', departement: '80', region: 'HDF' },
  { code: '62041', nom: 'Arras', departement: '62', region: 'HDF' },
  
  // Pays de la Loire
  { code: '44109', nom: 'Nantes', departement: '44', region: 'PDL' },
  { code: '49007', nom: 'Angers', departement: '49', region: 'PDL' },
  { code: '72181', nom: 'Le Mans', departement: '72', region: 'PDL' },
  
  // Bretagne
  { code: '35238', nom: 'Rennes', departement: '35', region: 'BRE' },
  { code: '29019', nom: 'Brest', departement: '29', region: 'BRE' },
  { code: '56260', nom: 'Vannes', departement: '56', region: 'BRE' },
  
  // Grand Est
  { code: '67482', nom: 'Strasbourg', departement: '67', region: 'GES' },
  { code: '54395', nom: 'Nancy', departement: '54', region: 'GES' },
  { code: '51108', nom: 'Reims', departement: '51', region: 'GES' },
  { code: '57463', nom: 'Metz', departement: '57', region: 'GES' },
  
  // Bourgogne-Franche-Comté
  { code: '21231', nom: 'Dijon', departement: '21', region: 'BFC' },
  { code: '25056', nom: 'Besançon', departement: '25', region: 'BFC' },
  
  // Centre-Val de Loire
  { code: '45234', nom: 'Orléans', departement: '45', region: 'CVL' },
  { code: '37261', nom: 'Tours', departement: '37', region: 'CVL' },
  
  // Normandie
  { code: '76540', nom: 'Rouen', departement: '76', region: 'NOR' },
  { code: '14118', nom: 'Caen', departement: '14', region: 'NOR' },
  { code: '76351', nom: 'Le Havre', departement: '76', region: 'NOR' }
];



// export const ACTIVITE_TO_GOOGLE_TYPE: Record<string, string | null> = {
//   // ======================
//   // BTP – GROS ŒUVRE
//   // ======================
//   'maçon': 'general-contractor',
//   'maconnerie': 'general-contractor',
//   'terrassement': 'general-contractor',
//   'demolition': 'general-contractor',
//   'charpentier': 'carpenter',
//   'couvreur': 'roofing-contractor',
//   'zingueur': 'roofing-contractor',
//   'construction-bois': 'home-builder',
//   'constructeur-maison': 'home-builder',
//   'constructeur': 'general-contractor',

//   // ======================
//   // BTP – SECOND ŒUVRE
//   // ======================
//   'plombier': 'plumber',
//   'plombier-chauffagiste': 'plumber',
//   'electricien': 'electrician',
//   'chauffagiste': 'hvac-contractor',
//   'climatisation': 'hvac-contractor',
//   'menuisier': 'carpenter',
//   'menuiserie-alu': 'window-installation-service',
//   'menuiserie-pvc': 'window-installation-service',
//   'plaquiste': 'drywall-contractor',
//   'peintre': 'painter',
//   'carreleur': 'tile-contractor',
//   'parqueteur': 'flooring-contractor',
//   'platrier': 'drywall-contractor',
//   'isolation': 'insulation-contractor',
//   'etancheite': 'waterproofing-service',
//   'vitrerie': 'glass-repair-service',
//   'miroiterie': 'glass-repair-service',

//   // ======================
//   // AUTOMOBILE
//   // ======================
//   'garage': 'auto-repair-shop',
//   'carrosserie': 'auto-body-shop',
//   'peinture-auto': 'auto-body-shop',
//   'mecanique': 'car-repair',
//   'pneumatique': 'tire-shop',
//   'pare-brise': 'auto-glass-shop',
//   'controle-technique': 'car-inspection-station',
//   'depannage-auto': 'towing-service',
//   'lavage-auto': 'car-wash',
//   'vente-voiture': 'car-dealer',

//   // ======================
//   // SANTÉ
//   // ======================
//   'medecin': 'doctor',
//   'dentiste': 'dentist',
//   'pharmacie': 'pharmacy',
//   'kine': 'physiotherapist',
//   'osteopathe': 'osteopath',
//   'infirmier': 'nurse',
//   'podologue': 'podiatrist',
//   'opticien': 'optician',
//   'audioprothesiste': 'hearing-aid-store',
//   'psychologue': 'psychologist',
//   'veterinaire': 'veterinarian',

//   // ======================
//   // SERVICES
//   // ======================
//   'coiffeur': 'hair-salon',
//   'salon-coiffure': 'hair-salon',
//   'esthetique': 'beauty-salon',
//   'massage': 'massage-therapist',
//   'manucure': 'nail-salon',
//   'spa': 'spa',
//   'tatouage': 'tattoo-shop',
//   'pressing': 'dry-cleaner',
//   'cordonnerie': 'shoe-repair-shop',
//   'retouche': 'tailor',

//   // ======================
//   // RESTAURATION
//   // ======================
//   'restaurant': 'restaurant',
//   'pizzeria': 'pizza-restaurant',
//   'creperie': 'creperie',
//   'kebab': 'kebab-shop',
//   'sushi': 'sushi-restaurant',
//   'cafe': 'cafe',
//   'bar': 'bar',
//   'brasserie': 'brasserie',
//   'traiteur': 'caterer',
//   'food-truck': 'food-truck',
//   'boulangerie': 'bakery',
//   'patisserie': 'pastry-shop',

//   // ======================
//   // IMMOBILIER
//   // ======================
//   'agence-immobiliere': 'real-estate-agency',
//   'syndic': 'property-management-company',
//   'gestion-locative': 'property-management-company',
//   'expert-immobilier': 'real-estate-appraiser',
//   'promoteur': 'real-estate-developer',
//   'home-staging': 'interior-designer',

//   // ======================
//   // PROFESSIONS LIBÉRALES
//   // ======================
//   'avocat': 'lawyer',
//   'notaire': 'notary-public',
//   'expert-comptable': 'accountant',
//   'assurance': 'insurance-agency',
//   'banque': 'bank',
//   'architecte': 'architect',
//   'geometre': 'land-surveyor',
//   'huissier': 'bailiff',

//   // ======================
//   // INFORMATIQUE
//   // ======================
//   'informatique': 'computer-support-and-services',
//   'reparation-pc': 'computer-repair-service',
//   'reparation-smartphone': 'cell-phone-store',
//   'reseau': 'telecommunications-service-provider',
//   'web-agency': 'software-company',
//   'telephonie': 'telecommunications-service-provider',

//   // ======================
//   // TRANSPORT
//   // ======================
//   'demenagement': 'moving-company',
//   'transport': 'logistics-service',
//   'taxi': 'taxi-service',
//   'vtc': 'taxi-service',
//   'ambulance': 'ambulance-service',
//   'location-vehicule': 'car-rental-agency',
//   'coursier': 'courier-service',

//   // ======================
//   // NETTOYAGE
//   // ======================
//   'nettoyage': 'cleaning-service',
//   'menage': 'house-cleaning-service',
//   'vitrerie-nettoyage': 'window-cleaning-service',
//   'desinfection': 'cleaning-service',
//   'debarras': 'waste-management-service',

//   // ======================
//   // SÉCURITÉ
//   // ======================
//   'serrurier': 'locksmith',
//   'vigile': 'security-service',
//   'videosurveillance': 'security-system-installer',

//   // ======================
//   // EXTÉRIEUR
//   // ======================
//   'paysagiste': 'landscape-designer',
//   'jardinier': 'landscaper',
//   'elagage': 'tree-service',
//   'piscine': 'swimming-pool-contractor',
//   'cloture': 'fence-contractor',
//   'portail': 'fence-contractor',
//   'pergola': 'deck-builder',
//   'terrasse': 'deck-builder',
//   'allees': 'paving-contractor',

//   // ======================
//   // SPÉCIALISÉS
//   // ======================
//   'assainissement': 'septic-system-service',
//   'forage': 'drilling-contractor',
//   'ramonage': 'chimney-sweep',
//   'domotique': 'home-automation-company',
//   'alarme': 'security-system-installer',
//   'antenne': 'antenna-service',
//   'panneau-solaire': 'solar-energy-equipment-supplier',
//   'pompe-chaleur': 'hvac-contractor',
//   'ventilation': 'hvac-contractor',
// }

// /**
//  * Liste des activités disponibles pour l'UI avec catégories
//  */
// export const mockActivites = Object.entries(ACTIVITE_TO_GOOGLE_TYPE)
//   .filter(([_, category]) => category !== null) // Exclure les null
//   .map(([key, category]) => ({
//     id: key,
//     nom: formatActiviteName(key),
//     categorie: getCategorieFromKey(key),
//     scrapio_category: category as string
//   }))
//   .sort((a, b) => a.nom.localeCompare(b.nom))

// /**
//  * Formate le nom de l'activité pour l'affichage
//  */
// function formatActiviteName(key: string): string {
//   return key
//     .split('-')
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(' ')
// }

// /**
//  * Détermine la catégorie UI à partir de la clé
//  */
// function getCategorieFromKey(key: string): string {
//   const categories: Record<string, string[]> = {
//     'BTP - Gros œuvre': ['maçon', 'terrassement', 'demolition', 'charpentier', 'couvreur', 'constructeur'],
//     'BTP - Second œuvre': ['plombier', 'electricien', 'menuisier', 'peintre', 'carreleur', 'plaquiste'],
//     'Extérieur': ['paysagiste', 'jardinier', 'elagage', 'piscine', 'terrasse'],
//     'Automobile': ['garage', 'carrosserie', 'mecanique', 'pneumatique', 'lavage-auto'],
//     'Santé': ['medecin', 'dentiste', 'pharmacie', 'kine', 'infirmier'],
//     'Services': ['coiffeur', 'esthetique', 'massage', 'pressing', 'cordonnerie'],
//     'Restauration': ['restaurant', 'pizzeria', 'cafe', 'bar', 'boulangerie', 'patisserie'],
//     'Immobilier': ['agence-immobiliere', 'syndic', 'promoteur'],
//     'Commerce': ['fleuriste', 'boucherie', 'epicerie', 'librairie', 'bijouterie'],
//     'Professions libérales': ['avocat', 'notaire', 'expert-comptable', 'architecte'],
//     'Informatique': ['informatique', 'reparation-pc', 'web-agency'],
//     'Transport': ['demenagement', 'taxi', 'vtc', 'coursier'],
//     'Éducation': ['auto-ecole', 'ecole-langue', 'cours-particuliers'],
//     'Loisirs': ['salle-sport', 'cinema', 'theatre', 'musee']
//   }

//   for (const [categorie, keys] of Object.entries(categories)) {
//     if (keys.some(k => key.includes(k))) {
//       return categorie
//     }
//   }

//   return 'Autres'
// }

/**
 * Interface pour les options d'activités
 */
// export interface ActiviteOption {
//   id: string
//   nom: string
//   categorie: string
//   scrapio_category: string
// }

export interface ActiviteOption {
  id: string          // Clé technique (ex: "maçon", "plombier")
  nom: string         // Nom affiché (ex: "Maçon", "Plombier")
  categorie: string   // Catégorie UI (ex: "BTP - Gros œuvre")
}


// export const ACTIVITES_DISPONIBLES: ActiviteOption[] = [
//   // ======================
//   // BTP – GROS ŒUVRE
//   // ======================
//   { id: 'maçon', nom: 'Maçon', categorie: 'BTP - Gros œuvre' },
//   { id: 'maconnerie', nom: 'Maçonnerie', categorie: 'BTP - Gros œuvre' },
//   { id: 'terrassement', nom: 'Terrassement', categorie: 'BTP - Gros œuvre' },
//   { id: 'demolition', nom: 'Démolition', categorie: 'BTP - Gros œuvre' },
//   { id: 'charpentier', nom: 'Charpentier', categorie: 'BTP - Gros œuvre' },
//   { id: 'couvreur', nom: 'Couvreur', categorie: 'BTP - Gros œuvre' },
//   { id: 'zingueur', nom: 'Zingueur', categorie: 'BTP - Gros œuvre' },
//   { id: 'construction-bois', nom: 'Construction bois', categorie: 'BTP - Gros œuvre' },
//   { id: 'constructeur-maison', nom: 'Constructeur maison', categorie: 'BTP - Gros œuvre' },
//   { id: 'constructeur', nom: 'Constructeur', categorie: 'BTP - Gros œuvre' },

//   // ======================
//   // BTP – SECOND ŒUVRE
//   // ======================
//   { id: 'plombier', nom: 'Plombier', categorie: 'BTP - Second œuvre' },
//   { id: 'plombier-chauffagiste', nom: 'Plombier chauffagiste', categorie: 'BTP - Second œuvre' },
//   { id: 'electricien', nom: 'Électricien', categorie: 'BTP - Second œuvre' },
//   { id: 'chauffagiste', nom: 'Chauffagiste', categorie: 'BTP - Second œuvre' },
//   { id: 'climatisation', nom: 'Climatisation', categorie: 'BTP - Second œuvre' },
//   { id: 'menuisier', nom: 'Menuisier', categorie: 'BTP - Second œuvre' },
//   { id: 'menuiserie-alu', nom: 'Menuiserie aluminium', categorie: 'BTP - Second œuvre' },
//   { id: 'menuiserie-pvc', nom: 'Menuiserie PVC', categorie: 'BTP - Second œuvre' },
//   { id: 'plaquiste', nom: 'Plaquiste', categorie: 'BTP - Second œuvre' },
//   { id: 'peintre', nom: 'Peintre', categorie: 'BTP - Second œuvre' },
//   { id: 'carreleur', nom: 'Carreleur', categorie: 'BTP - Second œuvre' },
//   { id: 'parqueteur', nom: 'Parqueteur', categorie: 'BTP - Second œuvre' },
//   { id: 'platrier', nom: 'Plâtrier', categorie: 'BTP - Second œuvre' },
//   { id: 'isolation', nom: 'Isolation', categorie: 'BTP - Second œuvre' },
//   { id: 'etancheite', nom: 'Étanchéité', categorie: 'BTP - Second œuvre' },
//   { id: 'vitrerie', nom: 'Vitrerie', categorie: 'BTP - Second œuvre' },
//   { id: 'miroiterie', nom: 'Miroiterie', categorie: 'BTP - Second œuvre' },

//   // ======================
//   // AUTOMOBILE
//   // ======================
//   { id: 'garage', nom: 'Garage', categorie: 'Automobile' },
//   { id: 'carrosserie', nom: 'Carrosserie', categorie: 'Automobile' },
//   { id: 'peinture-auto', nom: 'Peinture automobile', categorie: 'Automobile' },
//   { id: 'mecanique', nom: 'Mécanique', categorie: 'Automobile' },
//   { id: 'pneumatique', nom: 'Pneumatique', categorie: 'Automobile' },
//   { id: 'pare-brise', nom: 'Pare-brise', categorie: 'Automobile' },
//   { id: 'controle-technique', nom: 'Contrôle technique', categorie: 'Automobile' },
//   { id: 'depannage-auto', nom: 'Dépannage auto', categorie: 'Automobile' },
//   { id: 'lavage-auto', nom: 'Lavage auto', categorie: 'Automobile' },
//   { id: 'vente-voiture', nom: 'Vente voiture', categorie: 'Automobile' },

//   // ======================
//   // SANTÉ
//   // ======================
//   { id: 'medecin', nom: 'Médecin', categorie: 'Santé' },
//   { id: 'dentiste', nom: 'Dentiste', categorie: 'Santé' },
//   { id: 'pharmacie', nom: 'Pharmacie', categorie: 'Santé' },
//   { id: 'kine', nom: 'Kinésithérapeute', categorie: 'Santé' },
//   { id: 'osteopathe', nom: 'Ostéopathe', categorie: 'Santé' },
//   { id: 'infirmier', nom: 'Infirmier', categorie: 'Santé' },
//   { id: 'podologue', nom: 'Podologue', categorie: 'Santé' },
//   { id: 'opticien', nom: 'Opticien', categorie: 'Santé' },
//   { id: 'audioprothesiste', nom: 'Audioprothésiste', categorie: 'Santé' },
//   { id: 'psychologue', nom: 'Psychologue', categorie: 'Santé' },
//   { id: 'veterinaire', nom: 'Vétérinaire', categorie: 'Santé' },

//   // ======================
//   // SERVICES
//   // ======================
//   { id: 'coiffeur', nom: 'Coiffeur', categorie: 'Services' },
//   { id: 'salon-coiffure', nom: 'Salon de coiffure', categorie: 'Services' },
//   { id: 'esthetique', nom: 'Esthétique', categorie: 'Services' },
//   { id: 'massage', nom: 'Massage', categorie: 'Services' },
//   { id: 'manucure', nom: 'Manucure', categorie: 'Services' },
//   { id: 'spa', nom: 'Spa', categorie: 'Services' },
//   { id: 'tatouage', nom: 'Tatouage', categorie: 'Services' },
//   { id: 'pressing', nom: 'Pressing', categorie: 'Services' },
//   { id: 'cordonnerie', nom: 'Cordonnerie', categorie: 'Services' },
//   { id: 'retouche', nom: 'Retouche', categorie: 'Services' },

//   // ======================
//   // RESTAURATION
//   // ======================
//   { id: 'restaurant', nom: 'Restaurant', categorie: 'Restauration' },
//   { id: 'pizzeria', nom: 'Pizzeria', categorie: 'Restauration' },
//   { id: 'creperie', nom: 'Crêperie', categorie: 'Restauration' },
//   { id: 'kebab', nom: 'Kebab', categorie: 'Restauration' },
//   { id: 'sushi', nom: 'Sushi', categorie: 'Restauration' },
//   { id: 'cafe', nom: 'Café', categorie: 'Restauration' },
//   { id: 'bar', nom: 'Bar', categorie: 'Restauration' },
//   { id: 'brasserie', nom: 'Brasserie', categorie: 'Restauration' },
//   { id: 'traiteur', nom: 'Traiteur', categorie: 'Restauration' },
//   { id: 'food-truck', nom: 'Food truck', categorie: 'Restauration' },
//   { id: 'boulangerie', nom: 'Boulangerie', categorie: 'Restauration' },
//   { id: 'patisserie', nom: 'Pâtisserie', categorie: 'Restauration' },

//   // ======================
//   // IMMOBILIER
//   // ======================
//   { id: 'agence-immobiliere', nom: 'Agence immobilière', categorie: 'Immobilier' },
//   { id: 'syndic', nom: 'Syndic', categorie: 'Immobilier' },
//   { id: 'gestion-locative', nom: 'Gestion locative', categorie: 'Immobilier' },
//   { id: 'expert-immobilier', nom: 'Expert immobilier', categorie: 'Immobilier' },
//   { id: 'promoteur', nom: 'Promoteur', categorie: 'Immobilier' },
//   { id: 'home-staging', nom: 'Home staging', categorie: 'Immobilier' },

//   // ======================
//   // PROFESSIONS LIBÉRALES
//   // ======================
//   { id: 'avocat', nom: 'Avocat', categorie: 'Professions libérales' },
//   { id: 'notaire', nom: 'Notaire', categorie: 'Professions libérales' },
//   { id: 'expert-comptable', nom: 'Expert-comptable', categorie: 'Professions libérales' },
//   { id: 'assurance', nom: 'Assurance', categorie: 'Professions libérales' },
//   { id: 'banque', nom: 'Banque', categorie: 'Professions libérales' },
//   { id: 'architecte', nom: 'Architecte', categorie: 'Professions libérales' },
//   { id: 'geometre', nom: 'Géomètre', categorie: 'Professions libérales' },
//   { id: 'huissier', nom: 'Huissier', categorie: 'Professions libérales' },

//   // ======================
//   // INFORMATIQUE
//   // ======================
//   { id: 'informatique', nom: 'Informatique', categorie: 'Informatique' },
//   { id: 'reparation-pc', nom: 'Réparation PC', categorie: 'Informatique' },
//   { id: 'reparation-smartphone', nom: 'Réparation smartphone', categorie: 'Informatique' },
//   { id: 'reseau', nom: 'Réseau', categorie: 'Informatique' },
//   { id: 'web-agency', nom: 'Web agency', categorie: 'Informatique' },
//   { id: 'telephonie', nom: 'Téléphonie', categorie: 'Informatique' },

//   // ======================
//   // TRANSPORT
//   // ======================
//   { id: 'demenagement', nom: 'Déménagement', categorie: 'Transport' },
//   { id: 'transport', nom: 'Transport', categorie: 'Transport' },
//   { id: 'taxi', nom: 'Taxi', categorie: 'Transport' },
//   { id: 'vtc', nom: 'VTC', categorie: 'Transport' },
//   { id: 'ambulance', nom: 'Ambulance', categorie: 'Transport' },
//   { id: 'location-vehicule', nom: 'Location véhicule', categorie: 'Transport' },
//   { id: 'coursier', nom: 'Coursier', categorie: 'Transport' },

//   // ======================
//   // NETTOYAGE
//   // ======================
//   { id: 'nettoyage', nom: 'Nettoyage', categorie: 'Nettoyage' },
//   { id: 'menage', nom: 'Ménage', categorie: 'Nettoyage' },
//   { id: 'vitrerie-nettoyage', nom: 'Nettoyage de vitres', categorie: 'Nettoyage' },
//   { id: 'desinfection', nom: 'Désinfection', categorie: 'Nettoyage' },
//   { id: 'debarras', nom: 'Débarras', categorie: 'Nettoyage' },

//   // ======================
//   // SÉCURITÉ
//   // ======================
//   { id: 'serrurier', nom: 'Serrurier', categorie: 'Sécurité' },
//   { id: 'vigile', nom: 'Vigile', categorie: 'Sécurité' },
//   { id: 'videosurveillance', nom: 'Vidéosurveillance', categorie: 'Sécurité' },

//   // ======================
//   // EXTÉRIEUR
//   // ======================
//   { id: 'paysagiste', nom: 'Paysagiste', categorie: 'Extérieur' },
//   { id: 'jardinier', nom: 'Jardinier', categorie: 'Extérieur' },
//   { id: 'elagage', nom: 'Élagage', categorie: 'Extérieur' },
//   { id: 'piscine', nom: 'Piscine', categorie: 'Extérieur' },
//   { id: 'cloture', nom: 'Clôture', categorie: 'Extérieur' },
//   { id: 'portail', nom: 'Portail', categorie: 'Extérieur' },
//   { id: 'pergola', nom: 'Pergola', categorie: 'Extérieur' },
//   { id: 'terrasse', nom: 'Terrasse', categorie: 'Extérieur' },
//   { id: 'allees', nom: 'Allées', categorie: 'Extérieur' },

//   // ======================
//   // SPÉCIALISÉS
//   // ======================
//   { id: 'assainissement', nom: 'Assainissement', categorie: 'Spécialisés' },
//   { id: 'forage', nom: 'Forage', categorie: 'Spécialisés' },
//   { id: 'ramonage', nom: 'Ramonage', categorie: 'Spécialisés' },
//   { id: 'domotique', nom: 'Domotique', categorie: 'Spécialisés' },
//   { id: 'alarme', nom: 'Alarme', categorie: 'Spécialisés' },
//   { id: 'antenne', nom: 'Antenne', categorie: 'Spécialisés' },
//   { id: 'panneau-solaire', nom: 'Panneau solaire', categorie: 'Spécialisés' },
//   { id: 'pompe-chaleur', nom: 'Pompe à chaleur', categorie: 'Spécialisés' },
//   { id: 'ventilation', nom: 'Ventilation', categorie: 'Spécialisés' },
// ]

// export const mockActivites = ACTIVITES_DISPONIBLES



// LISTE COMPLÈTE DES ACTIVITÉS SCRAP.IO
// Mappées sur les catégories existantes du projet

// export interface ActiviteOption {
//   id: string;
//   nom: string;
//   categorie: string;
// }

export const ACTIVITES_DISPONIBLES: ActiviteOption[] = [
  // ======================
  // BTP – GROS ŒUVRE
  // ======================
  { id: 'macon', nom: 'Maçon', categorie: 'BTP - Gros œuvre' },
  { id: 'maconnerie', nom: 'Maçonnerie', categorie: 'BTP - Gros œuvre' },
  { id: 'entreprise-maconnerie', nom: 'Entrepreneur en maçonnerie', categorie: 'BTP - Gros œuvre' },
  { id: 'terrassement', nom: 'Terrassement', categorie: 'BTP - Gros œuvre' },
  { id: 'entreprise-terrassement', nom: 'Entreprise de terrassement', categorie: 'BTP - Gros œuvre' },
  { id: 'demolition', nom: 'Démolition', categorie: 'BTP - Gros œuvre' },
  { id: 'entrepreneur-demolition', nom: 'Entrepreneur spécialisé dans la démolition', categorie: 'BTP - Gros œuvre' },
  { id: 'charpentier', nom: 'Charpentier', categorie: 'BTP - Gros œuvre' },
  { id: 'atelier-charpente', nom: 'Atelier de menuiserie', categorie: 'BTP - Gros œuvre' },
  { id: 'couvreur', nom: 'Couvreur', categorie: 'BTP - Gros œuvre' },
  { id: 'zingueur', nom: 'Zingueur', categorie: 'BTP - Gros œuvre' },
  { id: 'construction-bois', nom: 'Construction bois', categorie: 'BTP - Gros œuvre' },
  { id: 'constructeur-maison-bois', nom: 'Constructeur de maisons en bois', categorie: 'BTP - Gros œuvre' },
  { id: 'constructeur-maison', nom: 'Constructeur de maisons personnalisées', categorie: 'BTP - Gros œuvre' },
  { id: 'constructeur-batiment', nom: 'Constructeur immobilier', categorie: 'BTP - Gros œuvre' },
  { id: 'entreprise-construction', nom: 'Entreprise de construction', categorie: 'BTP - Gros œuvre' },
  { id: 'genie-civil', nom: 'Entreprise de génie civil', categorie: 'BTP - Gros œuvre' },
  { id: 'entrepreneur-beton', nom: 'Constructeur de structures en béton', categorie: 'BTP - Gros œuvre' },
  { id: 'charpente-metallique', nom: 'Compagnie de construction métallique', categorie: 'BTP - Gros œuvre' },
  { id: 'entrepreneur-acier', nom: 'Constructeur en acier', categorie: 'BTP - Gros œuvre' },

  // ======================
  // BTP – SECOND ŒUVRE
  // ======================
  { id: 'plombier', nom: 'Plombier', categorie: 'BTP - Second œuvre' },
  { id: 'plombier-chauffagiste', nom: 'Plombier chauffagiste', categorie: 'BTP - Second œuvre' },
  { id: 'magasin-plomberie', nom: 'Magasin de matériel de plomberie', categorie: 'BTP - Second œuvre' },
  { id: 'electricien', nom: 'Électricien', categorie: 'BTP - Second œuvre' },
  { id: 'electricien-auto', nom: 'Électricien automobile', categorie: 'BTP - Second œuvre' },
  { id: 'chauffagiste', nom: 'Chauffagiste', categorie: 'BTP - Second œuvre' },
  { id: 'climatisation', nom: 'Entrepreneur en climatisation', categorie: 'BTP - Second œuvre' },
  { id: 'climatisation-auto', nom: 'Climatisation automobile', categorie: 'BTP - Second œuvre' },
  { id: 'menuisier', nom: 'Menuisier', categorie: 'BTP - Second œuvre' },
  { id: 'menuiserie-alu', nom: 'Menuiserie aluminium', categorie: 'BTP - Second œuvre' },
  { id: 'menuiserie-pvc', nom: 'Menuiserie PVC', categorie: 'BTP - Second œuvre' },
  { id: 'plaquiste', nom: 'Plaquiste', categorie: 'BTP - Second œuvre' },
  { id: 'cloisons-seches', nom: 'Entrepreneur de cloisons sèches', categorie: 'BTP - Second œuvre' },
  { id: 'peintre', nom: 'Peintre en bâtiment', categorie: 'BTP - Second œuvre' },
  { id: 'peinture-batiment', nom: 'Atelier de peinture', categorie: 'BTP - Second œuvre' },
  { id: 'carreleur', nom: 'Carreleur', categorie: 'BTP - Second œuvre' },
  { id: 'magasin-carrelage', nom: 'Magasin de carrelage', categorie: 'BTP - Second œuvre' },
  { id: 'parqueteur', nom: 'Parqueteur', categorie: 'BTP - Second œuvre' },
  { id: 'pose-parquet', nom: 'Service de pose de parquet', categorie: 'BTP - Second œuvre' },
  { id: 'platrier', nom: 'Plâtrier', categorie: 'BTP - Second œuvre' },
  { id: 'isolation', nom: 'Entrepreneur spécialisé dans l\'isolation', categorie: 'BTP - Second œuvre' },
  { id: 'etancheite', nom: 'Étanchéité', categorie: 'BTP - Second œuvre' },
  { id: 'entreprise-etancheite', nom: 'Entreprise d\'étanchéité', categorie: 'BTP - Second œuvre' },
  { id: 'vitrerie', nom: 'Vitrerie', categorie: 'BTP - Second œuvre' },
  { id: 'vitrier', nom: 'Vitrier', categorie: 'BTP - Second œuvre' },
  { id: 'miroiterie', nom: 'Miroiterie', categorie: 'BTP - Second œuvre' },
  { id: 'pose-portes', nom: 'Installateur de portes', categorie: 'BTP - Second œuvre' },
  { id: 'pose-fenetres', nom: 'Installateur de fenêtres', categorie: 'BTP - Second œuvre' },

  // ======================
  // AUTOMOBILE
  // ======================
  { id: 'garage', nom: 'Garage automobile', categorie: 'Automobile' },
  { id: 'reparation-auto', nom: 'Atelier de réparation automobile', categorie: 'Automobile' },
  { id: 'carrosserie', nom: 'Atelier de carrosserie automobile', categorie: 'Automobile' },
  { id: 'carrossier', nom: 'Mécanicien de carrosserie automobile', categorie: 'Automobile' },
  { id: 'peinture-auto', nom: 'Peinture automobile', categorie: 'Automobile' },
  { id: 'mecanique', nom: 'Atelier de mécanique automobile', categorie: 'Automobile' },
  { id: 'mecanicien', nom: 'Mécanicien', categorie: 'Automobile' },
  { id: 'pneumatique', nom: 'Magasin de pneus', categorie: 'Automobile' },
  { id: 'reparation-pneus', nom: 'Atelier de réparation de pneus', categorie: 'Automobile' },
  { id: 'pare-brise', nom: 'Pare-brise', categorie: 'Automobile' },
  { id: 'reparation-pare-brise', nom: 'Service de réparation de pare-brise', categorie: 'Automobile' },
  { id: 'controle-technique', nom: 'Contrôle technique', categorie: 'Automobile' },
  { id: 'depannage-auto', nom: 'Service de remorquage', categorie: 'Automobile' },
  { id: 'lavage-auto', nom: 'Station de lavage automobile', categorie: 'Automobile' },
  { id: 'lavage-libre-service', nom: 'Lavage de voiture en libre service', categorie: 'Automobile' },
  { id: 'vente-voiture', nom: 'Concessionnaire automobile', categorie: 'Automobile' },
  { id: 'vente-occasion', nom: 'Concessionnaire de voitures d\'occasion', categorie: 'Automobile' },
  { id: 'pieces-auto', nom: 'Magasin de pièces automobiles', categorie: 'Automobile' },
  { id: 'accessoires-auto', nom: 'Magasin d\'accessoires automobiles', categorie: 'Automobile' },
  { id: 'tuning', nom: 'Prestataire de tuning automobile', categorie: 'Automobile' },
  { id: 'casse-auto', nom: 'Casse automobile', categorie: 'Automobile' },

  // ======================
  // SANTÉ
  // ======================
  { id: 'medecin', nom: 'Médecin', categorie: 'Santé' },
  { id: 'medecin-generaliste', nom: 'Médecin généraliste', categorie: 'Santé' },
  { id: 'cabinet-medical', nom: 'Cabinet médical', categorie: 'Santé' },
  { id: 'dentiste', nom: 'Dentiste', categorie: 'Santé' },
  { id: 'cabinet-dentaire', nom: 'Cabinet dentaire', categorie: 'Santé' },
  { id: 'orthodontiste', nom: 'Orthodontiste', categorie: 'Santé' },
  { id: 'pharmacie', nom: 'Pharmacie', categorie: 'Santé' },
  { id: 'pharmacie-bio', nom: 'Pharmacie bio', categorie: 'Santé' },
  { id: 'kine', nom: 'Kinésithérapeute', categorie: 'Santé' },
  { id: 'physiotherapeute', nom: 'Physiothérapeute', categorie: 'Santé' },
  { id: 'osteopathe', nom: 'Ostéopathe', categorie: 'Santé' },
  { id: 'chiropracteur', nom: 'Chiropracteur', categorie: 'Santé' },
  { id: 'infirmier', nom: 'Infirmier', categorie: 'Santé' },
  { id: 'cabinet-infirmier', nom: 'Cabinet infirmier', categorie: 'Santé' },
  { id: 'podologue', nom: 'Podologue', categorie: 'Santé' },
  { id: 'opticien', nom: 'Opticien', categorie: 'Santé' },
  { id: 'optometriste', nom: 'Optométriste', categorie: 'Santé' },
  { id: 'audioprothesiste', nom: 'Audiologiste', categorie: 'Santé' },
  { id: 'psychologue', nom: 'Psychologue', categorie: 'Santé' },
  { id: 'psychiatre', nom: 'Psychiatre', categorie: 'Santé' },
  { id: 'psychotherapeute', nom: 'Psychothérapeute', categorie: 'Santé' },
  { id: 'veterinaire', nom: 'Vétérinaire', categorie: 'Santé' },
  { id: 'clinique-veterinaire', nom: 'Clinique vétérinaire', categorie: 'Santé' },
  { id: 'cardiologue', nom: 'Cardiologue', categorie: 'Santé' },
  { id: 'dermatologue', nom: 'Dermatologue', categorie: 'Santé' },
  { id: 'gynecologue', nom: 'Gynécologue obstétricien', categorie: 'Santé' },
  { id: 'pediatre', nom: 'Pédiatre', categorie: 'Santé' },
  { id: 'ophtalmologiste', nom: 'Ophtalmologiste', categorie: 'Santé' },
  { id: 'orl', nom: 'Oto-rhino-laryngologiste', categorie: 'Santé' },
  { id: 'radiologue', nom: 'Radiologue', categorie: 'Santé' },
  { id: 'sage-femme', nom: 'Sage-femme', categorie: 'Santé' },
  { id: 'dieteticien', nom: 'Diététicien', categorie: 'Santé' },
  { id: 'nutritionniste', nom: 'Nutritionniste', categorie: 'Santé' },

  // ======================
  // SERVICES
  // ======================
  { id: 'coiffeur', nom: 'Coiffeur', categorie: 'Services' },
  { id: 'salon-coiffure', nom: 'Salon de coiffure', categorie: 'Services' },
  { id: 'barbier', nom: 'Barbier', categorie: 'Services' },
  { id: 'esthetique', nom: 'Esthéticien/Esthéticienne', categorie: 'Services' },
  { id: 'institut-beaute', nom: 'Institut de beauté', categorie: 'Services' },
  { id: 'massage', nom: 'Massothérapeute', categorie: 'Services' },
  { id: 'institut-massage', nom: 'Institut de massages', categorie: 'Services' },
  { id: 'manucure', nom: 'Salon de manucure', categorie: 'Services' },
  { id: 'spa', nom: 'Spa', categorie: 'Services' },
  { id: 'spa-jour', nom: 'Spa de jour', categorie: 'Services' },
  { id: 'tatouage', nom: 'Tatoueur', categorie: 'Services' },
  { id: 'salon-tatouage', nom: 'Salon de tatouage et piercing', categorie: 'Services' },
  { id: 'piercing', nom: 'Salon de piercing', categorie: 'Services' },
  { id: 'pressing', nom: 'Pressing', categorie: 'Services' },
  { id: 'blanchisserie', nom: 'Blanchisserie', categorie: 'Services' },
  { id: 'laverie', nom: 'Laverie automatique', categorie: 'Services' },
  { id: 'cordonnerie', nom: 'Cordonnerie', categorie: 'Services' },
  { id: 'cordonnier', nom: 'Cordonnier', categorie: 'Services' },
  { id: 'retouche', nom: 'Service de retouche de vêtements', categorie: 'Services' },
  { id: 'couturier', nom: 'Couturier', categorie: 'Services' },
  { id: 'tailleur', nom: 'Tailleur', categorie: 'Services' },

  // ======================
  // RESTAURATION
  // ======================
  { id: 'restaurant', nom: 'Restaurant', categorie: 'Restauration' },
  { id: 'restaurant-francais', nom: 'Restaurant français', categorie: 'Restauration' },
  { id: 'restaurant-italien', nom: 'Restaurant italien', categorie: 'Restauration' },
  { id: 'restaurant-chinois', nom: 'Restaurant chinois', categorie: 'Restauration' },
  { id: 'restaurant-japonais', nom: 'Restaurant japonais', categorie: 'Restauration' },
  { id: 'restaurant-indien', nom: 'Restaurant indien', categorie: 'Restauration' },
  { id: 'restaurant-mexicain', nom: 'Restaurant mexicain', categorie: 'Restauration' },
  { id: 'pizzeria', nom: 'Pizzeria', categorie: 'Restauration' },
  { id: 'pizza-emporter', nom: 'Pizza à emporter', categorie: 'Restauration' },
  { id: 'creperie', nom: 'Crêperie', categorie: 'Restauration' },
  { id: 'kebab', nom: 'Kebab', categorie: 'Restauration' },
  { id: 'sushi', nom: 'Restaurant de sushis', categorie: 'Restauration' },
  { id: 'sushi-emporter', nom: 'Sushi à emporter', categorie: 'Restauration' },
  { id: 'cafe', nom: 'Café', categorie: 'Restauration' },
  { id: 'cafeteria', nom: 'Cafétéria', categorie: 'Restauration' },
  { id: 'bar', nom: 'Bar', categorie: 'Restauration' },
  { id: 'pub', nom: 'Pub', categorie: 'Restauration' },
  { id: 'brasserie', nom: 'Brasserie', categorie: 'Restauration' },
  { id: 'bistro', nom: 'Bistro', categorie: 'Restauration' },
  { id: 'traiteur', nom: 'Traiteur', categorie: 'Restauration' },
  { id: 'food-truck', nom: 'Food truck', categorie: 'Restauration' },
  { id: 'boulangerie', nom: 'Boulangerie', categorie: 'Restauration' },
  { id: 'patisserie', nom: 'Pâtisserie', categorie: 'Restauration' },
  { id: 'chocolatier', nom: 'Chocolatier', categorie: 'Restauration' },
  { id: 'glacier', nom: 'Glacier', categorie: 'Restauration' },
  { id: 'fromagerie', nom: 'Fromagerie', categorie: 'Restauration' },
  { id: 'boucherie', nom: 'Boucherie', categorie: 'Restauration' },
  { id: 'charcuterie', nom: 'Charcuterie', categorie: 'Restauration' },
  { id: 'poissonnerie', nom: 'Poissonnerie', categorie: 'Restauration' },
  { id: 'primeur', nom: 'Primeur', categorie: 'Restauration' },
  { id: 'epicerie', nom: 'Épicerie', categorie: 'Restauration' },
  { id: 'epicerie-fine', nom: 'Épicerie fine', categorie: 'Restauration' },

  // ======================
  // IMMOBILIER
  // ======================
  { id: 'agence-immobiliere', nom: 'Agence immobilière', categorie: 'Immobilier' },
  { id: 'agent-immobilier', nom: 'Agent immobilier', categorie: 'Immobilier' },
  { id: 'syndic', nom: 'Syndic', categorie: 'Immobilier' },
  { id: 'syndicat-copropriete', nom: 'Syndicat de copropriété', categorie: 'Immobilier' },
  { id: 'gestion-locative', nom: 'Société de gestion immobilière', categorie: 'Immobilier' },
  { id: 'expert-immobilier', nom: 'Expert immobilier', categorie: 'Immobilier' },
  { id: 'evaluateur-immobilier', nom: 'Évaluateur immobilier', categorie: 'Immobilier' },
  { id: 'promoteur', nom: 'Promoteur immobilier', categorie: 'Immobilier' },
  { id: 'home-staging', nom: 'Home staging', categorie: 'Immobilier' },
  { id: 'location-appartement', nom: 'Agence de location d\'appartements', categorie: 'Immobilier' },
  { id: 'administrateur-biens', nom: 'Administrateur de biens', categorie: 'Immobilier' },

  // ======================
  // PROFESSIONS LIBÉRALES
  // ======================
  { id: 'avocat', nom: 'Avocat', categorie: 'Professions libérales' },
  { id: 'cabinet-avocats', nom: 'Cabinet d\'avocats', categorie: 'Professions libérales' },
  { id: 'notaire', nom: 'Notaire', categorie: 'Professions libérales' },
  { id: 'huissier', nom: 'Huissier de justice', categorie: 'Professions libérales' },
  { id: 'expert-comptable', nom: 'Expert-comptable', categorie: 'Professions libérales' },
  { id: 'comptable', nom: 'Comptable', categorie: 'Professions libérales' },
  { id: 'cabinet-comptable', nom: 'Cabinet d\'expertise comptable', categorie: 'Professions libérales' },
  { id: 'assurance', nom: 'Agence d\'assurance', categorie: 'Professions libérales' },
  { id: 'courtier-assurance', nom: 'Courtier d\'assurances', categorie: 'Professions libérales' },
  { id: 'banque', nom: 'Banque', categorie: 'Professions libérales' },
  { id: 'conseiller-financier', nom: 'Conseiller financier', categorie: 'Professions libérales' },
  { id: 'architecte', nom: 'Architecte', categorie: 'Professions libérales' },
  { id: 'architecte-interieur', nom: 'Architecte d\'intérieur', categorie: 'Professions libérales' },
  { id: 'decorateur', nom: 'Décorateur d\'intérieur', categorie: 'Professions libérales' },
  { id: 'geometre', nom: 'Géomètre', categorie: 'Professions libérales' },
  { id: 'geometre-expert', nom: 'Géomètre expert', categorie: 'Professions libérales' },

  // ======================
  // INFORMATIQUE
  // ======================
  { id: 'informatique', nom: 'Assistance informatique', categorie: 'Informatique' },
  { id: 'reparation-pc', nom: 'Service de réparation d\'ordinateurs', categorie: 'Informatique' },
  { id: 'reparation-smartphone', nom: 'Atelier de réparation de téléphones mobiles', categorie: 'Informatique' },
  { id: 'magasin-informatique', nom: 'Magasin d\'informatique', categorie: 'Informatique' },
  { id: 'reseau', nom: 'Consultant en réseau informatique', categorie: 'Informatique' },
  { id: 'web-agency', nom: 'Agence de design', categorie: 'Informatique' },
  { id: 'developpeur-web', nom: 'Concepteur de sites Web', categorie: 'Informatique' },
  { id: 'telephonie', nom: 'Magasin de téléphonie mobile', categorie: 'Informatique' },
  { id: 'cybercafe', nom: 'Cybercafé', categorie: 'Informatique' },

  // ======================
  // TRANSPORT
  // ======================
  { id: 'demenagement', nom: 'Déménageur', categorie: 'Transport' },
  { id: 'service-demenagement', nom: 'Service de déménagement', categorie: 'Transport' },
  { id: 'transport', nom: 'Service de transport', categorie: 'Transport' },
  { id: 'transport-marchandises', nom: 'Société de transport routier', categorie: 'Transport' },
  { id: 'taxi', nom: 'Taxi', categorie: 'Transport' },
  { id: 'station-taxi', nom: 'Station de taxis', categorie: 'Transport' },
  { id: 'vtc', nom: 'VTC', categorie: 'Transport' },
  { id: 'ambulance', nom: 'Ambulance', categorie: 'Transport' },
  { id: 'location-vehicule', nom: 'Agence de location de voitures', categorie: 'Transport' },
  { id: 'location-utilitaire', nom: 'Agence de location de fourgonnettes', categorie: 'Transport' },
  { id: 'coursier', nom: 'Coursier', categorie: 'Transport' },
  { id: 'livraison', nom: 'Service de livraison', categorie: 'Transport' },

  // ======================
  // NETTOYAGE
  // ======================
  { id: 'nettoyage', nom: 'Service de nettoyage', categorie: 'Nettoyage' },
  { id: 'entreprise-nettoyage', nom: 'Entreprise de nettoyage de vitres', categorie: 'Nettoyage' },
  { id: 'menage', nom: 'Service de ménage', categorie: 'Nettoyage' },
  { id: 'nettoyage-vitres', nom: 'Nettoyage de vitres', categorie: 'Nettoyage' },
  { id: 'desinfection', nom: 'Désinfection', categorie: 'Nettoyage' },
  { id: 'debarras', nom: 'Service de débarras de maison', categorie: 'Nettoyage' },
  { id: 'nettoyage-moquette', nom: 'Service de nettoyage de moquettes', categorie: 'Nettoyage' },

  // ======================
  // SÉCURITÉ
  // ======================
  { id: 'serrurier', nom: 'Serrurier', categorie: 'Sécurité' },
  { id: 'serrurerie-urgence', nom: 'Service de serrurerie d\'urgence', categorie: 'Sécurité' },
  { id: 'vigile', nom: 'Service de garde de sécurité', categorie: 'Sécurité' },
  { id: 'videosurveillance', nom: 'Installateur de systèmes de sécurité', categorie: 'Sécurité' },
  { id: 'alarme', nom: 'Fournisseur d\'alarmes incendie', categorie: 'Sécurité' },
  { id: 'systeme-securite', nom: 'Fournisseur de systèmes de sécurité', categorie: 'Sécurité' },

  // ======================
  // EXTÉRIEUR
  // ======================
  { id: 'paysagiste', nom: 'Paysagiste', categorie: 'Extérieur' },
  { id: 'concepteur-paysagiste', nom: 'Concepteur paysagiste', categorie: 'Extérieur' },
  { id: 'jardinier', nom: 'Jardinier', categorie: 'Extérieur' },
  { id: 'jardinerie', nom: 'Jardinerie', categorie: 'Extérieur' },
  { id: 'elagage', nom: 'Arboriste et arboriculteur', categorie: 'Extérieur' },
  { id: 'service-elagage', nom: 'Service d\'élagage', categorie: 'Extérieur' },
  { id: 'piscine', nom: 'Magasin de matériel pour piscines', categorie: 'Extérieur' },
  { id: 'construction-piscine', nom: 'Société de construction de piscine', categorie: 'Extérieur' },
  { id: 'entretien-piscine', nom: 'Service de nettoyage de piscines', categorie: 'Extérieur' },
  { id: 'cloture', nom: 'Entrepreneur spécialisé dans les clôtures', categorie: 'Extérieur' },
  { id: 'portail', nom: 'Portail', categorie: 'Extérieur' },
  { id: 'pergola', nom: 'Constructeur de kiosques/pavillons de jardin', categorie: 'Extérieur' },
  { id: 'terrasse', nom: 'Constructeur de terrasses', categorie: 'Extérieur' },
  { id: 'construction-terrasse', nom: 'Entrepreneur spécialisé dans les terrasses', categorie: 'Extérieur' },
  { id: 'allees', nom: 'Entrepreneur spécialisé dans le pavage', categorie: 'Extérieur' },
  { id: 'pepiniere', nom: 'Pépinière', categorie: 'Extérieur' },
  { id: 'entretien-pelouse', nom: 'Service d\'entretien de pelouse', categorie: 'Extérieur' },

  // ======================
  // SPÉCIALISÉS
  // ======================
  { id: 'assainissement', nom: 'Service d\'assainissement', categorie: 'Spécialisés' },
  { id: 'forage', nom: 'Entrepreneur spécialisé dans le forage', categorie: 'Spécialisés' },
  { id: 'forage-puits', nom: 'Entrepreneur spécialisé dans le forage de puits', categorie: 'Spécialisés' },
  { id: 'ramonage', nom: 'Ramoneur', categorie: 'Spécialisés' },
  { id: 'domotique', nom: 'Entreprise de domotique', categorie: 'Spécialisés' },
  { id: 'antenne', nom: 'Entretien d\'antennes', categorie: 'Spécialisés' },
  { id: 'panneau-solaire', nom: 'Entrepreneur en énergie solaire', categorie: 'Spécialisés' },
  { id: 'energie-solaire', nom: 'Entreprise d\'énergie solaire', categorie: 'Spécialisés' },
  { id: 'pompe-chaleur', nom: 'Pompe à chaleur', categorie: 'Spécialisés' },
  { id: 'ventilation', nom: 'Entrepreneur spécialisé dans les systèmes de CVC', categorie: 'Spécialisés' },
  { id: 'desinsectisation', nom: 'Service d\'extermination des nuisibles', categorie: 'Spécialisés' },
  { id: 'fumigation', nom: 'Service de contrôle des animaux', categorie: 'Spécialisés' },
  { id: 'ascenseur', nom: 'Service de maintenance d\'ascenseurs', categorie: 'Spécialisés' },
  { id: 'cheminee', nom: 'Fabricant de cheminée', categorie: 'Spécialisés' },
  { id: 'poele', nom: 'Constructeur de poêles', categorie: 'Spécialisés' },

  // ======================
  // COMMERCE
  // ======================
  { id: 'supermarche', nom: 'Supermarché', categorie: 'Commerce' },
  { id: 'hypermarche', nom: 'Hypermarché', categorie: 'Commerce' },
  { id: 'supérette', nom: 'Supérette', categorie: 'Commerce' },
  { id: 'epicerie-nuit', nom: 'Épicerie de nuit', categorie: 'Commerce' },
  { id: 'fleuriste', nom: 'Fleuriste', categorie: 'Commerce' },
  { id: 'animalerie', nom: 'Animalerie', categorie: 'Commerce' },
  { id: 'magasin-vetements', nom: 'Magasin de vêtements', categorie: 'Commerce' },
  { id: 'magasin-chaussures', nom: 'Magasin de chaussures', categorie: 'Commerce' },
  { id: 'bijouterie', nom: 'Bijouterie', categorie: 'Commerce' },
  { id: 'librairie', nom: 'Librairie', categorie: 'Commerce' },
  { id: 'papeterie', nom: 'Papeterie', categorie: 'Commerce' },
  { id: 'magasin-jouets', nom: 'Magasin de jouets', categorie: 'Commerce' },
  { id: 'magasin-bricolage', nom: 'Magasin de bricolage', categorie: 'Commerce' },
  { id: 'quincaillerie', nom: 'Quincaillerie', categorie: 'Commerce' },
  { id: 'electromenager', nom: 'Magasin d\'électroménager', categorie: 'Commerce' },
  { id: 'magasin-meubles', nom: 'Magasin de meubles', categorie: 'Commerce' },
  { id: 'magasin-decoration', nom: 'Magasin d\'ameublement et de décoration', categorie: 'Commerce' },

  // ======================
  // ÉDUCATION
  // ======================
  { id: 'ecole-primaire', nom: 'École primaire', categorie: 'Éducation' },
  { id: 'college', nom: 'Collège', categorie: 'Éducation' },
  { id: 'lycee', nom: 'Lycée', categorie: 'Éducation' },
  { id: 'universite', nom: 'Université', categorie: 'Éducation' },
  { id: 'ecole-maternelle', nom: 'École maternelle', categorie: 'Éducation' },
  { id: 'creche', nom: 'Crèche', categorie: 'Éducation' },
  { id: 'garderie', nom: 'Garderie', categorie: 'Éducation' },
  { id: 'auto-ecole', nom: 'Auto-école', categorie: 'Éducation' },
  { id: 'ecole-musique', nom: 'École de musique', categorie: 'Éducation' },
  { id: 'ecole-danse', nom: 'École de danse', categorie: 'Éducation' },
  { id: 'ecole-langue', nom: 'École de langue', categorie: 'Éducation' },
  { id: 'soutien-scolaire', nom: 'Service de soutien scolaire', categorie: 'Éducation' },

  // ======================
  // LOISIRS & CULTURE
  // ======================
  { id: 'cinema', nom: 'Cinéma', categorie: 'Loisirs & Culture' },
  { id: 'theatre', nom: 'Théâtre', categorie: 'Loisirs & Culture' },
  { id: 'musee', nom: 'Musée', categorie: 'Loisirs & Culture' },
  { id: 'bibliotheque', nom: 'Bibliothèque', categorie: 'Loisirs & Culture' },
  { id: 'salle-sport', nom: 'Centre de fitness', categorie: 'Loisirs & Culture' },
  { id: 'piscine-municipale', nom: 'Piscine', categorie: 'Loisirs & Culture' },
  { id: 'bowling', nom: 'Bowling', categorie: 'Loisirs & Culture' },
  { id: 'parc-attractions', nom: 'Parc d\'attractions', categorie: 'Loisirs & Culture' },
  { id: 'zoo', nom: 'Zoo', categorie: 'Loisirs & Culture' },
  { id: 'aquarium', nom: 'Aquarium', categorie: 'Loisirs & Culture' },
]

export const mockActivites = ACTIVITES_DISPONIBLES


export const mockEntreprises: EntrepriseScraped[] = [
  {
    id: '1',
    nom: 'Dupont',
    prenom: 'Jean',
    nom_societe: 'Plomberie Dupont SARL',
    activite: 'Plombier',
    telephone: '+33 6 12 34 56 78',
    email: 'contact@plomberie-dupont.fr',
    siret: '123 456 789 00012',
    adresse: '15 Rue de la Paix',
    code_postal: '75002',
    ville: 'Paris',
    departement: 'Paris',
    note: 4.5,
    nombre_avis: 127
  },
  {
    id: '2',
    nom: 'Martin',
    prenom: 'Sophie',
    nom_societe: 'Électricité Martin & Fils',
    activite: 'Électricien',
    telephone: '+33 6 23 45 67 89',
    email: 's.martin@elec-martin.fr',
    siret: '234 567 890 00023',
    adresse: '42 Avenue Victor Hugo',
    code_postal: '75016',
    ville: 'Paris',
    departement: 'Paris',
    note: 4.8,
    nombre_avis: 203
  },
  {
    id: '3',
    nom: 'Bernard',
    prenom: 'Luc',
    nom_societe: 'Menuiserie Bernard',
    activite: 'Menuisier',
    telephone: '+33 6 34 56 78 90',
    email: 'luc.bernard@menuiserie-bernard.fr',
    siret: '345 678 901 00034',
    adresse: '8 Rue des Artisans',
    code_postal: '69003',
    ville: 'Lyon',
    departement: 'Rhône',
    note: 4.3,
    nombre_avis: 89
  },
  {
    id: '4',
    nom: 'Petit',
    prenom: 'Marie',
    nom_societe: 'Peinture Petit Déco',
    activite: 'Peintre en bâtiment',
    telephone: '+33 6 45 67 89 01',
    email: 'marie@peinture-petit.fr',
    siret: '456 789 012 00045',
    adresse: '23 Boulevard Gambetta',
    code_postal: '13001',
    ville: 'Marseille',
    departement: 'Bouches-du-Rhône',
    note: 4.6,
    nombre_avis: 156
  },
  {
    id: '5',
    nom: 'Robert',
    prenom: 'Pierre',
    nom_societe: 'Maçonnerie Robert EURL',
    activite: 'Maçon',
    telephone: '+33 6 56 78 90 12',
    email: 'p.robert@maconnerie-robert.fr',
    siret: '567 890 123 00056',
    adresse: '56 Rue de la République',
    code_postal: '33000',
    ville: 'Bordeaux',
    departement: 'Gironde',
    note: 4.4,
    nombre_avis: 112
  },
  {
    id: '6',
    nom: 'Richard',
    prenom: 'Antoine',
    nom_societe: 'Couverture Richard',
    activite: 'Couvreur',
    telephone: '+33 6 67 89 01 23',
    email: 'contact@couverture-richard.fr',
    siret: '678 901 234 00067',
    adresse: '34 Avenue de la Liberté',
    code_postal: '59000',
    ville: 'Lille',
    departement: 'Nord',
    note: 4.7,
    nombre_avis: 178
  },
  {
    id: '7',
    nom: 'Durand',
    prenom: 'François',
    nom_societe: 'Chauffage Durand SAS',
    activite: 'Chauffagiste',
    telephone: '+33 6 78 90 12 34',
    email: 'f.durand@chauffage-durand.fr',
    siret: '789 012 345 00078',
    adresse: '19 Rue du Commerce',
    code_postal: '44000',
    ville: 'Nantes',
    departement: 'Loire-Atlantique',
    note: 4.5,
    nombre_avis: 134
  },
  {
    id: '8',
    nom: 'Moreau',
    prenom: 'Julie',
    nom_societe: 'Boulangerie Artisanale Moreau',
    activite: 'Boulangerie',
    telephone: '+33 6 89 01 23 45',
    email: 'julie@boulangerie-moreau.fr',
    siret: '890 123 456 00089',
    adresse: '7 Place du Marché',
    code_postal: '31000',
    ville: 'Toulouse',
    departement: 'Haute-Garonne',
    note: 4.9,
    nombre_avis: 342
  },
  {
    id: '9',
    nom: 'Simon',
    prenom: 'Laurent',
    nom_societe: 'Plomberie Simon Pro',
    activite: 'Plombier',
    telephone: '+33 6 90 12 34 56',
    email: 'l.simon@plomberie-simon.fr',
    siret: '901 234 567 00090',
    adresse: '12 Rue Nationale',
    code_postal: '06000',
    ville: 'Nice',
    departement: 'Alpes-Maritimes',
    note: 4.2,
    nombre_avis: 95
  },
  {
    id: '10',
    nom: 'Laurent',
    prenom: 'Isabelle',
    nom_societe: 'Électricité Laurent Services',
    activite: 'Électricien',
    telephone: '+33 7 01 23 45 67',
    email: 'isabelle@elec-laurent.fr',
    siret: '012 345 678 00101',
    adresse: '28 Avenue Jean Jaurès',
    code_postal: '67000',
    ville: 'Strasbourg',
    departement: 'Bas-Rhin',
    note: 4.6,
    nombre_avis: 167
  },
  {
    id: '11',
    nom: 'Lefebvre',
    prenom: 'Thomas',
    nom_societe: 'Menuiserie Lefebvre',
    activite: 'Menuisier',
    telephone: '+33 7 12 34 56 78',
    email: 'thomas@menuiserie-lefebvre.fr',
    siret: '123 456 789 00112',
    adresse: '45 Rue de Rivoli',
    code_postal: '75004',
    ville: 'Paris',
    departement: 'Paris',
    note: 4.4,
    nombre_avis: 98
  },
  {
    id: '12',
    nom: 'Roux',
    prenom: 'Caroline',
    nom_societe: 'Peinture Roux Décoration',
    activite: 'Peintre en bâtiment',
    telephone: '+33 7 23 45 67 89',
    email: 'caroline@peinture-roux.fr',
    siret: '234 567 890 00123',
    adresse: '67 Cours Lafayette',
    code_postal: '69003',
    ville: 'Lyon',
    departement: 'Rhône',
    note: 4.7,
    nombre_avis: 189
  }
];


export const mockRegions: RegionOption[] = [
  { code: 'ARA', nom: 'Auvergne-Rhône-Alpes' },
  { code: 'BFC', nom: 'Bourgogne-Franche-Comté' },
  { code: 'BRE', nom: 'Bretagne' },
  { code: 'CVL', nom: 'Centre-Val de Loire' },
  { code: 'COR', nom: 'Corse' },
  { code: 'GES', nom: 'Grand Est' },
  { code: 'HDF', nom: 'Hauts-de-France'},
  { code: 'IDF', nom: 'Île-de-France' },
  { code: 'NOR', nom: 'Normandie' },
  { code: 'NAQ', nom: 'Nouvelle-Aquitaine'},
  { code: 'OCC', nom: 'Occitanie' },
  { code: 'PDL', nom: 'Pays de la Loire' },
  { code: 'PAC', nom: "Provence-Alpes-Côte d'Azur" },
  { code: 'CVF', nom: 'Centre-Val de France' }
];

// export const mockActivites: ActiviteOption[] = Object.keys(
//   ACTIVITE_TO_GOOGLE_TYPE
// ).map((key) => ({
//   id: key,
//   nom: key
//     .replace(/-/g, ' ')
//     .replace(/\b\w/g, (l) => l.toUpperCase()),
//   categorie: 'BTP - Gros œuvre'
// }))