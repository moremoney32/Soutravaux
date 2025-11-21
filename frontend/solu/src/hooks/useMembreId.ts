// src/hooks/useMembreId.ts

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

/**
 * Hook personnalisé pour récupérer l'ID du membre depuis l'URL
 * Exemple d'URL: /campagne/32 ou /achat-sms/32
 * 
 * @returns Le membre_id en tant que number, ou null si non disponible
 */
export const useMembreId = (): number | null => {
  const { membreId } = useParams<{ membreId: string }>();
  
  if (!membreId) {
    console.warn('Aucun membreId trouvé dans l\'URL');
    return null;
  }
 useEffect(() => {
    if (membreId) {
      localStorage.setItem("membreId", membreId);
    }
  }, [membreId]);

  const parsedId = parseInt(membreId, 10);
  
  if (isNaN(parsedId)) {
    console.warn('Le membreId dans l\'URL n\'est pas un nombre valide:', membreId);
    return null;
  }

  return parsedId;
};