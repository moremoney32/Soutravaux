// import { PoolConnection } from 'mysql2/promise';

// export async function planifierNotificationsInvites(
//   conn: PoolConnection,
//   eventId: number,
//   email: string,
//   eventDate: string,
//   startTime: string
// ) {
//   const start = new Date(`${eventDate} ${startTime}`);
//   const minus1h = new Date(start.getTime() - 60 * 60 * 1000);

//   await conn.query(`
//     INSERT INTO event_invitation_notifications
//     (event_id, recipient_email, notification_type, trigger_at)
//     VALUES (?,?,?,?)
//   `, [eventId, email, '1_hour_before', minus1h]);

//   await conn.query(`
//     INSERT INTO event_invitation_notifications
//     (event_id, recipient_email, notification_type, trigger_at)
//     VALUES (?,?,?,?)
//   `, [eventId, email, 'at_time', start]);

//   console.log("📅 rappels invités planifiés :", email);
// }


// // ✅ NOUVELLE FONCTION : Rappels personnalisés pour invités

// interface Reminder {
//   value: string;
//   method: 'email' | 'notification';
// }

// export async function planifierNotificationsInvitesPersonnalisees(
//   connection: PoolConnection,
//   eventId: number,
//   recipientEmail: string,
//   eventDate: string,
//   startTime: string,
//   reminders: Reminder[] 
// ): Promise<void> {
  
//   try {
//     console.log(`🔔 Planification rappels invité: ${recipientEmail}`);
    
//     const [year, month, day] = eventDate.split('-').map(Number);
//     const [hour, minute] = startTime.split(':').map(Number);
    
//     const eventDateTime = new Date(year, month - 1, day, hour, minute);
//     const now = new Date();
    
//     for (const reminder of reminders) {
//       const minutesBefore = Number(reminder.value);
      
//       const triggerTime = new Date(eventDateTime);
//       triggerTime.setMinutes(triggerTime.getMinutes() - minutesBefore);
      
//       if (triggerTime > now) {
        
//         let notificationType = 'custom';
//         if (minutesBefore === 0) notificationType = 'at_time';
//         else if (minutesBefore === 60) notificationType = '1_hour_before';
//         else if (minutesBefore === 1440) notificationType = '1_day_before';
        
//         await connection.query(
//           `INSERT INTO event_invitation_notifications 
//            (event_id, recipient_email, notification_type, trigger_at)
//            VALUES (?, ?, ?, ?)`,
//           [
//             eventId,
//             recipientEmail,
//             notificationType,
//             triggerTime.toISOString().slice(0, 19).replace('T', ' ')
//           ]
//         );
        
//         console.log(`  ✓ Rappel invité: ${minutesBefore} min avant`);
//       }
//     }
    
//   } catch (error) {
//     console.error('❌ Erreur rappels invité:', error);
//     throw error;
//   }
// }



import { PoolConnection } from 'mysql2/promise';

interface Reminder {
  value: string;
  method: 'email' | 'notification';
}

function formatDateTimeForMySQL(date: Date): string {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const mins  = String(date.getMinutes()).padStart(2, '0');
  const secs  = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
}

/**
 * Déduire le notification_type depuis minutes_before
 */
function deduireNotificationType(minutesBefore: number): string {
  if (minutesBefore === 0)    return 'at_time';
  if (minutesBefore === 60)   return '1_hour_before';
  if (minutesBefore === 1440) return '1_day_before';
  return 'custom';
}

/**
 * Planification FIXE (utilisée au moment du UPDATE event)
 * 1h avant + à l'heure — sans rappels personnalisés
 */
export async function planifierNotificationsInvites(
  conn: PoolConnection,
  eventId: number,
  email: string,
  eventDate: string,
  startTime: string
): Promise<void> {

  const [year, month, day] = eventDate.split('-').map(Number);
  const [hour, minute]     = startTime.split(':').map(Number);
  const eventDateTime      = new Date(year, month - 1, day, hour, minute);
  const now                = new Date();

  const rappelsDefaut = [
    { minutesBefore: 60,  type: '1_hour_before' },
    { minutesBefore: 0,   type: 'at_time'       },
  ];

  for (const r of rappelsDefaut) {
    const triggerTime = new Date(eventDateTime);
    triggerTime.setMinutes(triggerTime.getMinutes() - r.minutesBefore);

    if (triggerTime > now) {
      await conn.query(`
        INSERT INTO event_invitation_notifications
          (event_id, recipient_email, notification_type, trigger_at, minutes_before)
        VALUES (?, ?, ?, ?, ?)
      `, [eventId, email, r.type, formatDateTimeForMySQL(triggerTime), r.minutesBefore]);
    }
  }

  console.log(`📅 Rappels fixes invité planifiés : ${email}`);
}

/**
 * Planification PERSONNALISÉE (utilisée au moment du CREATE event)
 * Reprend exactement les rappels choisis par l'utilisateur
 * + garantit toujours un rappel à l'heure exacte (minutes_before = 0)
 */
export async function planifierNotificationsInvitesPersonnalisees(
  connection: PoolConnection,
  eventId: number,
  recipientEmail: string,
  eventDate: string,
  startTime: string,
  reminders: Reminder[]
): Promise<void> {

  try {
    console.log(`🔔 Planification rappels personnalisés invité : ${recipientEmail}`);

    const [year, month, day] = eventDate.split('-').map(Number);
    const [hour, minute]     = startTime.split(':').map(Number);
    const eventDateTime      = new Date(year, month - 1, day, hour, minute);
    const now                = new Date();

    // ─── Insérer chaque rappel choisi par l'utilisateur ───────────────
    const minutesInseres = new Set<number>();

    for (const reminder of reminders) {
      const minutesBefore    = Number(reminder.value);
      const notificationType = deduireNotificationType(minutesBefore);

      const triggerTime = new Date(eventDateTime);
      triggerTime.setMinutes(triggerTime.getMinutes() - minutesBefore);

      if (triggerTime > now) {
        await connection.query(`
          INSERT INTO event_invitation_notifications
            (event_id, recipient_email, notification_type, trigger_at, minutes_before)
          VALUES (?, ?, ?, ?, ?)
        `, [
          eventId,
          recipientEmail,
          notificationType,
          formatDateTimeForMySQL(triggerTime),
          minutesBefore
        ]);

        minutesInseres.add(minutesBefore);
        console.log(`  ✓ Rappel invité : ${minutesBefore} min avant (${notificationType})`);

      } else {
        console.log(`  ⏭️ Rappel ${minutesBefore} min avant ignoré (déjà passé)`);
      }
    }

    // ─── Garantir un rappel AT_TIME (0 min) s'il n'est pas déjà inclus ─
    if (!minutesInseres.has(0) && eventDateTime > now) {
      await connection.query(`
        INSERT INTO event_invitation_notifications
          (event_id, recipient_email, notification_type, trigger_at, minutes_before)
        VALUES (?, ?, 'at_time', ?, 0)
      `, [eventId, recipientEmail, formatDateTimeForMySQL(eventDateTime)]);

      console.log(`  ✓ Rappel at_time ajouté automatiquement pour l'invité`);
    }

    console.log(`✅ ${reminders.length} rappel(s) configuré(s) pour invité ${recipientEmail}`);

  } catch (error) {
    console.error('❌ Erreur rappels invité personnalisés :', error);
    throw error;
  }
}
