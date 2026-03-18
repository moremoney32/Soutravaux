
// Service pour gérer les invitations aux événements calendrier

import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { envoyerEmailNotificationInvitation } from './emailNotificationServices';
import {  planifierNotificationsInvitesPersonnalisees } from './invitationNotificationScheduler';
// import { planifierNotificationsInvites } from './invitationNotificationScheduler';

export interface EventInvitation {
  id: number;
  event_id: number;
  membre_id: number;
  email: string;
  nom: string;
  prenom: string;
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  responded_at: string | null;
}
interface Reminder {
  value: string;
  method: 'email' | 'notification';
}
// export async function inviteCollaboratorsToEvent(
//   conn:any,
//   eventId:number,
//   email:string,
//   creatorSocieteId:number,
//   eventDate:string,
//   startTime:string
// ): Promise<void> {

//   console.log("📨 invitation collaborateur:", email);

//   // 1. enregistrer invitation
//   await conn.query(`
//     INSERT INTO event_invitations (event_id,email,status)
//     VALUES (?,?, 'sent')
//   `,[eventId,email]);

//   // 2. email immédiat
//   await envoyerEmailInvitation(
//     eventId,
//     email,
//     "Collaborateur",
//     creatorSocieteId
//   );

//   // 3. planifier rappels invités (NOUVELLE TABLE)
//   await planifierNotificationsInvites(
//     conn,
//     eventId,
//     email,
//     eventDate,
//     startTime
//   );

//   console.log("✅ invitation + rappels invités OK :", email);
// }

export async function inviteCollaboratorsToEvent(
  conn: any,
  eventId: number,
  email: string,
  creatorSocieteId: number,
  eventDate: string,
  startTime: string,
  reminders?: Reminder[]  // ✅ AJOUTÉ (optionnel)
): Promise<void> {

  console.log("📨 invitation collaborateur:", email);

  // 1. enregistrer invitation
  await conn.query(`
    INSERT INTO event_invitations (event_id, email, status)
    VALUES (?, ?, 'sent')
  `, [eventId, email]);

  // 2. email immédiat
  await envoyerEmailInvitation(
    eventId,
    email,
    "Collaborateur",
    creatorSocieteId
  );

  // 3. ✅ MODIFIÉ : Choisir entre personnalisé ou automatique
  if (reminders && reminders.length > 0) {
    // Rappels personnalisés
    await planifierNotificationsInvitesPersonnalisees(
      conn,
      eventId,
      email,
      eventDate,
      startTime,
      reminders
    );
    console.log("✅ Rappels personnalisés invité :", email);
  } else {
    // Pas de rappels (ou rappels automatiques si tu veux)
    console.log("ℹ️ Pas de rappels pour l'invité :", email);
    
    // OU si tu veux des rappels par défaut :
    // await planifierNotificationsInvites(
    //   conn,
    //   eventId,
    //   email,
    //   eventDate,
    //   startTime
    // );
  }

  console.log("✅ invitation + rappels invités OK :", email);
}



/**
 * Obtenir le status des invitations pour un événement
 */
export async function getEventInvitations(
  eventId: number
): Promise<EventInvitation[]> {
  const conn = await pool.getConnection();

  try {
    const [rows] = await conn.query<RowDataPacket[]>(`
      SELECT 
        ea.id,
        ea.event_id,
        m.id as membre_id,
        m.email,
        m.nom,
        m.prenom,
        ea.status,
        ea.created_at as invited_at,
        ea.responded_at
      FROM event_attendees ea
      LEFT JOIN membres m ON ea.contact_email = m.email
      WHERE ea.event_id = ?
      ORDER BY ea.created_at DESC
    `, [eventId]);

    return rows as EventInvitation[];
  } finally {
    conn.release();
  }
}

/**
 * EMAIL INVITATION IMMÉDIAT
 */
async function envoyerEmailInvitation(
  eventId: number,
  email: string,
  prenom: string,
  creatorSocieteId: number
): Promise<void> {

  const conn = await pool.getConnection();

  try {

    const [eventRows] = await conn.query<RowDataPacket[]>(`
      SELECT ce.*, s.nomsociete
      FROM calendar_events ce
      LEFT JOIN societes s ON ce.societe_id = s.id
      WHERE ce.id = ?
    `, [eventId]);

    if (!eventRows.length) {
      console.warn(`⚠️ Événement ${eventId} introuvable`);
      return;
    }

    const event = eventRows[0];

    const [creatorRows] = await conn.query<RowDataPacket[]>(`
      SELECT m.prenom 
      FROM societes s
      JOIN membres m ON s.refmembre = m.ref
      WHERE s.id = ?
    `, [creatorSocieteId]);

    const creatorPrenom = creatorRows[0]?.prenom || 'Solutravo';

    const dateFormatee = formaterDate(event.event_date);
    const heureFormatee = `${event.start_time.substring(0, 5)}`;

    const subject = `📅 Invitation à l'événement: ${event.title}`;

    const message = creerEmailInvitation(
      prenom,
      event.title,
      dateFormatee,
      heureFormatee,
      event.location || 'Non spécifié',
      event.description || '',
      creatorPrenom
    );

    await envoyerEmailNotificationInvitation(email, subject, message);

    console.log(`📧 Email envoyé à ${email}`);

  } catch (error) {
    console.error(`❌ Erreur email invitation:`, error);
  } finally {
    conn.release();
  }
}

function creerEmailInvitation(
  prenom: string,
  eventTitle: string,
  date: string,
  heure: string,
  lieu: string,
  description: string,
  creatorName: string
): string {
  return `
    <div>
      <h2>📅 Invitation à un événement</h2>
      <p>Bonjour ${prenom || ''},</p>
      <p>Vous avez été ajouté par <strong>${creatorName}</strong></p>
      <p><strong>${eventTitle}</strong></p>
      <p>Date : ${date}</p>
      <p>Heure : ${heure}</p>
      <p>Lieu : ${lieu}</p>
      <p>${description}</p>
    </div>
  `;
}

function formaterDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  const jours = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

  return `${jours[date.getDay()]} ${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`;
}
export async function envoyerEmailInvitationImmediate(
  eventId:number,
  email:string,
  creatorSocieteId:number
){
  try{

    console.log(creatorSocieteId)
    const conn = await pool.getConnection();

    const [eventRows]:any = await conn.query(`
      SELECT ce.*, s.nomsociete
      FROM calendar_events ce
      LEFT JOIN societes s ON ce.societe_id = s.id
      WHERE ce.id = ?
    `,[eventId]);

    if(!eventRows.length){
      console.warn("⚠️ event introuvable pour email immédiat");
      return;
    }

    const event = eventRows[0];

    const subject = `📅 Invitation à l'événement: ${event.title}`;

    const message = `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">

    <div style="background: linear-gradient(135deg, #E77131 0%, #FF8A50 100%); padding: 20px; border-radius: 10px 10px 0 0;">
      <h2 style="color: white; margin: 0;">📅 Nouvelle invitation</h2>
    </div>

    <div style="background: #FFF3E0; padding: 30px; border-radius: 0 0 10px 10px;">
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Vous êtes invité à un événement :
      </p>

      <div style="background: white; padding: 25px; border-left: 4px solid #E77131; border-radius: 5px; margin-bottom: 25px; text-align: center;">
        
        <p style="font-size: 24px; font-weight: bold; color: #E77131; margin: 0 0 20px 0;">
          ${event.title}
        </p>

        <p style="margin: 0; font-size: 18px;">
          ⏰ <strong>${event.start_time}</strong>
        </p>

        <p style="margin: 15px 0 0 0; font-size: 14px;">
          📅 ${event.event_date}
        </p>

        ${event.location ? `
        <p style="margin: 15px 0 0 0; font-size: 14px;">
          📍 ${event.location}
        </p>
        ` : ''}
      </div>

      <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        Cet email a été envoyé automatiquement par <strong style="color: #E77131;">Solutravo</strong>.
      </p>

    </div>
  </div>
`;


    await envoyerEmailNotificationInvitation(email, subject, message);

    console.log("📧 invitation immédiate envoyée :", email);

  }catch(e){
    console.error("❌ erreur email immédiat",e);
  }
}
