



// import type { Plan, Feature, FeatureWithStatus } from '../types';

// const API_BASE =
//   window.location.hostname === "localhost"
//     ? "http://localhost:3000/api"       // → version locale
//     : "https://staging.solutravo.zeta-app.fr/api"; 

// async function fetchAPI(endpoint: string, options: RequestInit = {}) {
//   const response = await fetch(`${API_BASE}${endpoint}`, {
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//     ...options,
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ message: `une erreur s'est produite` }));
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

//   //createFeature pour inclure le rôle
//   createFeature: async (featureData: Omit<Feature, 'id'>): Promise<Feature> => {
//     return await fetchAPI('/features', {
//       method: 'POST',
//       body: JSON.stringify(featureData),
//     });
//   },

//   // Récupérer par rôle
//   getFeaturesByRole: async (role: string): Promise<Feature[]> => {
//     return await fetchAPI(`/features/by-role?role=${role}`);
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

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "https://staging.solutravo.zeta-app.fr/api";

// Fonction générique pour les requêtes JSON
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: `Une erreur s'est produite` 
    }));
    throw new Error(errorData.message || `Erreur ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

// Fonction spécifique pour l'upload d'images
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
    // PAS de Content-Type pour FormData (auto-géré par le navigateur)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      error: "Erreur lors de l'upload" 
    }));
    throw new Error(errorData.error || `Erreur upload ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.url) {
    throw new Error("URL de l'image non retournée par le serveur");
  }
   console.log('URL retournée:', data.url);

  return data.url;
}

export const planFeatureApi = {
  // ============================================
  // PLANS
  // ============================================
  
  getPlans: async (): Promise<Plan[]> => {
    return await fetchAPI('/plans');
  },

  getPlansByRole: async (role: string): Promise<Plan[]> => {
    return await fetchAPI(`/plans/by-role?role=${role}`);
  },

  getPlanById: async (id: number): Promise<Plan> => {
    return await fetchAPI(`/plans/${id}`);
  },

  // ============================================
  // FEATURES
  // ============================================
  
  getAllFeatures: async (): Promise<Feature[]> => {
    return await fetchAPI('/features');
  },

  getFeaturesByPage: async (page: string): Promise<Feature[]> => {
    return await fetchAPI(`/features/by-page?page=${encodeURIComponent(page)}`);
  },

  getFeaturesByRole: async (role: string): Promise<Feature[]> => {
    return await fetchAPI(`/features/by-role?role=${role}`);
  },

  // MODIFIÉ : createFeature avec support de l'upload
  createFeature: async (featureData: Omit<Feature, 'id'> & { 
    imageFile?: File 
  }): Promise<Feature> => {
    let imageUrl: string | undefined = featureData.image_url;

    // Si un fichier image est fourni, l'uploader d'abord
    if (featureData.imageFile) {
      try {
        imageUrl = await uploadImage(featureData.imageFile);
        console.log(`✅ Image uploadée: ${imageUrl}`);
      } catch (err) {
        console.error("❌ Erreur upload image:", err);
        throw new Error("Échec de l'upload de l'image");
      }
    }

    // Créer la feature avec l'URL de l'image
    const { imageFile, ...dataToSend } = featureData;
    
    return await fetchAPI('/features', {
      method: 'POST',
      body: JSON.stringify({
        ...dataToSend,
        image_url: imageUrl
      }),
    });
  },

  // MODIFIÉ : updateFeature avec support de l'upload
  updateFeature: async (id: number, featureData: Partial<Feature> & { 
    imageFile?: File 
  }): Promise<Feature> => {
    let imageUrl = featureData.image_url;

    // Si un nouveau fichier image est fourni, l'uploader
    if (featureData.imageFile) {
      try {
        imageUrl = await uploadImage(featureData.imageFile);
        console.log(`✅ Nouvelle image uploadée: ${imageUrl}`);
      } catch (err) {
        console.error("❌ Erreur upload image:", err);
        throw new Error("Échec de l'upload de l'image");
      }
    }

    // Mettre à jour la feature
    const { imageFile, ...dataToSend } = featureData;
    
    return await fetchAPI(`/features/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...dataToSend,
        image_url: imageUrl
      }),
    });
  },

  deleteFeature: async (id: number): Promise<void> => {
    await fetchAPI(`/features/${id}`, {
      method: 'DELETE',
    });
  },

  // ============================================
  // FEATURE-PLAN ASSOCIATIONS
  // ============================================
  
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

  // ============================================
  // UPLOAD (fonction publique si besoin)
  // ============================================
  
  uploadImage: uploadImage,
};