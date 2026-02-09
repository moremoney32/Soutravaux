// cron/notificationCron.ts
import axios from 'axios';
import cron from 'node-cron';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { envoyerEmailNotification } from './emailNotificationServices';
import { sendEventReminders, cleanupOldInvitations } from './InvitationReminderService';  // ✅ NOUVEAU

/**
 * Démarrer le cron job de notifications
 * S'exécute toutes les 3 minutes (au lieu de 5)
 */

const EMAIL_API_URL = 'https://auth.solutravo-app.fr/send-email.php';
const DEFAULT_SENDER = 'noreply@solutravo-compta.fr';
export function demarrerCronNotifications() {
  
  // cron.schedule('*/3 * * * *', async () => {
  cron.schedule('* * * * *', async () => {

    console.log('🔄 [CRON] Vérification des notifications à envoyer...');
    
    try {
      await verifierEtEnvoyerNotifications();   // société
    //await verifierEtEnvoyerInvitations();     // invités
    await sendEventReminders(); 
      
    } catch (error) {
      console.error('❌ [CRON] Erreur:', error);
    }
  });
  
  // Cron job supplémentaire: Nettoyer les vieilles invitations (chaque jour à 2h du matin)
  cron.schedule('0 2 * * *', async () => {
    console.log('🧹 [CRON] Nettoyage des invitations anciennes...');
    try {
      await cleanupOldInvitations();
    } catch (error) {
      console.error('❌ [CRON Cleanup] Erreur:', error);
    }
  });
  
  console.log('✅ Cron job de notifications démarré (toutes les 3 minutes)');
  console.log('✅ Cron job de cleanup démarré (chaque jour à 2h)');
}

/**
 * Vérifier et envoyer les notifications en attente
 */
async function verifierEtEnvoyerNotifications(): Promise<void> {
  const conn = await pool.getConnection();

  try {

    const [rows] = await conn.query<RowDataPacket[]>(`
      SELECT *
      FROM event_notifications
      WHERE sent_at IS NULL
      AND email_status = 'pending'
      AND trigger_at <= NOW()
      ORDER BY trigger_at ASC
      LIMIT 50
    `);

    if (rows.length === 0) {
      console.log('✅ [CRON] Aucune notification à envoyer');
      return;
    }

    console.log(`📧 [CRON] ${rows.length} notification(s) à envoyer`);

    let envoyees = 0;
    let echouees = 0;

    for (const notification of rows) {

      let success = false;

      // 🟢 CAS 1 : notification SOCIETE
      if (notification.recipient_societe_id) {
        success = await envoyerEmailNotification(notification.id);
      }

      // 🟣 CAS 2 : notification EMAIL collaborateur
      // else if (notification.recipient_email) {
      //   success = await envoyerEmailNotificationInvite(notification);
      // }

      if (success) envoyees++;
      else echouees++;

      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`✅ [CRON] Résultat : ${envoyees} envoyées, ${echouees} échouées`);

  } catch (error) {
    console.error('❌ [CRON] Erreur vérification notifications:', error);
  } finally {
    conn.release();
  }
}


/**
 * Tester manuellement l'envoi de notifications
 * (utile pour le développement)
 */

export async function envoyerEmailNotificationInvitationDirect(
  notificationId:number,
  email:string
): Promise<boolean> {

  const conn = await pool.getConnection();

  try {

    const [notifRows] = await conn.query<RowDataPacket[]>(`
      SELECT en.*, ce.title, ce.event_date, ce.start_time, ce.location, ce.description
      FROM event_notifications en
      JOIN calendar_events ce ON ce.id = en.event_id
      WHERE en.id = ?
    `,[notificationId]);

    if(!notifRows.length) return false;

    const notif = notifRows[0];

    const subject = `📅 Rappel : ${notif.title}`;
    const message = `
      <div>
        <h3>${notif.title}</h3>
        <p>Date : ${notif.event_date}</p>
        <p>Heure : ${notif.start_time}</p>
        <p>Lieu : ${notif.location || ''}</p>
        <p>${notif.description || ''}</p>
      </div>
    `;

    await axios.post(EMAIL_API_URL,{
      sender: DEFAULT_SENDER,
      receiver: email,
      subject,
      message
    });

    await conn.query(`
      UPDATE event_notifications
      SET sent_at = NOW(), email_status='sent'
      WHERE id=?
    `,[notificationId]);

    return true;

  } catch(err){

    await conn.query(`
      UPDATE event_notifications
      SET email_status='failed'
      WHERE id=?
    `,[notificationId]);

    return false;
  }
}

