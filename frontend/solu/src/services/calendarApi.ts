

//const API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'https://staging.solutravo.zeta-app.fr/api';

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



export function convertAPIEventToFrontend(apiEvent: CalendarEventAPI): any {
    try {
      // ✅ EXTRAIRE UNIQUEMENT LA PARTIE DATE (sans timezone)
      const dateStr = apiEvent.event_date.includes('T') 
        ? apiEvent.event_date.split('T')[0]  // "2026-01-08"
        : apiEvent.event_date;
      
      const [year, month, day] = dateStr.split('-').map(Number);
      
      const startTimeParsed = parseTimeString(apiEvent.start_time);
      const endTimeParsed = parseTimeString(apiEvent.end_time);
  
      // ✅ CRÉER EN HEURE LOCALE (pas UTC)
      const startDate = new Date(year, month - 1, day, startTimeParsed.hour, startTimeParsed.minute);
      const endDate = new Date(year, month - 1, day, endTimeParsed.hour, endTimeParsed.minute);
  
      console.log('🔍 DEBUG Conversion API→Frontend:', {
        id: apiEvent.id,
        title: apiEvent.title,
        event_type: apiEvent.event_type,
        api_date_brute: apiEvent.event_date,
        date_extraite: dateStr,
        year, month, day,
        date_js_créée: startDate,
        jour_attendu: startDate.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
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
        event_type: apiEvent.event_type || 'task',
        isPast: endDate < new Date()
      };
    } catch (error) {
      console.error('❌ Erreur conversion événement:', apiEvent, error);
      return {
        id: String(apiEvent.id),
        title: apiEvent.title + ' (ERREUR DATE)',
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
  console.log(creatorId)

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