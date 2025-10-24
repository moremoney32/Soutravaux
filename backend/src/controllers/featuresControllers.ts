import { Request, Response, NextFunction } from "express";
import {
  GetAllPlans,
  GetPlansByRole,
  GetPlanById,
  GetAllFeatures,
  GetFeaturesByPage,
  CreateFeature,
  UpdateFeature,
  DeleteFeature,
  GetPlanFeatures,
  AddFeatureToPlan,
  RemoveFeatureFromPlan,
  Plan,
  GetFeaturesByRole
} from '../services/featuresServices';

// ============================================
// CONTROLLERS - PLANS
// ============================================

/**
 * GET /api/admin/plans
 * Récupérer tous les plans
 */
export const getAllPlansController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plans = await GetAllPlans();
    res.status(200).json({
      success: true,
      data: plans,
      count: plans.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/plans/by-role
 * Récupérer les plans par rôle
 */
export const getPlansByRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.query;
    
    if (!role || typeof role !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Le paramètre "role" est requis et doit être une chaîne de caractères',
        valid_roles: ['artisan', 'annonceur']
      });
      return;
    }

    if (role !== 'artisan' && role !== 'annonceur') {
      res.status(400).json({
        success: false,
        message: 'Le rôle doit être "artisan" ou "annonceur"',
        received: role
      });
      return;
    }

    const plans = await GetPlansByRole(role);
    res.status(200).json({
      success: true,
      data: plans,
      count: plans.length,
      role: role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/plans/:id
 * Récupérer un plan par ID
 */
export const getPlanByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const planId = parseInt(req.params.id);
    
    if (isNaN(planId) || planId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de plan invalide',
        received: req.params.id
      });
      return;
    }

    const plan = await GetPlanById(planId);
    
    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Plan non trouvé',
        planId: planId
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// CONTROLLERS - FEATURES
// ============================================

/**
 * GET /api/admin/features
 * Récupérer toutes les fonctionnalités
 */
export const getAllFeaturesController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const features = await GetAllFeatures();
    res.status(200).json({
      success: true,
      data: features,
      count: features.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/features/by-page
 * Récupérer les fonctionnalités par page
 */
export const getFeaturesByPageController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page } = req.query;
    
    if (!page || typeof page !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Le paramètre "page" est requis',
        example: '/api/admin/features/by-page?page=Devis'
      });
      return;
    }

    const features = await GetFeaturesByPage(page);
    res.status(200).json({
      success: true,
      data: features,
      count: features.length,
      page: page
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/features
 * Créer une nouvelle fonctionnalité
 */
export const createFeatureController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, page, parent_feature_id, role } = req.body; // ✅ AJOUT du rôle

    // Validation des champs requis
    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        message: 'Le nom de la fonctionnalité est requis'
      });
      return;
    }

    if (!page || !page.trim()) {
      res.status(400).json({
        success: false,
        message: 'La page/module est requise'
      });
      return;
    }

    // VALIDATION CRITIQUE : le rôle est OBLIGATOIRE**///
    if (!role || (role !== 'artisan' && role !== 'annonceur')) {
      res.status(400).json({
        success: false,
        message: 'Le rôle est requis et doit être "artisan" ou "annonceur"',
        received: role
      });
      return;
    }

    const featureData = {
      name: name.trim(),
      page: page.trim(),
      parent_feature_id: parent_feature_id || null,
      role: role //AJOUT du rôle
    };

    console.log('Création feature avec données:', featureData);

    const newFeature = await CreateFeature(featureData);
    
    res.status(201).json({
      success: true,
      message: 'Fonctionnalité créée avec succès',
      data: newFeature
    });
  } catch (error: any) {
    console.error('Erreur controller création feature:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'Une fonctionnalité avec ce nom existe déjà'
      });
      return;
    }
    next(error);
  }
};

/**
 * GET /api/admin/features/by-role
 * Récupérer les fonctionnalités par rôle
 */
export const getFeaturesByRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.query;
    
    if (!role || typeof role !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Le paramètre "role" est requis'
      });
      return;
    }

    if (role !== 'artisan' && role !== 'annonceur') {
      res.status(400).json({
        success: false,
        message: 'Le rôle doit être "artisan" ou "annonceur"'
      });
      return;
    }

    const features = await GetFeaturesByRole(role);
    res.status(200).json({
      success: true,
      data: features,
      count: features.length,
      role: role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/features/:id
 * Mettre à jour une fonctionnalité
 */
export const updateFeatureController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const featureId = parseInt(req.params.id);
    
    if (isNaN(featureId) || featureId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de fonctionnalité invalide',
        received: req.params.id
      });
      return;
    }

    const { name, page, parent_feature_id } = req.body;
    const updateData: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        res.status(400).json({
          success: false,
          message: 'Le nom de la fonctionnalité ne peut pas être vide'
        });
        return;
      }
      updateData.name = name.trim();
    }

    if (page !== undefined) {
      if (!page.trim()) {
        res.status(400).json({
          success: false,
          message: 'La page/module ne peut pas être vide'
        });
        return;
      }
      updateData.page = page.trim();
    }

    if (parent_feature_id !== undefined) {
      updateData.parent_feature_id = parent_feature_id;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
      return;
    }

    const updatedFeature = await UpdateFeature(featureId, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Fonctionnalité mise à jour avec succès',
      data: updatedFeature
    });
  } catch (error: any) {
    if (error.message === 'Aucune donnée à mettre à jour') {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
};

/**
 * DELETE /api/admin/features/:id
 * Supprimer une fonctionnalité
 */
export const deleteFeatureController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const featureId = parseInt(req.params.id);
    
    if (isNaN(featureId) || featureId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de fonctionnalité invalide',
        received: req.params.id
      });
      return;
    }

    await DeleteFeature(featureId);
    
    res.status(200).json({
      success: true,
      message: 'Fonctionnalité supprimée avec succès',
      featureId: featureId
    });
  } catch (error: any) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(409).json({
        success: false,
        message: 'Impossible de supprimer cette fonctionnalité car elle est utilisée dans des plans'
      });
      return;
    }
    next(error);
  }
};

// ============================================
// CONTROLLERS - FEATURE-PLAN ASSOCIATIONS
// ============================================

/**
 * GET /api/admin/plans/:planId/features
 * Récupérer les fonctionnalités d'un plan avec leur statut
 */
export const getPlanFeaturesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const planId = parseInt(req.params.planId);
    
    if (isNaN(planId) || planId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de plan invalide',
        received: req.params.planId
      });
      return;
    }

    const features = await GetPlanFeatures(planId);
    
    res.status(200).json({
      success: true,
      data: features,
      count: features.length,
      planId: planId,
      enabledCount: features.filter((f: any) => f.enabled).length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/features/:featureId/plans/:planId
 * Ajouter une fonctionnalité à un plan
 */
export const addFeatureToPlanController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const featureId = parseInt(req.params.featureId);
    const planId = parseInt(req.params.planId);
    
    if (isNaN(featureId) || featureId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de fonctionnalité invalide',
        received: req.params.featureId
      });
      return;
    }

    if (isNaN(planId) || planId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de plan invalide',
        received: req.params.planId
      });
      return;
    }

    await AddFeatureToPlan(featureId, planId);
    
    res.status(200).json({
      success: true,
      message: 'Fonctionnalité ajoutée au plan avec succès',
      featureId: featureId,
      planId: planId
    });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'Cette fonctionnalité est déjà associée à ce plan'
      });
      return;
    }
    next(error);
  }
};

/**
 * DELETE /api/admin/features/:featureId/plans/:planId
 * Retirer une fonctionnalité d'un plan
 */
export const removeFeatureFromPlanController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const featureId = parseInt(req.params.featureId);
    const planId = parseInt(req.params.planId);
    
    if (isNaN(featureId) || featureId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de fonctionnalité invalide',
        received: req.params.featureId
      });
      return;
    }

    if (isNaN(planId) || planId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de plan invalide',
        received: req.params.planId
      });
      return;
    }

    await RemoveFeatureFromPlan(featureId, planId);
    
    res.status(200).json({
      success: true,
      message: 'Fonctionnalité retirée du plan avec succès',
      featureId: featureId,
      planId: planId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/plans/:planId/features/sync
 * Synchroniser les fonctionnalités d'un plan
 */
export const syncPlanFeaturesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const planId = parseInt(req.params.planId);
    const { featureIds } = req.body;
    
    if (isNaN(planId) || planId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de plan invalide',
        received: req.params.planId
      });
      return;
    }

    if (!Array.isArray(featureIds)) {
      res.status(400).json({
        success: false,
        message: 'Le champ "featureIds" doit être un tableau',
        received: featureIds
      });
      return;
    }

    // Vérifier que tous les IDs sont valides
    const invalidIds = featureIds.filter(id => typeof id !== 'number' || id <= 0);
    if (invalidIds.length > 0) {
      res.status(400).json({
        success: false,
        message: 'IDs de fonctionnalités invalides détectés',
        invalidIds: invalidIds
      });
      return;
    }

    // Supprimer toutes les associations existantes
    const currentFeatures = await GetPlanFeatures(planId);
    for (const feature of currentFeatures) {
      if (feature.enabled) {
        await RemoveFeatureFromPlan(feature.id, planId);
      }
    }

    // Ajouter les nouvelles associations
    for (const featureId of featureIds) {
      await AddFeatureToPlan(featureId, planId);
    }

    res.status(200).json({
      success: true,
      message: `Plan synchronisé avec ${featureIds.length} fonctionnalité(s)`,
      planId: planId,
      featureCount: featureIds.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/features/:featureId/plans
 * Récupérer les plans associés à une fonctionnalité
 */
export const getPlansByFeatureController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const featureId = parseInt(req.params.featureId);
    
    if (isNaN(featureId) || featureId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de fonctionnalité invalide',
        received: req.params.featureId
      });
      return;
    }

    // Récupérer tous les plans
    const allPlans = await GetAllPlans();
      const plansWithFeature: Plan[] = [];
    
    // Pour chaque plan, vérifier s'il contient cette fonctionnalité
    for (const plan of allPlans) {
      try {
        const planFeatures = await GetPlanFeatures(plan.id);
        const hasFeature = planFeatures.some((feature: any) => feature.id === featureId && feature.enabled);
        
        if (hasFeature) {
          plansWithFeature.push(plan);
        }
      } catch (error) {
        console.warn(`Impossible de vérifier les features du plan ${plan.id}:`, error);
        // Continuer avec le plan suivant
      }
    }

    res.status(200).json({
      success: true,
      data: plansWithFeature,
      count: plansWithFeature.length,
      featureId: featureId
    });
  } catch (error) {
    next(error);
  }
};

export default {
  // Plans
  getAllPlansController,
  getPlansByRoleController,
  getPlanByIdController,
  
  // Features
  getAllFeaturesController,
  getFeaturesByPageController,
  createFeatureController,
  updateFeatureController,
  deleteFeatureController,
  
  // Feature-Plan Associations
  getPlanFeaturesController,
  addFeatureToPlanController,
  removeFeatureFromPlanController,
  syncPlanFeaturesController,
  getPlansByFeatureController
};