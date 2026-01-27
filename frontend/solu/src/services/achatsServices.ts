// src/services/achatSMSService.ts

import type { CreateCheckoutSessionPayload, CreateCheckoutSessionResponse, SMSPack, UserCreditsResponse } from "../types/campagne.types";



const API_BASE_URL = 'https://integration-api.solutravo-app.fr/api';

/**
 * Récupère la liste des packs SMS actifs
 */
export const getSMSPacks = async (): Promise<SMSPack[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sms/packs`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des packs SMS:', error);
    throw error;
  }
};

/**
 * Crée une session de paiement Stripe
 */
export const createCheckoutSession = async (
  payload: CreateCheckoutSessionPayload
): Promise<CreateCheckoutSessionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sms/create-checkout-session`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    throw error;
  }
};

/**
 * Récupère les crédits SMS d'un membre
 */
export const getUserCredits = async (societe_id: number): Promise<UserCreditsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sms/credits/${societe_id}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des crédits SMS:', error);
    throw error;
  }
};