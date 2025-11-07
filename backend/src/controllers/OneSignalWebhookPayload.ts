import { Request, Response } from 'express';
import pool from '../config/db';

interface OneSignalWebhookPayload {
  event: string;
  external_user_id?: string;
  notification_id?: string;
  timestamp?: number;
}

export async function handleOneSignalWebhook(req: Request, res: Response) {
  const conn = await pool.getConnection();
  
  try {
    const payload: OneSignalWebhookPayload = req.body;
    
    console.log('📥 Webhook OneSignal reçu:', JSON.stringify(payload, null, 2));
    
    // Vérifier que c'est bien une notification délivrée
    if (payload.event === 'delivered' && payload.external_user_id) {
      const societeId = payload.external_user_id;
      
      console.log(`🎯 Notification délivrée à la société/presociété ${societeId}`);
      
      // ✅ Tenter de mettre à jour dans les présociétés
      const [resultPreSociete] = await conn.query(
        `UPDATE presocietes 
         SET isNotified = true, 
             notifiedAt = NOW()
         WHERE id = ?`,
        [societeId]
      );
      
      // ✅ Tenter de mettre à jour dans les sociétés
      const [resultSociete] = await conn.query(
        `UPDATE societes 
         SET isNotified = true,
             notifiedAt = NOW()
         WHERE id = ?`,
        [societeId]
      );
      
      const updated = (resultPreSociete as any).affectedRows + (resultSociete as any).affectedRows;
      
      if (updated > 0) {
        console.log(`✅ Société/Présociété ${societeId} marquée isNotified = true`);
      } else {
        console.log(`⚠️ ID ${societeId} non trouvé dans la BDD`);
      }
    }
    
    // Toujours répondre 200 à OneSignal
    res.status(200).json({ success: true });
    
  } catch (error: any) {
    console.error('❌ Erreur webhook OneSignal:', error);
    // Toujours répondre 200 même en cas d'erreur pour ne pas que OneSignal retente
    res.status(200).json({ success: false, error: error.message });
  } finally {
    conn.release();
  }
}