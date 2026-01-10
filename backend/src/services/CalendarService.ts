

// import pool from '../config/db';
// import { RowDataPacket } from 'mysql2';
// import { planifierNotificationsPourEvenement, supprimerNotificationsPendantes } from './notificationsSheduler';

// export interface CalendarEvent {
//   id: number;
//   societe_id: number;
//   title: string;
//   description?: string;
//   event_date: string;
//   start_time: string;
//   end_time: string;
//   location?: string;
//   color: string;
//   status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
//   event_type: 'task' | 'work' | 'meeting';  // ← AJOUTÉ
//   created_at: string;
//   updated_at: string;
//   societe_name?: string;
//   attendees?: EventAttendee[];
// }

// export interface EventAttendee {
//   id: number;
//   event_id: number;
//   societe_id: number;
//   societe_name: string;
//   contact_email?: string;
//   contact_phone?: string;
//   invite_method: 'email' | 'sms' | 'push' | 'contact';
//   status: 'pending' | 'accepted' | 'declined';
//   notified_at?: string;
//   responded_at?: string;
// }

// export interface CreateEventInput {
//   societe_id: number;
//   title: string;
//   description?: string;
//   event_date: string;
//   start_time: string;
//   end_time: string;
//   location?: string;
//   color?: string;
//   status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
//   event_type?: 'task' | 'work' | 'meeting';  // ← AJOUTÉ
//   attendee_societe_ids?: number[];
//   invite_method?: 'email' | 'sms' | 'push' | 'contact';
// }

// /**
//  * ✅ RÉCUPÉRER ÉVÉNEMENTS AVEC event_type
//  */
// export async function getEvents(
//   societeId: number,
//   startDate: string,
//   endDate: string
// ): Promise<CalendarEvent[]> {
//   const conn = await pool.getConnection();

//   try {
//     const [rows] = await conn.query<RowDataPacket[]>(
//       `SELECT DISTINCT
//         ce.id,
//         ce.societe_id,
//         ce.title,
//         ce.description,
//         ce.event_date,
//         ce.start_time,
//         ce.end_time,
//         ce.location,
//         ce.color,
//         ce.status,
//         ce.event_type,
//         ce.created_at,
//         ce.updated_at,
//         s.nomsociete as societe_name
//       FROM calendar_events ce
//       LEFT JOIN societes s ON ce.societe_id = s.id
//       WHERE ce.event_date BETWEEN ? AND ?
//         AND (
//           ce.societe_id = ?
//           OR EXISTS (
//             SELECT 1 FROM event_attendees ea 
//             WHERE ea.event_id = ce.id 
//               AND ea.societe_id = ?
//           )
//         )
//       ORDER BY ce.event_date, ce.start_time`,
//       [startDate, endDate, societeId, societeId]
//     );

//     const events = rows as CalendarEvent[];
    
//     for (const event of events) {
//       try {
//         event.attendees = await getEventAttendees(event.id);
//       } catch (error) {
//         console.warn(`Impossible de charger attendees pour event ${event.id}:`, error);
//         event.attendees = [];
//       }
//     }

//     return events;
//   } catch (error: any) {
//     console.error('Erreur getEvents:', error);
//     throw new Error("Erreur récupération événements");
//   } finally {
//     conn.release();
//   }
// }



// // export async function createEvent(data: CreateEventInput): Promise<number> {
// //     const conn = await pool.getConnection();
  
// //     try {
// //       await conn.beginTransaction();
  
// //       // ✅ NETTOYER LA DATE (enlever timestamp si présent)
// //       const eventDate = data.event_date.includes('T') 
// //         ? data.event_date.split('T')[0] 
// //         : data.event_date;
  
// //       console.log('📅 DEBUG Création événement:', {
// //         date_reçue_brute: data.event_date,
// //         date_nettoyée: eventDate,
// //         type_date: typeof data.event_date,
// //         start_time: data.start_time,
// //         event_type: data.event_type
// //       });
  
// //       const [result] = await conn.query<any>(
// //         `INSERT INTO calendar_events 
// //          (societe_id, title, description, event_date, start_time, end_time, location, color, status, event_type)
// //          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
// //         [
// //           data.societe_id,
// //           data.title,
// //           data.description || null,
// //           eventDate,  // ✅ Date propre : "2026-01-08"
// //           data.start_time,
// //           data.end_time,
// //           data.location || null,
// //           data.color || '#E77131',
// //           data.event_type || 'task'
// //         ]
// //       );
  
// //       const eventId = result.insertId;
  
// //       if (data.attendee_societe_ids && data.attendee_societe_ids.length > 0) {
// //         const inviteMethod = data.invite_method || 'push';
        
// //         for (const attendeeSocieteId of data.attendee_societe_ids) {
// //           await conn.query(
// //             `INSERT INTO event_attendees (event_id, societe_id, invite_method, notified_at)
// //              VALUES (?, ?, ?, NOW())`,
// //             [eventId, attendeeSocieteId, inviteMethod]
// //           );
// //         }
// //       }
  
// //       await conn.commit();
// //       console.log(`✅ Événement ${eventId} créé le ${eventDate} à ${data.start_time}`);
// //       return eventId;
// //     } catch (error: any) {
// //       await conn.rollback();
// //       console.error('❌ Erreur createEvent:', error);
// //       throw new Error("Erreur création événement");
// //     } finally {
// //       conn.release();
// //     }
// //   }

// export async function createEvent(data: CreateEventInput): Promise<number> {
//     const conn = await pool.getConnection();
  
//     try {
//       await conn.beginTransaction();
  
//       const eventDate = data.event_date.includes('T') 
//         ? data.event_date.split('T')[0] 
//         : data.event_date;
  
//       console.log('📅 DEBUG Création événement:', {
//         date_reçue_brute: data.event_date,
//         date_nettoyée: eventDate,
//         type_date: typeof data.event_date,
//         start_time: data.start_time,
//         event_type: data.event_type
//       });
  
//       const [result] = await conn.query<any>(
//         `INSERT INTO calendar_events 
//          (societe_id, title, description, event_date, start_time, end_time, location, color, status, event_type)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
//         [
//           data.societe_id,
//           data.title,
//           data.description || null,
//           eventDate,
//           data.start_time,
//           data.end_time,
//           data.location || null,
//           data.color || '#E77131',
//           data.event_type || 'task'
//         ]
//       );
  
//       const eventId = result.insertId;
  
//       // ✅ PASSER LA CONNEXION EN PARAMÈTRE
//       await planifierNotificationsPourEvenement(
//         conn,  // ← Connexion existante
//         eventId,
//         eventDate,
//         data.start_time,
//         data.societe_id
//       );
  
//       // Gérer les invités
//       if (data.attendee_societe_ids && data.attendee_societe_ids.length > 0) {
//         const inviteMethod = data.invite_method || 'push';
        
//         for (const attendeeSocieteId of data.attendee_societe_ids) {
//           await conn.query(
//             `INSERT INTO event_attendees (event_id, societe_id, invite_method, notified_at)
//              VALUES (?, ?, ?, NOW())`,
//             [eventId, attendeeSocieteId, inviteMethod]
//           );
          
//           // Notifications pour les invités
//           await planifierNotificationsPourEvenement(
//             conn,  // ← Même connexion
//             eventId,
//             eventDate,
//             data.start_time,
//             attendeeSocieteId
//           );
//         }
//       }
  
//       await conn.commit();
//       console.log(`✅ Événement ${eventId} créé avec notifications planifiées`);
//       return eventId;
      
//     } catch (error: any) {
//       await conn.rollback();
//       console.error('❌ Erreur createEvent:', error);
//       throw new Error("Erreur création événement");
//     } finally {
//       conn.release();
//     }
//   }


// /**
//  * ✅ MODIFIER ÉVÉNEMENT
//  */
// export async function updateEvent(
//   eventId: number,
//   data: Partial<CreateEventInput>,
//   societeId: number
// ): Promise<void> {
//   const conn = await pool.getConnection();

//   try {
//     await conn.beginTransaction();
    
//     const [rows] = await conn.query<RowDataPacket[]>(
//       `SELECT id FROM calendar_events WHERE id = ? AND societe_id = ?`,
//       [eventId, societeId]
//     );

//     if (rows.length === 0) {
//       throw new Error("Événement introuvable ou accès refusé");
//     }

//     const updates: string[] = [];
//     const params: any[] = [];

//     if (data.title) {
//       updates.push('title = ?');
//       params.push(data.title);
//     }
//     if (data.description !== undefined) {
//       updates.push('description = ?');
//       params.push(data.description);
//     }
//     if (data.event_date) {
//       updates.push('event_date = ?');
//       params.push(data.event_date);
//     }
//     if (data.start_time) {
//       updates.push('start_time = ?');
//       params.push(data.start_time);
//     }
//     if (data.end_time) {
//       updates.push('end_time = ?');
//       params.push(data.end_time);
//     }
//     if (data.location !== undefined) {
//       updates.push('location = ?');
//       params.push(data.location);
//     }
//     if (data.color) {
//       updates.push('color = ?');
//       params.push(data.color);
//     }
//     if (data.event_type) {
//       updates.push('event_type = ?');
//       params.push(data.event_type);
//     }

//     if (updates.length > 0) {
//       params.push(eventId);
//       await conn.query(
//         `UPDATE calendar_events SET ${updates.join(', ')} WHERE id = ?`,
//         params
//       );
//     }

//     // Si date/heure modifiée, replanifier
//     if (data.event_date || data.start_time) {
//       const [eventRows] = await conn.query<RowDataPacket[]>(
//         `SELECT event_date, start_time, societe_id FROM calendar_events WHERE id = ?`,
//         [eventId]
//       );
      
//       if (eventRows.length > 0) {
//         const event = eventRows[0];
        
//         // ✅ PASSER LA CONNEXION
//         await supprimerNotificationsPendantes(conn, eventId);
//         await planifierNotificationsPourEvenement(
//           conn,
//           eventId,
//           event.event_date,
//           event.start_time,
//           event.societe_id
//         );
        
//         console.log(`✅ Notifications replanifiées pour événement ${eventId}`);
//       }
//     }
    
//     await conn.commit();
    
//   } catch (error: any) {
//     await conn.rollback();
//     console.error('❌ Erreur updateEvent:', error);
//     throw error;
//   } finally {
//     conn.release();
//   }
// }



// /**
//  * SUPPRIMER ÉVÉNEMENT (pas de modification nécessaire)
//  * Les notifications seront supprimées automatiquement grâce à ON DELETE CASCADE
//  */
// export async function deleteEvent(eventId: number, societeId: number): Promise<void> {
//     const conn = await pool.getConnection();
//     try {
//       const [result] = await conn.query<any>(
//         `DELETE FROM calendar_events WHERE id = ? AND societe_id = ?`,
//         [eventId, societeId]
//       );
      
//       if (result.affectedRows === 0) {
//         throw new Error("Événement introuvable ou accès refusé");
//       }
      
//       console.log(`✅ Événement ${eventId} supprimé (notifications auto-supprimées)`);
      
//     } catch (error: any) {
//       console.error('Erreur deleteEvent:', error);
//       throw error;
//     } finally {
//       conn.release();
//     }
//   }
  

// export async function getEventAttendees(eventId: number): Promise<EventAttendee[]> {
//   const conn = await pool.getConnection();
//   try {
//     const [rows] = await conn.query<RowDataPacket[]>(
//       `SELECT 
//         ea.id,
//         ea.event_id,
//         ea.societe_id,
//         ea.invite_method,
//         ea.status,
//         ea.notified_at,
//         ea.responded_at,
//         COALESCE(s.nomsociete, 'Société inconnue') as societe_name,
//         s.email as contact_email,
//         s.telephone as contact_phone
//       FROM event_attendees ea
//       LEFT JOIN societes s ON ea.societe_id = s.id
//       WHERE ea.event_id = ?
//       ORDER BY ea.created_at`,
//       [eventId]
//     );
//     return rows as EventAttendee[];
//   } catch (error: any) {
//     console.error('Erreur getEventAttendees:', error);
//     return [];
//   } finally {
//     conn.release();
//   }
// }

// export async function inviteAttendees(
//   eventId: number,
//   societeIds: number[],
//   inviteMethod: 'email' | 'sms' | 'push' | 'contact'
// ): Promise<void> {
//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();
//     for (const societeId of societeIds) {
//       const [existing] = await conn.query<RowDataPacket[]>(
//         `SELECT id FROM event_attendees WHERE event_id = ? AND societe_id = ?`,
//         [eventId, societeId]
//       );
//       if (existing.length === 0) {
//         await conn.query(
//           `INSERT INTO event_attendees (event_id, societe_id, invite_method, notified_at)
//            VALUES (?, ?, ?, NOW())`,
//           [eventId, societeId, inviteMethod]
//         );
//       }
//     }
//     await conn.commit();
//   } catch (error: any) {
//     await conn.rollback();
//     console.error('Erreur inviteAttendees:', error);
//     throw new Error("Erreur invitation sociétés");
//   } finally {
//     conn.release();
//   }
// }

// export async function respondToInvite(
//   eventId: number,
//   societeId: number,
//   status: 'accepted' | 'declined'
// ): Promise<void> {
//   const conn = await pool.getConnection();
//   try {
//     await conn.query(
//       `UPDATE event_attendees 
//        SET status = ?, responded_at = NOW()
//        WHERE event_id = ? AND societe_id = ?`,
//       [status, eventId, societeId]
//     );
//   } catch (error: any) {
//     console.error('Erreur respondToInvite:', error);
//     throw new Error("Erreur réponse invitation");
//   } finally {
//     conn.release();
//   }
// }

// export async function getAvailableSocietes(excludeSocieteId?: number): Promise<any[]> {
//   const conn = await pool.getConnection();
//   try {
//     let query = `
//       SELECT 
//         id,
//         nomsociete as name,
//         email,
//         telephone as phone
//       FROM societes
//       WHERE 1=1
//     `;
//     const params: any[] = [];
//     if (excludeSocieteId) {
//       query += ` AND id != ?`;
//       params.push(excludeSocieteId);
//     }
//     query += ` ORDER BY nomsociete`;
//     const [rows] = await conn.query<RowDataPacket[]>(query, params);
//     return rows;
//   } catch (error: any) {
//     console.error('Erreur getAvailableSocietes:', error);
//     return [];
//   } finally {
//     conn.release();
//   }
// }




// services/CalendarService.ts (Modifications partielles)
import pool from '../config/db';

import { CalendarEvent, CreateEventInput, EventAttendee } from '../types/calendar';
import { RowDataPacket } from 'mysql2';
// import { getCategoryById } from './CategoryService';
import { planifierNotificationsPourEvenement, supprimerNotificationsPendantes } from './notificationsSheduler';

// ✅ MODIFIER getEvents pour inclure category
export async function getEvents(
  societeId: number,
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const conn = await pool.getConnection();

  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT DISTINCT
        ce.id,
        ce.societe_id,
        ce.title,
        ce.description,
        ce.event_date,
        ce.start_time,
        ce.end_time,
        ce.location,
        ce.color,
        ce.status,
        ce.event_type,
        ce.scope,
        ce.event_category_id,
        ce.custom_category_label,
        ce.created_at,
        ce.updated_at,
        s.nomsociete as societe_name,
        ec.label as category_label,
        ec.icon as category_icon,
        ec.color as category_color,
        ec.is_predefined as category_is_predefined,
        ec.requires_location as category_requires_location,
        ec.created_by_societe_id as category_created_by_societe_id,
        ec.created_at as category_created_at,
        ec.updated_at as category_updated_at
      FROM calendar_events ce
      LEFT JOIN societes s ON ce.societe_id = s.id
      LEFT JOIN event_categories ec ON ce.event_category_id = ec.id
      WHERE ce.event_date BETWEEN ? AND ?
        AND (
          ce.societe_id = ?
          OR EXISTS (
            SELECT 1 FROM event_attendees ea 
            WHERE ea.event_id = ce.id 
              AND ea.societe_id = ?
          )
        )
      ORDER BY ce.event_date, ce.start_time`,
      [startDate, endDate, societeId, societeId]
    );

    const events = rows.map(row => {
      const event = { ...row } as CalendarEvent;
      
      // Ajouter category si présente
      if (row.category_label) {
        event.category = {
          id: row.event_category_id,
          label: row.category_label,
          icon: row.category_icon,
          color: row.category_color,
          is_predefined: !!row.category_is_predefined,
          requires_location: !!row.category_requires_location,
          created_by_societe_id: row.category_created_by_societe_id || undefined,
          created_at: row.category_created_at || '',
          updated_at: row.category_updated_at || ''
        };
      }
      
      return event;
    });
    
    // Charger attendees
    for (const event of events) {
      event.attendees = await getEventAttendees(event.id);
    }

    return events;
    
  } catch (error: any) {
    console.error('Erreur getEvents:', error);
    throw new Error("Erreur récupération événements");
  } finally {
    conn.release();
  }
}

// ✅ MODIFIER createEvent pour gérer category
export async function createEvent(data: CreateEventInput): Promise<number> {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const eventDate = data.event_date.includes('T') 
      ? data.event_date.split('T')[0] 
      : data.event_date;

    const [result] = await conn.query<any>(
      `INSERT INTO calendar_events 
       (societe_id, title, description, event_date, start_time, end_time, 
        location, color, status, event_type, scope, event_category_id, custom_category_label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [
        data.societe_id,
        data.title,
        data.description || null,
        eventDate,
        data.start_time,
        data.end_time,
        data.location || null,
        data.color || '#E77131',
        data.event_type || 'task',  // ✅ Gardé pour compatibilité
        data.scope,
        data.event_category_id || null,
        data.custom_category_label || null
      ]
    );

    const eventId = result.insertId;

    // Planifier notifications
    await planifierNotificationsPourEvenement(
      conn,
      eventId,
      eventDate,
      data.start_time,
      data.societe_id
    );

    // Gérer invitations (si scope = collaborative)
    if (data.scope === 'collaborative' && data.attendee_societe_ids && data.attendee_societe_ids.length > 0) {
      const inviteMethod = data.invite_method || 'email';
      for (const attendeeSocieteId of data.attendee_societe_ids) {
        await conn.query(
          `INSERT INTO event_attendees (event_id, societe_id, invite_method, notified_at)
           VALUES (?, ?, ?, NOW())`,
          [eventId, attendeeSocieteId, inviteMethod]
        );
        
        // Notifications pour invités
        await planifierNotificationsPourEvenement(
          conn,
          eventId,
          eventDate,
          data.start_time,
          attendeeSocieteId
        );
      }
    }

    await conn.commit();
    console.log(`✅ Événement ${eventId} créé avec catégorie`);
    return eventId;
    
  } catch (error: any) {
    await conn.rollback();
    console.error('❌ Erreur createEvent:', error);
    throw new Error("Erreur création événement");
  } finally {
    conn.release();
  }
}

// ✅ MODIFIER updateEvent pour gérer category
export async function updateEvent(
  eventId: number,
  data: Partial<CreateEventInput>,
  societeId: number
): Promise<void> {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT id FROM calendar_events WHERE id = ? AND societe_id = ?`,
      [eventId, societeId]
    );

    if (rows.length === 0) {
      throw new Error("Événement introuvable ou accès refusé");
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.title) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.event_date) {
      updates.push('event_date = ?');
      params.push(data.event_date);
    }
    if (data.start_time) {
      updates.push('start_time = ?');
      params.push(data.start_time);
    }
    if (data.end_time) {
      updates.push('end_time = ?');
      params.push(data.end_time);
    }
    if (data.location !== undefined) {
      updates.push('location = ?');
      params.push(data.location);
    }
    if (data.color) {
      updates.push('color = ?');
      params.push(data.color);
    }
    if (data.scope) {
      updates.push('scope = ?');
      params.push(data.scope);
    }
    if (data.event_category_id !== undefined) {
      updates.push('event_category_id = ?');
      params.push(data.event_category_id);
    }
    if (data.custom_category_label !== undefined) {
      updates.push('custom_category_label = ?');
      params.push(data.custom_category_label);
    }

    if (updates.length > 0) {
      params.push(eventId);
      await conn.query(
        `UPDATE calendar_events SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    // Replanifier notifications si date/heure modifiée
    if (data.event_date || data.start_time) {
      const [eventRows] = await conn.query<RowDataPacket[]>(
        `SELECT event_date, start_time, societe_id FROM calendar_events WHERE id = ?`,
        [eventId]
      );
      
      if (eventRows.length > 0) {
        const event = eventRows[0];
        await supprimerNotificationsPendantes(conn, eventId);
        await planifierNotificationsPourEvenement(
          conn,
          eventId,
          event.event_date,
          event.start_time,
          event.societe_id
        );
      }
    }
    
    await conn.commit();
    
  } catch (error: any) {
    await conn.rollback();
    console.error('❌ Erreur updateEvent:', error);
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * SUPPRIMER ÉVÉNEMENT (pas de modification nécessaire)
 * Les notifications seront supprimées automatiquement grâce à ON DELETE CASCADE
 */
export async function deleteEvent(eventId: number, societeId: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query<any>(
        `DELETE FROM calendar_events WHERE id = ? AND societe_id = ?`,
        [eventId, societeId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error("Événement introuvable ou accès refusé");
      }
      
      console.log(`✅ Événement ${eventId} supprimé (notifications auto-supprimées)`);
      
    } catch (error: any) {
      console.error('Erreur deleteEvent:', error);
      throw error;
    } finally {
      conn.release();
    }
  }
  

export async function getEventAttendees(eventId: number): Promise<EventAttendee[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT 
        ea.id,
        ea.event_id,
        ea.societe_id,
        ea.invite_method,
        ea.status,
        ea.notified_at,
        ea.responded_at,
        COALESCE(s.nomsociete, 'Société inconnue') as societe_name,
        s.email as contact_email,
        s.telephone as contact_phone
      FROM event_attendees ea
      LEFT JOIN societes s ON ea.societe_id = s.id
      WHERE ea.event_id = ?
      ORDER BY ea.created_at`,
      [eventId]
    );
    return rows as EventAttendee[];
  } catch (error: any) {
    console.error('Erreur getEventAttendees:', error);
    return [];
  } finally {
    conn.release();
  }
}

export async function inviteAttendees(
  eventId: number,
  societeIds: number[],
  inviteMethod: 'email' | 'sms' | 'push' | 'contact'
): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const societeId of societeIds) {
      const [existing] = await conn.query<RowDataPacket[]>(
        `SELECT id FROM event_attendees WHERE event_id = ? AND societe_id = ?`,
        [eventId, societeId]
      );
      if (existing.length === 0) {
        await conn.query(
          `INSERT INTO event_attendees (event_id, societe_id, invite_method, notified_at)
           VALUES (?, ?, ?, NOW())`,
          [eventId, societeId, inviteMethod]
        );
      }
    }
    await conn.commit();
  } catch (error: any) {
    await conn.rollback();
    console.error('Erreur inviteAttendees:', error);
    throw new Error("Erreur invitation sociétés");
  } finally {
    conn.release();
  }
}

export async function respondToInvite(
  eventId: number,
  societeId: number,
  status: 'accepted' | 'declined'
): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `UPDATE event_attendees 
       SET status = ?, responded_at = NOW()
       WHERE event_id = ? AND societe_id = ?`,
      [status, eventId, societeId]
    );
  } catch (error: any) {
    console.error('Erreur respondToInvite:', error);
    throw new Error("Erreur réponse invitation");
  } finally {
    conn.release();
  }
}

export async function getAvailableSocietes(excludeSocieteId?: number): Promise<any[]> {
  const conn = await pool.getConnection();
  try {
    let query = `
      SELECT 
        id,
        nomsociete as name,
        email,
        telephone as phone
      FROM societes
      WHERE 1=1
    `;
    const params: any[] = [];
    if (excludeSocieteId) {
      query += ` AND id != ?`;
      params.push(excludeSocieteId);
    }
    query += ` ORDER BY nomsociete`;
    const [rows] = await conn.query<RowDataPacket[]>(query, params);
    return rows;
  } catch (error: any) {
    console.error('Erreur getAvailableSocietes:', error);
    return [];
  } finally {
    conn.release();
  }
}

