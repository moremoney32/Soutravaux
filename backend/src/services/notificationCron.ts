// cron/notificationCron.ts

import cron from 'node-cron';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { envoyerEmailNotification } from './emailNotificationServices';
// import { envoyerEmailNotification } from '../services/emailNotificationService';

/**
 * Démarrer le cron job de notifications
 * S'exécute toutes les 5 minutes
 */
export function demarrerCronNotifications() {
  
  // Cron pattern: "*/5 * * * *" = toutes les 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 [CRON] Vérification des notifications à envoyer...');
    
    try {
      await verifierEtEnvoyerNotifications();
    } catch (error) {
      console.error('❌ [CRON] Erreur:', error);
    }
  });
  
  console.log('✅ Cron job de notifications démarré (toutes les 5 minutes)');
}

/**
 * Vérifier et envoyer les notifications en attente
 */
async function verifierEtEnvoyerNotifications(): Promise<void> {
  const conn = await pool.getConnection();
  
  try {
    // Récupérer les notifications à envoyer
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT id, event_id, recipient_societe_id, notification_type, trigger_at
       FROM event_notifications
       WHERE sent_at IS NULL
         AND email_status = 'pending'
         AND trigger_at <= NOW()
       ORDER BY trigger_at ASC
       LIMIT 50`
    );
    
    if (rows.length === 0) {
      console.log('✅ [CRON] Aucune notification à envoyer');
      return;
    }
    
    console.log(`📧 [CRON] ${rows.length} notification(s) à envoyer`);
    
    // Envoyer chaque notification
    let envoyees = 0;
    let echouees = 0;
    
    for (const notification of rows) {
      const success = await envoyerEmailNotification(notification.id);
      
      if (success) {
        envoyees++;
      } else {
        echouees++;
      }
      
      // Petit délai entre chaque email pour éviter le spam
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ [CRON] Résultat : ${envoyees} envoyées, ${echouees} échouées`);
    
  } catch (error) {
    console.error('❌ [CRON] Erreur vérification notifications:', error);
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Tester manuellement l'envoi de notifications
 * (utile pour le développement)
 */
export async function testerEnvoiNotifications(): Promise<void> {
  console.log('🧪 Test manuel d\'envoi de notifications...');
  await verifierEtEnvoyerNotifications();
}