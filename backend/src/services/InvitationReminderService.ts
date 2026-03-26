/**
 * InvitationReminderService.ts
 * Gère les rappels pour les invitations d'événements
 */

import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { envoyerEmailNotificationInvitation } from './emailNotificationServices';
import { envoyerEmailRappelExterne } from './CalendarService';

interface EventInvitation extends RowDataPacket {
  id: number;
  event_id: number;
  email: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  reminded_at: string | null;
  event_title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  description: string | null;
}

/**
 * ✅ Envoyer des rappels pour les événements à venir
 * Rappels: 24h avant, 1h avant
 */
export async function sendEventReminders(): Promise<void> {
  const conn = await pool.getConnection();

  try {
    console.log('📬 [InvitationReminderService] Démarrage vérification des rappels...');

    // Récupérer les événements à rappeler
    const [invitations] = await conn.query<EventInvitation[]>(
      `SELECT 
        ei.id,
        ei.event_id,
        ei.email,
        ei.status,
        ei.created_at,
        ei.reminded_at,
        ce.title as event_title,
        ce.event_date,
        ce.start_time,
        ce.end_time,
        ce.location,
        ce.description
      FROM event_invitations ei
      JOIN calendar_events ce ON ei.event_id = ce.id
      WHERE ei.status = 'sent'
        AND ei.reminded_at IS NULL
        AND ce.event_date >= CURDATE()
        AND ce.event_date <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)`
    );

    console.log(`📬 [InvitationReminderService] ${invitations.length} invitations à vérifier`);

    for (const invitation of invitations) {
      try {
        // ✅ Combiner date + heure de début pour un calcul précis
        const eventDateTime = new Date(`${invitation.event_date}T${invitation.start_time}`);
        const now = new Date();
        const totalMinutesUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60);
        const hoursUntilEvent = totalMinutesUntilEvent / 60;

        console.log(`📧 [InvitationReminderService] Vérification rappel pour: ${invitation.email}`);
        console.log(`   Temps jusqu'à l'événement: ${hoursUntilEvent.toFixed(2)}h (${Math.round(totalMinutesUntilEvent)}min)`);

        // ✅ Rappel 24h avant (entre 23h50 et 24h10)
        if (hoursUntilEvent <= 24.17 && hoursUntilEvent > 23.83) {
          console.log(`   ⏰ Rappel 24h avant l'événement`);
          await sendReminder(
            invitation.email,
            invitation.event_title,
            invitation.event_date,
            invitation.start_time,
            invitation.location || '',
            invitation.description || '',
            'demain'
          );
          await updateReminderSent(invitation.id, conn);
        }
        // ✅ Rappel 1h avant (entre 50min et 70min)
        else if (hoursUntilEvent <= 1.17 && hoursUntilEvent > 0.83) {
          console.log(`   ⏰ Rappel 1h avant l'événement`);
          await sendReminder(
            invitation.email,
            invitation.event_title,
            invitation.event_date,
            invitation.start_time,
            invitation.location || '',
            invitation.description || '',
            '1 heure'
          );
          await updateReminderSent(invitation.id, conn);
        }
       
       else if (totalMinutesUntilEvent <= 5 && totalMinutesUntilEvent > 0)
 {
          console.log(`   ⏰ Rappel MAINTENANT - L'événement commence!`);
          await sendReminder(
            invitation.email,
            invitation.event_title,
            invitation.event_date,
            invitation.start_time,
            invitation.location || '',
            invitation.description || '',
            'maintenant'
          );
          await updateReminderSent(invitation.id, conn);
        }

      } catch (error: any) {
        console.error(
          `❌ [InvitationReminderService] Erreur pour ${invitation.email}:`,
          error.message
        );
      }
    }

    console.log('✅ [InvitationReminderService] Vérification des rappels terminée');

    // ─── Rappels pour les invités externes ───
    const [externesRows] = await conn.query<RowDataPacket[]>(`
      SELECT eei.id, eei.email, eei.reminded_at,
             ce.title as event_title, ce.event_date, ce.start_time, ce.location,
             s.nomsociete
      FROM event_externe_invitations eei
      JOIN calendar_events ce ON ce.id = eei.event_id
      JOIN societes s ON s.id = ce.societe_id
      WHERE eei.status = 'sent'
        AND eei.reminded_at IS NULL
        AND ce.event_date >= CURDATE()
        AND ce.event_date <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)
    `);

    for (const ext of externesRows as any[]) {
      try {
        const eventDateTime = new Date(`${ext.event_date}T${ext.start_time}`);
        const now = new Date();
        const minutesUntil = (eventDateTime.getTime() - now.getTime()) / (1000 * 60);

        if (minutesUntil <= 5 && minutesUntil > 0) {
          await envoyerEmailRappelExterne(
            ext.email,
            ext.event_title,
            ext.nomsociete,
            ext.start_time.substring(0, 5),
            ext.location || null
          );
          await conn.query(
            `UPDATE event_externe_invitations SET reminded_at = NOW() WHERE id = ?`,
            [ext.id]
          );
          console.log(`📧 [External] Rappel au moment de l'événement envoyé à ${ext.email}`);
        }
      } catch (e: any) {
        console.error(`❌ [External] Erreur rappel pour ${ext.email}:`, e.message);
      }
    }

  } catch (error: any) {
    console.error('[InvitationReminderService] Erreur générale:', error.message);
  } finally {
    conn.release();
  }
}

/**
 * ✅ Envoyer un email de rappel
 */
async function sendReminder(
  email: string,
  eventTitle: string,
  eventDate: string,
  startTime: string,
  location: string,
  description: string,
  timing: string
): Promise<void> {
  try {
    const { subject, htmlMessage } = construireEmailInvitation(
      eventTitle,
      eventDate,
      startTime,
      location,
      description,
      timing
    );

    await envoyerEmailNotificationInvitation(email, subject, htmlMessage);
    console.log(`✅ [InvitationReminderService] Rappel envoyé à: ${email}`);

  } catch (error: any) {
    console.error(
      `❌ [InvitationReminderService] Erreur envoi rappel à ${email}:`,
      error.message
    );
    throw error;
  }
}

/**
 * 🎨 Construire le design d'email pour les rappels d'invitation
 * Utilise le même style que les notifications classiques
 */
function construireEmailInvitation(
  eventTitle: string,
  eventDate: string,
  startTime: string,
  location: string,
  description: string,
  timing: string
): { subject: string; htmlMessage: string } {
  const heureFormatee = startTime.substring(0, 5); // "10:00"
  let subject = '';
  let htmlMessage = '';

  if (timing === 'demain') {
    subject = `📅 Rappel : ${eventTitle} demain à ${heureFormatee}`;
    htmlMessage = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #E77131 0%, #F59E6C 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">📅 Rappel : Événement demain</h2>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Bonjour,</p>
          
          <p style="font-size: 15px; margin-bottom: 25px;">
            Vous avez un événement collaboratif prévu <strong>demain</strong> :
          </p>
          
          <div style="background: white; padding: 20px; border-left: 4px solid #E77131; border-radius: 5px; margin-bottom: 25px;">
            <p style="font-size: 18px; font-weight: bold; color: #E77131; margin: 0 0 15px 0;">
              ${eventTitle}
            </p>
            
            <p style="margin: 8px 0; font-size: 14px;">
              <strong>📅 Date :</strong> ${eventDate}
            </p>
            
            <p style="margin: 8px 0; font-size: 14px;">
              <strong>⏰ Heure :</strong> ${heureFormatee}
            </p>
            
            ${location ? `
            <p style="margin: 8px 0; font-size: 14px;">
              <strong>📍 Lieu :</strong> ${location}
            </p>
            ` : ''}
            
            ${description ? `
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
              <strong>📝 Description :</strong><br/>
              ${description}
            </p>
            ` : ''}
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            Cet email a été envoyé automatiquement par <strong style="color: #E77131;">Solutravo</strong>.
          </p>
        </div>
      </div>
    `;
  } else if (timing === '1 heure') {
    subject = `⏰ Dans 1 heure : ${eventTitle}`;
    htmlMessage = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">⏰ Votre événement commence bientôt</h2>
        </div>
        
        <div style="background: #FFF9E6; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Bonjour,</p>
          
          <p style="font-size: 15px; margin-bottom: 25px;">
            Votre événement collaboratif commence <strong style="color: #FF9800;">dans 1 heure</strong> :
          </p>
          
          <div style="background: white; padding: 20px; border-left: 4px solid #FF9800; border-radius: 5px; margin-bottom: 25px;">
            <p style="font-size: 20px; font-weight: bold; color: #FF9800; margin: 0 0 15px 0;">
              ${eventTitle}
            </p>
            
            <p style="margin: 8px 0; font-size: 16px;">
              <strong>⏰ Heure :</strong> <span style="color: #FF9800; font-size: 18px;">${heureFormatee}</span>
            </p>
            
            ${location ? `
            <p style="margin: 8px 0; font-size: 14px;">
              <strong>📍 Lieu :</strong> ${location}
            </p>
            ` : ''}
            
            ${description ? `
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
              ${description}
            </p>
            ` : ''}
          </div>
          
          
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            Cet email a été envoyé automatiquement par <strong style="color: #E77131;">Solutravo</strong>.
          </p>
        </div>
      </div>
    `;
  } else if (timing === 'maintenant') {
    subject = `🔔 C'est maintenant : ${eventTitle}`;
    htmlMessage = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">🔔 C'est l'heure !</h2>
        </div>
        
        <div style="background: #E8F5E9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Bonjour,</p>
          
          <p style="font-size: 15px; margin-bottom: 25px;">
            Votre événement collaboratif commence <strong style="color: #4CAF50;">maintenant</strong> :
          </p>
          
          <div style="background: white; padding: 25px; border-left: 4px solid #4CAF50; border-radius: 5px; margin-bottom: 25px; text-align: center;">
            <p style="font-size: 24px; font-weight: bold; color: #4CAF50; margin: 0 0 20px 0;">
              ${eventTitle}
            </p>
            
            <p style="margin: 0; font-size: 18px; color: #4CAF50;">
              ⏰ <strong>${heureFormatee}</strong>
            </p>
            
            ${location ? `
            <p style="margin: 15px 0 0 0; font-size: 14px;">
              <strong>📍</strong> ${location}
            </p>
            ` : ''}
          </div>
          
          <div style="background: #E3F2FD; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #1565C0;">
              💡 <strong>Conseil :</strong> Préparez-vous pour que tout se passe au mieux.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            Cet email a été envoyé automatiquement par <strong style="color: #E77131;">Solutravo</strong>.
          </p>
        </div>
      </div>
    `;
  }

  return { subject, htmlMessage };
}

/**
 * ✅ Mettre à jour que le rappel a été envoyé
 */
async function updateReminderSent(invitationId: number, conn: any): Promise<void> {
  try {
    await conn.query(
      `UPDATE event_invitations 
       SET reminded_at = NOW()
       WHERE id = ?`,
      [invitationId]
    );
    console.log(`✅ [InvitationReminderService] Rappel enregistré pour invitation ${invitationId}`);
  } catch (error: any) {
    console.error(`❌ Erreur update reminder:`, error.message);
    throw error;
  }
}

/**
 * ✅ Nettoyer les anciennes invitations (optionnel)
 * Supprimer les invitations d'événements passés
 */
export async function cleanupOldInvitations(): Promise<void> {
  const conn = await pool.getConnection();

  try {
    console.log('🧹 [InvitationReminderService] Nettoyage des invitations anciennes...');

    const [result] = await conn.query(
      `DELETE FROM event_invitations 
       WHERE event_id IN (
         SELECT id FROM calendar_events 
         WHERE event_date < DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       )`
    );

    console.log(`✅ [InvitationReminderService] ${(result as any).affectedRows} anciennes invitations supprimées`);

  } catch (error: any) {
    console.error('[InvitationReminderService] Erreur cleanup:', error.message);
  } finally {
    conn.release();
  }
}


