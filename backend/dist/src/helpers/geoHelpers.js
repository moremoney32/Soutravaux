"use strict";
// src/services/geo.helper.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRegions = getAllRegions;
exports.getDepartementsFromRegion = getDepartementsFromRegion;
exports.getVillesFromDepartement = getVillesFromDepartement;
exports.getVillesFromMultipleDepartements = getVillesFromMultipleDepartements;
const axios_1 = __importDefault(require("axios"));
const GEO_API_BASE = 'https://geo.api.gouv.fr';
// ============================================
// RÉCUPÉRER TOUTES LES RÉGIONS
// ============================================
async function getAllRegions() {
    try {
        const response = await axios_1.default.get(`${GEO_API_BASE}/regions`);
        return response.data.map((r) => ({
            code: r.code,
            nom: r.nom
        }));
    }
    catch (error) {
        console.error('❌ Erreur récupération régions:', error);
        return [];
    }
}
// ============================================
// RÉCUPÉRER DÉPARTEMENTS D'UNE RÉGION
// ============================================
async function getDepartementsFromRegion(regionCode) {
    try {
        const response = await axios_1.default.get(`${GEO_API_BASE}/regions/${regionCode}/departements`);
        return response.data.map((d) => ({
            code: d.code,
            nom: d.nom
        }));
    }
    catch (error) {
        console.error(`❌ Erreur récupération départements région ${regionCode}:`, error);
        return [];
    }
}
// ============================================
// RÉCUPÉRER VILLES D'UN DÉPARTEMENT
// ============================================
async function getVillesFromDepartement(departementCode) {
    try {
        const response = await axios_1.default.get(`${GEO_API_BASE}/departements/${departementCode}/communes?fields=nom,code,population&limit=100`);
        // Trier par population décroissante et prendre les 20 plus grandes
        const villes = response.data
            .sort((a, b) => (b.population || 0) - (a.population || 0))
            .slice(0, 20)
            .map((v) => ({
            code: v.code,
            nom: v.nom
        }));
        return villes;
    }
    catch (error) {
        console.error(`❌ Erreur récupération villes département ${departementCode}:`, error);
        return [];
    }
}
// ============================================
// RÉCUPÉRER VILLES DE PLUSIEURS DÉPARTEMENTS
// ============================================
async function getVillesFromMultipleDepartements(departementCodes) {
    const allVilles = [];
    for (const deptCode of departementCodes) {
        const villes = await getVillesFromDepartement(deptCode);
        allVilles.push(...villes.map(v => ({ ...v, departement: deptCode })));
    }
    return allVilles;
}
//# sourceMappingURL=geoHelpers.js.map