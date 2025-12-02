// src/services/geo.helper.service.ts

import axios from 'axios';

const GEO_API_BASE = 'https://geo.api.gouv.fr';

// ============================================
// RÉCUPÉRER TOUTES LES RÉGIONS
// ============================================
export async function getAllRegions(): Promise<Array<{ code: string, nom: string }>> {
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
export async function getDepartementsFromRegion(regionCode: string): Promise<Array<{ code: string, nom: string }>> {
  try {
    const response = await axios.get(`${GEO_API_BASE}/regions/${regionCode}/departements`);
    return response.data.map((d: any) => ({
      code: d.code,
      nom: d.nom
    }));
  } catch (error) {
    console.error(`❌ Erreur récupération départements région ${regionCode}:`, error);
    return [];
  }
}

// ============================================
// RÉCUPÉRER VILLES D'UN DÉPARTEMENT
// ============================================
export async function getVillesFromDepartement(departementCode: string): Promise<Array<{ code: string, nom: string }>> {
  try {
    const response = await axios.get(
      `${GEO_API_BASE}/departements/${departementCode}/communes?fields=nom,code,population&limit=100`
    );
    
    // Trier par population décroissante et prendre les 20 plus grandes
    const villes = response.data
      .sort((a: any, b: any) => (b.population || 0) - (a.population || 0))
      .slice(0, 20)
      .map((v: any) => ({
        code: v.code,
        nom: v.nom
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
  departementCodes: string[]
): Promise<Array<{ code: string, nom: string, departement: string }>> {
  const allVilles: Array<{ code: string, nom: string, departement: string }> = [];
  
  for (const deptCode of departementCodes) {
    const villes = await getVillesFromDepartement(deptCode);
    allVilles.push(...villes.map(v => ({ ...v, departement: deptCode })));
  }
  
  return allVilles;
}