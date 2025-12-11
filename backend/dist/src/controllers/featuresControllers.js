"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlansByFeatureController = exports.syncPlanFeaturesController = exports.removeFeatureFromPlanController = exports.addFeatureToPlanController = exports.getPlanFeaturesController = exports.deleteFeatureController = exports.updateFeatureController = exports.getFeaturesByRoleController = exports.createFeatureController = exports.getFeaturesByPageController = exports.getAllFeaturesController = exports.getPlanByIdController = exports.getPlansByRoleController = exports.getAllPlansController = void 0;
const featuresServices_1 = require("../services/featuresServices");
// ============================================
// CONTROLLERS - PLANS
// ============================================
/**
 * GET /api/admin/plans
 * Récupérer tous les plans
 */
const getAllPlansController = async (_req, res, next) => {
    try {
        const plans = await (0, featuresServices_1.GetAllPlans)();
        res.status(200).json({
            success: true,
            data: plans,
            count: plans.length
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPlansController = getAllPlansController;
/**
 * GET /api/admin/plans/by-role
 * Récupérer les plans par rôle
 */
const getPlansByRoleController = async (req, res, next) => {
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
        const plans = await (0, featuresServices_1.GetPlansByRole)(role);
        res.status(200).json({
            success: true,
            data: plans,
            count: plans.length,
            role: role
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPlansByRoleController = getPlansByRoleController;
/**
 * GET /api/admin/plans/:id
 * Récupérer un plan par ID
 */
const getPlanByIdController = async (req, res, next) => {
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
        const plan = await (0, featuresServices_1.GetPlanById)(planId);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getPlanByIdController = getPlanByIdController;
// ============================================
// CONTROLLERS - FEATURES
// ============================================
/**
 * GET /api/admin/features
 * Récupérer toutes les fonctionnalités
 */
const getAllFeaturesController = async (_req, res, next) => {
    try {
        const features = await (0, featuresServices_1.GetAllFeatures)();
        res.status(200).json({
            success: true,
            data: features,
            count: features.length
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllFeaturesController = getAllFeaturesController;
/**
 * GET /api/admin/features/by-page
 * Récupérer les fonctionnalités par page
 */
const getFeaturesByPageController = async (req, res, next) => {
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
        const features = await (0, featuresServices_1.GetFeaturesByPage)(page);
        res.status(200).json({
            success: true,
            data: features,
            count: features.length,
            page: page
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFeaturesByPageController = getFeaturesByPageController;
/**
 * POST /api/admin/features
 * Créer une nouvelle fonctionnalité
 */
// export const createFeatureController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { name, page, parent_feature_id, role } = req.body; // AJOUT du rôle
//     // Validation des champs requis
//     if (!name || !name.trim()) {
//       res.status(400).json({
//         success: false,
//         message: 'Le nom de la fonctionnalité est requis'
//       });
//       return;
//     }
//     if (!page || !page.trim()) {
//       res.status(400).json({
//         success: false,
//         message: 'La page/module est requise'
//       });
//       return;
//     }
//     // VALIDATION CRITIQUE : le rôle est OBLIGATOIRE**///
//     if (!role || (role !== 'artisan' && role !== 'annonceur')) {
//       res.status(400).json({
//         success: false,
//         message: 'Le rôle est requis et doit être "artisan" ou "annonceur"',
//         received: role
//       });
//       return;
//     }
//     const featureData = {
//       name: name.trim(),
//       page: page.trim(),
//       parent_feature_id: parent_feature_id || null,
//       role: role //AJOUT du rôle
//     };
//     console.log('Création feature avec données:', featureData);
//     const newFeature = await CreateFeature(featureData);
//     res.status(201).json({
//       success: true,
//       message: 'Fonctionnalité créée avec succès',
//       data: newFeature
//     });
//   } catch (error: any) {
//     console.error('Erreur controller création feature:', error);
//     if (error.code === 'ER_DUP_ENTRY') {
//       res.status(409).json({
//         success: false,
//         message: 'Une fonctionnalité avec ce nom existe déjà'
//       });
//       return;
//     }
//     next(error);
//   }
// };
const createFeatureController = async (req, res, next) => {
    try {
        const { name, page, parent_feature_id, role, description, image_url } = req.body;
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
        if (!role || (role !== 'artisan' && role !== 'annonceur')) {
            res.status(400).json({
                success: false,
                message: 'Le rôle est requis et doit être "artisan" ou "annonceur"'
            });
            return;
        }
        const featureData = {
            name: name.trim(),
            page: page.trim(),
            description: description?.trim() || undefined,
            image_url: image_url || undefined,
            parent_feature_id: parent_feature_id || null,
            role: role
        };
        const newFeature = await (0, featuresServices_1.CreateFeature)(featureData);
        res.status(201).json({
            success: true,
            message: 'Fonctionnalité créée avec succès',
            data: newFeature
        });
    }
    catch (error) {
        console.error('Erreur controller création feature:', error);
        next(error);
    }
};
exports.createFeatureController = createFeatureController;
/**
 * GET /api/admin/features/by-role
 * Récupérer les fonctionnalités par rôle
 */
const getFeaturesByRoleController = async (req, res, next) => {
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
        const features = await (0, featuresServices_1.GetFeaturesByRole)(role);
        res.status(200).json({
            success: true,
            data: features,
            count: features.length,
            role: role
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFeaturesByRoleController = getFeaturesByRoleController;
/**
 * PUT /api/admin/features/:id
 * Mettre à jour une fonctionnalité
 */
// export const updateFeatureController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const featureId = parseInt(req.params.id);
//     if (isNaN(featureId) || featureId <= 0) {
//       res.status(400).json({
//         success: false,
//         message: 'ID de fonctionnalité invalide',
//         received: req.params.id
//       });
//       return;
//     }
//     const { name, page, parent_feature_id } = req.body;
//     const updateData: any = {};
//     if (name !== undefined) {
//       if (!name.trim()) {
//         res.status(400).json({
//           success: false,
//           message: 'Le nom de la fonctionnalité ne peut pas être vide'
//         });
//         return;
//       }
//       updateData.name = name.trim();
//     }
//     if (page !== undefined) {
//       if (!page.trim()) {
//         res.status(400).json({
//           success: false,
//           message: 'La page/module ne peut pas être vide'
//         });
//         return;
//       }
//       updateData.page = page.trim();
//     }
//     if (parent_feature_id !== undefined) {
//       updateData.parent_feature_id = parent_feature_id;
//     }
//     if (Object.keys(updateData).length === 0) {
//       res.status(400).json({
//         success: false,
//         message: 'Aucune donnée à mettre à jour'
//       });
//       return;
//     }
//     const updatedFeature = await UpdateFeature(featureId, updateData);
//     res.status(200).json({
//       success: true,
//       message: 'Fonctionnalité mise à jour avec succès',
//       data: updatedFeature
//     });
//   } catch (error: any) {
//     if (error.message === 'Aucune donnée à mettre à jour') {
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//       return;
//     }
//     next(error);
//   }
// };
const updateFeatureController = async (req, res, next) => {
    try {
        const featureId = parseInt(req.params.id);
        if (isNaN(featureId) || featureId <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID de fonctionnalité invalide'
            });
            return;
        }
        const { name, page, description, image_url, parent_feature_id } = req.body;
        const updateData = {};
        if (name !== undefined) {
            if (!name.trim()) {
                res.status(400).json({
                    success: false,
                    message: 'Le nom ne peut pas être vide'
                });
                return;
            }
            updateData.name = name.trim();
        }
        if (page !== undefined) {
            if (!page.trim()) {
                res.status(400).json({
                    success: false,
                    message: 'La page ne peut pas être vide'
                });
                return;
            }
            updateData.page = page.trim();
        }
        // ✅ AJOUT : Gestion de description et image_url
        if (description !== undefined) {
            updateData.description = description.trim() || null;
        }
        if (image_url !== undefined) {
            updateData.image_url = image_url || null;
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
        const updatedFeature = await (0, featuresServices_1.UpdateFeature)(featureId, updateData);
        res.status(200).json({
            success: true,
            message: 'Fonctionnalité mise à jour avec succès',
            data: updatedFeature
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateFeatureController = updateFeatureController;
/**
 * DELETE /api/admin/features/:id
 * Supprimer une fonctionnalité
 */
const deleteFeatureController = async (req, res, next) => {
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
        await (0, featuresServices_1.DeleteFeature)(featureId);
        res.status(200).json({
            success: true,
            message: 'Fonctionnalité supprimée avec succès',
            featureId: featureId
        });
    }
    catch (error) {
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
exports.deleteFeatureController = deleteFeatureController;
// ============================================
// CONTROLLERS - FEATURE-PLAN ASSOCIATIONS
// ============================================
/**
 * GET /api/admin/plans/:planId/features
 * Récupérer les fonctionnalités d'un plan avec leur statut
 */
const getPlanFeaturesController = async (req, res, next) => {
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
        const features = await (0, featuresServices_1.GetPlanFeatures)(planId);
        res.status(200).json({
            success: true,
            data: features,
            count: features.length,
            planId: planId,
            enabledCount: features.filter((f) => f.enabled).length
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPlanFeaturesController = getPlanFeaturesController;
/**
 * POST /api/admin/features/:featureId/plans/:planId
 * Ajouter une fonctionnalité à un plan
 */
const addFeatureToPlanController = async (req, res, next) => {
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
        await (0, featuresServices_1.AddFeatureToPlan)(featureId, planId);
        res.status(200).json({
            success: true,
            message: 'Fonctionnalité ajoutée au plan avec succès',
            featureId: featureId,
            planId: planId
        });
    }
    catch (error) {
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
exports.addFeatureToPlanController = addFeatureToPlanController;
/**
 * DELETE /api/admin/features/:featureId/plans/:planId
 * Retirer une fonctionnalité d'un plan
 */
const removeFeatureFromPlanController = async (req, res, next) => {
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
        await (0, featuresServices_1.RemoveFeatureFromPlan)(featureId, planId);
        res.status(200).json({
            success: true,
            message: 'Fonctionnalité retirée du plan avec succès',
            featureId: featureId,
            planId: planId
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFeatureFromPlanController = removeFeatureFromPlanController;
/**
 * POST /api/admin/plans/:planId/features/sync
 * Synchroniser les fonctionnalités d'un plan
 */
const syncPlanFeaturesController = async (req, res, next) => {
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
        const currentFeatures = await (0, featuresServices_1.GetPlanFeatures)(planId);
        for (const feature of currentFeatures) {
            if (feature.enabled) {
                await (0, featuresServices_1.RemoveFeatureFromPlan)(feature.id, planId);
            }
        }
        // Ajouter les nouvelles associations
        for (const featureId of featureIds) {
            await (0, featuresServices_1.AddFeatureToPlan)(featureId, planId);
        }
        res.status(200).json({
            success: true,
            message: `Plan synchronisé avec ${featureIds.length} fonctionnalité(s)`,
            planId: planId,
            featureCount: featureIds.length
        });
    }
    catch (error) {
        next(error);
    }
};
exports.syncPlanFeaturesController = syncPlanFeaturesController;
/**
 * GET /api/admin/features/:featureId/plans
 * Récupérer les plans associés à une fonctionnalité
 */
const getPlansByFeatureController = async (req, res, next) => {
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
        const allPlans = await (0, featuresServices_1.GetAllPlans)();
        const plansWithFeature = [];
        // Pour chaque plan, vérifier s'il contient cette fonctionnalité
        for (const plan of allPlans) {
            try {
                const planFeatures = await (0, featuresServices_1.GetPlanFeatures)(plan.id);
                const hasFeature = planFeatures.some((feature) => feature.id === featureId && feature.enabled);
                if (hasFeature) {
                    plansWithFeature.push(plan);
                }
            }
            catch (error) {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getPlansByFeatureController = getPlansByFeatureController;
exports.default = {
    // Plans
    getAllPlansController: exports.getAllPlansController,
    getPlansByRoleController: exports.getPlansByRoleController,
    getPlanByIdController: exports.getPlanByIdController,
    // Features
    getAllFeaturesController: exports.getAllFeaturesController,
    getFeaturesByPageController: exports.getFeaturesByPageController,
    createFeatureController: exports.createFeatureController,
    updateFeatureController: exports.updateFeatureController,
    deleteFeatureController: exports.deleteFeatureController,
    // Feature-Plan Associations
    getPlanFeaturesController: exports.getPlanFeaturesController,
    addFeatureToPlanController: exports.addFeatureToPlanController,
    removeFeatureFromPlanController: exports.removeFeatureFromPlanController,
    syncPlanFeaturesController: exports.syncPlanFeaturesController,
    getPlansByFeatureController: exports.getPlansByFeatureController
};
//# sourceMappingURL=featuresControllers.js.map