import type {
  PreSociete,
  Societe,
  Activite,
  Departement,
  GroupType,
  NotificationType
} from '../types/pushNotifications';


 //const API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'https://staging.solutravo.zeta-app.fr/api';

// ===== TYPES POUR LES RÉPONSES API =====
interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
}

interface SendNotificationResponse {
  success: boolean;
  message: string;
  sentCount: number;
  failedCount: number;
  details?: {
    pushSent?: number;
    sseSent?: number;      
    internalSent?: number;
  };
}

// ===== SERVICE API =====
export const pushNotificationApi = {
  
  /**
   * Récupère les présociétés selon les filtres
   */
  async getPreSocietes(
    role: GroupType,
    activiteIds?: string[],
    departementIds?: string[]
  ): Promise<PreSociete[]> {
    try {
      const params = new URLSearchParams({ role });
      
      if (activiteIds && activiteIds.length > 0) {
        params.append('activiteIds', activiteIds.join(','));
      }
      
      if (departementIds && departementIds.length > 0) {
        params.append('departementIds', departementIds.join(','));
      }

      const response = await fetch(
        `${API_BASE_URL}/presocietes?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la récupération des présociétés');
      }

      const result: ApiResponse<PreSociete[]> = await response.json();
      return result.data;
      
    } catch (error: any) {
      console.error('Erreur getPreSocietes:', error);
      throw error;
    }
  },

  /**
   * Récupère les sociétés selon les filtres
   */
  async getSocietes(
    role: GroupType,
    activiteIds?: string[],
    departementIds?: string[]
  ): Promise<Societe[]> {
    try {
      const params = new URLSearchParams({ role });
      
      if (activiteIds && activiteIds.length > 0) {
        params.append('activiteIds', activiteIds.join(','));
      }
      
      if (departementIds && departementIds.length > 0) {
        params.append('departementIds', departementIds.join(','));
      }

      const response = await fetch(
        `${API_BASE_URL}/societes?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la récupération des sociétés');
      }

      const result: ApiResponse<Societe[]> = await response.json();
      return result.data;
      
    } catch (error: any) {
      console.error(' Erreur getSocietes:', error);
      throw error;
    }
  },

  /**
   * Récupère toutes les activités
   */
  async getActivites(): Promise<Activite[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/activites`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la récupération des activités');
      }

      const result: ApiResponse<Activite[]> = await response.json();
      return result.data;
      
    } catch (error: any) {
      console.error(' Erreur getActivites:', error);
      throw error;
    }
  },

  /**
   * Récupère tous les départements
   */
  async getDepartements(): Promise<Departement[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/departements`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la récupération des départements');
      }

      const result: ApiResponse<Departement[]> = await response.json();
      return result.data;
      
    } catch (error: any) {
      console.error(' Erreur getDepartements:', error);
      throw error;
    }
  },

  /**
   * Envoie une notification aux destinataires sélectionnés
   */
  async sendNotification(payload: {
    message: string;
    emoji?: string;
    notificationTypes: NotificationType[];
    recipients: {
      preSocieteIds?: string[];
      societeIds?: string[];
    };
    filters?: {
      group?: GroupType;
      activiteIds?: string[];
      departementIds?: string[];
    };
  }): Promise<SendNotificationResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'envoi de la notification');
      }

      const result: SendNotificationResponse = await response.json();
      return result;
      
    } catch (error: any) {
      console.error(' Erreur sendNotification:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques pour un rôle
   */
  async getStats(role: GroupType): Promise<{
    preSocietesCount: number;
    societesCount: number;
    totalCount: number;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/stats?role=${role}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la récupération des stats');
      }

      const result: ApiResponse<any> = await response.json();
      return result.data;
      
    } catch (error: any) {
      console.error(' Erreur getStats:', error);
      throw error;
    }
  },
};