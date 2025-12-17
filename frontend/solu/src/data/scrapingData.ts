// src/mocks/scrapingData.ts

import type { ActiviteOption, DepartementOption, EntrepriseScraped, RegionOption, VilleOption } from "../types/scraping.type";

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

// export const mockActivites: ActiviteOption[] = [
//   { id: 'restaurant', nom: 'Restaurant', categorie: 'Restauration' },
//   { id: 'plombier', nom: 'Plombier', categorie: 'BTP' },
//   { id: 'electricien', nom: 'Électricien', categorie: 'BTP' },
//   { id: 'menuisier', nom: 'Menuisier', categorie: 'BTP' },
//   { id: 'peintre', nom: 'Peintre en bâtiment', categorie: 'BTP' },
//   { id: 'maçon', nom: 'Maçon', categorie: 'BTP' },
//   { id: 'couvreur', nom: 'Couvreur', categorie: 'BTP' },
//   { id: 'chauffagiste', nom: 'Chauffagiste', categorie: 'BTP' },
//   { id: 'boulangerie', nom: 'Boulangerie', categorie: 'Alimentation' },
//   { id: 'coiffeur', nom: 'Coiffeur', categorie: 'Services' },
//   { id: 'garage', nom: 'Garage automobile', categorie: 'Automobile' },
//   { id: 'pharmacie', nom: 'Pharmacie', categorie: 'Santé' }
// ];
// export const mockActivites: ActiviteOption[] = [
//   // ============================================
//   // BTP - GROS ŒUVRE
//   // ============================================
//   { id: 'maçon', nom: 'Maçon', categorie: 'BTP - Gros œuvre' },
//   { id: 'terrassement', nom: 'Terrassement', categorie: 'BTP - Gros œuvre' },
//   { id: 'demolition', nom: 'Démolition', categorie: 'BTP - Gros œuvre' },
//   { id: 'charpentier', nom: 'Charpentier', categorie: 'BTP - Gros œuvre' },
//   { id: 'couvreur', nom: 'Couvreur', categorie: 'BTP - Gros œuvre' },
//   { id: 'zingueur', nom: 'Zingueur', categorie: 'BTP - Gros œuvre' },
//   { id: 'construction-bois', nom: 'Construction bois', categorie: 'BTP - Gros œuvre' },
//   { id: 'constructeur-maison', nom: 'Constructeur de maisons', categorie: 'BTP - Gros œuvre' },

//   // ============================================
//   // BTP - SECOND ŒUVRE
//   // ============================================
//   { id: 'plombier', nom: 'Plombier', categorie: 'BTP - Second œuvre' },
//   { id: 'plombier-chauffagiste', nom: 'Plombier-Chauffagiste', categorie: 'BTP - Second œuvre' },
//   { id: 'electricien', nom: 'Électricien', categorie: 'BTP - Second œuvre' },
//   { id: 'chauffagiste', nom: 'Chauffagiste', categorie: 'BTP - Second œuvre' },
//   { id: 'climatisation', nom: 'Climatisation', categorie: 'BTP - Second œuvre' },
//   { id: 'menuisier', nom: 'Menuisier', categorie: 'BTP - Second œuvre' },
//   { id: 'menuiserie-alu', nom: 'Menuiserie aluminium', categorie: 'BTP - Second œuvre' },
//   { id: 'menuiserie-pvc', nom: 'Menuiserie PVC', categorie: 'BTP - Second œuvre' },
//   { id: 'plaquiste', nom: 'Plaquiste', categorie: 'BTP - Second œuvre' },
//   { id: 'peintre', nom: 'Peintre en bâtiment', categorie: 'BTP - Second œuvre' },
//   { id: 'carreleur', nom: 'Carreleur', categorie: 'BTP - Second œuvre' },
//   { id: 'parqueteur', nom: 'Parqueteur', categorie: 'BTP - Second œuvre' },
//   { id: 'platrier', nom: 'Plâtrier', categorie: 'BTP - Second œuvre' },
//   { id: 'isolation', nom: 'Isolation', categorie: 'BTP - Second œuvre' },
//   { id: 'etancheite', nom: 'Étanchéité', categorie: 'BTP - Second œuvre' },
//   { id: 'vitrerie', nom: 'Vitrerie', categorie: 'BTP - Second œuvre' },
//   { id: 'miroiterie', nom: 'Miroiterie', categorie: 'BTP - Second œuvre' },

//   // ============================================
//   // BTP - FINITIONS
//   // ============================================
//   { id: 'decoration', nom: 'Décoration intérieure', categorie: 'BTP - Finitions' },
//   { id: 'revetement-sol', nom: 'Revêtement de sol', categorie: 'BTP - Finitions' },
//   { id: 'moquette', nom: 'Pose de moquette', categorie: 'BTP - Finitions' },
//   { id: 'papier-peint', nom: 'Pose de papier peint', categorie: 'BTP - Finitions' },
//   { id: 'staff', nom: 'Staff', categorie: 'BTP - Finitions' },
//   { id: 'stucateur', nom: 'Stucateur', categorie: 'BTP - Finitions' },

//   // ============================================
//   // BTP - EXTÉRIEUR & AMÉNAGEMENT
//   // ============================================
//   { id: 'paysagiste', nom: 'Paysagiste', categorie: 'BTP - Extérieur' },
//   { id: 'jardinier', nom: 'Jardinier', categorie: 'BTP - Extérieur' },
//   { id: 'elagage', nom: 'Élagage', categorie: 'BTP - Extérieur' },
//   { id: 'piscine', nom: 'Pisciniste', categorie: 'BTP - Extérieur' },
//   { id: 'cloture', nom: 'Clôture', categorie: 'BTP - Extérieur' },
//   { id: 'portail', nom: 'Portail automatique', categorie: 'BTP - Extérieur' },
//   { id: 'pergola', nom: 'Pergola', categorie: 'BTP - Extérieur' },
//   { id: 'terrasse', nom: 'Terrasse', categorie: 'BTP - Extérieur' },
//   { id: 'allees', nom: 'Allées et accès', categorie: 'BTP - Extérieur' },

//   // ============================================
//   // BTP - SPÉCIALISÉS
//   // ============================================
//   { id: 'assainissement', nom: 'Assainissement', categorie: 'BTP - Spécialisé' },
//   { id: 'forage', nom: 'Forage', categorie: 'BTP - Spécialisé' },
//   { id: 'ramonage', nom: 'Ramonage', categorie: 'BTP - Spécialisé' },
//   { id: 'domotique', nom: 'Domotique', categorie: 'BTP - Spécialisé' },
//   { id: 'alarme', nom: 'Alarme et sécurité', categorie: 'BTP - Spécialisé' },
//   { id: 'antenne', nom: 'Antenne et parabole', categorie: 'BTP - Spécialisé' },
//   { id: 'panneau-solaire', nom: 'Panneaux solaires', categorie: 'BTP - Spécialisé' },
//   { id: 'pompe-chaleur', nom: 'Pompe à chaleur', categorie: 'BTP - Spécialisé' },
//   { id: 'ventilation', nom: 'Ventilation VMC', categorie: 'BTP - Spécialisé' },

//   // ============================================
//   // BTP - RÉNOVATION
//   // ============================================
//   { id: 'renovation-complete', nom: 'Rénovation complète', categorie: 'BTP - Rénovation' },
//   { id: 'renovation-appartement', nom: 'Rénovation appartement', categorie: 'BTP - Rénovation' },
//   { id: 'renovation-maison', nom: 'Rénovation maison', categorie: 'BTP - Rénovation' },
//   { id: 'renovation-salle-bain', nom: 'Rénovation salle de bain', categorie: 'BTP - Rénovation' },
//   { id: 'renovation-cuisine', nom: 'Rénovation cuisine', categorie: 'BTP - Rénovation' },
//   { id: 'renovation-energetique', nom: 'Rénovation énergétique', categorie: 'BTP - Rénovation' },

//   // ============================================
//   // AUTOMOBILE
//   // ============================================
//   { id: 'garage', nom: 'Garage automobile', categorie: 'Automobile' },
//   { id: 'carrosserie', nom: 'Carrosserie', categorie: 'Automobile' },
//   { id: 'peinture-auto', nom: 'Peinture automobile', categorie: 'Automobile' },
//   { id: 'mecanique', nom: 'Mécanique', categorie: 'Automobile' },
//   { id: 'pneumatique', nom: 'Pneumatique', categorie: 'Automobile' },
//   { id: 'pare-brise', nom: 'Pare-brise', categorie: 'Automobile' },
//   { id: 'controle-technique', nom: 'Contrôle technique', categorie: 'Automobile' },
//   { id: 'depannage-auto', nom: 'Dépannage automobile', categorie: 'Automobile' },
//   { id: 'lavage-auto', nom: 'Lavage automobile', categorie: 'Automobile' },
//   { id: 'vente-voiture', nom: 'Vente de voitures', categorie: 'Automobile' },

//   // ============================================
//   // SANTÉ
//   // ============================================
//   { id: 'medecin', nom: 'Médecin généraliste', categorie: 'Santé' },
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

//   // ============================================
//   // SERVICES À LA PERSONNE
//   // ============================================
//   { id: 'coiffeur', nom: 'Coiffeur', categorie: 'Services à la personne' },
//   { id: 'esthetique', nom: 'Esthétique', categorie: 'Services à la personne' },
//   { id: 'massage', nom: 'Massage', categorie: 'Services à la personne' },
//   { id: 'manucure', nom: 'Manucure', categorie: 'Services à la personne' },
//   { id: 'spa', nom: 'Spa', categorie: 'Services à la personne' },
//   { id: 'tatouage', nom: 'Tatouage', categorie: 'Services à la personne' },
//   { id: 'pressing', nom: 'Pressing', categorie: 'Services à la personne' },
//   { id: 'cordonnerie', nom: 'Cordonnerie', categorie: 'Services à la personne' },
//   { id: 'retouche', nom: 'Retouche vêtements', categorie: 'Services à la personne' },

//   // ============================================
//   // RESTAURATION
//   // ============================================
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

//   // ============================================
//   // ALIMENTATION
//   // ============================================
//   { id: 'boulangerie', nom: 'Boulangerie', categorie: 'Alimentation' },
//   { id: 'patisserie', nom: 'Pâtisserie', categorie: 'Alimentation' },
//   { id: 'boucherie', nom: 'Boucherie', categorie: 'Alimentation' },
//   { id: 'charcuterie', nom: 'Charcuterie', categorie: 'Alimentation' },
//   { id: 'poissonnerie', nom: 'Poissonnerie', categorie: 'Alimentation' },
//   { id: 'fromagerie', nom: 'Fromagerie', categorie: 'Alimentation' },
//   { id: 'primeur', nom: 'Primeur', categorie: 'Alimentation' },
//   { id: 'epicerie', nom: 'Épicerie', categorie: 'Alimentation' },
//   { id: 'superette', nom: 'Supérette', categorie: 'Alimentation' },
//   { id: 'cave', nom: 'Cave à vin', categorie: 'Alimentation' },
//   { id: 'chocolaterie', nom: 'Chocolaterie', categorie: 'Alimentation' },

//   // ============================================
//   // IMMOBILIER
//   // ============================================
//   { id: 'agence-immobiliere', nom: 'Agence immobilière', categorie: 'Immobilier' },
//   { id: 'syndic', nom: 'Syndic de copropriété', categorie: 'Immobilier' },
//   { id: 'gestion-locative', nom: 'Gestion locative', categorie: 'Immobilier' },
//   { id: 'expert-immobilier', nom: 'Expert immobilier', categorie: 'Immobilier' },
//   { id: 'promoteur', nom: 'Promoteur immobilier', categorie: 'Immobilier' },
//   { id: 'home-staging', nom: 'Home staging', categorie: 'Immobilier' },

//   // ============================================
//   // SERVICES PROFESSIONNELS
//   // ============================================
//   { id: 'avocat', nom: 'Avocat', categorie: 'Services professionnels' },
//   { id: 'notaire', nom: 'Notaire', categorie: 'Services professionnels' },
//   { id: 'expert-comptable', nom: 'Expert-comptable', categorie: 'Services professionnels' },
//   { id: 'assurance', nom: 'Assurance', categorie: 'Services professionnels' },
//   { id: 'banque', nom: 'Banque', categorie: 'Services professionnels' },
//   { id: 'architecte', nom: 'Architecte', categorie: 'Services professionnels' },
//   { id: 'geometre', nom: 'Géomètre', categorie: 'Services professionnels' },
//   { id: 'huissier', nom: 'Huissier', categorie: 'Services professionnels' },

//   // ============================================
//   // INFORMATIQUE & TÉLÉCOMS
//   // ============================================
//   { id: 'informatique', nom: 'Informatique', categorie: 'Informatique' },
//   { id: 'reparation-pc', nom: 'Réparation ordinateur', categorie: 'Informatique' },
//   { id: 'reparation-smartphone', nom: 'Réparation smartphone', categorie: 'Informatique' },
//   { id: 'reseau', nom: 'Réseau informatique', categorie: 'Informatique' },
//   { id: 'web-agency', nom: 'Agence web', categorie: 'Informatique' },
//   { id: 'telephonie', nom: 'Téléphonie', categorie: 'Informatique' },

//   // ============================================
//   // COMMERCE
//   // ============================================
//   { id: 'vetements', nom: 'Vêtements', categorie: 'Commerce' },
//   { id: 'chaussures', nom: 'Chaussures', categorie: 'Commerce' },
//   { id: 'bijouterie', nom: 'Bijouterie', categorie: 'Commerce' },
//   { id: 'horlogerie', nom: 'Horlogerie', categorie: 'Commerce' },
//   { id: 'maroquinerie', nom: 'Maroquinerie', categorie: 'Commerce' },
//   { id: 'parfumerie', nom: 'Parfumerie', categorie: 'Commerce' },
//   { id: 'librairie', nom: 'Librairie', categorie: 'Commerce' },
//   { id: 'papeterie', nom: 'Papeterie', categorie: 'Commerce' },
//   { id: 'jouets', nom: 'Jouets', categorie: 'Commerce' },
//   { id: 'electromenager', nom: 'Électroménager', categorie: 'Commerce' },
//   { id: 'meuble', nom: 'Meubles', categorie: 'Commerce' },
//   { id: 'decoration-maison', nom: 'Décoration maison', categorie: 'Commerce' },
//   { id: 'bricolage', nom: 'Bricolage', categorie: 'Commerce' },
//   { id: 'jardinerie', nom: 'Jardinerie', categorie: 'Commerce' },
//   { id: 'animalerie', nom: 'Animalerie', categorie: 'Commerce' },
//   { id: 'fleuriste', nom: 'Fleuriste', categorie: 'Commerce' },

//   // ============================================
//   // TRANSPORT & LOGISTIQUE
//   // ============================================
//   { id: 'demenagement', nom: 'Déménagement', categorie: 'Transport' },
//   { id: 'transport', nom: 'Transport', categorie: 'Transport' },
//   { id: 'taxi', nom: 'Taxi', categorie: 'Transport' },
//   { id: 'vtc', nom: 'VTC', categorie: 'Transport' },
//   { id: 'ambulance', nom: 'Ambulance', categorie: 'Transport' },
//   { id: 'location-vehicule', nom: 'Location de véhicules', categorie: 'Transport' },
//   { id: 'coursier', nom: 'Coursier', categorie: 'Transport' },

//   // ============================================
//   // NETTOYAGE & ENTRETIEN
//   // ============================================
//   { id: 'nettoyage', nom: 'Nettoyage', categorie: 'Nettoyage' },
//   { id: 'menage', nom: 'Ménage', categorie: 'Nettoyage' },
//   { id: 'vitrerie-nettoyage', nom: 'Nettoyage de vitres', categorie: 'Nettoyage' },
//   { id: 'desinfection', nom: 'Désinfection', categorie: 'Nettoyage' },
//   { id: 'debarras', nom: 'Débarras', categorie: 'Nettoyage' },

//   // ============================================
//   // SÉCURITÉ
//   // ============================================
//   { id: 'serrurier', nom: 'Serrurier', categorie: 'Sécurité' },
//   { id: 'vigile', nom: 'Sécurité privée', categorie: 'Sécurité' },
//   { id: 'videosurveillance', nom: 'Vidéosurveillance', categorie: 'Sécurité' },

//   // ============================================
//   // FORMATION & ÉDUCATION
//   // ============================================
//   { id: 'auto-ecole', nom: 'Auto-école', categorie: 'Formation' },
//   { id: 'cours-particuliers', nom: 'Cours particuliers', categorie: 'Formation' },
//   { id: 'formation', nom: 'Centre de formation', categorie: 'Formation' },
//   { id: 'creche', nom: 'Crèche', categorie: 'Formation' },
//   { id: 'garde-enfant', nom: 'Garde d\'enfants', categorie: 'Formation' },

//   // ============================================
//   // LOISIRS & TOURISME
//   // ============================================
//   { id: 'hotel', nom: 'Hôtel', categorie: 'Tourisme' },
//   { id: 'gite', nom: 'Gîte', categorie: 'Tourisme' },
//   { id: 'camping', nom: 'Camping', categorie: 'Tourisme' },
//   { id: 'agence-voyage', nom: 'Agence de voyage', categorie: 'Tourisme' },
//   { id: 'musee', nom: 'Musée', categorie: 'Tourisme' },
//   { id: 'salle-sport', nom: 'Salle de sport', categorie: 'Loisirs' },
//   { id: 'piscine-publique', nom: 'Piscine', categorie: 'Loisirs' },
//   { id: 'cinema', nom: 'Cinéma', categorie: 'Loisirs' },
//   { id: 'theatre', nom: 'Théâtre', categorie: 'Loisirs' },

//   // ============================================
//   // ÉVÉNEMENTIEL
//   // ============================================
//   { id: 'photographe', nom: 'Photographe', categorie: 'Événementiel' },
//   { id: 'videaste', nom: 'Vidéaste', categorie: 'Événementiel' },
//   { id: 'dj', nom: 'DJ', categorie: 'Événementiel' },
//   { id: 'location-materiel', nom: 'Location de matériel', categorie: 'Événementiel' },
//   { id: 'organisation-evenement', nom: 'Organisation événement', categorie: 'Événementiel' },
//   { id: 'wedding-planner', nom: 'Wedding planner', categorie: 'Événementiel' },

//   // ============================================
//   // AUTRES SERVICES
//   // ============================================
//   { id: 'imprimerie', nom: 'Imprimerie', categorie: 'Autres' },
//   { id: 'publicite', nom: 'Publicité', categorie: 'Autres' },
//   { id: 'graphiste', nom: 'Graphiste', categorie: 'Autres' },
//   { id: 'traduction', nom: 'Traduction', categorie: 'Autres' },
//   { id: 'marquage-publicitaire', nom: 'Marquage publicitaire', categorie: 'Autres' },
// ];



export const ACTIVITE_TO_GOOGLE_TYPE: Record<string, string | null> = {
  // ======================
  // BTP – GROS ŒUVRE
  // ======================
  'maçon': 'masonry-contractor',
  'terrassement': 'excavating-contractor',
  'demolition': 'demolition-contractor',
  'charpentier': 'carpenter',
  'couvreur': 'roofer',
  'zingueur': 'roofer',
  'construction-bois': 'general-contractor',
  'constructeur-maison': 'general-contractor',

  // ======================
  // BTP – SECOND ŒUVRE
  // ======================
  'plombier': 'plumber',
  'plombier-chauffagiste': 'plumber',
  'electricien': 'electrician',
  'chauffagiste': 'hvac-contractor',
  'climatisation': 'hvac-contractor',
  'menuisier': 'carpenter',
  'menuiserie-alu': 'carpenter',
  'menuiserie-pvc': 'carpenter',
  'plaquiste': 'drywall-contractor',
  'peintre': 'painter',
  'carreleur': 'tile-contractor',
  'parqueteur': 'flooring-contractor',
  'platrier': 'plasterer',
  'isolation': 'insulation-contractor',
  'etancheite': 'waterproofing-contractor',
  'vitrerie': 'glass-repair',
  'miroiterie': 'glass-repair',

  // ======================
  // EXTÉRIEUR
  // ======================
  'paysagiste': 'landscaper',
  'jardinier': 'gardener',
  'elagage': 'tree-service',
  'piscine': 'swimming-pool-contractor',
  'cloture': 'fence-contractor',
  'portail': 'fence-contractor',
  'pergola': 'deck-builder',
  'terrasse': 'deck-builder',
  'allees': 'paving-contractor',

  // ======================
  // SPÉCIALISÉS
  // ======================
  'assainissement': 'septic-system-service',
  'forage': 'drilling-contractor',
  'ramonage': 'chimney-sweep',
  'domotique': 'home-automation',
  'alarme': 'security-system-supplier',
  'antenne': 'antenna-service',
  'panneau-solaire': 'solar-energy-company',
  'pompe-chaleur': 'hvac-contractor',
  'ventilation': 'hvac-contractor',

  // ======================
  // AUTOMOBILE
  // ======================
  'garage': 'auto-repair',
  'carrosserie': 'auto-body-shop',
  'peinture-auto': 'auto-body-shop',
  'mecanique': 'auto-repair',
  'pneumatique': 'tire-shop',
  'pare-brise': 'auto-glass-service',
  'controle-technique': 'car-inspection-station',
  'depannage-auto': 'towing-service',
  'lavage-auto': 'car-wash',
  'vente-voiture': 'car-dealer',

  // ======================
  // SANTÉ
  // ======================
  'medecin': 'doctor',
  'dentiste': 'dentist',
  'pharmacie': 'pharmacy',
  'kine': 'physical-therapist',
  'osteopathe': 'osteopath',
  'infirmier': 'nursing-agency',
  'podologue': 'podiatrist',
  'opticien': 'optician',
  'audioprothesiste': 'hearing-aid-store',
  'psychologue': 'psychologist',
  'veterinaire': 'veterinary-care',

  // ======================
  // SERVICES
  // ======================
  'coiffeur': 'hair-salon',
  'esthetique': 'beauty-salon',
  'massage': 'massage-therapist',
  'manucure': 'nail-salon',
  'spa': 'spa',
  'tatouage': 'tattoo-shop',
  'pressing': 'laundry',
  'cordonnerie': 'shoe-repair',
  'retouche': 'tailor',

  // ======================
  // RESTAURATION
  // ======================
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

  // ======================
  // IMMOBILIER
  // ======================
  'agence-immobiliere': 'real-estate-agency',
  'syndic': 'property-management',
  'gestion-locative': 'property-management',
  'expert-immobilier': 'real-estate-appraiser',
  'promoteur': 'real-estate-developer',
  'home-staging': 'interior-designer',

  // ======================
  // PRO
  // ======================
  'avocat': 'lawyer',
  'notaire': 'notary-public',
  'expert-comptable': 'accountant',
  'assurance': 'insurance-agency',
  'banque': 'bank',
  'architecte': 'architect',
  'geometre': 'land-surveyor',
  'huissier': 'bailiff',

  // ======================
  // INFORMATIQUE
  // ======================
  'informatique': 'it-services',
  'reparation-pc': 'computer-repair',
  'reparation-smartphone': 'mobile-phone-repair',
  'reseau': 'it-services',
  'web-agency': 'software-company',
  'telephonie': 'telecommunications-service',

  // ======================
  // TRANSPORT
  // ======================
  'demenagement': 'moving-company',
  'transport': 'logistics-service',
  'taxi': 'taxi-service',
  'vtc': 'ride-hailing-service',
  'ambulance': 'ambulance-service',
  'location-vehicule': 'car-rental',
  'coursier': 'courier-service',

  // ======================
  // NETTOYAGE
  // ======================
  'nettoyage': 'cleaning-service',
  'menage': 'house-cleaning-service',
  'vitrerie-nettoyage': 'window-cleaning-service',
  'desinfection': 'sanitation-service',
  'debarras': 'waste-removal',

  // ======================
  // SÉCURITÉ
  // ======================
  'serrurier': 'locksmith',
  'vigile': 'security-service',
  'videosurveillance': 'security-system-supplier',
}

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

export const mockActivites: ActiviteOption[] = Object.keys(
  ACTIVITE_TO_GOOGLE_TYPE
).map((key) => ({
  id: key,
  nom: key
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase()),
  categorie: 'BTP - Gros œuvre'
}))