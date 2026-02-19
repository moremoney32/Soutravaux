

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

  if (err.code === 'ER_DUP_ENTRY') {
  console.error('❌ Duplicate entry:', err.sqlMessage); // Log pour debug
  
  // Extraire le nom de la colonne depuis l'erreur SQL
  const match = err.sqlMessage?.match(/for key '(.+?)'/);
  const keyName = match ? match[1] : 'inconnue';
  
  res.status(409).json({
    success: false,
    message: `Entrée dupliquée détectée (${keyName}). Veuillez vérifier vos données.`,
    // debug: err.sqlMessage // ⚠️ À retirer en prod
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