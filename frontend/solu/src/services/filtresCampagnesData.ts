// import type { CampagneRecipient, CampagnesResponse } from "../types/campagne.types";

import type { CampagneDetailResponse, CampagneFiltersAPI, CampagneRecipient, CampagnesResponse } from "../types/campagne.types";


const API_BASE_URL = 'https://backendstaging.solutravo-compta.fr/api';

export const getAllCampagnes = async (
  userId: number,
  page: number = 1,
  filters?: CampagneFiltersAPI
): Promise<CampagnesResponse> => {
  try {
    const params = new URLSearchParams({
      societe_id: userId.toString(),
      page: page.toString(),
    });

    if (filters) {
      if (filters.telephone) params.append('phone_number', filters.telephone);
      if (filters.smsMin) params.append('min_people', filters.smsMin);
      if (filters.smsMax) params.append('max_people', filters.smsMax);
      if (filters.message) params.append('message', filters.message);
      if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
      if (filters.dateFin) params.append('dateFin', filters.dateFin);
      if (filters.supprimees) params.append('supprimees', 'true');
    }

    console.log('Requête API avec params:', params.toString());

    const response = await fetch(
      `${API_BASE_URL}/all_campaigns?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-CSRF-TOKEN': '',
        },
      }
    );

    if (!response.ok) {
      // ✅ CORRECTION : Parenthèses au lieu de backticks
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data: CampagnesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des campagnes:', error);
    throw error;
  }
};


/**
 * Calculer les statistiques d'une campagne depuis les recipients
 */
export const calculateCampagneStats = (recipients: CampagneRecipient[]) => {
  const total = recipients.length;
  const delivered = recipients.filter(r => r.status === 'delivered').length;
  const pending = recipients.filter(r => r.status === 'pending').length;
  const failed = recipients.filter(r => r.status === 'failed').length;
  const clicked = recipients.filter(r => r.clicked !== null).length;
  const stopped = recipients.filter(r => r.stop !== null).length;

  const tauxReussite = total > 0 ? ((delivered / total) * 100).toFixed(2) : '0.00';
  const tauxClics = total > 0 ? ((clicked / total) * 100).toFixed(2) : '0.00';

  return {
    total,
    delivered,
    pending,
    failed,
    clicked,
    stopped,
    tauxReussite: parseFloat(tauxReussite),
    tauxClics: parseFloat(tauxClics),
  };
};

/**
 * Déterminer le statut global d'une campagne
 */
export const getCampagneGlobalStatus = (recipients: CampagneRecipient[]): 'completed' | 'pending' | 'failed' => {
  if (recipients.length === 0) return 'pending';
  
  const allDelivered = recipients.every(r => r.status === 'delivered');
  const allFailed = recipients.every(r => r.status === 'failed');
  const somePending = recipients.some(r => r.status === 'pending');
  
  if (allDelivered) return 'completed';
  if (allFailed) return 'failed';
  if (somePending) return 'pending';
  
  return 'pending';
};



export const getCampagneDetails = async (
  campaignId: string
): Promise<CampagneDetailResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/statistique/campaigns/${campaignId}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-CSRF-TOKEN': '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data: CampagneDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de campagne:', error);
    throw error;
  }
};