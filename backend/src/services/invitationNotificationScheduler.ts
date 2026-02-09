import { PoolConnection } from 'mysql2/promise';

export async function planifierNotificationsInvites(
  conn: PoolConnection,
  eventId: number,
  email: string,
  eventDate: string,
  startTime: string
) {
  const start = new Date(`${eventDate} ${startTime}`);
  const minus1h = new Date(start.getTime() - 60 * 60 * 1000);

  await conn.query(`
    INSERT INTO event_invitation_notifications
    (event_id, recipient_email, notification_type, trigger_at)
    VALUES (?,?,?,?)
  `, [eventId, email, '1_hour_before', minus1h]);

  await conn.query(`
    INSERT INTO event_invitation_notifications
    (event_id, recipient_email, notification_type, trigger_at)
    VALUES (?,?,?,?)
  `, [eventId, email, 'at_time', start]);

  console.log("📅 rappels invités planifiés :", email);
}
