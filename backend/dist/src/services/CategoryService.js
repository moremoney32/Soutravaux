"use strict";
// services/CategoryService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.createCategory = createCategory;
exports.getCategoryById = getCategoryById;
const db_1 = __importDefault(require("../config/db"));
/**
 * Récupérer toutes les catégories (prédéfinies + personnalisées société)
 */
async function getCategories(societeId) {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query(`SELECT * FROM event_categories
       WHERE is_predefined = TRUE
          OR created_by_societe_id = ?
       ORDER BY is_predefined DESC, label ASC`, [societeId]);
        return rows;
    }
    catch (error) {
        console.error('Erreur getCategories:', error);
        throw new Error("Erreur récupération catégories");
    }
    finally {
        conn.release();
    }
}
/**
 * Créer une catégorie personnalisée
 */
async function createCategory(data) {
    const conn = await db_1.default.getConnection();
    try {
        // Vérifier si label existe déjà pour cette société
        const [existing] = await conn.query(`SELECT id FROM event_categories 
       WHERE label = ? AND (is_predefined = TRUE OR created_by_societe_id = ?)`, [data.label, data.societe_id]);
        if (existing.length > 0) {
            throw new Error("Une catégorie avec ce nom existe déjà");
        }
        const [result] = await conn.query(`INSERT INTO event_categories 
       (label, icon, color, is_predefined, created_by_societe_id, requires_location)
       VALUES (?, ?, ?, FALSE, ?, ?)`, [
            data.label,
            data.icon || '📌',
            data.color || '#E77131',
            data.societe_id,
            data.requires_location || false
        ]);
        const categoryId = result.insertId;
        // Récupérer la catégorie créée
        const [rows] = await conn.query(`SELECT * FROM event_categories WHERE id = ?`, [categoryId]);
        console.log(`✅ Catégorie "${data.label}" créée (ID: ${categoryId})`);
        return rows[0];
    }
    catch (error) {
        console.error('Erreur createCategory:', error);
        throw error;
    }
    finally {
        conn.release();
    }
}
/**
 * Récupérer une catégorie par ID
 */
async function getCategoryById(categoryId) {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query(`SELECT * FROM event_categories WHERE id = ?`, [categoryId]);
        return rows.length > 0 ? rows[0] : null;
    }
    catch (error) {
        console.error('Erreur getCategoryById:', error);
        return null;
    }
    finally {
        conn.release();
    }
}
//# sourceMappingURL=CategoryService.js.map