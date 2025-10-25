
import pool from "../config/db";

export interface Plan {
  id: number;
  name: string;
  subtitle?: string;
  description?: string;
  target_audience?: string;
  key_benefits?: string[];
  detailed_features?: any[];
  why_choose?: string;
  icon_name?: string;
  gradient?: string;
  price: number;
  period: string;
  features?: string[];
  popular: boolean;
  color: string;
  stripe_link?: string;
  is_default: boolean;
  role: 'artisan' | 'annonceur';
  is_enterprise?: boolean;
}

export async function GetAllPlans(): Promise<Plan[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM plans ORDER BY role, price ASC');
    const plans = (rows as any[]).map(plan => ({
      ...plan,
      popular: plan.popular === 1,
      is_default: plan.is_default === 1,
      is_enterprise: plan.name.toLowerCase().includes('entreprise') || plan.id === 20 || plan.id === 24
    }));
    return plans;
  } finally {
    conn.release();
  }
}

export async function GetPlansByRole(role: string): Promise<Plan[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM plans WHERE role = ? ORDER BY price ASC', [role]);
    const plans = (rows as any[]).map(plan => ({
      ...plan,
      popular: plan.popular === 1,
      is_default: plan.is_default === 1,
      is_enterprise: plan.name.toLowerCase().includes('entreprise') || plan.id === 20 || plan.id === 24
    }));
    return plans;
  } finally {
    conn.release();
  }
}

export async function GetPlanById(id: number): Promise<Plan | null> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM plans WHERE id = ?', [id]);
    const plans = rows as any[];
    if (plans.length === 0) return null;
    
    const plan = plans[0];
    return {
      ...plan,
      popular: plan.popular === 1,
      is_default: plan.is_default === 1,
      is_enterprise: plan.name.toLowerCase().includes('entreprise') || plan.id === 20 || plan.id === 24
    };
  } finally {
    conn.release();
  }
}

export async function GetAllFeatures(): Promise<any[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM features ORDER BY page, id');
    return rows as any[];
  } finally {
    conn.release();
  }
}

export async function GetFeaturesByPage(page: string): Promise<any[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM features WHERE page = ? ORDER BY id', [page]);
    return rows as any[];
  } finally {
    conn.release();
  }
}


// AJOUTER cette nouvelle fonction
export async function GetFeaturesByRole(role: string): Promise<any[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT * FROM features WHERE role = ? ORDER BY page, id',
      [role]
    );
    console.log(`Features chargées pour rôle ${role}: ${(rows as any[]).length}`);
    return rows as any[];
  } finally {
    conn.release();
  }
}

// MODIFIER CreateFeature pour utiliser le rôle
export async function CreateFeature(featureData: { 
  name: string; 
  page: string; 
  role: string;
  parent_feature_id?: number | null;
}): Promise<any> {
  const conn = await pool.getConnection();
  try {
    console.log('Service: Création feature avec rôle:', featureData.role);
    
    // 1. Créer la feature
    const [result] = await conn.query(
      'INSERT INTO features (name, page, role, parent_feature_id) VALUES (?, ?, ?, ?)',
      [featureData.name, featureData.page, featureData.role, featureData.parent_feature_id || null]
    );
    
    const newFeatureId = (result as any).insertId;
    console.log('Service: Feature créée avec ID:', newFeatureId);
    
    // 2. IDs fixes des plans entreprise
    const enterprisePlanIds: { [key: string]: number } = {
      'artisan': 20,    // Plan Entreprise Artisan
      'annonceur': 24   // Plan Entreprise Annonceur
    };
    
    const enterprisePlanId = enterprisePlanIds[featureData.role];
    
    if (enterprisePlanId) {
      //CORRECTION : Vérifier si la liaison existe déjà
      const [existingLink] = await conn.query(
        'SELECT * FROM feature_plans WHERE feature_id = ? AND plan_id = ?',
        [newFeatureId, enterprisePlanId]
      );
      
      if ((existingLink as any[]).length === 0) {
        // Seulement insérer si la liaison n'existe pas
        await conn.query(
          'INSERT INTO feature_plans (feature_id, plan_id) VALUES (?, ?)',
          [newFeatureId, enterprisePlanId]
        );
        console.log(`Service: Feature liée au plan entreprise ${enterprisePlanId} (${featureData.role})`);
      } else {
        console.log('ℹLiaison existe déjà, pas de doublon créé');
      }
    } else {
      console.warn('⚠️ Service: Aucun plan entreprise défini pour rôle:', featureData.role);
    }
    
    // 3. Retourner la feature créée
    const [newFeature] = await conn.query('SELECT * FROM features WHERE id = ?', [newFeatureId]);
    return (newFeature as any[])[0];
    
  } catch (error: any) {
    console.error('Service: Erreur création feature:', error);
    throw error;
  } finally {
    conn.release();
  }
}
export async function UpdateFeature(id: number, featureData: Partial<any>): Promise<any> {
  const conn = await pool.getConnection();
  try {
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(featureData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('Aucune donnée à mettre à jour');
    }

    values.push(id);

    await conn.query(
      `UPDATE features SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedFeature] = await conn.query('SELECT * FROM features WHERE id = ?', [id]);
    return (updatedFeature as any[])[0];
  } finally {
    conn.release();
  }
}

export async function DeleteFeature(id: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query('DELETE FROM features WHERE id = ?', [id]);
  } finally {
    conn.release();
  }
}

export async function GetPlanFeatures(planId: number): Promise<any[]> {
  const conn = await pool.getConnection();
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
    
    return rows as any[];
  } finally {
    conn.release();
  }
}

export async function AddFeatureToPlan(featureId: number, planId: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'INSERT IGNORE INTO feature_plans (feature_id, plan_id) VALUES (?, ?)',
      [featureId, planId]
    );
  } finally {
    conn.release();
  }
}

export async function RemoveFeatureFromPlan(featureId: number, planId: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'DELETE FROM feature_plans WHERE feature_id = ? AND plan_id = ?',
      [featureId, planId]
    );
  } finally {
    conn.release();
  }
}