"use strict";
// services/CollaboratorsService.ts
// Service pour gérer les collaborateurs d'une société
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollaboratorsBySociete = getCollaboratorsBySociete;
exports.getUniqueCollaboratorsBySociete = getUniqueCollaboratorsBySociete;
exports.isCollaboratorOfSociete = isCollaboratorOfSociete;
exports.assignCollaborator = assignCollaborator;
exports.removeCollaborator = removeCollaborator;
exports.getSocietesByCollaborator = getSocietesByCollaborator;
exports.updateAssignmentExpiry = updateAssignmentExpiry;
const db_1 = __importDefault(require("../config/db"));
/**
 * Récupérer tous les collaborateurs d'une société (exclut le propriétaire)
 * @param societeId - ID de la société
 * @returns Liste des collaborateurs avec leurs informations (sans le propriétaire)
 */
async function getCollaboratorsBySociete(societeId) {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query(`SELECT 
        mpa.id,
        mpa.membre_id,
        m.email,
        m.nom,
        m.prenom,
        mpa.poste_id,
        mpa.societe_id,
        mpa.assigned_at,
        mpa.expires_at,
        s.nomsociete
      FROM membre_poste_assignments mpa
      JOIN membres m ON mpa.membre_id = m.id
      JOIN societes s ON mpa.societe_id = s.id
      JOIN membres owner ON s.refmembre = owner.ref
      WHERE mpa.societe_id = ?
        AND mpa.membre_id != owner.id
        AND (mpa.expires_at IS NULL OR mpa.expires_at > NOW())
        AND m.statut = 'actif'
      ORDER BY m.nom, m.prenom`, [societeId]);
        return rows;
    }
    finally {
        conn.release();
    }
}
/**
 * Récupérer les collaborateurs distincts (par email) d'une société (exclut le propriétaire)
 * Utile pour éviter les doublons si un membre a plusieurs postes
 * @param societeId - ID de la société
 * @returns Liste des collaborateurs uniques (sans le propriétaire)
 */
async function getUniqueCollaboratorsBySociete(societeId) {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query(`SELECT DISTINCT
        m.id as membre_id,
        m.email,
        m.nom,
        m.prenom,
        mpa.societe_id,
        MIN(mpa.poste_id) as poste_id,
        MIN(mpa.assigned_at) as assigned_at,
        MIN(mpa.expires_at) as expires_at
      FROM membre_poste_assignments mpa
      JOIN membres m ON mpa.membre_id = m.id
      JOIN societes s ON mpa.societe_id = s.id
      JOIN membres owner ON s.refmembre = owner.ref
      WHERE mpa.societe_id = ?
        AND mpa.membre_id != owner.id
        AND (mpa.expires_at IS NULL OR mpa.expires_at > NOW())
        AND m.statut = 'actif'
      GROUP BY m.id
      ORDER BY m.nom, m.prenom`, [societeId]);
        return rows;
    }
    finally {
        conn.release();
    }
}
/**
 * Vérifier si un membre est collaborateur d'une société
 * @param memberId - ID du membre
 * @param societeId - ID de la société
 * @returns true si le membre est collaborateur actif
 */
async function isCollaboratorOfSociete(memberId, societeId) {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query(`SELECT 1 FROM membre_poste_assignments
       WHERE membre_id = ?
         AND societe_id = ?
         AND (expires_at IS NULL OR expires_at > NOW())
       LIMIT 1`, [memberId, societeId]);
        return rows.length > 0;
    }
    finally {
        conn.release();
    }
}
/**
 * Assigner un collaborateur à une société
 * @param memberId - ID du membre
 * @param posteId - ID du poste
 * @param societeId - ID de la société
 * @param assignedBy - ID du membre qui assigne (optionnel)
 * @param expiresAt - Date d'expiration de l'assignation (optionnel)
 * @returns ID de l'assignation créée
 */
async function assignCollaborator(memberId, posteId, societeId, assignedBy, expiresAt) {
    const conn = await db_1.default.getConnection();
    try {
        const [result] = await conn.query(`INSERT INTO membre_poste_assignments 
       (membre_id, poste_id, societe_id, assigned_by, expires_at)
       VALUES (?, ?, ?, ?, ?)`, [memberId, posteId, societeId, assignedBy || null, expiresAt || null]);
        return result.insertId;
    }
    finally {
        conn.release();
    }
}
/**
 * Retirer l'assignation d'un collaborateur
 * @param memberId - ID du membre
 * @param societeId - ID de la société
 */
async function removeCollaborator(memberId, societeId) {
    const conn = await db_1.default.getConnection();
    try {
        await conn.query(`DELETE FROM membre_poste_assignments
       WHERE membre_id = ? AND societe_id = ?`, [memberId, societeId]);
    }
    finally {
        conn.release();
    }
}
/**
 * Obtenir les sociétés pour lesquelles un membre est collaborateur
 * @param memberId - ID du membre
 * @returns Liste des sociétés où le membre est assigné
 */
async function getSocietesByCollaborator(memberId) {
    const conn = await db_1.default.getConnection();
    try {
        const [rows] = await conn.query(`SELECT DISTINCT s.id as societe_id, s.nomsociete
       FROM membre_poste_assignments mpa
       JOIN societes s ON mpa.societe_id = s.id
       WHERE mpa.membre_id = ?
         AND (mpa.expires_at IS NULL OR mpa.expires_at > NOW())
       ORDER BY s.nomsociete`, [memberId]);
        return rows;
    }
    finally {
        conn.release();
    }
}
/**
 * Mettre à jour la date d'expiration d'une assignation
 * @param memberId - ID du membre
 * @param societeId - ID de la société
 * @param expiresAt - Nouvelle date d'expiration
 */
async function updateAssignmentExpiry(memberId, societeId, expiresAt) {
    const conn = await db_1.default.getConnection();
    try {
        await conn.query(`UPDATE membre_poste_assignments
       SET expires_at = ?
       WHERE membre_id = ? AND societe_id = ?`, [expiresAt, memberId, societeId]);
    }
    finally {
        conn.release();
    }
}
//# sourceMappingURL=CollaboratorsService.js.map