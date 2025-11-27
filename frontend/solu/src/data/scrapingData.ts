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

export const mockActivites: ActiviteOption[] = [
  { id: 'restaurant', nom: 'Restaurant', categorie: 'Restauration' },
  { id: 'plombier', nom: 'Plombier', categorie: 'BTP' },
  { id: 'electricien', nom: 'Électricien', categorie: 'BTP' },
  { id: 'menuisier', nom: 'Menuisier', categorie: 'BTP' },
  { id: 'peintre', nom: 'Peintre en bâtiment', categorie: 'BTP' },
  { id: 'maçon', nom: 'Maçon', categorie: 'BTP' },
  { id: 'couvreur', nom: 'Couvreur', categorie: 'BTP' },
  { id: 'chauffagiste', nom: 'Chauffagiste', categorie: 'BTP' },
  { id: 'boulangerie', nom: 'Boulangerie', categorie: 'Alimentation' },
  { id: 'coiffeur', nom: 'Coiffeur', categorie: 'Services' },
  { id: 'garage', nom: 'Garage automobile', categorie: 'Automobile' },
  { id: 'pharmacie', nom: 'Pharmacie', categorie: 'Santé' }
];

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