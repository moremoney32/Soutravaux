import { Request, Response } from "express";
import axios from "axios";

export const searchCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
        const nom = req.query.nom as string;

        if (!nom || nom.length < 3) {
            res.status(400).json({ error: "Veuillez saisir au moins 3 caractères." });
            return;
        }

        const apiKey = process.env.INSEE_API_KEY;
        // Encodage du paramètre
        const query = encodeURIComponent(`denominationUniteLegale:${nom}*`);

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
            ville: e.adresseEtablissement?.libelleCommuneEtablissement,
            cp: e.adresseEtablissement?.codePostalEtablissement,
        })) || [];

        res.json(results);
    } catch (err: any) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: "Erreur lors de la recherche d'entreprises" });
    }
};