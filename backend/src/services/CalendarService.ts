


import { planifierNotificationsPourEvenement, supprimerNotificationsPendantes } from './notificationsSheduler';
import pool from '../config/db';
import { CalendarEvent, CreateEventInput, EventAttendee } from '../types/calendar';
import { RowDataPacket } from 'mysql2';
import { envoyerEmailInvitationImmediate } from './InvitationService';
import { planifierNotificationsInvites } from './invitationNotificationScheduler';
/* ============================================================
   GET EVENTS
============================================================ */
export async function getEvents(
  societeId: number,
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {

  const conn = await pool.getConnection();

  try {

    const [rows] = await conn.query<RowDataPacket[]>(`
      SELECT DISTINCT
        ce.*,
        s.nomsociete as societe_name
      FROM calendar_events ce
      LEFT JOIN societes s ON ce.societe_id = s.id
      WHERE ce.event_date BETWEEN ? AND ?
      AND (
        ce.societe_id = ?
        OR EXISTS (
          SELECT 1 FROM event_attendees ea 
          WHERE ea.event_id = ce.id AND ea.societe_id = ?
        )
      )
      ORDER BY ce.event_date, ce.start_time
    `,[startDate,endDate,societeId,societeId]);

    const events = rows as CalendarEvent[];

    for(const ev of events){
      ev.attendees = await getEventAttendees(ev.id);
    }

    return events;

  } finally {
    conn.release();
  }
}


export async function createEvent(data: CreateEventInput): Promise<number> {

  const conn = await pool.getConnection();

  try {

    console.log("🔥 CREATE EVENT DATA =", data);

    await conn.beginTransaction();

    const eventDate = data.event_date.includes('T')
      ? data.event_date.split('T')[0]
      : data.event_date;

    // ==============================
    // 1️⃣ INSERT EVENT
    // ==============================
    const [result] = await conn.query<any>(`
      INSERT INTO calendar_events 
      (societe_id,title,description,event_date,start_time,end_time,location,color,status,event_type,scope,event_category_id,custom_category_label)
      VALUES (?,?,?,?,?,?,?,?, 'pending', ?, ?, ?, ?)
    `,[
      data.societe_id,
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
    // 2️⃣ PLANIFICATION NOTIFS SOCIÉTÉ
    // ==============================
    await planifierNotificationsPourEvenement(
      conn,
      eventId,
      eventDate,
      data.start_time,
      data.societe_id
    );

    // ==============================
    // 3️⃣ ENREGISTRER LES INVITÉS (PAS D'EMAIL ICI)
    // ==============================
    let emails: string[] = [];

    if ((data.scope || '').toLowerCase() === 'collaborative') {

      console.log("🚀 MODE COLLABORATIF");

      emails = (data as any).attendee_emails || [];

      console.log("📧 emails reçus =", emails);

      for (const email of emails) {

        // on enregistre seulement en DB
        await conn.query(`
          INSERT INTO event_invitations (event_id,email,status)
          VALUES (?,?, 'sent')
        `,[eventId,email]);

        // planifier rappels invités
        await planifierNotificationsInvites(
          conn,
          eventId,
          email,
          eventDate,
          data.start_time
        );
      }
    }

    // ==============================
    // 4️⃣ COMMIT SQL
    // ==============================
    await conn.commit();

    console.log("✅ EVENT CRÉÉ =", eventId);

    // ==============================
    // 5️⃣ EMAIL IMMÉDIAT APRÈS COMMIT
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

  } catch (error:any) {

    await conn.rollback();
    console.error("❌ CREATE EVENT ERROR =", error);
    throw new Error(error.message);

  } finally {
    conn.release();
  }
}

/* ============================================================
   UPDATE EVENT — VERSION EMAIL ONLY (COLLABORATEURS)
============================================================ */
export async function updateEvent(
  eventId: number,
  data: Partial<CreateEventInput>,
  societeId: number
): Promise<void> {

  const conn = await pool.getConnection();

  try {
    console.log("🔥 UPDATE EVENT", { eventId, data, societeId });

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

    if (updates.length > 0) {
      params.push(eventId);
      await conn.query(
        `UPDATE calendar_events SET ${updates.join(',')} WHERE id=?`,
        params
      );
    }

    /* ===============================
       2️⃣ RECUP EVENT MIS A JOUR
    =============================== */
    const [eventRows]: any = await conn.query(`
      SELECT event_date,start_time,societe_id
      FROM calendar_events
      WHERE id=?
    `,[eventId]);

    if (!eventRows.length) throw new Error("Event introuvable");

    const ev = eventRows[0];

    /* ===============================
       3️⃣ REPLANIFIER NOTIFS SOCIETE
    =============================== */
    await supprimerNotificationsPendantes(conn, eventId);

    await planifierNotificationsPourEvenement(
      conn,
      eventId,
      ev.event_date,
      ev.start_time,
      ev.societe_id
    );

    /* ===============================
       4️⃣ GESTION INVITÉS (EMAIL)
    =============================== */

    // récupérer emails existants
    const [inviteRows]: any = await conn.query(`
      SELECT email FROM event_invitations
      WHERE event_id = ?
    `,[eventId]);

    const emails = inviteRows.map((r:any)=>r.email);

    if (emails.length) {

      console.log("📨 Update → replanification rappels + email collaborateurs");

      // supprimer anciens rappels invités
      await conn.query(`
        DELETE FROM event_invitation_notifications
        WHERE event_id = ?
      `,[eventId]);

      // recréer rappels invités
      for (const email of emails) {

        await planifierNotificationsInvites(
          conn,
          eventId,
          email,
          ev.event_date,
          ev.start_time
        );
      }
    }

    await conn.commit();

    /* ===============================
       5️⃣ EMAIL "EVENT MODIFIÉ"
    =============================== */
    for (const email of emails) {

      await envoyerEmailInvitationImmediate(
        eventId,
        email,
        societeId
      );

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
   DELETE
============================================================ */
export async function deleteEvent(eventId:number,societeId:number){
  const conn=await pool.getConnection();
  try{
    await conn.query(`DELETE FROM calendar_events WHERE id=? AND societe_id=?`,[eventId,societeId]);
  }finally{conn.release();}
}





/* ============================================================
   ATTENDEES
============================================================ */
export async function getEventAttendees(eventId:number):Promise<EventAttendee[]>{
  const conn=await pool.getConnection();
  try{
    const [rows]=await conn.query<RowDataPacket[]>(`
      SELECT ea.*, s.nomsociete as societe_name
      FROM event_attendees ea
      LEFT JOIN societes s ON ea.societe_id=s.id
      WHERE ea.event_id=?
    `,[eventId]);
    return rows as EventAttendee[];
  }finally{conn.release();}
}





/* ============================================================
   INVITE SOCIETES MANUEL
============================================================ */
export async function inviteAttendees(
  eventId:number,
  societeIds:number[],
  inviteMethod:'email'|'sms'|'push'|'contact'
){
  const conn=await pool.getConnection();
  try{
    await conn.beginTransaction();

    for(const sid of societeIds){
      await conn.query(`
        INSERT INTO event_attendees(event_id,societe_id,invite_method,status)
        VALUES(?,?,?,'pending')
      `,[eventId,sid,inviteMethod]);
    }

    await conn.commit();
  }catch(e){
    await conn.rollback();
    throw e;
  }finally{conn.release();}
}





/* ============================================================
   REPONDRE INVITATION
============================================================ */
export async function respondToInvite(
  eventId:number,
  societeId:number,
  status:'accepted'|'declined'
){
  await pool.query(`
    UPDATE event_attendees SET status=?,responded_at=NOW()
    WHERE event_id=? AND societe_id=?
  `,[status,eventId,societeId]);
}





/* ============================================================
   GET SOCIETES
============================================================ */
export async function getAvailableSocietes(excludeSocieteId?:number){
  const [rows]:any = await pool.query(`
    SELECT id,nomsociete as name,email FROM societes
    ${excludeSocieteId ? 'WHERE id != '+excludeSocieteId : ''}
    ORDER BY nomsociete
  `);
  return rows;
}
