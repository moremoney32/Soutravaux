// import { Request, Response, NextFunction } from "express";

// export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
//   console.error("❌ Global Error Handler:", err.message);

//   res.status(err.statusCode || 500).json({
//     success: false,
//     error: err.message || "Erreur serveur",
//   });
// }

// ============================================================
// FICHIER 2 : src/middleware/errorHandler.ts
// Créer ce fichier s'il n'existe pas
// Puis l'enregistrer dans app.ts APRÈS toutes les routes :
//   app.use(errorHandler);
// ============================================================

import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Erreur avec message lisible défini dans le service
  if (err.userMessage) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.userMessage   // ← message clair pour le frontend/client
    });
    return;
  }

  // Erreurs MySQL connues → message lisible
  if (err.code === 'ER_DUP_ENTRY') {
    res.status(409).json({
      success: false,
      message: 'Cette référence existe déjà. Veuillez en choisir une autre.'
    });
    return;
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    res.status(422).json({
      success: false,
      message: 'Un élément sélectionné n\'existe plus dans la base de données. Veuillez actualiser la page.'
    });
    return;
  }

  if (err.code === 'ER_DATA_TOO_LONG') {
    res.status(422).json({
      success: false,
      message: 'Une valeur saisie est trop longue. Vérifiez vos champs et réessayez.'
    });
    return;
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    res.status(503).json({
      success: false,
      message: 'Le serveur est temporairement indisponible. Réessayez dans quelques instants.'
    });
    return;
  }

  // Erreur générique — ne jamais exposer les détails techniques au client
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({
    success: false,
    message: 'Une erreur inattendue s\'est produite. Veuillez réessayer ou contacter le support.'
    // ✅ Pas de err.message technique envoyé au frontend
  });
}