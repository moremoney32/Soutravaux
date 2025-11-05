import pool from "../config/db";

import { RowDataPacket } from "mysql2";
import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { ActiviteDTO, DepartementDTO, GroupType, PreSocieteDTO, SendNotificationPayload, SendNotificationResponse, SocieteDTO } from "../types/Pushnotifications";

// ===== RÉCUPÉRATION DES PRÉSOCIÉTÉS =====
export async function getPreSocietes(
  role: GroupType,
  activiteIds?: string[],
  departementIds?: string[]
): Promise<PreSocieteDTO[]> {
  const conn = await pool.getConnection();


  
  try {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.siret,
        p.createdAt,
        p.role,
        p.ville,
        p.cp,
        p.activity,
        0 as isNotified
      FROM presocietes p
      WHERE p.role = ?
    `;
    
    const params: any[] = [role];

    // Filtrer par activité si spécifié
    if (activiteIds && activiteIds.length > 0) {
      query += ` AND p.activity IN (${activiteIds.map(() => '?').join(',')})`;
      params.push(...activiteIds);
    }

    // Filtrer par département via code postal (cp)
    // On compare les 2 premiers chiffres du CP avec le numéro du département
    if (departementIds && departementIds.length > 0) {
      // Créer une sous-requête pour récupérer les numéros de départements
      const [departments] = await conn.query<RowDataPacket[]>(
        `SELECT numero FROM departements WHERE id IN (${departementIds.map(() => '?').join(',')})`,
        departementIds
      );
      
      const departmentNumbers = departments.map((d: any) => d.numero);
      
      if (departmentNumbers.length > 0) {
        // Filtrer les présociétés dont le CP commence par un des numéros de département
        const cpConditions = departmentNumbers.map(() => 'LEFT(p.cp, 2) = ?').join(' OR ');
        query += ` AND (${cpConditions})`;
        params.push(...departmentNumbers);
      }
    }
    
    query += ` ORDER BY p.createdAt DESC`;

    const [rows] = await conn.query<RowDataPacket[]>(query, params);
    
    return rows.map((row: any) => ({
      id: String(row.id),
      name: row.name || 'Sans nom',
      siret: row.siret,
      createdDate: new Date(row.createdAt).toISOString(),
      isNotified: false, // À implémenter apres
      group: row.role as GroupType,
      ville: row.ville,
      cp: row.cp,
      activity: row.activity
    }));
    
  } finally {
    conn.release();
  }
}

// ===== RÉCUPÉRATION DES SOCIÉTÉS =====
export async function getSocietes(
  role: GroupType,
  activiteIds?: string[],
  departementIds?: string[]
): Promise<SocieteDTO[]> {
  const conn = await pool.getConnection();
  
  try {
    let query = `
      SELECT DISTINCT
        s.id,
        s.nomsociete,
        s.email,
        s.date_creation,
        s.role,
        s.siret,
        s.refmembre
      FROM societes s
      WHERE s.role = ?
    `;
    
    const params: any[] = [role];

    // SI des filtres sont appliqués, on fait la jointure
    if ((activiteIds && activiteIds.length > 0) || (departementIds && departementIds.length > 0)) {
      query = `
        SELECT DISTINCT
          s.id,
          s.nomsociete,
          s.email,
          s.date_creation,
          s.role,
          s.siret,
          s.refmembre
        FROM societes s
        INNER JOIN activite_departement_societes ads ON ads.societe_id = s.id
        WHERE s.role = ?
      `;

      // Filtrage par activité
      if (activiteIds && activiteIds.length > 0) {
        query += ` AND ads.activite_id IN (${activiteIds.map(() => '?').join(',')})`;
        params.push(...activiteIds);
      }

      // Filtrage par département
      if (departementIds && departementIds.length > 0) {
        query += ` AND ads.departement_id IN (${departementIds.map(() => '?').join(',')})`;
        params.push(...departementIds);
      }
    }

    query += ` ORDER BY s.date_creation DESC`;

    const [rows] = await conn.query<RowDataPacket[]>(query, params);
    
    // Retourner les sociétés (SANS récupérer leurs activités/départements pour l'instant)
    const societes = rows.map((row: any) => ({
      id: String(row.id),
      name: row.nomsociete,
      email: row.email,
      createdDate: new Date(row.date_creation).toISOString(),
      isNotified: false,
      group: row.role as GroupType,
      activites: [], // On ne charge pas les activités maintenant
      departements: [], // On ne charge pas les départements maintenant
      siret: row.siret
    }));

    return societes;
    
  } finally {
    conn.release();
  }
}

// ===== RÉCUPÉRATION DES ACTIVITÉS =====
export async function getActivites(): Promise<ActiviteDTO[]> {
  const conn = await pool.getConnection();
  
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT id, nom FROM activites ORDER BY nom ASC`
    );
    
    return rows.map((row: any) => ({
      id: String(row.id),
      name: row.nom
    }));
    
  } finally {
    conn.release();
  }
}

// ===== RÉCUPÉRATION DES DÉPARTEMENTS =====
export async function getDepartements(): Promise<DepartementDTO[]> {
  const conn = await pool.getConnection();
  
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT id, numero, nom FROM departements ORDER BY numero ASC`
    );
    
    return rows.map((row: any) => ({
      id: String(row.id),
      name: row.nom,
      code: row.numero
    }));
    
  } finally {
    conn.release();
  }
}

// ===== ENVOI DE NOTIFICATION =====
export async function sendNotification(
  payload: SendNotificationPayload
): Promise<SendNotificationResponse> {
  const conn = await pool.getConnection();
  interface OneSignalResponse {
  id?: string;
  recipients?: number;
  errors?: string[];
  error?: string;
}
  
  try {
    await conn.beginTransaction();

    let totalRecipients = 0;
    const recipientUserIds: string[] = [];

    // Récupérer les IDs utilisateurs des présociétés sélectionnées
    if (payload.recipients.preSocieteIds && payload.recipients.preSocieteIds.length > 0) {
      const [preSocietes] = await conn.query<RowDataPacket[]>(
        `SELECT p.id, p.name, m.id as membre_id, m.email
         FROM presocietes p
         INNER JOIN membres m ON m.id = p.membre_id
         WHERE p.id IN (${payload.recipients.preSocieteIds.map(() => '?').join(',')})`,
        payload.recipients.preSocieteIds
      );
      
      preSocietes.forEach((ps: any) => {
        if (ps.membre_id) recipientUserIds.push(ps.membre_id.toString());
      });
      
      totalRecipients += preSocietes.length;
    }

    // Récupérer les IDs utilisateurs des sociétés sélectionnées
    if (payload.recipients.societeIds && payload.recipients.societeIds.length > 0) {
      const [societes] = await conn.query<RowDataPacket[]>(
        `SELECT s.id, s.email, m.id as membre_id
         FROM societes s
         INNER JOIN membres m ON m.email = s.email
         WHERE s.id IN (${payload.recipients.societeIds.map(() => '?').join(',')})`,
        payload.recipients.societeIds
      );
      
      societes.forEach((s: any) => {
        if (s.membre_id) recipientUserIds.push(s.membre_id.toString());
      });
      
      totalRecipients += societes.length;
    }

    console.log(' IDs utilisateurs à notifier:', recipientUserIds);

    // Envoi réel via OneSignal
    let pushSent = 0;
    let internalSent = 0;

    if (payload.notificationTypes.includes('push') && recipientUserIds.length > 0) {
      try {
        const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
          },
          body: JSON.stringify({
            app_id: process.env.ONESIGNAL_APP_ID,
            include_external_user_ids:recipientUserIds, //recipientUserIds,
            headings: {
              en: 'Solutravo',
              fr: 'Solutravo'
            },
            contents: {
              en: `${payload.emoji} ${payload.message}`,
              fr: `${payload.emoji} ${payload.message}`
            },
            data: {
              type: 'notification',
              timestamp: new Date().toISOString()
            }
          })
        });

         const oneSignalResult = await oneSignalResponse.json() as OneSignalResponse;
        
        if (oneSignalResponse.ok) {
          console.log('OneSignal notification sent:', oneSignalResult);
          
          //Vérification de type sécurisée
          if (oneSignalResult && typeof oneSignalResult === 'object' && 'recipients' in oneSignalResult) {
            pushSent = oneSignalResult.recipients || recipientUserIds.length;
          } else {
            pushSent = recipientUserIds.length;
          }
        } else {
          console.error(' OneSignal error:', oneSignalResult);
          
          //Vérification de type sécurisée pour les erreurs
          let errorMessage = 'OneSignal failed';
          if (oneSignalResult && typeof oneSignalResult === 'object') {
            if (Array.isArray(oneSignalResult.errors)) {
              errorMessage = oneSignalResult.errors.join(', ');
            } else if (oneSignalResult.error && typeof oneSignalResult.error === 'string') {
              errorMessage = oneSignalResult.error;
            } else if (oneSignalResult.errors && typeof oneSignalResult.errors === 'string') {
              errorMessage = oneSignalResult.errors;
            }
          }
          throw new Error(errorMessage);
        }
        
      } catch (error: any) {
        console.error(' Erreur OneSignal:', error);
        pushSent = 0;
        // Ne pas throw pour continuer avec internal notifications
      }
    }

    if (payload.notificationTypes.includes('internal')) {
      console.log('Envoi de notifications INTERNES à:', recipientUserIds.length, 'utilisateurs');
      internalSent = recipientUserIds.length;
    }

    await conn.commit();

    return {
      success: true,
      message: `Notification envoyée avec succès à ${totalRecipients} destinataire(s)`,
      sentCount: totalRecipients,
      failedCount: 0,
      details: {
        pushSent,
        internalSent
      }
    };
    
  } catch (error: any) {
    await conn.rollback();
    console.error(' Erreur lors de l\'envoi de notification:', error);
    throw new Error(`Échec de l'envoi de notification: ${error.message}`);
  } finally {
    conn.release();
  }
}

// STATISTIQUES
export async function getNotificationStats(role: GroupType) {
  const conn = await pool.getConnection();
  
  try {
    const [preSocietesCount] = await conn.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM presocietes WHERE role = ?`,
      [role]
    );

    const [societesCount] = await conn.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM societes WHERE role = ?`,
      [role]
    );

    return {
      preSocietesCount: preSocietesCount[0].count,
      societesCount: societesCount[0].count,
      totalCount: preSocietesCount[0].count + societesCount[0].count
    };
    
  } finally {
    conn.release();
  }
}