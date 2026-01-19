"use strict";
// src/controllers/scraper.controller.ts
// import { Request, Response, NextFunction } from 'express';
// import type { ScraperQuery } from '../types/scraper';
// import {orchestrateScrapingOptimized } from '../services/ochestratorscraperService';
// export const scrapeGoogleMapsController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { region, departement, ville, activite, nombre_resultats } = req.body;
//     console.log('Requête reçue:', req.body);
//     // Validation région obligatoire
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
//     // Convertir departement et ville en tableaux si nécessaire
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
//     console.log('🔧 Query finale:', query);
//     const { entreprises, stats } = await orchestrateScrapingOptimized(query);
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
//       stats,
//       data: entreprises
//     });
//   } catch (error: any) {
//     console.error('❌ Erreur controller:', error);
//     next(error);
//   }
// };
//# sourceMappingURL=ScraperController.js.map