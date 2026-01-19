"use strict";
// cron/notificationCron.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demarrerCronNotifications = demarrerCronNotifications;
exports.testerEnvoiNotifications = testerEnvoiNotifications;
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = __importDefault(require("../config/db"));
const emailNotificationServices_1 = require("./emailNotificationServices");
const InvitationReminderService_1 = require("./InvitationReminderService"); // ✅ NOUVEAU
/**
 * Démarrer le cron job de notifications
 * S'exécute toutes les 3 minutes (au lieu de 5)
 */
function demarrerCronNotifications() {
    // Cron pattern: "*/3 * * * *" = toutes les 3 minutes (réduction pour plus de précision des rappels)
    node_cron_1.default.schedule('*/3 * * * *', async () => {
        console.log('🔄 [CRON] Vérification des notifications à envoyer...');
        try {
            // ✅ Vérifier les notifications normales
            await verifierEtEnvoyerNotifications();
            // ✅ NOUVEAU: Vérifier les rappels d'invitations
            await (0, InvitationReminderService_1.sendEventReminders)();
        }
        catch (error) {
            console.error('❌ [CRON] Erreur:', error);
        }
    });
    // Cron job supplémentaire: Nettoyer les vieilles invitations (chaque jour à 2h du matin)
    node_cron_1.default.schedule('0 2 * * *', async () => {
        console.log('🧹 [CRON] Nettoyage des invitations anciennes...');
        try {
            await (0, InvitationReminderService_1.cleanupOldInvitations)();
        }
        catch (error) {
            console.error('❌ [CRON Cleanup] Erreur:', error);
        }
    });
    console.log('✅ Cron job de notifications démarré (toutes les 3 minutes)');
    console.log('✅ Cron job de cleanup démarré (chaque jour à 2h)');
}
/**
 * Vérifier et envoyer les notifications en attente
 */
async function verifierEtEnvoyerNotifications() {
    const conn = await db_1.default.getConnection();
    try {
        // Récupérer les notifications à envoyer
        const [rows] = await conn.query(`SELECT id, event_id, recipient_societe_id, notification_type, trigger_at
       FROM event_notifications
       WHERE sent_at IS NULL
         AND email_status = 'pending'
         AND trigger_at <= NOW()
       ORDER BY trigger_at ASC
       LIMIT 50`);
        if (rows.length === 0) {
            console.log('✅ [CRON] Aucune notification à envoyer');
            return;
        }
        console.log(`📧 [CRON] ${rows.length} notification(s) à envoyer`);
        // Envoyer chaque notification
        let envoyees = 0;
        let echouees = 0;
        for (const notification of rows) {
            const success = await (0, emailNotificationServices_1.envoyerEmailNotification)(notification.id);
            if (success) {
                envoyees++;
            }
            else {
                echouees++;
            }
            // Petit délai entre chaque email pour éviter le spam
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        console.log(`✅ [CRON] Résultat : ${envoyees} envoyées, ${echouees} échouées`);
    }
    catch (error) {
        console.error('❌ [CRON] Erreur vérification notifications:', error);
        throw error;
    }
    finally {
        conn.release();
    }
}
/**
 * Tester manuellement l'envoi de notifications
 * (utile pour le développement)
 */
async function testerEnvoiNotifications() {
    console.log('🧪 Test manuel d\'envoi de notifications...');
    await verifierEtEnvoyerNotifications();
}
//# sourceMappingURL=notificationCron.js.map