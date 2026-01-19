// services/InvitationService.ts
// Service pour gérer les invitations aux événements calendrier

import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { getUniqueCollaboratorsBySociete } from './CollaboratorsService';
import { envoyerEmailNotificationInvitation } from './emailNotificationServices';

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

/**
 * Inviter les collaborateurs d'une société à un événement
 * @param eventId - ID de l'événement
 * @param societeId - ID de la société
 * @param creatorSocieteId - ID de la société qui crée l'événement
 * @returns Nombre d'invitations envoyées
 */
export async function inviteCollaboratorsToEvent(
  eventId: number,
  societeId: number,
  creatorSocieteId: number
): Promise<number> {
  const conn = await pool.getConnection();

  try {
    // Récupérer les collaborateurs de la société
    const collaborators = await getUniqueCollaboratorsBySociete(societeId);

    if (collaborators.length === 0) {
      console.log(`✅ Aucun collaborateur à inviter pour societeId ${societeId}`);
      return 0;
    }

    // Créer les invitations dans la table event_attendees
    let invitationCount = 0;

    for (const collaborator of collaborators) {
      try {
        // Vérifier si l'invitation existe déjà
        const [existingRows] = await conn.query<RowDataPacket[]>(
          `SELECT id FROM event_attendees 
           WHERE event_id = ? AND societe_id = ? LIMIT 1`,
          [eventId, societeId]
        );

        if (existingRows.length === 0) {
          // Créer l'invitation
          await conn.query(
            `INSERT INTO event_attendees 
             (event_id, societe_id, contact_email, invite_method, status)
             VALUES (?, ?, ?, 'email', 'pending')`,
            [eventId, societeId, collaborator.email]
          );

          // Envoyer l'email d'invitation
          await envoyerEmailInvitation(
            eventId,
            collaborator.email,
            collaborator.prenom,
            creatorSocieteId
          );

          invitationCount++;
        }
      } catch (error) {
        console.error(
          `❌ Erreur invitation collaborateur ${collaborator.membre_id}:`,
          error
        );
      }
    }

    console.log(`✅ ${invitationCount} invitations envoyées pour l'événement ${eventId}`);
    return invitationCount;
  } finally {
    conn.release();
  }
}

/**
 * Obtenir le status des invitations pour un événement
 */
export async function getEventInvitations(
  eventId: number
): Promise<EventInvitation[]> {
  const conn = await pool.getConnection();

  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT 
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
      ORDER BY ea.created_at DESC`,
      [eventId]
    );

    return rows as EventInvitation[];
  } finally {
    conn.release();
  }
}

/**
 * Envoyer un email d'invitation
 */
async function envoyerEmailInvitation(
  eventId: number,
  email: string,
  prenom: string,
  creatorSocieteId: number
): Promise<void> {
  try {
    // Récupérer les infos de l'événement
    const conn = await pool.getConnection();
    try {
      const [eventRows] = await conn.query<RowDataPacket[]>(
        `SELECT ce.*, s.nomsociete
         FROM calendar_events ce
         LEFT JOIN societes s ON ce.societe_id = s.id
         WHERE ce.id = ?`,
        [eventId]
      );

      if (eventRows.length === 0) {
        console.warn(`⚠️ Événement ${eventId} introuvable`);
        return;
      }

      const event = eventRows[0];
      
      // Récupérer le prénom du propriétaire de la société (créateur)
      const [creatorRows] = await conn.query<RowDataPacket[]>(
        `SELECT m.prenom 
         FROM societes s
         JOIN membres m ON s.refmembre = m.ref
         WHERE s.id = ?`,
        [creatorSocieteId]
      );
      const creatorPrenom = creatorRows[0]?.prenom || 'Solutravo';

      // Formater les données pour l'email
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

      // Envoyer l'email via l'API
      await envoyerEmailNotificationInvitation(email, subject, message);

      console.log(
        `📧 Email d'invitation envoyé à ${email} pour l'événement ${event.title}`
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(`❌ Erreur envoi email invitation:`, error);
  }
}

/**
 * Créer le contenu HTML de l'email d'invitation
 */
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
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #E77131 0%, #F59E6C 100%); padding: 20px; border-radius: 10px 10px 0 0;">
        <h2 style="color: white; margin: 0;">📅 Invitation à un événement</h2>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Bonjour,</p>
        
        <p style="font-size: 15px; margin-bottom: 25px;">
          Vous avez été ajouté à l'événement suivant par <strong>${creatorName}</strong>:
        </p>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #E77131; border-radius: 5px; margin-bottom: 25px;">
          <p style="font-size: 18px; font-weight: bold; color: #E77131; margin: 0 0 15px 0;">
            ${eventTitle}
          </p>
          
          <p style="margin: 8px 0; font-size: 14px;">
            <strong>📅 Date :</strong> ${date}
          </p>
          
          <p style="margin: 8px 0; font-size: 14px;">
            <strong>⏰ Heure :</strong> ${heure}
          </p>
          
          <p style="margin: 8px 0; font-size: 14px;">
            <strong>📍 Lieu :</strong> ${lieu}
          </p>
          
          ${description ? `
          <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
            <strong>📝 Description:</strong><br/>
            ${description}
          </p>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="http://localhost:3000/calendar?event=${eventTitle}" 
             style="background: #E77131; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Voir l'événement
          </a>
        </div>
        
      </div>
    </div>
  `;
  console.log(prenom);
}


/**
 * Formater une date au format français
 */
function formaterDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  const jours = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi'
  ];
  const mois = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre'
  ];

  const jourSemaine = jours[date.getDay()];
  const jour = date.getDate();
  const moisNom = mois[date.getMonth()];
  const annee = date.getFullYear();

  return `${jourSemaine} ${jour} ${moisNom} ${annee}`;
}
