// services/notificationScheduler.ts

// import pool from '../config/db';

// services/notificationScheduler.ts
import { PoolConnection } from 'mysql2/promise';

interface NotificationSchedule {
  event_id: number;
  recipient_societe_id: number;
  notification_type: '1_day_before' | '1_hour_before' | 'at_time';
  trigger_at: string;
}

export function calculerMomentsNotifications(
  eventDate: string,
  startTime: string
): NotificationSchedule[] {
  
  const schedules: Omit<NotificationSchedule, 'event_id' | 'recipient_societe_id'>[] = [];
  
  const [year, month, day] = eventDate.split('-').map(Number);
  const [hour, minute] = startTime.split(':').map(Number);
  
  const eventDateTime = new Date(year, month - 1, day, hour, minute);
  const now = new Date();
  
  // 1 JOUR AVANT À 18H
  const oneDayBefore = new Date(eventDateTime);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  oneDayBefore.setHours(18, 0, 0, 0);
  
  if (oneDayBefore > now) {
    schedules.push({
      notification_type: '1_day_before',
      trigger_at: formatDateTimeForMySQL(oneDayBefore)
    });
  }
  
  // 1 HEURE AVANT
  const oneHourBefore = new Date(eventDateTime);
  oneHourBefore.setHours(oneHourBefore.getHours() - 1);
  
  if (oneHourBefore.getHours() < 7) {
    oneHourBefore.setHours(7, 0, 0, 0);
  }
  
  if (oneHourBefore > now) {
    schedules.push({
      notification_type: '1_hour_before',
      trigger_at: formatDateTimeForMySQL(oneHourBefore)
    });
  }
  
  // À L'HEURE
  if (eventDateTime > now) {
    schedules.push({
      notification_type: 'at_time',
      trigger_at: formatDateTimeForMySQL(eventDateTime)
    });
  }
  
  console.log('📅 Notifications calculées:', {
    eventDate,
    startTime,
    schedules: schedules.map(s => ({
      type: s.notification_type,
      trigger: s.trigger_at
    }))
  });
  
  return schedules as NotificationSchedule[];
}

/**
 * ✅ MODIFIÉ : UTILISER LA CONNEXION EXISTANTE
 */
export async function planifierNotificationsPourEvenement(
  connection: PoolConnection,  // ← Recevoir la connexion en paramètre
  eventId: number,
  eventDate: string,
  startTime: string,
  creatorSocieteId: number
): Promise<void> {
  
  try {
    const schedules = calculerMomentsNotifications(eventDate, startTime);
    
    for (const schedule of schedules) {
      await connection.query(
        `INSERT INTO event_notifications 
         (event_id, recipient_societe_id, notification_type, trigger_at)
         VALUES (?, ?, ?, ?)`,
        [
          eventId,
          creatorSocieteId,
          schedule.notification_type,
          schedule.trigger_at
        ]
      );
    }
    
    console.log(`✅ ${schedules.length} notifications planifiées pour l'événement ${eventId}`);
    
  } catch (error) {
    console.error('❌ Erreur planification notifications:', error);
    throw error;
  }
}

/**
 * ✅ MODIFIÉ : UTILISER LA CONNEXION EXISTANTE
 */
export async function supprimerNotificationsPendantes(
  connection: PoolConnection,
  eventId: number
): Promise<void> {
  
  try {
    await connection.query(
      `DELETE FROM event_notifications 
       WHERE event_id = ? AND sent_at IS NULL`,
      [eventId]
    );
    
    console.log(`🗑️ Notifications pendantes supprimées pour événement ${eventId}`);
    
  } catch (error) {
    console.error('❌ Erreur suppression notifications:', error);
    throw error;
  }
}

function formatDateTimeForMySQL(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}