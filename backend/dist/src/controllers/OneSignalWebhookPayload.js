"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOneSignalWebhook = handleOneSignalWebhook;
const db_1 = __importDefault(require("../config/db"));
async function handleOneSignalWebhook(req, res) {
    const conn = await db_1.default.getConnection();
    try {
        const payload = req.body;
        console.log('📥 Webhook OneSignal reçu:', JSON.stringify(payload, null, 2));
        // Vérifier que c'est bien une notification délivrée
        if (payload.event === 'delivered' && payload.external_user_id) {
            const societeId = payload.external_user_id;
            console.log(`🎯 Notification délivrée à la société/presociété ${societeId}`);
            // ✅ Tenter de mettre à jour dans les présociétés
            const [resultPreSociete] = await conn.query(`UPDATE presocietes 
         SET isNotified = true, 
             notifiedAt = NOW()
         WHERE id = ?`, [societeId]);
            // ✅ Tenter de mettre à jour dans les sociétés
            const [resultSociete] = await conn.query(`UPDATE societes 
         SET isNotified = true,
             notifiedAt = NOW()
         WHERE id = ?`, [societeId]);
            const updated = resultPreSociete.affectedRows + resultSociete.affectedRows;
            if (updated > 0) {
                console.log(`✅ Société/Présociété ${societeId} marquée isNotified = true`);
            }
            else {
                console.log(`⚠️ ID ${societeId} non trouvé dans la BDD`);
            }
        }
        // Toujours répondre 200 à OneSignal
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('❌ Erreur webhook OneSignal:', error);
        // Toujours répondre 200 même en cas d'erreur pour ne pas que OneSignal retente
        res.status(200).json({ success: false, error: error.message });
    }
    finally {
        conn.release();
    }
}
//# sourceMappingURL=OneSignalWebhookPayload.js.map