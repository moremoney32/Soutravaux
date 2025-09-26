import { Request, Response } from "express";
import axios from "axios";

export const SearchCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
        const siret = req.query.siret as string;

        if (!siret || siret.length < 3) {
            res.status(400).json({ error: "Veuillez saisir au moins 3 caractères." });
            return;
        }

        const apiKey = process.env.INSEE_API_KEY;
        // Encodage du paramètre
        const query = encodeURIComponent(`siret:${siret}*`);

        const response = await axios.get(
            `https://api.insee.fr/api-sirene/3.11/siret?q=${query}`,
            {
                headers: {
                    "X-INSEE-Api-Key-Integration": apiKey,
                },
            }
        );

        const results = response.data.etablissements?.map((e: any) => ({
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
    } catch (err: any) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: "Erreur lors de la recherche d'entreprises" });
    }
};