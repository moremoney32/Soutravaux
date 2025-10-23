



// import type { Plan, Feature, FeatureWithStatus } from '../types';

// const API_BASE = 'http://localhost:3000/api';

// // Fonction utilitaire pour les appels API
// async function fetchAPI(endpoint: string, options: RequestInit = {}) {
//   const response = await fetch(`${API_BASE}${endpoint}`, {
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//     ...options,
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ message: 'Erreur API' }));
//     throw new Error(errorData.message || `Erreur ${response.status}`);
//   }

//   const data = await response.json();
//   return data.data || data;
// }

// export const planFeatureApi = {
//   // Plans
//   getPlans: async (): Promise<Plan[]> => {
//     return await fetchAPI('/plans');
//   },

//   getPlansByRole: async (role: string): Promise<Plan[]> => {
//     return await fetchAPI(`/plans/by-role?role=${role}`);
//   },

//   getPlanById: async (id: number): Promise<Plan> => {
//     return await fetchAPI(`/plans/${id}`);
//   },

//   // Features
//   getAllFeatures: async (): Promise<Feature[]> => {
//     return await fetchAPI('/features');
//   },

//   getFeaturesByPage: async (page: string): Promise<Feature[]> => {
//     return await fetchAPI(`/features/by-page?page=${encodeURIComponent(page)}`);
//   },

//   createFeature: async (featureData: Omit<Feature, 'id'>): Promise<Feature> => {
//     return await fetchAPI('/features', {
//       method: 'POST',
//       body: JSON.stringify(featureData),
//     });
//   },

//   updateFeature: async (id: number, featureData: Partial<Feature>): Promise<Feature> => {
//     return await fetchAPI(`/features/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(featureData),
//     });
//   },

//   deleteFeature: async (id: number): Promise<void> => {
//     await fetchAPI(`/features/${id}`, {
//       method: 'DELETE',
//     });
//   },

//   // Feature-Plan Associations
//   getPlanFeatures: async (planId: number): Promise<FeatureWithStatus[]> => {
//     return await fetchAPI(`/plans/${planId}/features`);
//   },

//   addFeatureToPlan: async (featureId: number, planId: number): Promise<void> => {
//     await fetchAPI(`/features/${featureId}/plans/${planId}`, {
//       method: 'POST',
//     });
//   },

//   removeFeatureFromPlan: async (featureId: number, planId: number): Promise<void> => {
//     await fetchAPI(`/features/${featureId}/plans/${planId}`, {
//       method: 'DELETE',
//     });
//   },

//   syncPlanFeatures: async (planId: number, featureIds: number[]): Promise<void> => {
//     await fetchAPI(`/plans/${planId}/features/sync`, {
//       method: 'POST',
//       body: JSON.stringify({ featureIds }),
//     });
//   },

//   getPlansByFeature: async (featureId: number): Promise<Plan[]> => {
//     return await fetchAPI(`/features/${featureId}/plans`);
//   },
// };



import type { Plan, Feature, FeatureWithStatus } from '../types';

const API_BASE = 'http://localhost:3000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erreur API' }));
    throw new Error(errorData.message || `Erreur ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

export const planFeatureApi = {
  // Plans
  getPlans: async (): Promise<Plan[]> => {
    return await fetchAPI('/plans');
  },

  getPlansByRole: async (role: string): Promise<Plan[]> => {
    return await fetchAPI(`/plans/by-role?role=${role}`);
  },

  getPlanById: async (id: number): Promise<Plan> => {
    return await fetchAPI(`/plans/${id}`);
  },

  // Features
  getAllFeatures: async (): Promise<Feature[]> => {
    return await fetchAPI('/features');
  },

  getFeaturesByPage: async (page: string): Promise<Feature[]> => {
    return await fetchAPI(`/features/by-page?page=${encodeURIComponent(page)}`);
  },

  // ✅ CORRIGEZ createFeature pour inclure le rôle
  createFeature: async (featureData: Omit<Feature, 'id'>): Promise<Feature> => {
    return await fetchAPI('/features', {
      method: 'POST',
      body: JSON.stringify(featureData),
    });
  },

  // ✅ NOUVELLE FONCTION : Récupérer par rôle
  getFeaturesByRole: async (role: string): Promise<Feature[]> => {
    return await fetchAPI(`/features/by-role?role=${role}`);
  },

  updateFeature: async (id: number, featureData: Partial<Feature>): Promise<Feature> => {
    return await fetchAPI(`/features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(featureData),
    });
  },

  deleteFeature: async (id: number): Promise<void> => {
    await fetchAPI(`/features/${id}`, {
      method: 'DELETE',
    });
  },

  // Feature-Plan Associations
  getPlanFeatures: async (planId: number): Promise<FeatureWithStatus[]> => {
    return await fetchAPI(`/plans/${planId}/features`);
  },

  addFeatureToPlan: async (featureId: number, planId: number): Promise<void> => {
    await fetchAPI(`/features/${featureId}/plans/${planId}`, {
      method: 'POST',
    });
  },

  removeFeatureFromPlan: async (featureId: number, planId: number): Promise<void> => {
    await fetchAPI(`/features/${featureId}/plans/${planId}`, {
      method: 'DELETE',
    });
  },

  syncPlanFeatures: async (planId: number, featureIds: number[]): Promise<void> => {
    await fetchAPI(`/plans/${planId}/features/sync`, {
      method: 'POST',
      body: JSON.stringify({ featureIds }),
    });
  },

  getPlansByFeature: async (featureId: number): Promise<Plan[]> => {
    return await fetchAPI(`/features/${featureId}/plans`);
  },
  
};

