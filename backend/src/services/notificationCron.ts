
import cron from 'node-cron';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { envoyerEmailNotification, envoyerEmailNotificationInvitation } from './emailNotificationServices';
// import { envoyerEmailNotification, envoyerEmailNotificationInvitation } from '../services/emailNotificationService';

let isRunning = false;

/**
 * ✅ NOUVEAU : Envoyer email notification MEMBRE
 */
async function envoyerEmailNotificationMembre(
  notificationId: number
): Promise<void> {
  
  const conn = await pool.getConnection();
  
  try {
    console.log(`📧 [NotificationMembre] Traitement notification ${notificationId}`);
    
    // 1️⃣ Récupérer notification
    const [notifRows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM event_notifications WHERE id = ?`,
      [notificationId]
    );
    
    if (!notifRows.length) {
      console.log(`⚠️ Notification ${notificationId} introuvable`);
      return;
    }
    
    const notification = notifRows[0];
    
    // 2️⃣ Récupérer événement
    const [eventRows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM calendar_events WHERE id = ?`,
      [notification.event_id]
    );
    
    if (!eventRows.length) {
      console.log(`⚠️ Event ${notification.event_id} introuvable`);
      return;
    }
    
    const event = eventRows[0];
    
    // 3️⃣ Récupérer email du membre
    const [membreRows] = await conn.query<RowDataPacket[]>(
      `SELECT email, nom, prenom FROM membres WHERE id = ?`,
      [notification.recipient_membre_id]
    );
    
    if (!membreRows.length) {
      console.log(`⚠️ Membre ${notification.recipient_membre_id} introuvable`);
      return;
    }
    
    const membre = membreRows[0];
    
    if (!membre.email) {
      console.log(`⚠️ Pas d'email pour membre ${notification.recipient_membre_id}`);
      return;
    }
    
    // 4️⃣ Construire email (similaire à société)
    const { subject, message } = construireEmailMembre(
      event,
      membre,
      notification.notification_type,
      notification.minutes_before
    );
    
    // 5️⃣ Envoyer via emailNotificationService
    console.log(`📧 Envoi email à ${membre.email} (${notification.notification_type})`);
    
    const success = await envoyerEmailNotificationInvitation(
      membre.email,
      subject,
      message
    );
    
    if (success) {
      // 6️⃣ Marquer comme envoyé
      await conn.query(
        `UPDATE event_notifications 
         SET sent_at = NOW(), email_status = 'sent'
         WHERE id = ?`,
        [notificationId]
      );
      
      console.log(`✅ Email membre envoyé (notification ${notificationId})`);
    } else {
      throw new Error('Échec envoi email');
    }
    
  } catch (error: any) {
    console.error(`❌ Erreur notif membre ${notificationId}:`, error);
    
    // Marquer comme échoué
    await conn.query(
      `UPDATE event_notifications
       SET email_status = 'failed', email_response = ?
       WHERE id = ?`,
      [JSON.stringify({ error: error.message }), notificationId]
    );
  } finally {
    conn.release();
  }
}


async function envoyerEmailNotificationInvite(notificationId: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    console.log(`📧 [NotificationInvité] Traitement notification ${notificationId}`);

    // 1️⃣ Récupérer notification
    const [notifRows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM event_invitation_notifications WHERE id = ?`,
      [notificationId]
    );
    if (!notifRows.length) {
      console.log(`⚠️ Notification invité ${notificationId} introuvable`);
      return;
    }
    const notification = notifRows[0];

    // 2️⃣ Récupérer événement
    const [eventRows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM calendar_events WHERE id = ?`,
      [notification.event_id]
    );
    if (!eventRows.length) {
      console.log(`⚠️ Event ${notification.event_id} introuvable`);
      return;
    }
    const event = eventRows[0];

    // 3️⃣ Construire membre fictif depuis l'email
    const membreFictif = {
      prenom: null,
      nom: notification.recipient_email.split('@')[0]
    };

    // 4️⃣ Construire email — même fonction que membre
    const { subject, message } = construireEmailMembre(
      event,
      membreFictif,
      notification.notification_type,
      notification.minutes_before
    );

    // 5️⃣ Envoyer
    console.log(`📧 Envoi rappel invité à ${notification.recipient_email} (${notification.notification_type})`);
    const success = await envoyerEmailNotificationInvitation(notification.recipient_email, subject, message);

    if (success) {
      // 6️⃣ Marquer comme envoyé
      await conn.query(
        `UPDATE event_invitation_notifications SET sent_at = NOW(), email_status = 'sent' WHERE id = ?`,
        [notificationId]
      );
      console.log(`✅ Rappel invité envoyé (notification ${notificationId})`);
    } else {
      throw new Error('Échec envoi email invité');
    }

  } catch (error: any) {
    console.error(`❌ Erreur rappel invité ${notificationId}:`, error);
    await conn.query(
      `UPDATE event_invitation_notifications SET email_status = 'failed' WHERE id = ?`,
      [notificationId]
    );
  } finally {
    conn.release();
  }
}


/**
 * ✅ Construire email pour MEMBRE
 */

function construireEmailMembre(
  event: any,
  membre: any,
  notificationType: string,
  minutesBefore?: number
): { subject: string; message: string } {

  const dateFormatee  = formaterDate(event.event_date);
  const heureFormatee = event.start_time.substring(0, 5);
  const prenom        = membre.prenom || membre.nom.split(' ')[0];

  // ─── Bloc détails réutilisable ────────────────────────────────────────
  const blocEvent = (couleur: string) => `
    <div style="background:white;padding:20px;border-left:4px solid ${couleur};border-radius:5px;margin-bottom:25px;">
      <p style="font-size:18px;font-weight:bold;color:${couleur};margin:0 0 15px 0;">${event.title}</p>
      <p style="margin:8px 0;font-size:14px;"><strong>📅 Date :</strong> ${dateFormatee}</p>
      <p style="margin:8px 0;font-size:14px;"><strong>⏰ Heure :</strong> ${heureFormatee}</p>
      ${event.location    ? `<p style="margin:8px 0;font-size:14px;"><strong>📍 Lieu :</strong> ${event.location}</p>` : ''}
      ${event.description ? `<p style="margin:15px 0 0 0;font-size:14px;color:#666;"><strong>📝 Description :</strong><br/>${event.description}</p>` : ''}
    </div>
  `;

  const footer = `
    <p style="font-size:14px;color:#666;margin-top:30px;padding-top:20px;border-top:1px solid #ddd;">
      Cet email a été envoyé automatiquement par <strong style="color:#E77131;">Solutravo</strong>.
    </p>
  `;

  // ─── Libellé humain pour les minutes ─────────────────────────────────
  const libelleMinutes = (m: number): string => {
    if (m === 0)     return 'maintenant';
    if (m === 5)     return 'dans 5 minutes';
    if (m === 10)    return 'dans 10 minutes';
    if (m === 15)    return 'dans 15 minutes';
    if (m === 30)    return 'dans 30 minutes';
    if (m === 60)    return 'dans 1 heure';
    if (m === 120)   return 'dans 2 heures';
    if (m === 1440)  return 'demain';
    if (m === 2880)  return 'dans 2 jours';
    if (m === 10080) return 'dans 1 semaine';
    if (m < 60)      return `dans ${m} minutes`;
    if (m < 1440)    return `dans ${Math.round(m / 60)} heure(s)`;
    return `dans ${Math.round(m / 1440)} jour(s)`;
  };

  let subject = '';
  let message = '';

  switch (notificationType) {

    // ─── 1 jour avant ────────────────────────────────────────────────
    case '1_day_before':
      subject = `📅 Rappel : ${event.title} demain à ${heureFormatee}`;
      message = `
        <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#E77131 0%,#F59E6C 100%);padding:20px;border-radius:10px 10px 0 0;">
            <h2 style="color:white;margin:0;">📅 Rappel : Événement demain</h2>
          </div>
          <div style="background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px;">
            <p style="font-size:16px;margin-bottom:20px;">Bonjour <strong>${prenom}</strong>,</p>
            <p style="font-size:15px;margin-bottom:25px;">Vous avez un événement prévu <strong>demain</strong> :</p>
            ${blocEvent('#E77131')}
            ${footer}
          </div>
        </div>`;
      break;

    // ─── 1 heure avant ───────────────────────────────────────────────
    case '1_hour_before':
      subject = `⏰ Dans 1 heure : ${event.title}`;
      message = `
        <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#FF9800 0%,#FFB74D 100%);padding:20px;border-radius:10px 10px 0 0;">
            <h2 style="color:white;margin:0;">⏰ Votre événement commence bientôt</h2>
          </div>
          <div style="background:#FFF9E6;padding:30px;border-radius:0 0 10px 10px;">
            <p style="font-size:16px;margin-bottom:20px;">Bonjour <strong>${prenom}</strong>,</p>
            <p style="font-size:15px;margin-bottom:25px;">Votre événement commence <strong style="color:#FF9800;">dans 1 heure</strong> :</p>
            ${blocEvent('#FF9800')}
            ${footer}
          </div>
        </div>`;
      break;

    // ─── À l'heure exacte ────────────────────────────────────────────
    case 'at_time':
      subject = `🔔 C'est maintenant : ${event.title}`;
      message = `
        <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#4CAF50 0%,#66BB6A 100%);padding:20px;border-radius:10px 10px 0 0;">
            <h2 style="color:white;margin:0;">🔔 C'est l'heure !</h2>
          </div>
          <div style="background:#E8F5E9;padding:30px;border-radius:0 0 10px 10px;">
            <p style="font-size:16px;margin-bottom:20px;">Bonjour <strong>${prenom}</strong>,</p>
            <p style="font-size:15px;margin-bottom:25px;">Votre événement commence <strong style="color:#4CAF50;">maintenant</strong> :</p>
            ${blocEvent('#4CAF50')}
            ${footer}
          </div>
        </div>`;
      break;

    // ─── CUSTOM : 5min, 10min, 15min, 30min, 2h, 2j, 1sem... ────────
    case 'custom': {
      const minutes = minutesBefore ?? 0;
      const libelle = libelleMinutes(minutes);

      // Couleur et ambiance selon l'urgence
      const isNow   = minutes === 0;
      const isSoon  = minutes > 0  && minutes <= 30;   // 5, 10, 15, 30 min → rouge urgent
      const isHours = minutes > 30 && minutes < 1440;  // 1h+, quelques heures → orange
      // const isDays  = minutes >= 1440;                 // 1 jour+ → orange Solutravo

      const couleur = isNow   ? '#4CAF50'
                    : isSoon  ? '#F44336'
                    : isHours ? '#FF9800'
                    : '#E77131';

      const bgColor = isNow   ? '#E8F5E9'
                    : isSoon  ? '#FFEBEE'
                    : isHours ? '#FFF9E6'
                    : '#f9f9f9';

      const emoji   = isNow   ? '🔔'
                    : isSoon  ? '🚨'
                    : isHours ? '⏰'
                    : '📅';

      subject = `${emoji} ${isNow ? "C'est maintenant" : `Rappel – ${libelle}`} : ${event.title}`;

      message = `
        <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,${couleur} 0%,${couleur}CC 100%);padding:20px;border-radius:10px 10px 0 0;">
            <h2 style="color:white;margin:0;">${emoji} ${isNow ? "C'est l'heure !" : `Rappel : ${libelle}`}</h2>
          </div>
          <div style="background:${bgColor};padding:30px;border-radius:0 0 10px 10px;">
            <p style="font-size:16px;margin-bottom:20px;">Bonjour <strong>${prenom}</strong>,</p>
            <p style="font-size:15px;margin-bottom:25px;">
              ${isNow
                ? `Votre événement commence <strong style="color:${couleur};">maintenant</strong> :`
                : `Votre événement commence <strong style="color:${couleur};">${libelle}</strong> :`
              }
            </p>
            ${blocEvent(couleur)}
            ${footer}
          </div>
        </div>`;
      break;
    }

    // ─── Fallback sécurité ────────────────────────────────────────────
    default:
      subject = `📅 Rappel : ${event.title}`;
      message = `<p>Bonjour ${prenom}, rappel pour : <strong>${event.title}</strong> le ${dateFormatee} à ${heureFormatee}.</p>`;
  }

  return { subject, message };
}

/**
 * Formater date
 */
function formaterDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  
  return `${jours[date.getDay()]} ${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * CRON : Vérifier et envoyer notifications
 */
export function demarrerCronNotifications() {
  
  console.log('🕐 CRON Notifications démarré (toutes les minutes)');
  
  cron.schedule('* * * * *', async () => {
    
    if (isRunning) {
      console.log('⏳ CRON déjà en cours, skip...');
      return;
    }
    
    isRunning = true;
    
    try {
      const conn = await pool.getConnection();
      
      try {
       

        const now = new Date();

// ✅ Heure locale
const nowStr = `${now.getFullYear()}-${
  String(now.getMonth() + 1).padStart(2, '0')}-${
  String(now.getDate()).padStart(2, '0')} ${
  String(now.getHours()).padStart(2, '0')}:${
  String(now.getMinutes()).padStart(2, '0')}:${
  String(now.getSeconds()).padStart(2, '0')}`;
        
        console.log(`🔔 [${nowStr}] Vérification notifications pendantes...`);
        
        // ==============================
        // 1️⃣ NOTIFICATIONS MEMBRES
        // ==============================
        const [notifsMembres] = await conn.query<RowDataPacket[]>(`
          SELECT * FROM event_notifications
          WHERE recipient_membre_id IS NOT NULL
          AND sent_at IS NULL
          AND trigger_at <= ?
          ORDER BY trigger_at ASC
          LIMIT 50
        `, [nowStr]);
        
        console.log(`📨 ${notifsMembres.length} notifications membres à envoyer`);
        
        for (const notif of notifsMembres) {
          try {
            await envoyerEmailNotificationMembre(notif.id);
          } catch (error: any) {
            console.error(`❌ Erreur notif membre ${notif.id}:`, error);
          }
        }
        
        // ==============================
        // 2️⃣ NOTIFICATIONS SOCIÉTÉS
        // ==============================
        const [notifsSocietes] = await conn.query<RowDataPacket[]>(`
          SELECT * FROM event_notifications
          WHERE recipient_societe_id IS NOT NULL
          AND sent_at IS NULL
          AND trigger_at <= ?
          ORDER BY trigger_at ASC
          LIMIT 50
        `, [nowStr]);
        
        console.log(`📨 ${notifsSocietes.length} notifications sociétés à envoyer`);
        
        for (const notif of notifsSocietes) {
          try {
            // ✅ Utiliser la fonction existante pour sociétés
            await envoyerEmailNotification(notif.id);
          } catch (error: any) {
            console.error(`❌ Erreur notif société ${notif.id}:`, error);
          }
        }
        
        // ==============================
        // 3️⃣ NOTIFICATIONS INVITÉS (si tu as ce système)
        // ==============================
        const [notifsInvites] = await conn.query<RowDataPacket[]>(`
          SELECT * FROM event_invitation_notifications
          WHERE sent_at IS NULL
          AND trigger_at <= ?
          ORDER BY trigger_at ASC
          LIMIT 50
        `, [nowStr]);
        
        console.log(`📨 ${notifsInvites.length} notifications invités à envoyer`);
        
        for (const notif of notifsInvites) {
          try {
            
    await envoyerEmailNotificationInvite(notif.id);
          } catch (error: any) {
            console.error(`❌ Erreur notif invité ${notif.id}:`, error);
          }
        }
        
      } finally {
        conn.release();
      }
      
    } catch (error) {
      console.error('❌ CRON ERROR:', error);
    } finally {
      isRunning = false;
    }
  });
}