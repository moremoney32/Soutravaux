// import { Request, Response } from "express";
// import axios from "axios";

// export const SearchCompanies = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { siret, nom } = req.query;
//         const searchTerm = (siret as string) || (nom as string);

//         if (!searchTerm || searchTerm.length < 3) {
//             res.status(400).json({ error: "Veuillez saisir au moins 3 caractères." });
//             return;
//         }

//         const apiKey = process.env.INSEE_API_KEY;
//         let query: string;
        
//         if (siret) {
//             // Recherche SIRET : garde le wildcard pour la partial search
//             query = encodeURIComponent(`siret:${searchTerm}*`);
//         } else {
//             query = encodeURIComponent(`denominationUniteLegale:"${searchTerm}*" OR nomUsageUniteLegale:"${searchTerm}*"`);
//         }

//         const response = await axios.get(
//             `https://api.insee.fr/api-sirene/3.11/siret?q=${query}&nombre=20`, // Limite à 20 résultats
//             {
//                 headers: {
//                     "X-INSEE-Api-Key-Integration":apiKey,
//                 },
//             }
//         );

//         // FILTRAGE SUPPLÉMENTAIRE côté backend
//         let results = response.data.etablissements?.map((e: any) => ({
//             nom: e.uniteLegale?.denominationUniteLegale || e.uniteLegale?.nomUsageUniteLegale,
//             siren: e.siren,
//             siret: e.siret,
//             activite: e.uniteLegale?.activitePrincipaleUniteLegale,
//             adresse: `${e.adresseEtablissement?.numeroVoieEtablissement || ''} ${e.adresseEtablissement?.typeVoieEtablissement || ''} ${e.adresseEtablissement?.libelleVoieEtablissement || ''}`.trim(),
//             ville: e.adresseEtablissement?.libelleCommuneEtablissement,
//             codePostal: e.adresseEtablissement?.codePostalEtablissement,
//             pays: e.adresseEtablissement?.libellePaysEtablissement,
//             etat: e.etatAdministratifEtablissement
//         })) || [];

//         // FILTRE SUPPLÉMENTAIRE pour les recherches par nom
//         if (nom) {
//             const searchLower = searchTerm.toLowerCase();
//             results = results.filter((company: any) => 
//                 company.nom?.toLowerCase().includes(searchLower)
//             );
//         }

//         res.json(results);
//     } catch (err: any) {
//         console.error("Erreur API INSEE:", err.response?.data || err.message);
//         res.status(500).json({ error: "Erreur lors de la recherche d'entreprises" });
//     }
// };



import { Request, Response } from "express";
import axios from "axios";

// ✅ FONCTION UTILITAIRE : Nettoyer les valeurs "[ND]" → ""
function cleanInseeValue(value: string | undefined | null): string {
  if (!value || value.trim() === '') {
    return '';
  }
  
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase();
  
  // Détecter "ND", "[ND]", "[ND] [ND]", etc.
  if (upper === 'ND' || 
      upper === '[ND]' || 
      upper.includes('[ND]') ||
      /^\[ND\](\s*\[ND\])*$/.test(trimmed)) {
    return '';
  }
  
  return trimmed;
}

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
            `https://api.insee.fr/api-sirene/3.11/siret?q=${query}&nombre=20`,
            {
                headers: {
                    "X-INSEE-Api-Key-Integration": apiKey,
                },
            }
        );

        // ✅ MAPPING + NETTOYAGE DES "[ND]"
        let results = response.data.etablissements?.map((e: any) => {
            // Extraire les valeurs brutes
            const nom = e.uniteLegale?.denominationUniteLegale || e.uniteLegale?.nomUsageUniteLegale;
            const siren = e.siren;
            const siret = e.siret;
            const activite = e.uniteLegale?.activitePrincipaleUniteLegale;
            const etat = e.etatAdministratifEtablissement;
            
            // Composants de l'adresse
            const numeroVoie = e.adresseEtablissement?.numeroVoieEtablissement;
            const typeVoie = e.adresseEtablissement?.typeVoieEtablissement;
            const libelleVoie = e.adresseEtablissement?.libelleVoieEtablissement;
            const ville = e.adresseEtablissement?.libelleCommuneEtablissement;
            const codePostal = e.adresseEtablissement?.codePostalEtablissement;
            const pays = e.adresseEtablissement?.libellePaysEtablissement;
            
            // ✅ Nettoyer chaque composant de l'adresse
            const numeroVoieCleaned = cleanInseeValue(numeroVoie);
            const typeVoieCleaned = cleanInseeValue(typeVoie);
            const libelleVoieCleaned = cleanInseeValue(libelleVoie);
            
            // Construire l'adresse complète (sans les "[ND]")
            const adresseParts = [
                numeroVoieCleaned,
                typeVoieCleaned,
                libelleVoieCleaned
            ].filter(part => part !== '').join(' ');
            
            return {
                nom: cleanInseeValue(nom),
                siren: cleanInseeValue(siren),
                siret: cleanInseeValue(siret),
                activite: cleanInseeValue(activite),
                adresse: adresseParts.trim(), // ✅ Adresse nettoyée
                ville: cleanInseeValue(ville),
                codePostal: cleanInseeValue(codePostal),
                pays: cleanInseeValue(pays),
                etat: cleanInseeValue(etat)
            };
        }) || [];

        // FILTRE SUPPLÉMENTAIRE pour les recherches par nom
        if (nom) {
            const searchLower = searchTerm.toLowerCase();
            results = results.filter((company: any) => 
                company.nom?.toLowerCase().includes(searchLower)
            );
        }

        console.log(`✅ ${results.length} entreprise(s) trouvée(s) (nettoyées)`);
        
        res.json(results);
        
    } catch (err: any) {
        console.error("❌ Erreur API INSEE:", err.response?.data || err.message);
        res.status(500).json({ error: "Erreur lors de la recherche d'entreprises" });
    }
};