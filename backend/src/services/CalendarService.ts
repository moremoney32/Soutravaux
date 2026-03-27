
// services/CalendarService.ts - VERSION AVEC AUTORISATION
import pool from '../config/db';
import { CalendarEvent, CreateEventInput, EventAttendee } from '../types/calendar';
import { RowDataPacket } from 'mysql2';
import { planifierNotificationsPersonnalisees, planifierNotificationsPourMembre, supprimerNotificationsPendantesMembre } from '../helpers/notificationMemberScheduler';
import { envoyerEmailInvitationImmediate } from './InvitationService';
import { planifierNotificationsInvites, planifierNotificationsInvitesPersonnalisees } from './invitationNotificationScheduler';
import { verifyAccess } from './AuthorizationService';
import axios from 'axios';


const EMAIL_API_URL = 'https://auth.solutravo-app.fr/send-email.php';
const DEFAULT_SENDER = 'noreply@solutravo-compta.fr';

export async function getEvents(
  societeId: number,
  membreId: number,
  role: 'admin' | 'collaborator',
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {

  const conn = await pool.getConnection();

  try {
    const query = `
      SELECT DISTINCT
        ce.*,
        s.nomsociete as societe_name,
        m.prenom as created_by_prenom,
        m.nom as created_by_nom,
        m.email as created_by_email
      FROM calendar_events ce
      LEFT JOIN societes s ON ce.societe_id = s.id
      LEFT JOIN membres m ON ce.created_by_membre_id = m.id
      WHERE ce.event_date BETWEEN ? AND ?
      AND (
        -- ✅ Ses propres événements
        (ce.societe_id = ? AND ce.created_by_membre_id = ?)

        -- ✅ Invité par email (collaborateur)
        OR EXISTS (
          SELECT 1 FROM event_invitations ei
          WHERE ei.event_id = ce.id
          AND ei.email COLLATE utf8mb4_general_ci = (
            SELECT email FROM membres WHERE id = ?
          )
        )

        -- ✅ Sa société est invitée
        OR EXISTS (
          SELECT 1 FROM event_societe_invitations esi
          WHERE esi.event_id = ce.id
          AND esi.societe_invitee_id = ?
        )
      )
      ORDER BY ce.event_date, ce.start_time
    `;

    const params = [startDate, endDate, societeId, membreId, membreId, societeId];

    console.log(`📅 Chargement événements pour ${role} membre ${membreId}`);

    const [rows] = await conn.query<RowDataPacket[]>(query, params);
    const events = rows as CalendarEvent[];

    // Charger attendees + reminders pour chaque event
    for (const ev of events) {
      ev.attendees = await getEventAttendees(ev.id);

      const [reminderRows] = await conn.query<RowDataPacket[]>(`
        SELECT minutes_before as value, method
        FROM event_reminders
        WHERE event_id = ?
        ORDER BY minutes_before DESC
      `, [ev.id]);

      (ev as any).reminders = (reminderRows as any[]).map((r: any) => ({
        value: String(r.value),
        method: r.method
      }));

      // Charger sociétés Solutravo invitées
      const [invitedSocietesRows] = await conn.query<RowDataPacket[]>(`
        SELECT esi.societe_invitee_id as id, s.nomsociete
        FROM event_societe_invitations esi
        JOIN societes s ON s.id = esi.societe_invitee_id
        WHERE esi.event_id = ?
      `, [ev.id]);
      (ev as any).invited_societes = invitedSocietesRows;

      // Charger emails externes invités
      const [externeRows] = await conn.query<RowDataPacket[]>(`
        SELECT email FROM event_externe_invitations WHERE event_id = ?
      `, [ev.id]);
      (ev as any).invited_externe_emails = externeRows.map((r: any) => r.email);

      // Charger emails collaborateurs individuels invités
      const [memberInviteRows] = await conn.query<RowDataPacket[]>(`
        SELECT email FROM event_invitations WHERE event_id = ?
      `, [ev.id]);
      (ev as any).invited_member_emails = memberInviteRows.map((r: any) => r.email);
    }

    console.log(`✅ ${events.length} événements récupérés`);
    return events;

  } finally {
    conn.release();
  }
}
/* ============================================================
   CREATE EVENT - ✅ AVEC MEMBRE_ID
============================================================ */



/* ============================================================
   CREATE EVENT - ✅ AVEC RAPPELS PERSONNALISÉS
============================================================ */
// export async function createEvent(
//   data: CreateEventInput,
//   membreId: number
// ): Promise<number> {

//   const conn = await pool.getConnection();

//   try {

//     console.log("🔥 CREATE EVENT DATA =", data);
//     console.log("👤 Créé par membre ID =", membreId);

//     await conn.beginTransaction();

//     const eventDate = data.event_date.includes('T')
//       ? data.event_date.split('T')[0]
//       : data.event_date;

//     // ==============================
//     // 1️⃣ INSERT EVENT avec created_by_membre_id
//     // ==============================
//     const [result] = await conn.query<any>(`
//       INSERT INTO calendar_events 
//       (societe_id, created_by_membre_id, title, description, event_date, start_time, end_time, location, color, status, event_type, scope, event_category_id, custom_category_label)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
//     `, [
//       data.societe_id,
//       membreId,
//       data.title,
//       data.description || null,
//       eventDate,
//       data.start_time,
//       data.end_time,
//       data.location || null,
//       data.color || '#E77131',
//       data.event_type || 'task',
//       data.scope || 'personal',
//       data.event_category_id || null,
//       data.custom_category_label || null
//     ]);

//     const eventId = result.insertId;

//     // ==============================
//     // 2️⃣ RAPPELS PERSONNALISÉS (au lieu de automatiques)
//     // ==============================
    
//     // ✅ OPTION A : Seulement si l'utilisateur a choisi des rappels
//     if (data.reminders && data.reminders.length > 0) {
//       console.log("🔔 Enregistrement rappels personnalisés:", data.reminders);
      
//       for (const reminder of data.reminders) {
//         await conn.query(`
//           INSERT INTO event_reminders (event_id, minutes_before, method)
//           VALUES (?, ?, ?)
//         `, [eventId, Number(reminder.value), reminder.method]);
//       }
      
//       // Planifier les notifications selon les rappels choisis
//       await planifierNotificationsPersonnalisees(
//         conn,
//         eventId,
//         eventDate,
//         data.start_time,
//         membreId,
//         data.reminders
//       );
      
//     } else {
//       // ✅ OPTION B : Pas de rappels (ou rappels par défaut optionnels)
//       console.log("ℹ️ Aucun rappel configuré pour cet événement");
      
//       // Si tu veux quand même des rappels par défaut, décommente :
//       await planifierNotificationsPersonnalisees(
//     conn,
//     eventId,
//     eventDate,
//     data.start_time,
//     membreId,
//     [{ value: '0', method: 'email' }]  // ← 0 min = à l'heure exacte
//   );
//     }

//     // ==============================
//     // 3️⃣ ENREGISTRER LES INVITÉS (emails)
//     // ==============================
//     let emails: string[] = [];

//     if ((data.scope || '').toLowerCase() === 'collaborative') {

//       console.log("🚀 MODE COLLABORATIF");

//       emails = (data as any).attendee_emails || [];

//       console.log("📧 emails reçus =", emails);

//       for (const email of emails) {

//         await conn.query(`
//           INSERT INTO event_invitations (event_id, email, status)
//           VALUES (?, ?, 'sent')
//         `, [eventId, email]);

//         // ✅ Les invités ont aussi des rappels personnalisés
//         if (data.reminders && data.reminders.length > 0) {
//           await planifierNotificationsInvitesPersonnalisees(
//             conn,
//             eventId,
//             email,
//             eventDate,
//             data.start_time,
//             data.reminders
//           );
//         } else {
//           // Pas de rappels pour les invités non plus
//           console.log("ℹ️ Pas de rappels pour l'invité:", email);
//         }
//       }
//     }

//     // ==============================
//     // 4️⃣ COMMIT SQL
//     // ==============================
//     await conn.commit();

//     console.log("✅ EVENT CRÉÉ =", eventId);

//     // ==============================
//     // 5️⃣ EMAIL IMMÉDIAT INVITATIONS
//     // ==============================
//     if (emails.length) {

//       console.log("📨 Envoi emails immédiats invitations...");

//       for (const email of emails) {
//         await envoyerEmailInvitationImmediate(
//           eventId,
//           email,
//           data.societe_id
//         );
//       }
//     }

//     return eventId;

//   } catch (error: any) {

//     await conn.rollback();
//     console.error("❌ CREATE EVENT ERROR =", error);
//     throw new Error(error.message);

//   } finally {
//     conn.release();
//   }
// }




export async function createEvent(
  data: CreateEventInput,
  membreId: number
): Promise<number> {

  const conn = await pool.getConnection();

  try {

    console.log("🔥 CREATE EVENT DATA =", data);
    console.log("👤 Créé par membre ID =", membreId);

    await conn.beginTransaction();

    const eventDate = data.event_date.includes('T')
      ? data.event_date.split('T')[0]
      : data.event_date;

    // ==============================
    // 1️⃣ INSERT EVENT
    // ==============================
    const [result] = await conn.query<any>(`
      INSERT INTO calendar_events 
      (societe_id, created_by_membre_id, title, description, event_date, start_time, end_time, location, color, status, event_type, scope, event_category_id, custom_category_label)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `, [
      data.societe_id,
      membreId,
      data.title,
      data.description || null,
      eventDate,
      data.start_time,
      data.end_time,
      data.location || null,
      data.color || '#E77131',
      data.event_type || 'task',
      data.scope || 'personal',
      data.event_category_id || null,
      data.custom_category_label || null
    ]);

    const eventId = result.insertId;

    // ==============================
    // 2️⃣ RAPPELS PERSONNALISÉS
    // ==============================
    if (data.reminders && data.reminders.length > 0) {
      console.log("🔔 Enregistrement rappels personnalisés:", data.reminders);

      for (const reminder of data.reminders) {
        await conn.query(`
          INSERT INTO event_reminders (event_id, minutes_before, method)
          VALUES (?, ?, ?)
        `, [eventId, Number(reminder.value), reminder.method]);
      }

      // ✅ Rappels personnalisés + at_time automatique garanti
      await planifierNotificationsPersonnalisees(
        conn, eventId, eventDate, data.start_time, membreId, data.reminders
      );

    } else {
      // ✅ Aucun rappel choisi → at_time automatique seulement
      console.log("🔔 Aucun rappel choisi → at_time automatique planifié");
      await planifierNotificationsPersonnalisees(
        conn, eventId, eventDate, data.start_time, membreId, []
      );
    }

    // ==============================
    // 3️⃣ ENREGISTRER LES INVITÉS
    // ==============================
    let emails: string[] = [];

    if ((data.scope || '').toLowerCase() === 'collaborative') {

      console.log("🚀 MODE COLLABORATIF");
      emails = (data as any).attendee_emails || [];
      console.log("📧 emails reçus =", emails);

      for (const email of emails) {

        await conn.query(`
          INSERT INTO event_invitations (event_id, email, status)
          VALUES (?, ?, 'sent')
        `, [eventId, email]);

        if (data.reminders && data.reminders.length > 0) {
          // ✅ Rappels personnalisés + at_time automatique pour invité
          await planifierNotificationsInvitesPersonnalisees(
            conn, eventId, email, eventDate, data.start_time, data.reminders
          );
        } else {
          // ✅ Aucun rappel → at_time automatique pour invité aussi
          console.log("🔔 at_time auto pour invité:", email);
          await planifierNotificationsInvitesPersonnalisees(
            conn, eventId, email, eventDate, data.start_time, []
          );
        }
      }
    }

    // ==============================
    // 4️⃣ COMMIT SQL
    // ==============================
    await conn.commit();
    console.log("✅ EVENT CRÉÉ =", eventId);

    // ==============================
    // 5️⃣ EMAIL IMMÉDIAT INVITATIONS
    // ==============================
    if (emails.length) {
      console.log("📨 Envoi emails immédiats invitations...");
      for (const email of emails) {
        await envoyerEmailInvitationImmediate(
          eventId,
          email,
          data.societe_id
        );
      }
    }

    // ==============================
    // 6️⃣ INVITATIONS EXTERNES (hors Solutravo)
    // ==============================
    const externeEmails: string[] = (data as any).invited_externe_emails || [];
    if (externeEmails.length > 0) {
      console.log(`📧 Envoi invitations externes: ${externeEmails.join(', ')}`);

      // Récupérer les infos de l'event et de la société
      const connExt = await pool.getConnection();
      try {
        const [evRows]: any = await connExt.query(`
          SELECT ce.title, ce.event_date, ce.start_time, ce.location, ce.description,
                 s.nomsociete
          FROM calendar_events ce
          JOIN societes s ON s.id = ce.societe_id
          WHERE ce.id = ?
        `, [eventId]);

        if (evRows.length > 0) {
          const ev = evRows[0];
          const nomInvitante = ev.nomsociete;
          const dateFormatee = formaterDateSocieteExport(ev.event_date);
          const heureFormatee = ev.start_time.substring(0, 5);

          for (const email of externeEmails) {
            // Stocker en base
            await connExt.query(`
              INSERT IGNORE INTO event_externe_invitations (event_id, email, status)
              VALUES (?, ?, 'sent')
            `, [eventId, email]);

            // Envoyer l'email de bienvenue
            await envoyerEmailExterne(email, ev.title, nomInvitante, dateFormatee, heureFormatee, ev.location, ev.description);
          }
        }
      } finally {
        connExt.release();
      }
    }

    return eventId;

  } catch (error: any) {
    await conn.rollback();
    console.error("❌ CREATE EVENT ERROR =", error);
    throw new Error(error.message);
  } finally {
    conn.release();
  }
}


/* ============================================================
   UPDATE EVENT - ✅ AVEC MEMBRE_ID
============================================================ */

export async function updateEvent(
  eventId: number,
  data: Partial<CreateEventInput>,
  societeId: number,
  membreId: number
): Promise<void> {

  const conn = await pool.getConnection();

  try {
    console.log("🔥 UPDATE EVENT", { eventId, data, societeId, membreId });

    await conn.beginTransaction();

    /* ===============================
       1️⃣ UPDATE EVENT
    =============================== */
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title) { updates.push('title=?'); params.push(data.title); }
    if (data.description !== undefined) { updates.push('description=?'); params.push(data.description); }
    if (data.event_date) { updates.push('event_date=?'); params.push(data.event_date); }
    if (data.start_time) { updates.push('start_time=?'); params.push(data.start_time); }
    if (data.end_time) { updates.push('end_time=?'); params.push(data.end_time); }
    if (data.location !== undefined) { updates.push('location=?'); params.push(data.location); }
    if (data.scope) { updates.push('scope=?'); params.push(data.scope); }

    // ✅ AJOUTÉS
    if (data.color) { updates.push('color=?'); params.push(data.color); }
    if (data.event_category_id !== undefined) { updates.push('event_category_id=?'); params.push(data.event_category_id); }
    if (data.custom_category_label !== undefined) { updates.push('custom_category_label=?'); params.push(data.custom_category_label); }

    updates.push('updated_by_membre_id=?');
    params.push(membreId);

    if (updates.length > 0) {
      params.push(eventId);
      await conn.query(
        `UPDATE calendar_events SET ${updates.join(',')} WHERE id=?`,
        params
      );
    }

    /* ===============================
       1️⃣ BIS — METTRE À JOUR LES RAPPELS
    =============================== */
    if (data.reminders !== undefined) {
      // Supprimer les anciens rappels
      await conn.query(`DELETE FROM event_reminders WHERE event_id = ?`, [eventId]);

      if (data.reminders.length > 0) {
        for (const reminder of data.reminders) {
          await conn.query(`
            INSERT INTO event_reminders (event_id, minutes_before, method)
            VALUES (?, ?, ?)
          `, [eventId, Number(reminder.value), reminder.method]);
        }
        console.log(`🔔 ${data.reminders.length} rappel(s) mis à jour pour event ${eventId}`);
      } else {
        console.log(`🔔 Tous les rappels supprimés pour event ${eventId}`);
      }
    }

    /* ===============================
       2️⃣ RECUP EVENT MIS A JOUR
    =============================== */
    const [eventRows]: any = await conn.query(`
      SELECT event_date, start_time, societe_id, created_by_membre_id
      FROM calendar_events
      WHERE id=?
    `, [eventId]);

    if (!eventRows.length) throw new Error("Event introuvable");

    const ev = eventRows[0];
    const creatorMembreId = ev.created_by_membre_id;

    /* ===============================
       3️⃣ RÉCUPÉRER RAPPELS PERSONNALISÉS
    =============================== */
    const [reminderRows]: any = await conn.query(`
      SELECT minutes_before as value, method 
      FROM event_reminders 
      WHERE event_id = ?
    `, [eventId]);

    console.log(`🔔 ${reminderRows.length} rappel(s) personnalisé(s) trouvé(s) pour event ${eventId}`);

    /* ===============================
       4️⃣ REPLANIFIER NOTIFS CRÉATEUR
    =============================== */
    if (creatorMembreId) {
      await supprimerNotificationsPendantesMembre(conn, eventId, creatorMembreId);

      if (reminderRows.length > 0) {
        console.log("🔔 Replanification avec rappels personnalisés pour créateur");
        await planifierNotificationsPersonnalisees(
          conn,
          eventId,
          ev.event_date,
          ev.start_time,
          creatorMembreId,
          reminderRows
        );
      } else {
        console.log("🔔 Replanification avec rappels fixes pour créateur");
        await planifierNotificationsPourMembre(
          conn,
          eventId,
          ev.event_date,
          ev.start_time,
          creatorMembreId
        );
      }
    }

    /* ===============================
       5️⃣ GESTION INVITÉS
    =============================== */
    const [inviteRows]: any = await conn.query(`
      SELECT email FROM event_invitations
      WHERE event_id = ?
    `, [eventId]);

    const emails = inviteRows.map((r: any) => r.email);

    if (emails.length) {
      console.log("📨 Update → replanification rappels invités");

      await conn.query(`
        DELETE FROM event_invitation_notifications
        WHERE event_id = ?
      `, [eventId]);

      for (const email of emails) {
        if (reminderRows.length > 0) {
          console.log(`🔔 Replanification rappels personnalisés pour invité : ${email}`);
          await planifierNotificationsInvitesPersonnalisees(
            conn,
            eventId,
            email,
            ev.event_date,
            ev.start_time,
            reminderRows
          );
        } else {
          console.log(`🔔 Replanification rappels fixes pour invité : ${email}`);
          await planifierNotificationsInvites(
            conn,
            eventId,
            email,
            ev.event_date,
            ev.start_time
          );
        }
      }
    }

    await conn.commit();

    /* ===============================
       6️⃣ EMAIL "EVENT MODIFIÉ" aux invités
    =============================== */
    for (const email of emails) {
      await envoyerEmailInvitationImmediate(eventId, email, societeId);
      console.log("📧 email update envoyé à", email);
    }

  } catch (e) {
    await conn.rollback();
    console.error("❌ UPDATE EVENT ERROR", e);
    throw e;
  } finally {
    conn.release();
  }
}


/* ============================================================
   DELETE EVENT - ✅ AVEC MEMBRE_ID (AUDIT)
============================================================ */
export async function deleteEvent(
  eventId: number,
  societeId: number,
  membreId: number
) {
  const conn = await pool.getConnection();
  try {

    console.log(`🗑️ Suppression event ${eventId} par membre ${membreId}`);

    await conn.query(`DELETE FROM calendar_events WHERE id=? AND societe_id=?`, [eventId, societeId]);

  } finally { conn.release(); }
}


/* ============================================================
   ATTENDEES (inchangé)
============================================================ */
export async function getEventAttendees(eventId: number): Promise<EventAttendee[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(`
      SELECT ea.*, s.nomsociete as societe_name
      FROM event_attendees ea
      LEFT JOIN societes s ON ea.societe_id=s.id
      WHERE ea.event_id=?
    `, [eventId]);
    return rows as EventAttendee[];
  } finally { conn.release(); }
}


/* ============================================================
   INVITE SOCIETES (inchangé)
============================================================ */
export async function inviteAttendees(
  eventId: number,
  societeIds: number[],
  inviteMethod: 'email' | 'sms' | 'push' | 'contact'
) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const sid of societeIds) {
      await conn.query(`
        INSERT INTO event_attendees(event_id,societe_id,invite_method,status)
        VALUES(?,?,?,'pending')
      `, [eventId, sid, inviteMethod]);
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally { conn.release(); }
}


/* ============================================================
   RESPOND INVITE (inchangé)
============================================================ */
export async function respondToInvite(
  eventId: number,
  societeId: number,
  status: 'accepted' | 'declined'
) {
  await pool.query(`
    UPDATE event_attendees SET status=?,responded_at=NOW()
    WHERE event_id=? AND societe_id=?
  `, [status, eventId, societeId]);
}


/* ============================================================
   GET SOCIETES (inchangé)
============================================================ */
export async function getAvailableSocietes(excludeSocieteId?: number) {
  const [rows]: any = await pool.query(`
    SELECT id,nomsociete as name,email FROM societes
    ${excludeSocieteId ? 'WHERE id != ' + excludeSocieteId : ''}
    ORDER BY nomsociete
  `);
  return rows;
}



/* ============================================================
   SEARCH SOCIETES
============================================================ */
export async function searchSocietes(
  query: string,
  excludeSocieteId: number
): Promise<any[]> {
  const conn = await pool.getConnection();
  try {
    const searchTerm = `%${query}%`;
    const [rows] = await conn.query<RowDataPacket[]>(`
      SELECT 
        id,
        nomsociete,
        email,
        ville,
        logo,
        nom_responsable,
        prenom_responsable
      FROM societes
      WHERE id != ?
      AND (
        nomsociete LIKE ?
        OR email LIKE ?
        OR ville LIKE ?
      )
      ORDER BY nomsociete ASC
      LIMIT 20
    `, [excludeSocieteId, searchTerm, searchTerm, searchTerm]);

    return rows;
  } finally {
    conn.release();
  }
}

/* ============================================================
   INVITER UNE SOCIÉTÉ
============================================================ */


export async function inviterSociete(
  eventId: number,
  societeInvitanteId: number,
  societeInviteeId: number,
  membreId: number
): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ✅ Vérifier que c'est un admin
    const auth = await verifyAccess(societeInvitanteId, membreId);
    if (auth.role !== 'admin') {
      throw new Error("Seul l'admin peut inviter une société");
    }

    // ✅ Vérifier que l'event appartient bien à la société invitante
    const [eventRows]: any = await conn.query(`
      SELECT id, title, event_date, start_time, location, description
      FROM calendar_events
      WHERE id = ? AND societe_id = ?
    `, [eventId, societeInvitanteId]);

    if (!eventRows.length) {
      throw new Error("Événement introuvable ou accès refusé");
    }

    const event = eventRows[0];

    // ✅ Vérifier que la société invitée existe
    const [societeRows]: any = await conn.query(`
      SELECT id, nomsociete, email, nom_responsable, prenom_responsable
      FROM societes WHERE id = ?
    `, [societeInviteeId]);

    if (!societeRows.length) {
      throw new Error("Société invitée introuvable");
    }

    const societeInvitee = societeRows[0];

    // ✅ Récupérer nom société invitante
    const [societeInvitanteRows]: any = await conn.query(`
      SELECT nomsociete FROM societes WHERE id = ?
    `, [societeInvitanteId]);
    const nomInvitante = societeInvitanteRows[0]?.nomsociete || 'Une société';

    // ✅ Vérifier si invitation déjà envoyée
    const [existingRows]: any = await conn.query(`
      SELECT id FROM event_societe_invitations
      WHERE event_id = ? AND societe_invitee_id = ?
    `, [eventId, societeInviteeId]);

    if (existingRows.length) {
      throw new Error("Cette société a déjà été invitée");
    }

    // ✅ Créer l'invitation
    await conn.query(`
      INSERT INTO event_societe_invitations
        (event_id, societe_invitante_id, societe_invitee_id, status)
      VALUES (?, ?, ?, 'pending')
    `, [eventId, societeInvitanteId, societeInviteeId]);

    // ✅ Planifier les mêmes rappels que l'organisateur
    const [reminderRows]: any = await conn.query(`
      SELECT minutes_before as value, method
      FROM event_reminders
      WHERE event_id = ?
    `, [eventId]);

    if (reminderRows.length > 0) {
      await planifierNotificationsInvitesPersonnalisees(
        conn,
        eventId,
        societeInvitee.email,
        event.event_date,
        event.start_time,
        reminderRows
      );
      console.log(`✅ Rappels planifiés pour société invitée ${societeInvitee.email}`);
    } else {
      console.log(`ℹ️ Pas de rappels configurés pour cet événement`);
    }

    // ✅ Email immédiat d'invitation
    const prenom = societeInvitee.prenom_responsable || societeInvitee.nom_responsable?.split(' ')[0] || 'Responsable';
    const dateFormatee = formaterDateSociete(event.event_date);
    const heureFormatee = event.start_time.substring(0, 5);

    const subject = `📅 ${nomInvitante} vous invite à un événement : ${event.title}`;
    const message = `
      <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#E77131 0%,#F59E6C 100%);padding:20px;border-radius:10px 10px 0 0;">
          <h2 style="color:white;margin:0;">📅 Invitation à un événement</h2>
        </div>
        <div style="background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px;">
          <p style="font-size:16px;margin-bottom:20px;">Bonjour <strong>${prenom}</strong>,</p>
          <p style="font-size:15px;margin-bottom:25px;">
            La société <strong style="color:#E77131;">${nomInvitante}</strong> vous invite à participer à l'événement suivant :
          </p>
          <div style="background:white;padding:20px;border-left:4px solid #E77131;border-radius:5px;margin-bottom:25px;">
            <p style="font-size:18px;font-weight:bold;color:#E77131;margin:0 0 15px 0;">
              ${event.title}
            </p>
            <p style="margin:8px 0;font-size:14px;">
              <strong>📅 Date :</strong> ${dateFormatee}
            </p>
            <p style="margin:8px 0;font-size:14px;">
              <strong>⏰ Heure :</strong> ${heureFormatee}
            </p>
            ${event.location ? `
            <p style="margin:8px 0;font-size:14px;">
              <strong>📍 Lieu :</strong> ${event.location}
            </p>` : ''}
            ${event.description ? `
            <p style="margin:15px 0 0 0;font-size:14px;color:#666;">
              <strong>📝 Description :</strong><br/>${event.description}
            </p>` : ''}
          </div>
          <div style="background:#FFF3E0;padding:15px;border-radius:5px;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#E65100;">
              💡 Cet événement est maintenant visible sur votre agenda Solutravo.
            </p>
          </div>
          <p style="font-size:14px;color:#666;margin-top:30px;padding-top:20px;border-top:1px solid #ddd;">
            Cet email a été envoyé automatiquement par <strong style="color:#E77131;">Solutravo</strong>.
          </p>
        </div>
      </div>
    `;

    await axios.post(EMAIL_API_URL, {
      sender: DEFAULT_SENDER,
      receiver: societeInvitee.email,
      subject,
      message
    });

    console.log(`📧 Email invitation envoyé à ${societeInvitee.email}`);

    await conn.commit();
    console.log(`✅ Société ${societeInviteeId} invitée à l'événement ${eventId}`);

  } catch (error: any) {
    await conn.rollback();
    console.error('❌ Erreur invitation société:', error);
    throw error;
  } finally {
    conn.release();
  }
}

/* ============================================================
   INVITER UNE SOCIÉTÉ EXTERNE (hors Solutravo, par email)
============================================================ */
export async function inviterSocieteExterne(
  eventId: number,
  societeInvitanteId: number,
  membreId: number,
  emailExterne: string
): Promise<void> {
  const conn = await pool.getConnection();
  try {
    // Vérifier que c'est un admin
    const auth = await verifyAccess(societeInvitanteId, membreId);
    if (auth.role !== 'admin') {
      throw new Error("Seul l'admin peut inviter une société");
    }

    // Récupérer l'événement
    const [eventRows]: any = await conn.query(`
      SELECT id, title, event_date, start_time, location, description
      FROM calendar_events
      WHERE id = ? AND societe_id = ?
    `, [eventId, societeInvitanteId]);

    if (!eventRows.length) {
      throw new Error("Événement introuvable ou accès refusé");
    }

    const event = eventRows[0];

    // Récupérer le nom de la société invitante
    const [societeRows]: any = await conn.query(`
      SELECT nomsociete FROM societes WHERE id = ?
    `, [societeInvitanteId]);
    const nomInvitante = societeRows[0]?.nomsociete || 'Une société';

    const dateFormatee = formaterDateSociete(event.event_date);
    const heureFormatee = event.start_time.substring(0, 5);

    // Stocker en base (évite les doublons)
    await conn.query(`
      INSERT IGNORE INTO event_externe_invitations (event_id, email, status)
      VALUES (?, ?, 'sent')
    `, [eventId, emailExterne]);

    // Utiliser le template email accueillant (même design que lors de la création)
    await envoyerEmailExterne(
      emailExterne,
      event.title,
      nomInvitante,
      dateFormatee,
      heureFormatee,
      event.location || null,
      event.description || null
    );

    console.log(`📧 Email invitation externe envoyé à ${emailExterne}`);

  } catch (error: any) {
    console.error('❌ Erreur invitation externe:', error);
    throw error;
  } finally {
    conn.release();
  }
}

/* ============================================================
   HELPER : Formater date
============================================================ */
function formaterDateSociete(dateStr: string): string {
  return formaterDateSocieteExport(dateStr);
}

function formaterDateSocieteExport(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${jours[date.getDay()]} ${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`;
}

/* ============================================================
   HELPER : Email d'invitation externe (design accueillant)
============================================================ */
export async function envoyerEmailExterne(
  emailDest: string,
  eventTitle: string,
  nomInvitante: string,
  dateFormatee: string,
  heureFormatee: string,
  location: string | null,
  description: string | null
): Promise<void> {
  const subject = `${nomInvitante} vous invite à consulter son agenda`;
  const message = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;color:#333;line-height:1.7;max-width:620px;margin:0 auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#E77131 0%,#FF9A5C 100%);padding:36px 28px;text-align:center;">
        <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;padding:14px;margin-bottom:14px;">
          <span style="font-size:32px;">📅</span>
        </div>
        <h1 style="color:white;margin:0;font-size:22px;font-weight:700;letter-spacing:0.3px;">${nomInvitante} vous invite à consulter son agenda</h1>
      </div>

      <!-- Body -->
      <div style="background:#ffffff;padding:36px 32px;">

        <p style="font-size:16px;margin:0 0 10px;color:#222;font-weight:600;">Bonjour,</p>

        <p style="font-size:15px;margin:0 0 26px;color:#555;line-height:1.8;">
          L'entreprise <strong style="color:#E77131;">${nomInvitante}</strong> vous a ajouté à un évènement sur son agenda Solutravo et vous autorise à le consulter.
        </p>

        <!-- Carte événement -->
        <div style="background:linear-gradient(135deg,#fffaf6 0%,#fff9f4 100%);border:1.5px solid #FFCC99;border-radius:12px;padding:24px;margin-bottom:30px;">
          <p style="font-size:19px;font-weight:700;color:#E77131;margin:0 0 18px;padding-bottom:14px;border-bottom:1px solid #FFE0C0;">
            ${eventTitle}
          </p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:7px 0;font-size:14px;color:#999;width:100px;vertical-align:top;">📅 Date</td>
              <td style="padding:7px 0;font-size:14px;color:#333;font-weight:600;">${dateFormatee}</td>
            </tr>
            <tr>
              <td style="padding:7px 0;font-size:14px;color:#999;vertical-align:top;">⏰ Heure</td>
              <td style="padding:7px 0;font-size:14px;color:#333;font-weight:600;">${heureFormatee}</td>
            </tr>
            ${location ? `
            <tr>
              <td style="padding:7px 0;font-size:14px;color:#999;vertical-align:top;">📍 Lieu</td>
              <td style="padding:7px 0;font-size:14px;color:#333;">${location}</td>
            </tr>` : ''}
            ${description ? `
            <tr>
              <td style="padding:7px 0;font-size:14px;color:#999;vertical-align:top;padding-top:12px;">📝 Note</td>
              <td style="padding:7px 0;font-size:14px;color:#555;font-style:italic;padding-top:12px;">${description}</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin:30px 0;">
          <a href="https://staging.solutravo-compta.fr"
            style="display:inline-block;background:linear-gradient(135deg,#E77131,#F59E6C);color:white;text-decoration:none;padding:16px 42px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.4px;box-shadow:0 6px 18px rgba(231,113,49,0.35);">
            Voir l'événement
          </a>
        </div>

        <!-- Footer gris Solutravo -->
        <div style="background:#f5f5f5;border-radius:10px;padding:22px;margin-top:28px;">
          <p style="font-size:14px;font-weight:700;color:#333;margin:0 0 10px;">
            Pas encore sur Solutravo ?
          </p>
          <p style="font-size:13px;color:#666;margin:0 0 8px;line-height:1.8;">
            Solutravo est la plateforme qui connecte les professionnels du bâtiment — artisans, fournisseurs, donneurs d'ordre — pour mieux collaborer, gérer leurs agendas et développer/piloter leur activité.
          </p>
          <p style="font-size:13px;color:#666;margin:0;line-height:1.8;">
            En rejoignant Solutravo, vous pourrez confirmer votre présence à cet événement, gérer vos rendez-vous et découvrir de nouveaux partenaires.
          </p>
        </div>

        <!-- Footer message -->
        <div style="border-top:1px solid #f0f0f0;padding-top:20px;margin-top:24px;text-align:center;">
          <p style="font-size:12px;color:#bbb;margin:0;">
            Vous recevez cet email car <strong style="color:#E77131;">${nomInvitante}</strong> a souhaité vous inviter via <strong style="color:#E77131;">Solutravo</strong>.<br/>
            Si vous ne souhaitez pas être contacté(e), ignorez simplement ce message.
          </p>
        </div>

      </div>
    </div>
  `;

  await axios.post(EMAIL_API_URL, {
    sender: DEFAULT_SENDER,
    receiver: emailDest,
    subject,
    message
  });

  console.log(`📧 Email invitation externe (accueillant) envoyé à ${emailDest}`);
}

/* ============================================================
   HELPER : Email rappel au moment de l'événement (externe)
============================================================ */
export async function envoyerEmailRappelExterne(
  emailDest: string,
  eventTitle: string,
  nomInvitante: string,
  heureFormatee: string,
  location: string | null
): Promise<void> {
  const subject = `⏰ Rappel — "${eventTitle}" a lieu aujourd'hui avec ${nomInvitante}`;
  const message = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;color:#333;line-height:1.7;max-width:620px;margin:0 auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#E77131 0%,#FF9A5C 100%);padding:30px 24px;text-align:center;">
        <span style="font-size:36px;">⏰</span>
        <h1 style="color:white;margin:10px 0 0;font-size:22px;font-weight:700;">C'est aujourd'hui !</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Votre événement est imminent</p>
      </div>
      <div style="background:#fff;padding:32px 28px;">
        <p style="font-size:15px;color:#444;margin:0 0 20px;">Bonjour,</p>
        <p style="font-size:15px;color:#444;margin:0 0 24px;line-height:1.8;">
          Petit rappel de la part de <strong style="color:#E77131;">${nomInvitante}</strong> —
          l'événement <strong style="color:#333;">${eventTitle}</strong> auquel vous avez été invité(e) se déroule <strong>aujourd'hui à ${heureFormatee}</strong>${location ? `<br/>📍 <em>${location}</em>` : ''}.
        </p>

        <div style="background:#FFF8F3;border-left:4px solid #E77131;border-radius:0 8px 8px 0;padding:16px 18px;margin-bottom:28px;">
          <p style="margin:0;font-size:14px;color:#E65100;line-height:1.7;">
            Vous n'êtes pas encore sur <strong>Solutravo</strong> ? Rejoignez-nous dès maintenant pour confirmer votre présence, gérer vos événements professionnels et tisser de nouveaux liens dans votre secteur.
          </p>
        </div>

        <div style="text-align:center;margin:24px 0;">
          <a href="https://staging.solutravo-compta.fr"
            style="display:inline-block;background:linear-gradient(135deg,#E77131,#F59E6C);color:white;text-decoration:none;padding:15px 38px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 6px 16px rgba(231,113,49,0.35);">
            ✨ Rejoindre Solutravo — C'est gratuit
          </a>
        </div>

        <p style="font-size:12px;color:#bbb;text-align:center;margin-top:24px;border-top:1px solid #f0f0f0;padding-top:16px;">
          Email automatique via <strong style="color:#E77131;">Solutravo</strong> · Demandé par ${nomInvitante}.
        </p>
      </div>
    </div>
  `;

  await axios.post(EMAIL_API_URL, {
    sender: DEFAULT_SENDER,
    receiver: emailDest,
    subject,
    message
  });
}
