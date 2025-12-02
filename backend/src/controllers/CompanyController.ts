import { Request, Response } from "express";
import axios from "axios";

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
            // Recherche SIRET : garde le wildcard pour la partial search
            query = encodeURIComponent(`siret:${searchTerm}*`);
        } else {
            query = encodeURIComponent(`denominationUniteLegale:"${searchTerm}*" OR nomUsageUniteLegale:"${searchTerm}*"`);
        }

        const response = await axios.get(
            `https://api.insee.fr/api-sirene/3.11/siret?q=${query}&nombre=20`, // Limite à 20 résultats
            {
                headers: {
                    "X-INSEE-Api-Key-Integration":apiKey,
                },
            }
        );

        // FILTRAGE SUPPLÉMENTAIRE côté backend
        let results = response.data.etablissements?.map((e: any) => ({
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

        // FILTRE SUPPLÉMENTAIRE pour les recherches par nom
        if (nom) {
            const searchLower = searchTerm.toLowerCase();
            results = results.filter((company: any) => 
                company.nom?.toLowerCase().includes(searchLower)
            );
        }

        res.json(results);
    } catch (err: any) {
        console.error("Erreur API INSEE:", err.response?.data || err.message);
        res.status(500).json({ error: "Erreur lors de la recherche d'entreprises" });
    }
};