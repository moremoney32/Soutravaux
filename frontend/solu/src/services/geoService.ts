// src/services/geoService.ts

import axios from 'axios';

const GEO_API_BASE = 'https://geo.api.gouv.fr';

// ============================================
// TYPES (correspondent à tes interfaces)
// ============================================
export interface Region {
  code: string;
  nom: string;
}

export interface Departement {
  code: string;
  nom: string;
  region: string;
}

export interface Ville {
  code: string;
  nom: string;
  departement: string;
  region: string;
  population?: number;
}

// ============================================
// RÉCUPÉRER TOUTES LES RÉGIONS
// ============================================
export async function getAllRegions(): Promise<Region[]> {
  try {
    const response = await axios.get(`${GEO_API_BASE}/regions`);
    
    return response.data.map((r: any) => ({
      code: r.code,
      nom: r.nom
    }));
  } catch (error) {
    console.error('❌ Erreur récupération régions:', error);
    return [];
  }
}

// ============================================
// RÉCUPÉRER DÉPARTEMENTS D'UNE RÉGION
// ============================================
export async function getDepartementsFromRegion(regionCode: string): Promise<Departement[]> {
  try {
    const response = await axios.get(`${GEO_API_BASE}/regions/${regionCode}/departements`);
    
    return response.data.map((d: any) => ({
      code: d.code,
      nom: d.nom,
      region: regionCode
    }));
  } catch (error) {
    console.error(`❌ Erreur récupération départements région ${regionCode}:`, error);
    return [];
  }
}

// ============================================
// RÉCUPÉRER VILLES D'UN DÉPARTEMENT
// ============================================
export async function getVillesFromDepartement(
  departementCode: string,
  regionCode: string
): Promise<Ville[]> {
  try {
    // ⭐ Utiliser l'endpoint "communes" (communes = villes)
    const response = await axios.get(
      `${GEO_API_BASE}/departements/${departementCode}/communes`,
      {
        params: {
          fields: 'nom,code,population',
          limit: 1000  // Récupérer toutes les communes
        }
      }
    );
    
    // Trier par population décroissante
    const villes = response.data
      .sort((a: any, b: any) => (b.population || 0) - (a.population || 0))
      .map((v: any) => ({
        code: v.code,
        nom: v.nom,
        departement: departementCode,
        region: regionCode,
        population: v.population
      }));
    
    return villes;
  } catch (error) {
    console.error(`❌ Erreur récupération villes département ${departementCode}:`, error);
    return [];
  }
}

// ============================================
// RÉCUPÉRER VILLES DE PLUSIEURS DÉPARTEMENTS
// ============================================
export async function getVillesFromMultipleDepartements(
  departements: Array<{ code: string, region: string }>
): Promise<Ville[]> {
  const allVilles: Ville[] = [];
  
  // Exécuter les requêtes en parallèle pour plus de rapidité
  const promises = departements.map(dept => 
    getVillesFromDepartement(dept.code, dept.region)
  );
  
  const results = await Promise.all(promises);
  
  // Fusionner tous les résultats
  results.forEach(villes => {
    allVilles.push(...villes);
  });
  
  // Trier par population décroissante
  return allVilles.sort((a, b) => (b.population || 0) - (a.population || 0));
}