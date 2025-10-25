import { Request, Response } from "express";
import axios from "axios";

// export const SearchCompanies = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const siret = req.query.siret as string;

//         if (!siret || siret.length < 3) {
//             res.status(400).json({ error: "Veuillez saisir au moins 3 caractères." });
//             return;
//         }

//         const apiKey = process.env.INSEE_API_KEY;
//         // Encodage du paramètre
//         const query = encodeURIComponent(`siret:${siret}*`);

//         const response = await axios.get(
//             `https://api.insee.fr/api-sirene/3.11/siret?q=${query}`,
//             {
//                 headers: {
//                     "X-INSEE-Api-Key-Integration": apiKey,
//                 },
//             }
//         );
//         console.log(response)
     

//         const results = response.data.etablissements?.map((e: any) => ({
//             nom: e.uniteLegale?.denominationUniteLegale,
//             siren: e.siren,
//             siret: e.siret,
//             activite: e.uniteLegale?.activitePrincipaleUniteLegale,
//             rue: e.adresseEtablissement?.typeVoieEtablissement,
//             ville: e.adresseEtablissement?.libelleVoieEtablissement,
//             cp: e.adresseEtablissement?.numeroVoieEtablissement,
//             libelle: e.adresseEtablissement?.libelleCommuneEtablissement,
//             type: e.adresseEtablissement?.typeVoieEtablissement,
//             code: e.adresseEtablissement?.codePostalEtablissement,
//             pays: e.adresseEtablissement?.libellePaysEtablissement,
//         })) || [];

//         res.json(results);
//     } catch (err: any) {
//         console.error(err.response?.data || err.message);
//         res.status(500).json({ error: "Erreur lors de la recherche d'entreprises" });
//     }
// };

export const SearchCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
        const { siret, nom } = req.query;
        const searchTerm = (siret as string) || (nom as string);

        if (!searchTerm || searchTerm.length < 3) {
            res.status(400).json({ error: "Veuillez saisir au moins 3 caractères." });
            return;
        }

        const apiKey = process.env.INSEE_API_KEY;
        let query: string;
        
        if (siret) {
            query = encodeURIComponent(`siret:${searchTerm}*`);
        } else {
            query = encodeURIComponent(`denominationUniteLegale:"${searchTerm}"* OR nomUsageUniteLegale:"${searchTerm}"*`);
        }

        const response = await axios.get(
            `https://api.insee.fr/api-sirene/3.11/siret?q=${query}&nombre=50`,
            {
                headers: {
                    "X-INSEE-Api-Key-Integration": apiKey,
                },
            }
        );

        const results = response.data.etablissements?.map((e: any) => ({
            nom: e.uniteLegale?.denominationUniteLegale || e.uniteLegale?.nomUsageUniteLegale,
            siren: e.siren,
            siret: e.siret,
            activite: e.uniteLegale?.activitePrincipaleUniteLegale,
            adresse: `${e.adresseEtablissement?.numeroVoieEtablissement || ''} ${e.adresseEtablissement?.typeVoieEtablissement || ''} ${e.adresseEtablissement?.libelleVoieEtablissement || ''}`.trim(),
            ville: e.adresseEtablissement?.libelleCommuneEtablissement,
            codePostal: e.adresseEtablissement?.codePostalEtablissement,
            pays: e.adresseEtablissement?.libellePaysEtablissement,
            etat: e.etatAdministratifEtablissement
        })) || [];

        res.json(results);
    } catch (err: any) {
        console.error("Erreur API INSEE:", err.response?.data || err.message);
        res.status(500).json({ error: "Erreur lors de la recherche d'entreprises" });
    }
};