
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
   HELPER : Formater date pour société
============================================================ */
function formaterDateSociete(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${jours[date.getDay()]} ${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`;
}
