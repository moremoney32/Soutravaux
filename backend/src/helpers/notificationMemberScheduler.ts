// helpers/notificationMemberScheduler.ts
import { PoolConnection } from 'mysql2/promise';

interface NotificationSchedule {
  notification_type: '1_day_before' | '1_hour_before' | 'at_time';
  trigger_at: string;
}

interface Reminder {
  value: string;
  method: 'email' | 'notification';
}

/**
 * Calculer moments notifications
 */
function calculerMomentsNotifications(
  eventDate: string,
  startTime: string
): NotificationSchedule[] {
  
  const schedules: NotificationSchedule[] = [];
  
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
  
  return schedules;
}

/**
 * ✅ NOUVEAU : Planifier notifications pour un MEMBRE
 */
export async function planifierNotificationsPourMembre(
  connection: PoolConnection,
  eventId: number,
  eventDate: string,
  startTime: string,
  membreId: number
): Promise<void> {
  
  try {
    const schedules = calculerMomentsNotifications(eventDate, startTime);
    
    for (const schedule of schedules) {
      await connection.query(
        `INSERT INTO event_notifications 
         (event_id, recipient_membre_id, notification_type, trigger_at)
         VALUES (?, ?, ?, ?)`,
        [
          eventId,
          membreId,
          schedule.notification_type,
          schedule.trigger_at
        ]
      );
    }
    
    console.log(`✅ ${schedules.length} notifications planifiées pour membre ${membreId}`);
    
  } catch (error) {
    console.error('❌ Erreur planification notifications membre:', error);
    throw error;
  }
}

/**
 * Supprimer notifications pendantes pour un membre
 */
export async function supprimerNotificationsPendantesMembre(
  connection: PoolConnection,
  eventId: number,
  membreId: number
): Promise<void> {
  
  try {
    await connection.query(
      `DELETE FROM event_notifications 
       WHERE event_id = ? 
       AND recipient_membre_id = ?
       AND sent_at IS NULL`,
      [eventId, membreId]
    );
    
    console.log(`🗑️ Notifications pendantes supprimées pour membre ${membreId}, event ${eventId}`);
    
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

// ✅ NOUVELLE FONCTION : Rappels personnalisés pour le membre créateur

export async function planifierNotificationsPersonnalisees(
  connection: PoolConnection,
  eventId: number,
  eventDate: string,
  startTime: string,
  membreId: number,
  reminders: Reminder[]
): Promise<void> {
  
  try {
    console.log(`🔔 Planification rappels personnalisés pour membre ${membreId}`);
    
    const [year, month, day] = eventDate.split('-').map(Number);
    const [hour, minute] = startTime.split(':').map(Number);
    
    const eventDateTime = new Date(year, month - 1, day, hour, minute);
    const now = new Date();
    
    for (const reminder of reminders) {
      const minutesBefore = Number(reminder.value);
      
      // Calculer l'heure du rappel
      const triggerTime = new Date(eventDateTime);
      triggerTime.setMinutes(triggerTime.getMinutes() - minutesBefore);
      
      // Si le rappel est dans le futur
      if (triggerTime > now) {
        
        let notificationType = 'custom';
        if (minutesBefore === 0) notificationType = 'at_time';
        else if (minutesBefore === 60) notificationType = '1_hour_before';
        else if (minutesBefore === 1440) notificationType = '1_day_before';
        
        await connection.query(
          `INSERT INTO event_notifications 
           (event_id, recipient_membre_id, notification_type, trigger_at, minutes_before)
           VALUES (?, ?, ?, ?, ?)`,
          [
            eventId,
            membreId,
            notificationType,
            formatDateTimeForMySQL(triggerTime),
            minutesBefore  // ✅ LA LIGNE QUI MANQUAIT
          ]
        );
        
        console.log(`  ✓ Rappel: ${minutesBefore} min avant (${notificationType})`);
      } else {
        console.log(`  ⏭️ Rappel ${minutesBefore} min avant ignoré (passé)`);
      }
    }

    const hasAtTime = reminders.some(r => Number(r.value) === 0);

if (!hasAtTime && eventDateTime > now) {
  await connection.query(
    `INSERT INTO event_notifications 
     (event_id, recipient_membre_id, notification_type, trigger_at, minutes_before)
     VALUES (?, ?, 'at_time', ?, 0)`,
    [eventId, membreId, formatDateTimeForMySQL(eventDateTime)]
  );
  console.log(`  ✓ Rappel at_time ajouté automatiquement pour le créateur`);
}
    
    console.log(`✅ ${reminders.length} rappel(s) configuré(s)`);
    
  } catch (error) {
    console.error('❌ Erreur planification rappels personnalisés:', error);
    throw error;
  }
}