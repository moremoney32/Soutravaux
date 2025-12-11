"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllPlans = GetAllPlans;
exports.GetPlansByRole = GetPlansByRole;
exports.GetPlanById = GetPlanById;
exports.GetAllFeatures = GetAllFeatures;
exports.GetFeaturesByPage = GetFeaturesByPage;
exports.GetFeaturesByRole = GetFeaturesByRole;
exports.CreateFeature = CreateFeature;
exports.UpdateFeature = UpdateFeature;
exports.DeleteFeature = DeleteFeature;
exports.GetPlanFeatures = GetPlanFeatures;
exports.AddFeatureToPlan = AddFeatureToPlan;
exports.RemoveFeatureFromPlan = RemoveFeatureFromPlan;
const db_1 = __importDefault(require("../config/db"));
async function GetAllPlans() {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query('SELECT * FROM plans ORDER BY role, price ASC');
        const plans = rows.map(plan => ({
            ...plan,
            popular: plan.popular === 1,
            is_default: plan.is_default === 1,
            is_enterprise: plan.name.toLowerCase().includes('entreprise') || plan.id === 20 || plan.id === 24
        }));
        return plans;
    }
    finally {
        conn.release();
    }
}
async function GetPlansByRole(role) {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query('SELECT * FROM plans WHERE role = ? ORDER BY price ASC', [role]);
        const plans = rows.map(plan => ({
            ...plan,
            popular: plan.popular === 1,
            is_default: plan.is_default === 1,
            is_enterprise: plan.name.toLowerCase().includes('entreprise') || plan.id === 20 || plan.id === 24
        }));
        return plans;
    }
    finally {
        conn.release();
    }
}
async function GetPlanById(id) {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query('SELECT * FROM plans WHERE id = ?', [id]);
        const plans = rows;
        if (plans.length === 0)
            return null;
        const plan = plans[0];
        return {
            ...plan,
            popular: plan.popular === 1,
            is_default: plan.is_default === 1,
            is_enterprise: plan.name.toLowerCase().includes('entreprise') || plan.id === 20 || plan.id === 24
        };
    }
    finally {
        conn.release();
    }
}
async function GetAllFeatures() {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query('SELECT * FROM features ORDER BY page, id');
        return rows;
    }
    finally {
        conn.release();
    }
}
async function GetFeaturesByPage(page) {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query('SELECT * FROM features WHERE page = ? ORDER BY id', [page]);
        return rows;
    }
    finally {
        conn.release();
    }
}
// AJOUTER cette nouvelle fonction
async function GetFeaturesByRole(role) {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query('SELECT * FROM features WHERE role = ? ORDER BY page, id', [role]);
        console.log(`Features chargées pour rôle ${role}: ${rows.length}`);
        return rows;
    }
    finally {
        conn.release();
    }
}
// MODIFIER CreateFeature pour inclure description + image
async function CreateFeature(featureData) {
    const conn = await db_1.default.getConnection();
    try {
        console.log('Service: Création feature avec rôle:', featureData.role);
        // 1. Créer la feature
        const [result] = await conn.query('INSERT INTO features (name, page, role, description, image_url, parent_feature_id) VALUES (?, ?, ?, ?, ?, ?)', [
            featureData.name,
            featureData.page,
            featureData.role,
            featureData.description || null,
            featureData.image_url || null,
            featureData.parent_feature_id || null
        ]);
        const newFeatureId = result.insertId;
        console.log('Service: Feature créée avec ID:', newFeatureId);
        // 2. IDs fixes des plans entreprise
        const enterprisePlanIds = {
            'artisan': 20,
            'annonceur': 24
        };
        const enterprisePlanId = enterprisePlanIds[featureData.role];
        if (enterprisePlanId) {
            const [existingLink] = await conn.query('SELECT * FROM feature_plans WHERE feature_id = ? AND plan_id = ?', [newFeatureId, enterprisePlanId]);
            if (existingLink.length === 0) {
                await conn.query('INSERT INTO feature_plans (feature_id, plan_id) VALUES (?, ?)', [newFeatureId, enterprisePlanId]);
                console.log(`Service: Feature liée au plan entreprise ${enterprisePlanId}`);
            }
        }
        // 3. Retourner la feature créée
        const [newFeature] = await conn.query('SELECT * FROM features WHERE id = ?', [newFeatureId]);
        return newFeature[0];
    }
    catch (error) {
        console.error('Service: Erreur création feature:', error);
        throw error;
    }
    finally {
        conn.release();
    }
}
// MODIFIER UpdateFeature pour inclure description + image
async function UpdateFeature(id, featureData) {
    const conn = await db_1.default.getConnection();
    try {
        const updates = [];
        const values = [];
        // Autoriser la mise à jour de description et image_url
        const allowedFields = ['name', 'page', 'description', 'image_url', 'parent_feature_id'];
        Object.entries(featureData).forEach(([key, value]) => {
            if (allowedFields.includes(key) && value !== undefined) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        });
        if (updates.length === 0) {
            throw new Error('Aucune donnée à mettre à jour');
        }
        values.push(id);
        await conn.query(`UPDATE features SET ${updates.join(', ')} WHERE id = ?`, values);
        const [updatedFeature] = await conn.query('SELECT * FROM features WHERE id = ?', [id]);
        return updatedFeature[0];
    }
    finally {
        conn.release();
    }
}
async function DeleteFeature(id) {
    const conn = await db_1.default.getConnection();
    try {
        await conn.query('DELETE FROM features WHERE id = ?', [id]);
    }
    finally {
        conn.release();
    }
}
async function GetPlanFeatures(planId) {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query(`
      SELECT 
        f.*,
        CASE WHEN fp.feature_id IS NOT NULL THEN 1 ELSE 0 END as enabled,
        CASE WHEN ? IN (20, 24) THEN 1 ELSE 0 END as inherited
      FROM features f
      LEFT JOIN feature_plans fp ON f.id = fp.feature_id AND fp.plan_id = ?
      ORDER BY f.page, f.id
    `, [planId, planId]);
        return rows;
    }
    finally {
        conn.release();
    }
}
async function AddFeatureToPlan(featureId, planId) {
    const conn = await db_1.default.getConnection();
    try {
        await conn.query('INSERT IGNORE INTO feature_plans (feature_id, plan_id) VALUES (?, ?)', [featureId, planId]);
    }
    finally {
        conn.release();
    }
}
async function RemoveFeatureFromPlan(featureId, planId) {
    const conn = await db_1.default.getConnection();
    try {
        await conn.query('DELETE FROM feature_plans WHERE feature_id = ? AND plan_id = ?', [featureId, planId]);
    }
    finally {
        conn.release();
    }
}
//# sourceMappingURL=featuresServices.js.map