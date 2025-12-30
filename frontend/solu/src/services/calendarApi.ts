// // services/calendarApi.ts

// const API_BASE_URL = 'http://localhost:3000/api';

// export interface CalendarEventAPI {
//   id: number;
//   societe_id: number;
//   creator_id: number;
//   title: string;
//   description?: string;
//   event_date: string;
//   start_time: string;
//   end_time: string;
//   location?: string;
//   color: string;
//   status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
//   created_at: string;
//   updated_at: string;
//   creator_name?: string;
//   attendees?: any[];
// }

// export interface CreateEventInput {
//   societe_id: number;
//   creator_id: number;
//   title: string;
//   description?: string;
//   event_date: string; // YYYY-MM-DD
//   start_time: string; // HH:MM
//   end_time: string;   // HH:MM
//   location?: string;
//   color?: string;
//   attendee_ids?: number[];
//   invite_methods?: ('email' | 'sms' | 'push' | 'contact')[];
// }

// /**
//  * Récupérer événements d'une période
//  */
// export async function fetchEvents(
//   societeId: number,
//   startDate: string,
//   endDate: string,
//   membreId?: number
// ): Promise<CalendarEventAPI[]> {
//   const params = new URLSearchParams({
//     societe_id: String(societeId),
//     start_date: startDate,
//     end_date: endDate
//   });

//   if (membreId) {
//     params.append('membre_id', String(membreId));
//   }

//   const response = await fetch(`${API_BASE_URL}/calendar/events?${params}`);
//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur récupération événements');
//   }

//   return result.data;
// }

// /**
//  * Créer un événement
//  */
// export async function createCalendarEvent(data: CreateEventInput): Promise<number> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data)
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur création événement');
//   }

//   return result.data.id;
// }

// /**
//  * Modifier un événement
//  */
// export async function updateCalendarEvent(
//   eventId: number,
//   userId: number,
//   data: Partial<CreateEventInput>
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ ...data, user_id: userId })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur modification événement');
//   }
// }

// /**
//  * Supprimer un événement
//  */
// export async function deleteCalendarEvent(eventId: number, userId: number): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ user_id: userId })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur suppression événement');
//   }
// }

// /**
//  * Inviter des artisans à un événement
//  */
// export async function inviteArtisans(
//   eventId: number,
//   attendeeIds: number[],
//   inviteMethod: 'email' | 'sms' | 'push' | 'contact'
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/invite`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       attendee_ids: attendeeIds,
//       invite_method: inviteMethod
//     })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur envoi invitations');
//   }
// }

// /**
//  * Répondre à une invitation
//  */
// export async function respondToInvitation(
//   eventId: number,
//   membreId: number,
//   status: 'accepted' | 'declined'
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/respond`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       membre_id: membreId,
//       status
//     })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur réponse invitation');
//   }
// }

// /**
//  * Convertir CalendarEventAPI → CalendarEvent (frontend)
//  */
// export function convertAPIEventToFrontend(apiEvent: CalendarEventAPI): any {
//   const startDate = new Date(`${apiEvent.event_date}T${apiEvent.start_time}`);
//   const endDate = new Date(`${apiEvent.event_date}T${apiEvent.end_time}`);

//   return {
//     id: String(apiEvent.id),
//     title: apiEvent.title,
//     description: apiEvent.description,
//     startTime: startDate,
//     endTime: endDate,
//     color: apiEvent.color,
//     calendar: 'personal',
//     attendees: apiEvent.attendees?.map(a => a.membre_name) || [],
//     status: apiEvent.status,
//     isPast: endDate < new Date() // IMPORTANT: Détecte événements passés
//   };
// }

// /**
//  * Convertir CalendarEvent (frontend) → CreateEventInput (API)
//  */
// export function convertFrontendEventToAPI(
//   event: any,
//   societeId: number,
//   creatorId: number
// ): CreateEventInput {
//   const eventDate = event.startTime.toISOString().split('T')[0];
//   const startTime = event.startTime.toTimeString().slice(0, 5);
//   const endTime = event.endTime.toTimeString().slice(0, 5);

//   return {
//     societe_id: societeId,
//     creator_id: creatorId,
//     title: event.title,
//     description: event.description,
//     event_date: eventDate,
//     start_time: startTime,
//     end_time: endTime,
//     color: event.color || '#E77131'
//   };
// }





// services/calendarApi.ts - VERSION CORRIGÉE

// const API_BASE_URL = 'http://localhost:3000/api';

// export interface CalendarEventAPI {
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
//   created_at: string;
//   updated_at: string;
//   societe_name?: string;
//   attendees?: any[];
// }

// export interface CreateEventInput {
//   societe_id: number;
//   title: string;
//   description?: string;
//   event_date: string; // YYYY-MM-DD
//   start_time: string; // HH:MM
//   end_time: string;   // HH:MM
//   location?: string;
//   color?: string;
//   attendee_societe_ids?: number[];  // ← CORRIGÉ
//   invite_method?: 'email' | 'sms' | 'push' | 'contact';
// }

// /**
//  * Récupérer événements d'une période
//  */
// export async function fetchEvents(
//   societeId: number,
//   startDate: string,
//   endDate: string
// ): Promise<CalendarEventAPI[]> {
//   const params = new URLSearchParams({
//     societe_id: String(societeId),
//     start_date: startDate,
//     end_date: endDate
//   });

//   const response = await fetch(`${API_BASE_URL}/calendar/events?${params}`);
//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur récupération événements');
//   }

//   return result.data;
// }

// /**
//  * Créer un événement
//  */
// export async function createCalendarEvent(data: CreateEventInput): Promise<number> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data)
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur création événement');
//   }

//   return result.data.id;
// }

// /**
//  * Modifier un événement
//  */
// export async function updateCalendarEvent(
//   eventId: number,
//   societeId: number,  // ← CORRIGÉ
//   data: Partial<CreateEventInput>
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ ...data, societe_id: societeId })  // ← CORRIGÉ
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur modification événement');
//   }
// }

// /**
//  * Supprimer un événement
//  */
// export async function deleteCalendarEvent(eventId: number, societeId: number): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ societe_id: societeId })  // ← CORRIGÉ
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur suppression événement');
//   }
// }

// /**
//  * Inviter des sociétés à un événement
//  */
// export async function inviteArtisans(
//   eventId: number,
//   societeIds: number[],  // ← CORRIGÉ (societes, pas artisans)
//   inviteMethod: 'email' | 'sms' | 'push' | 'contact'
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/invite`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       societe_ids: societeIds,  // ← CORRIGÉ
//       invite_method: inviteMethod
//     })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur envoi invitations');
//   }
// }

// /**
//  * Répondre à une invitation
//  */
// export async function respondToInvitation(
//   eventId: number,
//   societeId: number,  // ← CORRIGÉ
//   status: 'accepted' | 'declined'
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/respond`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       societe_id: societeId,  // ← CORRIGÉ
//       status
//     })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur réponse invitation');
//   }
// }

// /**
//  * Convertir CalendarEventAPI → CalendarEvent (frontend)
//  */
// export function convertAPIEventToFrontend(apiEvent: CalendarEventAPI): any {
//   const startDate = new Date(`${apiEvent.event_date}T${apiEvent.start_time}`);
//   const endDate = new Date(`${apiEvent.event_date}T${apiEvent.end_time}`);

//   return {
//     id: String(apiEvent.id),
//     title: apiEvent.title,
//     description: apiEvent.description,
//     startTime: startDate,
//     endTime: endDate,
//     color: apiEvent.color,
//     calendar: 'personal',
//     attendees: apiEvent.attendees?.map(a => a.societe_name) || [],
//     status: apiEvent.status,
//     isPast: endDate < new Date() // Détecte événements passés
//   };
// }

// /**
//  * Convertir CalendarEvent (frontend) → CreateEventInput (API)
//  */
// export function convertFrontendEventToAPI(
//   event: any,
//   societeId: number,
//   creatorId: number  // Pas utilisé mais gardé pour compatibilité
// ): CreateEventInput {
//   const eventDate = event.startTime.toISOString().split('T')[0];
//   const startTime = event.startTime.toTimeString().slice(0, 5);
//   const endTime = event.endTime.toTimeString().slice(0, 5);

//   return {
//     societe_id: societeId,
//     title: event.title,
//     description: event.description,
//     event_date: eventDate,
//     start_time: startTime,
//     end_time: endTime,
//     color: event.color || '#E77131'
//   };
// }


// services/calendarApi.ts - PARSER DATES ROBUSTE

// const API_BASE_URL = 'http://localhost:3000/api';

// export interface CalendarEventAPI {
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
//   created_at: string;
//   updated_at: string;
//   societe_name?: string;
//   attendees?: any[];
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
//   attendee_societe_ids?: number[];
//   invite_method?: 'email' | 'sms' | 'push' | 'contact';
// }

// export async function fetchEvents(
//   societeId: number,
//   startDate: string,
//   endDate: string
// ): Promise<CalendarEventAPI[]> {
//   const params = new URLSearchParams({
//     societe_id: String(societeId),
//     start_date: startDate,
//     end_date: endDate
//   });

//   const response = await fetch(`${API_BASE_URL}/calendar/events?${params}`);
//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur récupération événements');
//   }

//   return result.data;
// }

// export async function createCalendarEvent(data: CreateEventInput): Promise<number> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data)
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur création événement');
//   }

//   return result.data.id;
// }

// export async function updateCalendarEvent(
//   eventId: number,
//   societeId: number,
//   data: Partial<CreateEventInput>
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ ...data, societe_id: societeId })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur modification événement');
//   }
// }

// export async function deleteCalendarEvent(eventId: number, societeId: number): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ societe_id: societeId })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur suppression événement');
//   }
// }

// export async function inviteArtisans(
//   eventId: number,
//   societeIds: number[],
//   inviteMethod: 'email' | 'sms' | 'push' | 'contact'
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/invite`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       societe_ids: societeIds,
//       invite_method: inviteMethod
//     })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur envoi invitations');
//   }
// }

// export async function respondToInvitation(
//   eventId: number,
//   societeId: number,
//   status: 'accepted' | 'declined'
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/respond`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       societe_id: societeId,
//       status
//     })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur réponse invitation');
//   }
// }

// /**
//  * ✅ PARSER TEMPS ROBUSTE
//  * Gère: "14:02:00", "14:02:00.000", "14:02"
//  */
// function parseTimeString(timeStr: string): { hour: number; minute: number } {
//   // Nettoyer millisecondes
//   const cleanTime = timeStr.split('.')[0]; // "14:02:00.000" → "14:02:00"
//   const parts = cleanTime.split(':');
  
//   return {
//     hour: parseInt(parts[0], 10) || 0,
//     minute: parseInt(parts[1], 10) || 0
//   };
// }

// /**
//  * ✅ PARSER DATE ROBUSTE
//  * Gère: "2025-12-29T23:00:00.000Z", "2025-12-29"
//  */
// function parseDateString(dateStr: string): { year: number; month: number; day: number } {
//   // Extraire seulement la partie date
//   const datePart = dateStr.split('T')[0]; // "2025-12-29T23:00:00.000Z" → "2025-12-29"
//   const parts = datePart.split('-');
  
//   return {
//     year: parseInt(parts[0], 10),
//     month: parseInt(parts[1], 10),
//     day: parseInt(parts[2], 10)
//   };
// }

// /**
//  * Convertir CalendarEventAPI → CalendarEvent (frontend)
//  * ✅ CORRECTION: Parser robuste pour tous formats
//  */
// export function convertAPIEventToFrontend(apiEvent: CalendarEventAPI): any {
//   try {
//     // Parser date
//     const { year, month, day } = parseDateString(apiEvent.event_date);
    
//     // Parser heures
//     const startTimeParsed = parseTimeString(apiEvent.start_time);
//     const endTimeParsed = parseTimeString(apiEvent.end_time);

//     // Créer dates JavaScript
//     const startDate = new Date(year, month - 1, day, startTimeParsed.hour, startTimeParsed.minute);
//     const endDate = new Date(year, month - 1, day, endTimeParsed.hour, endTimeParsed.minute);

//     console.log('🔍 Conversion événement:', {
//       id: apiEvent.id,
//       title: apiEvent.title,
//       api_date: apiEvent.event_date,
//       api_start_time: apiEvent.start_time,
//       api_end_time: apiEvent.end_time,
//       parsed_start: startDate.toString(),
//       parsed_end: endDate.toString(),
//       isValid: !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())
//     });

//     return {
//       id: String(apiEvent.id),
//       title: apiEvent.title,
//       description: apiEvent.description,
//       startTime: startDate,
//       endTime: endDate,
//       color: apiEvent.color,
//       calendar: 'personal',
//       attendees: apiEvent.attendees?.map(a => a.societe_name) || [],
//       status: apiEvent.status,
//       isPast: endDate < new Date()
//     };
//   } catch (error) {
//     console.error('❌ Erreur conversion événement:', apiEvent, error);
    
//     // Retourner événement invalide plutôt que crasher
//     return {
//       id: String(apiEvent.id),
//       title: apiEvent.title + ' (ERREUR)',
//       description: apiEvent.description,
//       startTime: new Date(),
//       endTime: new Date(),
//       color: '#999999',
//       calendar: 'personal',
//       attendees: [],
//       status: apiEvent.status,
//       isPast: false
//     };
//   }
// }

// /**
//  * Convertir CalendarEvent (frontend) → CreateEventInput (API)
//  */
// export function convertFrontendEventToAPI(
//   event: any,
//   societeId: number,
//   creatorId: number
// ): CreateEventInput {
//   const eventDate = event.startTime.toISOString().split('T')[0];
//   const startTime = event.startTime.toTimeString().slice(0, 5);
//   const endTime = event.endTime.toTimeString().slice(0, 5);

//   return {
//     societe_id: societeId,
//     title: event.title,
//     description: event.description,
//     event_date: eventDate,
//     start_time: startTime,
//     end_time: endTime,
//     location: event.location,
//     color: event.color || '#E77131'
//   };
// }



// services/calendarApi.ts - PARSER DATES ROBUSTE

// const API_BASE_URL = 'http://localhost:3000/api';

// export interface CalendarEventAPI {
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
//   created_at: string;
//   updated_at: string;
//   societe_name?: string;
//   attendees?: any[];
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
//   attendee_societe_ids?: number[];
//   invite_method?: 'email' | 'sms' | 'push' | 'contact';
// }

// export async function fetchEvents(
//   societeId: number,
//   startDate: string,
//   endDate: string
// ): Promise<CalendarEventAPI[]> {
//   const params = new URLSearchParams({
//     societe_id: String(societeId),
//     start_date: startDate,
//     end_date: endDate
//   });

//   const response = await fetch(`${API_BASE_URL}/calendar/events?${params}`);
//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur récupération événements');
//   }

//   return result.data;
// }

// export async function createCalendarEvent(data: CreateEventInput): Promise<number> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data)
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur création événement');
//   }

//   return result.data.id;
// }

// export async function updateCalendarEvent(
//   eventId: number,
//   societeId: number,
//   data: Partial<CreateEventInput>
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ ...data, societe_id: societeId })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur modification événement');
//   }
// }

// export async function deleteCalendarEvent(eventId: number, societeId: number): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ societe_id: societeId })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur suppression événement');
//   }
// }

// export async function inviteArtisans(
//   eventId: number,
//   societeIds: number[],
//   inviteMethod: 'email' | 'sms' | 'push' | 'contact'
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/invite`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       societe_ids: societeIds,
//       invite_method: inviteMethod
//     })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur envoi invitations');
//   }
// }

// export async function respondToInvitation(
//   eventId: number,
//   societeId: number,
//   status: 'accepted' | 'declined'
// ): Promise<void> {
//   const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/respond`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       societe_id: societeId,
//       status
//     })
//   });

//   const result = await response.json();

//   if (!result.success) {
//     throw new Error(result.message || 'Erreur réponse invitation');
//   }
// }

// /**
//  * ✅ PARSER TEMPS ROBUSTE
//  * Gère: "14:02:00", "14:02:00.000", "14:02"
//  */
// function parseTimeString(timeStr: string): { hour: number; minute: number } {
//   // Nettoyer millisecondes
//   const cleanTime = timeStr.split('.')[0]; // "14:02:00.000" → "14:02:00"
//   const parts = cleanTime.split(':');
  
//   return {
//     hour: parseInt(parts[0], 10) || 0,
//     minute: parseInt(parts[1], 10) || 0
//   };
// }

// /**
//  * ✅ PARSER DATE ROBUSTE
//  * Gère: "2025-12-29T23:00:00.000Z", "2025-12-29"
//  */
// function parseDateString(dateStr: string): { year: number; month: number; day: number } {
//   // Extraire seulement la partie date
//   const datePart = dateStr.split('T')[0]; // "2025-12-29T23:00:00.000Z" → "2025-12-29"
//   const parts = datePart.split('-');
  
//   return {
//     year: parseInt(parts[0], 10),
//     month: parseInt(parts[1], 10),
//     day: parseInt(parts[2], 10)
//   };
// }

// /**
//  * Convertir CalendarEventAPI → CalendarEvent (frontend)
//  * ✅ CORRECTION: Parser robuste pour tous formats
//  */
// export function convertAPIEventToFrontend(apiEvent: CalendarEventAPI): any {
//   try {
//     // Parser date
//     const { year, month, day } = parseDateString(apiEvent.event_date);
    
//     // Parser heures
//     const startTimeParsed = parseTimeString(apiEvent.start_time);
//     const endTimeParsed = parseTimeString(apiEvent.end_time);

//     // Créer dates JavaScript
//     const startDate = new Date(year, month - 1, day, startTimeParsed.hour, startTimeParsed.minute);
//     const endDate = new Date(year, month - 1, day, endTimeParsed.hour, endTimeParsed.minute);

//     console.log('🔍 Conversion événement:', {
//       id: apiEvent.id,
//       title: apiEvent.title,
//       api_date: apiEvent.event_date,
//       api_start_time: apiEvent.start_time,
//       api_end_time: apiEvent.end_time,
//       parsed_start: startDate.toString(),
//       parsed_end: endDate.toString(),
//       isValid: !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())
//     });

//     return {
//       id: String(apiEvent.id),
//       title: apiEvent.title,
//       description: apiEvent.description,
//       startTime: startDate,
//       endTime: endDate,
//       color: apiEvent.color,
//       calendar: 'personal',
//       attendees: apiEvent.attendees?.map(a => a.societe_name) || [],
//       status: apiEvent.status,
//       isPast: endDate < new Date()
//     };
//   } catch (error) {
//     console.error('❌ Erreur conversion événement:', apiEvent, error);
    
//     // Retourner événement invalide plutôt que crasher
//     return {
//       id: String(apiEvent.id),
//       title: apiEvent.title + ' (ERREUR)',
//       description: apiEvent.description,
//       startTime: new Date(),
//       endTime: new Date(),
//       color: '#999999',
//       calendar: 'personal',
//       attendees: [],
//       status: apiEvent.status,
//       isPast: false
//     };
//   }
// }

// /**
//  * Convertir CalendarEvent (frontend) → CreateEventInput (API)
//  */
// export function convertFrontendEventToAPI(
//   event: any,
//   societeId: number,
//   creatorId: number
// ): CreateEventInput {
//   const eventDate = event.startTime.toISOString().split('T')[0];
//   const startTime = event.startTime.toTimeString().slice(0, 5);
//   const endTime = event.endTime.toTimeString().slice(0, 5);

//   return {
//     societe_id: societeId,
//     title: event.title,
//     description: event.description,
//     event_date: eventDate,
//     start_time: startTime,
//     end_time: endTime,
//     location: event.location,
//     color: event.color || '#E77131'
//   };
// }




// services/calendarApi.ts - TIMEZONE CORRIGÉE

// services/calendarApi.ts - AVEC EVENT_TYPE + FIX DATE

const API_BASE_URL = 'http://localhost:3000/api';

export interface CalendarEventAPI {
  id: number;
  societe_id: number;
  title: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  color: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  event_type: 'task' | 'work' | 'meeting';  // ← AJOUTÉ
  created_at: string;
  updated_at: string;
  societe_name?: string;
  attendees?: any[];
}

export interface CreateEventInput {
  societe_id: number;
  title: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  color?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  event_type?: 'task' | 'work' | 'meeting';  // ← AJOUTÉ
  attendee_societe_ids?: number[];
  invite_method?: 'email' | 'sms' | 'push' | 'contact';
}

export async function fetchEvents(
  societeId: number,
  startDate: string,
  endDate: string
): Promise<CalendarEventAPI[]> {
  const params = new URLSearchParams({
    societe_id: String(societeId),
    start_date: startDate,
    end_date: endDate
  });

  const response = await fetch(`${API_BASE_URL}/calendar/events?${params}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur récupération événements');
  }

  return result.data;
}

export async function createCalendarEvent(data: CreateEventInput): Promise<number> {
  console.log('📤 Création événement API:', data);
  
  const response = await fetch(`${API_BASE_URL}/calendar/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur création événement');
  }

  return result.data.id;
}

export async function updateCalendarEvent(
  eventId: number,
  societeId: number,
  data: Partial<CreateEventInput>
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...data, societe_id: societeId })
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur modification événement');
  }
}

export async function deleteCalendarEvent(eventId: number, societeId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ societe_id: societeId })
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur suppression événement');
  }
}

export async function inviteArtisans(
  eventId: number,
  societeIds: number[],
  inviteMethod: 'email' | 'sms' | 'push' | 'contact'
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      societe_ids: societeIds,
      invite_method: inviteMethod
    })
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur envoi invitations');
  }
}

export async function respondToInvitation(
  eventId: number,
  societeId: number,
  status: 'accepted' | 'declined'
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      societe_id: societeId,
      status
    })
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur réponse invitation');
  }
}

function parseTimeString(timeStr: string): { hour: number; minute: number } {
  const cleanTime = timeStr.split('.')[0];
  const parts = cleanTime.split(':');
  return {
    hour: parseInt(parts[0], 10) || 0,
    minute: parseInt(parts[1], 10) || 0
  };
}

function parseDateString(dateStr: string): { year: number; month: number; day: number } {
  const datePart = dateStr.split('T')[0];
  const parts = datePart.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10)
  };
}

/**
 * ✅ Convertir API → Frontend AVEC event_type
 */
export function convertAPIEventToFrontend(apiEvent: CalendarEventAPI): any {
  try {
    const { year, month, day } = parseDateString(apiEvent.event_date);
    const startTimeParsed = parseTimeString(apiEvent.start_time);
    const endTimeParsed = parseTimeString(apiEvent.end_time);

    const startDate = new Date(year, month - 1, day, startTimeParsed.hour, startTimeParsed.minute);
    const endDate = new Date(year, month - 1, day, endTimeParsed.hour, endTimeParsed.minute);

    console.log('🔍 Conversion API→Frontend:', {
      id: apiEvent.id,
      title: apiEvent.title,
      event_type: apiEvent.event_type,  // ← LOG
      api_date: apiEvent.event_date,
      parsed_date: startDate.toLocaleDateString('fr-FR')
    });

    return {
      id: String(apiEvent.id),
      title: apiEvent.title,
      description: apiEvent.description,
      location: apiEvent.location,
      startTime: startDate,
      endTime: endDate,
      color: apiEvent.color,
      calendar: 'personal',
      attendees: apiEvent.attendees?.map(a => a.societe_name) || [],
      status: apiEvent.status,
      event_type: apiEvent.event_type || 'task',  // ← AJOUTÉ
      isPast: endDate < new Date()
    };
  } catch (error) {
    console.error('❌ Erreur conversion événement:', apiEvent, error);
    return {
      id: String(apiEvent.id),
      title: apiEvent.title + ' (ERREUR)',
      description: apiEvent.description,
      startTime: new Date(),
      endTime: new Date(),
      color: '#999999',
      calendar: 'personal',
      attendees: [],
      status: apiEvent.status,
      event_type: 'task',
      isPast: false
    };
  }
}

/**
 * ✅ Convertir Frontend → API AVEC event_type
 */
export function convertFrontendEventToAPI(
  event: any,
  societeId: number,
  creatorId: number
): CreateEventInput {
  // ✅ FIX DATE : Utiliser getDate() au lieu de getUTCDate()
  const year = event.startTime.getFullYear();
  const month = String(event.startTime.getMonth() + 1).padStart(2, '0');
  const day = String(event.startTime.getDate()).padStart(2, '0');
  const eventDate = `${year}-${month}-${day}`;
  
  const startHour = String(event.startTime.getHours()).padStart(2, '0');
  const startMin = String(event.startTime.getMinutes()).padStart(2, '0');
  const startTime = `${startHour}:${startMin}`;
  
  const endHour = String(event.endTime.getHours()).padStart(2, '0');
  const endMin = String(event.endTime.getMinutes()).padStart(2, '0');
  const endTime = `${endHour}:${endMin}`;

  console.log('📤 Conversion Frontend→API:', {
    title: event.title,
    event_type: event.event_type,  // ← LOG
    event_date: eventDate,
    start_time: startTime,
    jour_semaine: event.startTime.toLocaleDateString('fr-FR', { weekday: 'long' })
  });

  return {
    societe_id: societeId,
    title: event.title,
    description: event.description,
    location: event.location,
    event_date: eventDate,
    start_time: startTime,
    end_time: endTime,
    color: event.color || '#E77131',
    status: event.status || 'pending',
    event_type: event.event_type || 'task'  // ← AJOUTÉ
  };
}