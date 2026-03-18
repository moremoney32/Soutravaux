// services/AuthorizationService.ts
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

export interface AuthorizationResult {
  authorized: boolean;
  role?: 'admin' | 'collaborator';
  reason?: string;
}

/**
 * Vérifier si un membre a accès à une société
 * et identifier son rôle (admin ou collaborateur)
 */
export async function verifyAccess(
  societeId: number,
  membreId: number
): Promise<AuthorizationResult> {
  
  const conn = await pool.getConnection();
  
  try {
    console.log(`🔐 [AuthorizationService] Vérification accès societe=${societeId}, membre=${membreId}`);
    
    // 1️⃣ Vérifier si membre existe et est actif
    const [membreRows] = await conn.query<RowDataPacket[]>(
      `SELECT id, is_collaborator, type, statut 
       FROM membres 
       WHERE id = ?`,
      [membreId]
    );
    
    if (!membreRows.length) {
      console.log('❌ Membre introuvable');
      return { authorized: false, reason: 'member_not_found' };
    }
    
    const membre = membreRows[0];
    
    if (membre.statut !== 'actif') {
      console.log('❌ Membre inactif');
      return { authorized: false, reason: 'member_inactive' };
    }
    
    // 2️⃣ Vérifier si membre est ADMIN de la société
    const [adminRows] = await conn.query<RowDataPacket[]>(
      `SELECT m.id 
       FROM societes s
       JOIN membres m ON s.refmembre = m.ref
       WHERE s.id = ? AND m.id = ?`,
      [societeId, membreId]
    );
    
    if (adminRows.length > 0) {
      console.log('✅ ADMIN de la société');
      return { authorized: true, role: 'admin' };
    }
    
    // 3️⃣ Vérifier si membre est COLLABORATEUR de la société
    const [collabRows] = await conn.query<RowDataPacket[]>(
      `SELECT 1 
       FROM membre_poste_assignments 
       WHERE membre_id = ? 
       AND societe_id = ?
       AND (expires_at IS NULL OR expires_at > NOW())
       LIMIT 1`,
      [membreId, societeId]
    );
    
    if (collabRows.length > 0) {
      console.log('✅ COLLABORATEUR de la société');
      return { authorized: true, role: 'collaborator' };
    }
    
    // 4️⃣ Pas autorisé
    console.log('❌ Membre non autorisé pour cette société');
    return { authorized: false, reason: 'not_member_of_societe' };
    
  } catch (error) {
    console.error('❌ Erreur vérification accès:', error);
    return { authorized: false, reason: 'internal_error' };
  } finally {
    conn.release();
  }
}

/**
 * Récupérer email d'un membre
 */
export async function getMembreEmail(membreId: number): Promise<string | null> {
  const conn = await pool.getConnection();
  
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT email FROM membres WHERE id = ?`,
      [membreId]
    );
    
    return rows.length ? rows[0].email : null;
  } finally {
    conn.release();
  }
}

/**
 * Récupérer infos complètes d'un membre
 */
export async function getMembreInfo(membreId: number) {
  const conn = await pool.getConnection();
  
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT id, ref, nom, prenom, email, is_collaborator, type 
       FROM membres 
       WHERE id = ?`,
      [membreId]
    );
    
    return rows.length ? rows[0] : null;
  } finally {
    conn.release();
  }
}