// /**
//  * 🎯 CONTRÔLEUR DE SCRAPING OPTIMISÉ
//  * Utilise orchestrateScrapingOptimized pour une meilleure performance
//  */

// import { Request, Response } from 'express';
// import type { ScraperQuery } from '../types/scraper';
// import { orchestrateScrapingOptimized } from '../services/orchestratorScraperOptimized';

// export const scrapeGoogleMapsController = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { region, departement, ville, activite, nombre_resultats } = req.body;

//     console.log('📥 Requête reçue:', {
//       region,
//       departement: Array.isArray(departement) ? `${departement.length} depts` : departement,
//       ville: Array.isArray(ville) ? `${ville.length} villes` : ville,
//       activite,
//       nombre_resultats
//     });

//     // ✅ Validation région obligatoire
//     if (!region) {
//       res.status(400).json({
//         success: false,
//         message: 'La région est obligatoire',
//         stats: {
//           total_vise: 0,
//           total_trouve: 0,
//           avec_telephone: 0,
//           avec_email: 0,
//           avec_siret: 0,
//           avec_gerant: 0,
//           duree_secondes: 0,
//           message: '⚠️ La région est obligatoire'
//         },
//         data: []
//       });
//       return;
//     }

//     // ✅ Construire la query
//     const query: ScraperQuery = {
//       region,
//       departement: departement 
//         ? (Array.isArray(departement) ? departement : [departement])
//         : undefined,
//       ville: ville
//         ? (Array.isArray(ville) ? ville : [ville])
//         : undefined,
//       activite: activite || undefined,
//       nombre_resultats: nombre_resultats || 20
//     };

//     console.log('🔧 Query finale:', {
//       region: query.region,
//       departements: query.departement?.length || 0,
//       villes: query.ville?.length || 0,
//       activite: query.activite,
//       nombre_resultats: query.nombre_resultats
//     });

//     // 🚀 Orchestrer le scraping optimisé
//     const { entreprises, stats } = await orchestrateScrapingOptimized(query);

//     // ✅ Retourner les résultats
//     if (entreprises.length === 0) {
//       res.status(200).json({
//         success: true,
//         message: stats.message || 'Aucune entreprise trouvée',
//         stats,
//         data: []
//       });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Scraping réussi',
//       stats: {
//         ...stats,
//         villes_scrappees: stats.villes_scrappees || []
//       },
//       data: entreprises
//     });

//     console.log(`✅ Scraping terminé : ${entreprises.length} entreprises en ${stats.duree_secondes}s`);

//   } catch (error: any) {
//     console.error('❌ Erreur controller:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors du scraping',
//       error: error instanceof Error ? error.message : 'Erreur inconnue',
//       stats: {
//         total_vise: 0,
//         total_trouve: 0,
//         avec_telephone: 0,
//         avec_email: 0,
//         avec_siret: 0,
//         avec_gerant: 0,
//         duree_secondes: 0,
//         message: '❌ Erreur serveur'
//       },
//       data: []
//     });
//   }
// };


import { Request, Response } from 'express';
import type { ScraperQuery } from '../types/scraper';
import { orchestrateScrapingOptimized } from '../services/orchestratorScraperOptimized';

export const scrapeGoogleMapsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { region, departement, ville, activite, nombre_resultats } = req.body;

    console.log('📥 Requête reçue:', {
      region,
      departements: Array.isArray(departement) ? departement.length : 0,
      villes: Array.isArray(ville) ? ville.length : 0,
      activite,
      nombre_resultats
    });

    // ✅ Validation
    if (!region) {
      res.status(400).json({
        success: false,
        message: 'La région est obligatoire',
        stats: createEmptyStats('⚠️ La région est obligatoire'),
        data: []
      });
      return;
    }

    // Limiter le nombre de résultats pour la performance
    const maxResults = Math.min(nombre_resultats || 20, 100);
    
    // Construire la query
    const query: ScraperQuery = {
      region,
      departement: departement 
        ? (Array.isArray(departement) ? departement : [departement])
        : undefined,
      ville: ville
        ? (Array.isArray(ville) ? ville : [ville])
        : undefined,
      activite: activite || undefined,
      nombre_resultats: maxResults
    };

    console.log('🔧 Query finale:', {
      region: query.region,
      departements: query.departement?.length || 0,
      villes: query.ville?.length || 0,
      activite: query.activite,
      nombre_resultats: query.nombre_resultats
    });

    // 🚀 Lancer le scraping optimisé
    const { entreprises, stats } = await orchestrateScrapingOptimized(query);

    // ✅ Retourner les résultats
    res.status(200).json({
      success: true,
      message: stats.message,
      stats,
      data: entreprises
    });

    console.log(`✅ Scraping terminé: ${entreprises.length} entreprises en ${stats.duree_secondes}s`);

  } catch (error: any) {
    console.error('❌ Erreur controller:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      stats: createEmptyStats('❌ Erreur serveur'),
      data: [],
      error: error.message
    });
  }
};

function createEmptyStats(message: string) {
  return {
    total_vise: 0,
    total_trouve: 0,
    avec_telephone: 0,
    avec_email: 0,
    avec_siret: 0,
    avec_gerant: 0,
    duree_secondes: 0,
    message
  };
}