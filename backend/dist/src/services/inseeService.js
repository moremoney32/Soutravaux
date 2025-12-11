"use strict";
// src/services/inseeService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiretFromInsee = getSiretFromInsee;
exports.clearInseeCache = clearInseeCache;
const axios_1 = __importDefault(require("axios"));
const parralel_1 = require("./parralel");
// Cache en mémoire
const inseeCache = new Map();
// RÉCUPÉRER SIRET + ADRESSE VIA API INSEE
async function getSiretFromInsee(nomSociete) {
    if (!nomSociete || nomSociete.length < 3) {
        return {};
    }
    // Vérifier le cache
    const cacheKey = nomSociete.toLowerCase().trim();
    if (inseeCache.has(cacheKey)) {
        console.log(`Cache hit: ${nomSociete}`);
        return inseeCache.get(cacheKey);
    }
    console.log(`Recherche SIRET + Adresse: ${nomSociete}`);
    const result = await (0, parralel_1.retryAsync)(async () => {
        const apiKey = process.env.INSEE_API_KEY;
        if (!apiKey) {
            console.error('INSEE_API_KEY manquante');
            return {};
        }
        const query = encodeURIComponent(`denominationUniteLegale:"${nomSociete}*" OR nomUsageUniteLegale:"${nomSociete}*"`);
        const response = await axios_1.default.get(`https://api.insee.fr/api-sirene/3.11/siret?q=${query}&nombre=1`, {
            headers: {
                'X-INSEE-Api-Key-Integration': apiKey
            },
            timeout: 5000
        });
        const etablissements = response.data.etablissements;
        if (!etablissements || etablissements.length === 0) {
            console.log(`❌ Aucun SIRET: ${nomSociete}`);
            return {};
        }
        const etablissement = etablissements[0];
        const uniteLegale = etablissement.uniteLegale;
        const adresseEtab = etablissement.adresseEtablissement;
        const inseeResult = {
            siret: etablissement.siret,
            siren: etablissement.siren,
            etat_administratif: etablissement.etatAdministratifEtablissement
        };
        //EXTRACTION ADRESSE COMPLÈTE INSEE
        if (adresseEtab) {
            // Composer l'adresse
            const numeroVoie = adresseEtab.numeroVoieEtablissement || '';
            const typeVoie = adresseEtab.typeVoieEtablissement || '';
            const libelleVoie = adresseEtab.libelleVoieEtablissement || '';
            const complementAdresse = adresseEtab.complementAdresseEtablissement || '';
            // Construire l'adresse complète
            const adresseParts = [
                numeroVoie,
                typeVoie,
                libelleVoie,
                complementAdresse
            ].filter(part => part).join(' ');
            if (adresseParts) {
                inseeResult.adresse_etablissement = adresseParts.trim();
            }
            // Code postal
            if (adresseEtab.codePostalEtablissement) {
                inseeResult.code_postal_etablissement = adresseEtab.codePostalEtablissement;
            }
            // Ville
            if (adresseEtab.libelleCommuneEtablissement) {
                inseeResult.ville_etablissement = adresseEtab.libelleCommuneEtablissement;
            }
        }
        // Nom du gérant (entreprises individuelles)
        if (uniteLegale?.categorieEntreprise === 'PME' ||
            uniteLegale?.categorieEntreprise === 'ETI') {
            const nomGerant = uniteLegale.nomUsageUniteLegale ||
                uniteLegale.prenomUsuelUniteLegale;
            if (nomGerant) {
                inseeResult.nom_gerant = nomGerant;
            }
        }
        console.log(`SIRET + Adresse trouvés: ${inseeResult.siret} - ${inseeResult.adresse_etablissement}`);
        return inseeResult;
    }, 3, 1000);
    // Mettre en cache
    if (result && result.siret) {
        inseeCache.set(cacheKey, result);
    }
    return result || {};
}
// VIDER LE CACHE
function clearInseeCache() {
    inseeCache.clear();
    console.log('Cache INSEE vidé');
}
//# sourceMappingURL=inseeService.js.map