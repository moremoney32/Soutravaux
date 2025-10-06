"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchCompanies = void 0;
const axios_1 = __importDefault(require("axios"));
const SearchCompanies = async (req, res) => {
    try {
        const siret = req.query.siret;
        if (!siret || siret.length < 3) {
            res.status(400).json({ error: "Veuillez saisir au moins 3 caractères." });
            return;
        }
        const apiKey = process.env.INSEE_API_KEY;
        // Encodage du paramètre
        const query = encodeURIComponent(`siret:${siret}*`);
        const response = await axios_1.default.get(`https://api.insee.fr/api-sirene/3.11/siret?q=${query}`, {
            headers: {
                "X-INSEE-Api-Key-Integration": apiKey,
            },
        });
        console.log(response.data.etablissements);
        const results = response.data.etablissements?.map((e) => ({
            nom: e.uniteLegale?.denominationUniteLegale,
            siren: e.siren,
            siret: e.siret,
            activite: e.uniteLegale?.activitePrincipaleUniteLegale,
            rue: e.adresseEtablissement?.typeVoieEtablissement,
            ville: e.adresseEtablissement?.libelleVoieEtablissement,
            cp: e.adresseEtablissement?.numeroVoieEtablissement,
            libelle: e.adresseEtablissement?.libelleCommuneEtablissement,
            type: e.adresseEtablissement?.typeVoieEtablissement,
            code: e.adresseEtablissement?.codePostalEtablissement,
            pays: e.adresseEtablissement?.libellePaysEtablissement,
        })) || [];
        res.json(results);
    }
    catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: "Erreur lors de la recherche d'entreprises" });
    }
};
exports.SearchCompanies = SearchCompanies;
//# sourceMappingURL=CompanyController.js.map