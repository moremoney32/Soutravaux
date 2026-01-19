"use strict";
// services/emailNotificationService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envoyerEmailNotification = envoyerEmailNotification;
exports.envoyerEmailNotificationInvitation = envoyerEmailNotificationInvitation;
const axios_1 = __importDefault(require("axios"));
const db_1 = __importDefault(require("../config/db"));
const CategoryService_1 = require("./CategoryService");
const EMAIL_API_URL = 'https://auth.solutravo-app.fr/send-email.php';
const DEFAULT_SENDER = 'noreply@solutravo-compta.fr';
/**
 * Envoyer un email de notification
 */
async function envoyerEmailNotification(notificationId) {
    const conn = await db_1.default.getConnection();
    try {
        // 1. Récupérer les infos de la notification
        const [notifRows] = await conn.query(`SELECT * FROM event_notifications WHERE id = ?`, [notificationId]);
        if (notifRows.length === 0) {
            console.warn(`⚠️ Notification ${notificationId} introuvable`);
            return false;
        }
        const notification = notifRows[0];
        // 2. Récupérer les infos de l'événement
        const [eventRows] = await conn.query(`SELECT * FROM calendar_events WHERE id = ?`, [notification.event_id]);
        if (eventRows.length === 0) {
            console.warn(`⚠️ Événement ${notification.event_id} introuvable`);
            return false;
        }
        const event = eventRows[0];
        let category = null;
        if (event.event_category_id) {
            category = await (0, CategoryService_1.getCategoryById)(event.event_category_id);
        }
        // Si pas de catégorie référencée mais label personnalisé présent, construire un objet category minimal
        if (!category && event.custom_category_label) {
            category = {
                label: event.custom_category_label,
                icon: '📌',
                color: '#E77131',
                is_predefined: false,
                requires_location: false,
                created_by_societe_id: undefined,
                created_at: '',
                updated_at: ''
            };
        }
        // 3. Récupérer les infos du destinataire
        const [recipientRows] = await conn.query(`SELECT email, nomsociete FROM societes WHERE id = ?`, [notification.recipient_societe_id]);
        if (recipientRows.length === 0) {
            console.warn(`⚠️ Destinataire ${notification.recipient_societe_id} introuvable`);
            return false;
        }
        const recipient = recipientRows[0];
        if (!recipient.email) {
            console.warn(`⚠️ Pas d'email pour la société ${notification.recipient_societe_id}`);
            return false;
        }
        // 4. Construire l'email selon le type
        const { subject, message } = construireEmail(event, recipient, notification.notification_type, category);
        // 5. Envoyer l'email
        console.log(`📧 Envoi email à ${recipient.email} (${notification.notification_type})`);
        const response = await axios_1.default.post(EMAIL_API_URL, {
            sender: DEFAULT_SENDER,
            receiver: recipient.email,
            subject,
            message
        });
        console.log(response);
        // 6. Marquer comme envoyé
        await conn.query(`UPDATE event_notifications 
       SET sent_at = NOW(), 
           email_status = 'sent',
           email_response = ?
       WHERE id = ?`, [JSON.stringify({ status: response.status }), notificationId]);
        console.log(`✅ Email envoyé avec succès (notification ${notificationId})`);
        return true;
    }
    catch (error) {
        console.error(`❌ Erreur envoi email (notification ${notificationId}):`, error.message);
        // Marquer comme échoué
        await conn.query(`UPDATE event_notifications 
       SET email_status = 'failed',
           email_response = ?
       WHERE id = ?`, [JSON.stringify({ error: error.message }), notificationId]);
        return false;
    }
    finally {
        conn.release();
    }
}
/**
 * Construire le contenu de l'email selon le type de notification
 */
function construireEmail(event, recipient, notificationType, category) {
    // Formater la date et l'heure
    const dateFormatee = formaterDate(event.event_date);
    const heureFormatee = event.start_time.substring(0, 5); // "10:00"
    const prenom = recipient.nomsociete.split(' ')[0]; // Premier mot du nom
    //RÉCUPÉRER ICÔNE + LABEL CATÉGORIE
    const categoryIcon = category?.icon || '📅';
    const categoryLabel = category?.label || 'Événement';
    const categoryColor = category?.color || '#E77131';
    console.log('Catégorie:', categoryLabel, categoryIcon, categoryColor);
    let subject = '';
    let message = '';
    switch (notificationType) {
        case '1_day_before':
            subject = `📅 Rappel : ${event.title} demain à ${heureFormatee}`;
            //   message = `
            //   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            //     <div style="background: linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            //       <h1 style="color: white; font-size: 48px; margin: 0;">${categoryIcon}</h1>
            //       <h2 style="color: white; margin: 10px 0 0 0;">${categoryLabel}</h2>
            //     </div>
            //     <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            //       <p style="font-size: 16px;">Bonjour <strong>${prenom}</strong>,</p>
            //       <p style="font-size: 15px; margin: 20px 0;">
            //         Rappel : Vous avez un <strong>${categoryLabel.toLowerCase()}</strong> prévu <strong>demain</strong> :
            //       </p>
            //       <div style="background: white; padding: 20px; border-left: 4px solid ${categoryColor}; border-radius: 5px; margin: 20px 0;">
            //         <p style="font-size: 18px; font-weight: bold; color: ${categoryColor}; margin: 0 0 15px 0;">
            //           ${event.title}
            //         </p>
            //         <p style="margin: 8px 0;"><strong>📅 Date :</strong> ${dateFormatee}</p>
            //         <p style="margin: 8px 0;"><strong>⏰ Heure :</strong> ${heureFormatee}</p>
            //         ${event.location ? `<p style="margin: 8px 0;"><strong>📍 Lieu :</strong> ${event.location}</p>` : ''}
            //         ${event.description ? `<p style="margin: 15px 0 0 0; color: #666;">${event.description}</p>` : ''}
            //       </div>
            //       <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            //         Email automatique - <strong style="color: #E77131;">Solutravo</strong>
            //       </p>
            //     </div>
            //   </div>
            // `;
            message = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E77131 0%, #F59E6C 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">📅 Rappel : Événement demain</h2>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${prenom}</strong>,</p>
            
            <p style="font-size: 15px; margin-bottom: 25px;">
              Vous avez un événement prévu <strong>demain</strong> :
            </p>
            
            <div style="background: white; padding: 20px; border-left: 4px solid #E77131; border-radius: 5px; margin-bottom: 25px;">
              <p style="font-size: 18px; font-weight: bold; color: #E77131; margin: 0 0 15px 0;">
                ${event.title}
              </p>
              
              <p style="margin: 8px 0; font-size: 14px;">
                <strong>📅 Date :</strong> ${dateFormatee}
              </p>
              
              <p style="margin: 8px 0; font-size: 14px;">
                <strong>⏰ Heure :</strong> ${heureFormatee}
              </p>
              
              ${event.location ? `
              <p style="margin: 8px 0; font-size: 14px;">
                <strong>📍 Lieu :</strong> ${event.location}
              </p>
              ` : ''}
              
              ${event.description ? `
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                <strong>📝 Description :</strong><br/>
                ${event.description}
              </p>
              ` : ''}
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Cet email a été envoyé automatiquement par <strong style="color: #E77131;">Solutravo</strong>.<br/>
              Pour gérer vos notifications, connectez-vous à votre espace.
            </p>
          </div>
        </div>
      `;
            break;
        case '1_hour_before':
            subject = `⏰ Dans 1 heure : ${event.title}`;
            message = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">⏰ Votre événement commence bientôt</h2>
          </div>
          
          <div style="background: #FFF9E6; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${prenom}</strong>,</p>
            
            <p style="font-size: 15px; margin-bottom: 25px;">
              Votre événement commence <strong style="color: #FF9800;">dans 1 heure</strong> :
            </p>
            
            <div style="background: white; padding: 20px; border-left: 4px solid #FF9800; border-radius: 5px; margin-bottom: 25px;">
              <p style="font-size: 20px; font-weight: bold; color: #FF9800; margin: 0 0 15px 0;">
                ${event.title}
              </p>
              
              <p style="margin: 8px 0; font-size: 16px;">
                <strong>⏰ Heure :</strong> <span style="color: #FF9800; font-size: 18px;">${heureFormatee}</span>
              </p>
              
              ${event.location ? `
              <p style="margin: 8px 0; font-size: 14px;">
                <strong>📍 Lieu :</strong> ${event.location}
              </p>
              ` : ''}
              
              ${event.description ? `
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                ${event.description}
              </p>
              ` : ''}
            </div>
            
            <div style="background: #FFE0B2; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #E65100;">
                💡 <strong>Conseil :</strong> Préparez-vous et vérifiez votre équipement si nécessaire.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Cet email a été envoyé automatiquement par <strong style="color: #E77131;">Solutravo</strong>.
            </p>
          </div>
        </div>
      `;
            break;
        case 'at_time':
            subject = `🔔 C'est maintenant : ${event.title}`;
            message = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">🔔 C'est l'heure !</h2>
          </div>
          
          <div style="background: #E8F5E9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${prenom}</strong>,</p>
            
            <p style="font-size: 15px; margin-bottom: 25px;">
              Votre événement commence <strong style="color: #4CAF50;">maintenant</strong> :
            </p>
            
            <div style="background: white; padding: 25px; border-left: 4px solid #4CAF50; border-radius: 5px; margin-bottom: 25px; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; color: #4CAF50; margin: 0 0 20px 0;">
                ${event.title}
              </p>
              
              <p style="margin: 0; font-size: 18px; color: #4CAF50;">
                ⏰ <strong>${heureFormatee}</strong>
              </p>
              
              ${event.location ? `
              <p style="margin: 15px 0 0 0; font-size: 14px;">
                <strong>📍</strong> ${event.location}
              </p>
              ` : ''}
            </div>
            
            
            
            <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Cet email a été envoyé automatiquement par <strong style="color: #E77131;">Solutravo</strong>.
            </p>
          </div>
        </div>
      `;
            break;
    }
    return { subject, message };
}
/**
 * Formater une date au format français
 */
function formaterDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const jourSemaine = jours[date.getDay()];
    const jour = date.getDate();
    const moisNom = mois[date.getMonth()];
    const annee = date.getFullYear();
    return `${jourSemaine} ${jour} ${moisNom} ${annee}`;
}
/**
 * Envoyer un email de notification d'invitation
 * Format: receiver + sender (pour les rappels d'invitation aux collaborateurs)
 */
async function envoyerEmailNotificationInvitation(recipientEmail, subject, htmlMessage) {
    try {
        const payload = {
            receiver: recipientEmail, // ✅ API attend "receiver" pas "to"
            sender: DEFAULT_SENDER, // ✅ API attend "sender"
            subject: subject,
            message: htmlMessage // ✅ API attend "message" pas "html"
        };
        const response = await axios_1.default.post(EMAIL_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200 || response.status === 201 || response.data.success) {
            console.log(`📧 Email d'invitation envoyé à ${recipientEmail}`);
            return true;
        }
        else {
            console.error(`❌ Erreur envoi email: ${response.statusText}`);
            return false;
        }
    }
    catch (error) {
        console.error(`❌ Erreur lors de l'envoi de l'email d'invitation:`, error);
        return false;
    }
}
//# sourceMappingURL=emailNotificationServices.js.map