// import pool from "../config/db";
// import { RowDataPacket, ResultSetHeader } from 'mysql2';

// // ============================================
// // INTERFACES
// // ============================================

// export interface Plan {
//   id: number;
//   name: string;
//   subtitle?: string;
//   description?: string;
//   target_audience?: string;
//   key_benefits?: string;
//   detailed_features?: string;
//   why_choose?: string;
//   icon_name?: string;
//   gradient?: string;
//   price: number;
//   period: string;
//   features?: string; // JSON
//   popular: number;
//   color: string;
//   stripe_link?: string;
//   is_default: number;
//   role: string;
// }

// export interface Feature {
//   id: number;
//   name: string;
//   page: string;
//   parent_feature_id: number | null;
// }

// export interface FeaturePlan {
//   feature_id: number;
//   plan_id: number;
// }

// export interface FeaturePlanDetailed extends FeaturePlan {
//   feature_name?: string;
//   feature_page?: string;
//   plan_name?: string;
//   plan_role?: string;
// }

// // ============================================
// // SERVICES - PLANS
// // ============================================

// /**
//  * Récupérer tous les plans
//  */
// export async function GetAllPlans(): Promise<Plan[]> {
//   const conn = await pool.getConnection();
  
//   try {
//     const [rows] = await conn.query<RowDataPacket[]>(
//       'SELECT * FROM plans ORDER BY role, price ASC'
//     );
    
//     // Parser les champs JSON si nécessaire
//     const plans = rows.map((p: any) => ({
//       ...p,
//       features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features,
//       key_benefits: typeof p.key_benefits === 'string' ? JSON.parse(p.key_benefits || '[]') : p.key_benefits,
//       detailed_features: typeof p.detailed_features === 'string' ? JSON.parse(p.detailed_features || '[]') : p.detailed_features
//     }));
    
//     return plans;
//   } catch (err: any) {
//     const error = new Error('Erreur lors de la récupération des plans');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Récupérer les plans par rôle
//  */
// export async function GetPlansByRole(role: string): Promise<Plan[]> {
//   if (!role || !['artisan', 'annonceur'].includes(role)) {
//     const err = new Error('Rôle invalide. Valeurs acceptées: artisan, annonceur');
//     (err as any).statusCode = 400;
//     throw err;
//   }

//   const conn = await pool.getConnection();
  
//   try {
//     const [rows] = await conn.query<RowDataPacket[]>(
//       'SELECT * FROM plans WHERE role = ? ORDER BY price ASC',
//       [role]
//     );
    
//     const plans = rows.map((p: any) => ({
//       ...p,
//       features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features,
//       key_benefits: typeof p.key_benefits === 'string' ? JSON.parse(p.key_benefits || '[]') : p.key_benefits,
//       detailed_features: typeof p.detailed_features === 'string' ? JSON.parse(p.detailed_features || '[]') : p.detailed_features
//     }));
    
//     return plans;
//   } catch (err: any) {
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors de la récupération des plans par rôle');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Récupérer un plan par ID
//  */
// export async function GetPlanById(planId: number): Promise<Plan> {
//   const conn = await pool.getConnection();
  
//   try {
//     const [rows] = await conn.query<RowDataPacket[]>(
//       'SELECT * FROM plans WHERE id = ?',
//       [planId]
//     );
    
//     if (rows.length === 0) {
//       const err = new Error('Plan introuvable');
//       (err as any).statusCode = 404;
//       throw err;
//     }
    
//     const plan = rows[0] as any;
//     return {
//       ...plan,
//       features: typeof plan.features === 'string' ? JSON.parse(plan.features || '[]') : plan.features,
//       key_benefits: typeof plan.key_benefits === 'string' ? JSON.parse(plan.key_benefits || '[]') : plan.key_benefits,
//       detailed_features: typeof plan.detailed_features === 'string' ? JSON.parse(plan.detailed_features || '[]') : plan.detailed_features
//     };
//   } catch (err: any) {
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors de la récupération du plan');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// // ============================================
// // SERVICES - FEATURES
// // ============================================

// /**
//  * Récupérer toutes les features
//  */
// export async function GetAllFeatures(): Promise<Feature[]> {
//   const conn = await pool.getConnection();
  
//   try {
//     const [rows] = await conn.query<RowDataPacket[]>(
//       'SELECT * FROM features ORDER BY page, name'
//     );
    
//     return rows as Feature[];
//   } catch (err: any) {
//     const error = new Error('Erreur lors de la récupération des fonctionnalités');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Récupérer les features par page
//  */
// export async function GetFeaturesByPage(page: string): Promise<Feature[]> {
//   if (!page) {
//     const err = new Error('Le paramètre "page" est requis');
//     (err as any).statusCode = 400;
//     throw err;
//   }

//   const conn = await pool.getConnection();
  
//   try {
//     const [rows] = await conn.query<RowDataPacket[]>(
//       'SELECT * FROM features WHERE page = ? ORDER BY name',
//       [page]
//     );
    
//     return rows as Feature[];
//   } catch (err: any) {
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors de la récupération des fonctionnalités');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Récupérer une feature par ID
//  */
// export async function GetFeatureById(featureId: number): Promise<Feature> {
//   const conn = await pool.getConnection();
  
//   try {
//     const [rows] = await conn.query<RowDataPacket[]>(
//       'SELECT * FROM features WHERE id = ?',
//       [featureId]
//     );
    
//     if (rows.length === 0) {
//       const err = new Error('Fonctionnalité introuvable');
//       (err as any).statusCode = 404;
//       throw err;
//     }
    
//     return rows[0] as Feature;
//   } catch (err: any) {
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors de la récupération de la fonctionnalité');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Créer une nouvelle feature
//  */
// export async function CreateFeature(data: {
//   name: string;
//   page: string;
//   parent_feature_id?: number | null;
// }): Promise<{ id: number; message: string }> {
//   const { name, page, parent_feature_id } = data;

//   // Validation
//   if (!name || name.trim() === '') {
//     const err = new Error('Le nom de la fonctionnalité est obligatoire');
//     (err as any).statusCode = 400;
//     throw err;
//   }

//   if (!page || page.trim() === '') {
//     const err = new Error('La page est obligatoire');
//     (err as any).statusCode = 400;
//     throw err;
//   }

//   const conn = await pool.getConnection();
  
//   try {
//     await conn.beginTransaction();

//     // Vérifier si parent existe (si fourni)
//     if (parent_feature_id !== null && parent_feature_id !== undefined) {
//       const [parentRows] = await conn.query<RowDataPacket[]>(
//         'SELECT id FROM features WHERE id = ?',
//         [parent_feature_id]
//       );
      
//       if (parentRows.length === 0) {
//         await conn.rollback();
//         const err = new Error('La fonctionnalité parente n\'existe pas');
//         (err as any).statusCode = 404;
//         throw err;
//       }
//     }

//     // Insérer la nouvelle feature
//     const [result] = await conn.query<ResultSetHeader>(
//       'INSERT INTO features (name, page, parent_feature_id) VALUES (?, ?, ?)',
//       [name.trim(), page.trim(), parent_feature_id || null]
//     );

//     await conn.commit();

//     return {
//       id: result.insertId,
//       message: 'Fonctionnalité créée avec succès'
//     };
//   } catch (err: any) {
//     await conn.rollback();
    
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors de la création de la fonctionnalité');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Mettre à jour une feature
//  */
// export async function UpdateFeature(
//   featureId: number,
//   data: {
//     name?: string;
//     page?: string;
//     parent_feature_id?: number | null;
//   }
// ): Promise<{ message: string }> {
//   const { name, page, parent_feature_id } = data;

//   const conn = await pool.getConnection();
  
//   try {
//     await conn.beginTransaction();

//     // Vérifier que la feature existe
//     const [existingRows] = await conn.query<RowDataPacket[]>(
//       'SELECT id FROM features WHERE id = ?',
//       [featureId]
//     );

//     if (existingRows.length === 0) {
//       await conn.rollback();
//       const err = new Error('Fonctionnalité introuvable');
//       (err as any).statusCode = 404;
//       throw err;
//     }

//     // Vérifier que le parent existe (si fourni)
//     if (parent_feature_id !== null && parent_feature_id !== undefined) {
//       if (parent_feature_id === featureId) {
//         await conn.rollback();
//         const err = new Error('Une fonctionnalité ne peut pas être son propre parent');
//         (err as any).statusCode = 400;
//         throw err;
//       }

//       const [parentRows] = await conn.query<RowDataPacket[]>(
//         'SELECT id FROM features WHERE id = ?',
//         [parent_feature_id]
//       );

//       if (parentRows.length === 0) {
//         await conn.rollback();
//         const err = new Error('La fonctionnalité parente n\'existe pas');
//         (err as any).statusCode = 404;
//         throw err;
//       }
//     }

//     // Construire la requête UPDATE dynamiquement
//     const updates: string[] = [];
//     const values: any[] = [];

//     if (name !== undefined) {
//       updates.push('name = ?');
//       values.push(name.trim());
//     }
//     if (page !== undefined) {
//       updates.push('page = ?');
//       values.push(page.trim());
//     }
//     if (parent_feature_id !== undefined) {
//       updates.push('parent_feature_id = ?');
//       values.push(parent_feature_id);
//     }

//     if (updates.length === 0) {
//       await conn.rollback();
//       const err = new Error('Aucune modification fournie');
//       (err as any).statusCode = 400;
//       throw err;
//     }

//     values.push(featureId);

//     await conn.query(
//       `UPDATE features SET ${updates.join(', ')} WHERE id = ?`,
//       values
//     );

//     await conn.commit();

//     return { message: 'Fonctionnalité mise à jour avec succès' };
//   } catch (err: any) {
//     await conn.rollback();
    
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors de la mise à jour de la fonctionnalité');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Supprimer une feature
//  */
// export async function DeleteFeature(featureId: number): Promise<{ message: string }> {
//   const conn = await pool.getConnection();
  
//   try {
//     await conn.beginTransaction();

//     // Vérifier que la feature existe
//     const [existingRows] = await conn.query<RowDataPacket[]>(
//       'SELECT id FROM features WHERE id = ?',
//       [featureId]
//     );

//     if (existingRows.length === 0) {
//       await conn.rollback();
//       const err = new Error('Fonctionnalité introuvable');
//       (err as any).statusCode = 404;
//       throw err;
//     }

//     // Vérifier si des features enfants existent
//     const [childrenRows] = await conn.query<RowDataPacket[]>(
//       'SELECT id FROM features WHERE parent_feature_id = ?',
//       [featureId]
//     );

//     if (childrenRows.length > 0) {
//       await conn.rollback();
//       const err = new Error(
//         `Impossible de supprimer cette fonctionnalité : ${childrenRows.length} sous-fonctionnalité(s) y sont liées`
//       );
//       (err as any).statusCode = 400;
//       throw err;
//     }

//     // Supprimer les associations dans feature_plans
//     await conn.query('DELETE FROM feature_plans WHERE feature_id = ?', [featureId]);

//     // Supprimer la feature
//     await conn.query('DELETE FROM features WHERE id = ?', [featureId]);

//     await conn.commit();

//     return { message: 'Fonctionnalité supprimée avec succès' };
//   } catch (err: any) {
//     await conn.rollback();
    
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors de la suppression de la fonctionnalité');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// // ============================================
// // SERVICES - FEATURE_PLANS (Associations)
// // ============================================

// /**
//  * Récupérer toutes les associations feature_plans
//  */
// export async function GetAllFeaturePlans(): Promise<FeaturePlanDetailed[]> {
//   const conn = await pool.getConnection();
  
//   try {
//     const [rows] = await conn.query<RowDataPacket[]>(
//       `SELECT 
//         fp.feature_id,
//         fp.plan_id,
//         f.name as feature_name,
//         f.page as feature_page,
//         p.name as plan_name,
//         p.role as plan_role
//        FROM feature_plans fp
//        JOIN features f ON fp.feature_id = f.id
//        JOIN plans p ON fp.plan_id = p.id
//        ORDER BY p.role, p.price, f.page, f.name`
//     );
    
//     return rows as FeaturePlanDetailed[];
//   } catch (err: any) {
//     const error = new Error('Erreur lors de la récupération des associations');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Récupérer les features d'un plan spécifique
//  */
// export async function GetFeaturesByPlan(planId: number): Promise<FeaturePlanDetailed[]> {
//   const conn = await pool.getConnection();
  
//   try {
//     // Vérifier que le plan existe
//     const [planRows] = await conn.query<RowDataPacket[]>(
//       'SELECT id FROM plans WHERE id = ?',
//       [planId]
//     );

//     if (planRows.length === 0) {
//       const err = new Error('Plan introuvable');
//       (err as any).statusCode = 404;
//       throw err;
//     }

//     const [rows] = await conn.query<RowDataPacket[]>(
//       `SELECT 
//         fp.feature_id,
//         fp.plan_id,
//         f.name as feature_name,
//         f.page as feature_page,
//         f.parent_feature_id
//        FROM feature_plans fp
//        JOIN features f ON fp.feature_id = f.id
//        WHERE fp.plan_id = ?
//        ORDER BY f.page, f.name`,
//       [planId]
//     );
    
//     return rows as FeaturePlanDetailed[];
//   } catch (err: any) {
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors de la récupération des fonctionnalités du plan');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Récupérer les plans qui ont une feature spécifique
//  */
// export async function GetPlansByFeature(featureId: number): Promise<FeaturePlanDetailed[]> {
//   const conn = await pool.getConnection();
  
//   try {
//     // Vérifier que la feature existe
//     const [featureRows] = await conn.query<RowDataPacket[]>(
//       'SELECT id FROM features WHERE id = ?',
//       [featureId]
//     );

//     if (featureRows.length === 0) {
//       const err = new Error('Fonctionnalité introuvable');
//       (err as any).statusCode = 404;
//       throw err;
//     }

//     const [rows] = await conn.query<RowDataPacket[]>(
//       `SELECT 
//         fp.feature_id,
//         fp.plan_id,
//         p.name as plan_name,
//         p.role as plan_role,
//         p.price
//        FROM feature_plans fp
//        JOIN plans p ON fp.plan_id = p.id
//        WHERE fp.feature_id = ?
//        ORDER BY p.role, p.price`,
//       [featureId]
//     );
    
//     return rows as FeaturePlanDetailed[];
//   } catch (err: any) {
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors de la récupération des plans');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Ajouter une feature à un plan
//  */
// export async function AddFeatureToPlan(
//   featureId: number,
//   planId: number
// ): Promise<{ message: string }> {
//   const conn = await pool.getConnection();
  
//   try {
//     await conn.beginTransaction();

//     // Vérifier que la feature existe
//     const [featureRows] = await conn.query<RowDataPacket[]>(
//       'SELECT id FROM features WHERE id = ?',
//       [featureId]
//     );

//     if (featureRows.length === 0) {
//       await conn.rollback();
//       const err = new Error('Fonctionnalité introuvable');
//       (err as any).statusCode = 404;
//       throw err;
//     }

//     // Vérifier que le plan existe
//     const [planRows] = await conn.query<RowDataPacket[]>(
//       'SELECT id FROM plans WHERE id = ?',
//       [planId]
//     );

//     if (planRows.length === 0) {
//       await conn.rollback();
//       const err = new Error('Plan introuvable');
//       (err as any).statusCode = 404;
//       throw err;
//     }

//     // Vérifier si l'association existe déjà
//     const [existingRows] = await conn.query<RowDataPacket[]>(
//       'SELECT * FROM feature_plans WHERE feature_id = ? AND plan_id = ?',
//       [featureId, planId]
//     );

//     if (existingRows.length > 0) {
//       await conn.rollback();
//       const err = new Error('Cette fonctionnalité est déjà associée à ce plan');
//       (err as any).statusCode = 409;
//       throw err;
//     }

//     // Créer l'association
//     await conn.query(
//       'INSERT INTO feature_plans (feature_id, plan_id) VALUES (?, ?)',
//       [featureId, planId]
//     );

//     await conn.commit();

//     return { message: 'Fonctionnalité ajoutée au plan avec succès' };
//   } catch (err: any) {
//     await conn.rollback();
    
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors de l\'ajout de la fonctionnalité au plan');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Retirer une feature d'un plan
//  */
// export async function RemoveFeatureFromPlan(
//   featureId: number,
//   planId: number
// ): Promise<{ message: string }> {
//   const conn = await pool.getConnection();
  
//   try {
//     await conn.beginTransaction();

//     // Vérifier si l'association existe
//     const [existingRows] = await conn.query<RowDataPacket[]>(
//       'SELECT * FROM feature_plans WHERE feature_id = ? AND plan_id = ?',
//       [featureId, planId]
//     );

//     if (existingRows.length === 0) {
//       await conn.rollback();
//       const err = new Error('Association introuvable');
//       (err as any).statusCode = 404;
//       throw err;
//     }

//     // Supprimer l'association
//     await conn.query(
//       'DELETE FROM feature_plans WHERE feature_id = ? AND plan_id = ?',
//       [featureId, planId]
//     );

//     await conn.commit();

//     return { message: 'Fonctionnalité retirée du plan avec succès' };
//   } catch (err: any) {
//     await conn.rollback();
    
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors du retrait de la fonctionnalité du plan');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

// /**
//  * Mise à jour en masse (batch) des associations
//  */
// export async function BatchUpdateFeaturePlans(
//   featurePlans: FeaturePlan[]
// ): Promise<{ message: string; count: number }> {
//   if (!Array.isArray(featurePlans) || featurePlans.length === 0) {
//     const err = new Error('Le tableau d\'associations est requis et ne peut pas être vide');
//     (err as any).statusCode = 400;
//     throw err;
//   }

//   const conn = await pool.getConnection();
  
//   try {
//     await conn.beginTransaction();

//     let count = 0;

//     for (const fp of featurePlans) {
//       // Vérifier si existe déjà
//       const [existing] = await conn.query<RowDataPacket[]>(
//         'SELECT * FROM feature_plans WHERE feature_id = ? AND plan_id = ?',
//         [fp.feature_id, fp.plan_id]
//       );

//       if (existing.length === 0) {
//         // Insérer
//         await conn.query(
//           'INSERT INTO feature_plans (feature_id, plan_id) VALUES (?, ?)',
//           [fp.feature_id, fp.plan_id]
//         );
//         count++;
//       }
//     }

//     await conn.commit();

//     return {
//       message: 'Mise à jour en masse effectuée avec succès',
//       count
//     };
//   } catch (err: any) {
//     await conn.rollback();
    
//     if ((err as any).statusCode) throw err;
    
//     const error = new Error('Erreur lors de la mise à jour en masse');
//     (error as any).statusCode = 500;
//     throw error;
//   } finally {
//     conn.release();
//   }
// }



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

// export async function CreateFeature(featureData: Omit<any, 'id'>): Promise<any> {
//   const conn = await pool.getConnection();
//   try {
//     console.log(' Création feature avec données:', featureData);
    
//     // 1. La BD génère l'ID automatiquement (AUTO_INCREMENT)
//     const [result] = await conn.query(
//       'INSERT INTO features (name, page, parent_feature_id) VALUES (?, ?, ?)',
//       [featureData.name, featureData.page, featureData.parent_feature_id || null]
//     );
    
//     const newFeatureId = (result as any).insertId;
//     console.log(' Feature créée avec ID:', newFeatureId);
    
//     // 2. Récupérer la feature complète
//     const [newFeature] = await conn.query('SELECT * FROM features WHERE id = ?', [newFeatureId]);
    
//     return (newFeature as any[])[0];
//   } catch (error: any) {
//     console.error(' Erreur création feature:', error);
//     throw error;
//   } finally {
//     conn.release();
//   }
// }

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
    console.log('🆕 Service: Création feature avec rôle:', featureData.role);
    
    // 1. Créer la feature
    const [result] = await conn.query(
      'INSERT INTO features (name, page, role, parent_feature_id) VALUES (?, ?, ?, ?)',
      [featureData.name, featureData.page, featureData.role, featureData.parent_feature_id || null]
    );
    
    const newFeatureId = (result as any).insertId;
    console.log('✅ Service: Feature créée avec ID:', newFeatureId);
    
    // 2. IDs fixes des plans entreprise
    const enterprisePlanIds: { [key: string]: number } = {
      'artisan': 20,    // Plan Entreprise Artisan
      'annonceur': 24   // Plan Entreprise Annonceur
    };
    
    const enterprisePlanId = enterprisePlanIds[featureData.role];
    
    if (enterprisePlanId) {
      // ✅ CORRECTION : Vérifier si la liaison existe déjà
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
        console.log(`✅ Service: Feature liée au plan entreprise ${enterprisePlanId} (${featureData.role})`);
      } else {
        console.log('ℹ️  Liaison existe déjà, pas de doublon créé');
      }
    } else {
      console.warn('⚠️ Service: Aucun plan entreprise défini pour rôle:', featureData.role);
    }
    
    // 3. Retourner la feature créée
    const [newFeature] = await conn.query('SELECT * FROM features WHERE id = ?', [newFeatureId]);
    return (newFeature as any[])[0];
    
  } catch (error: any) {
    console.error('❌ Service: Erreur création feature:', error);
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