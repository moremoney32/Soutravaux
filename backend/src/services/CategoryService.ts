// services/CategoryService.ts

import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { EventCategory, CreateCategoryInput } from '../types/calendar';

/**
 * Récupérer toutes les catégories (prédéfinies + personnalisées société)
 */
export async function getCategories(societeId: number): Promise<EventCategory[]> {
  const conn = await pool.getConnection();
  
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM event_categories
       WHERE is_predefined = TRUE
          OR created_by_societe_id = ?
       ORDER BY is_predefined DESC, label ASC`,
      [societeId]
    );
    
    return rows as EventCategory[];
    
  } catch (error: any) {
    console.error('Erreur getCategories:', error);
    throw new Error("Erreur récupération catégories");
  } finally {
    conn.release();
  }
}

/**
 * Créer une catégorie personnalisée
 */
export async function createCategory(data: CreateCategoryInput): Promise<EventCategory> {
  const conn = await pool.getConnection();
  
  try {
    // Vérifier si label existe déjà pour cette société
    const [existing] = await conn.query<RowDataPacket[]>(
      `SELECT id FROM event_categories 
       WHERE label = ? AND (is_predefined = TRUE OR created_by_societe_id = ?)`,
      [data.label, data.societe_id]
    );
    
    if (existing.length > 0) {
      throw new Error("Une catégorie avec ce nom existe déjà");
    }
    
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO event_categories 
       (label, icon, color, is_predefined, created_by_societe_id, requires_location)
       VALUES (?, ?, ?, FALSE, ?, ?)`,
      [
        data.label,
        data.icon || '📌',
        data.color || '#E77131',
        data.societe_id,
        data.requires_location || false
      ]
    );
    
    const categoryId = result.insertId;
    
    // Récupérer la catégorie créée
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM event_categories WHERE id = ?`,
      [categoryId]
    );
    
    console.log(`✅ Catégorie "${data.label}" créée (ID: ${categoryId})`);
    
    return rows[0] as EventCategory;
    
  } catch (error: any) {
    console.error('Erreur createCategory:', error);
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Récupérer une catégorie par ID
 */
export async function getCategoryById(categoryId: number): Promise<EventCategory | null> {
  const conn = await pool.getConnection();
  
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM event_categories WHERE id = ?`,
      [categoryId]
    );
    
    return rows.length > 0 ? (rows[0] as EventCategory) : null;
    
  } catch (error: any) {
    console.error('Erreur getCategoryById:', error);
    return null;
  } finally {
    conn.release();
  }
}