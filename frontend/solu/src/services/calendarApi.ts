

const API_BASE_URL = 'https://solutravo.zeta-app.fr/api';
//const API_BASE_URL = 'https://solutravo.zeta-app.fr/api';

export interface EventCategory {
  id: number;
  label: string;
  icon: string;
  color: string;
  is_predefined: boolean;
  requires_location: boolean;
  created_by_societe_id?: number;
  created_at: string;
  updated_at: string;
}

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
  event_type?: 'task' | 'work' | 'meeting';
  scope: 'personal' | 'collaborative';
  event_category_id?: number;
  custom_category_label?: string;
  created_at: string;
  updated_at: string;
  societe_name?: string;
  attendees?: any[];
  category?: EventCategory;
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
  scope: 'personal' | 'collaborative';
  event_category_id?: number;
  custom_category_label?: string;
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

/**
 * Récupérer les catégories d'événements (prédéfinies + personnalisées)
 */
export async function fetchCategories(societeId: number): Promise<EventCategory[]> {
  const params = new URLSearchParams({
    societe_id: String(societeId)
  });

  const response = await fetch(`${API_BASE_URL}/calendar/categories?${params}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur récupération catégories');
  }

  return result.data;
}

/**
 * Créer une catégorie personnalisée
 */
export async function createCategory(
  societeId: number,
  label: string,
  icon?: string,
  color?: string,
  requires_location?: boolean
): Promise<EventCategory> {
  const response = await fetch(`${API_BASE_URL}/calendar/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      societe_id: societeId,
      label,
      icon,
      color,
      requires_location
    })
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur création catégorie');
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

/**
 * Inviter les collaborateurs sélectionnés à un événement
 * @param eventId - ID de l'événement
 * @param memberIds - Liste des IDs des membres (collaborateurs)
 * @returns
 */
export async function inviteCollaborators(
  eventId: number,
  memberIds: number[]
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      member_ids: memberIds,
      invite_method: 'email'
    })
  });

  const result = await response.json();
  console.log('📨 Invitation collaborateurs réponse API:', result);

  if (!result.success) {
    throw new Error(result.message || 'Erreur envoi invitations aux collaborateurs');
  }
}

/**
 * ✅ NOUVEAU: Inviter les collaborateurs par EMAIL directement
 * @param eventId - ID de l'événement
 * @param emails - Liste des EMAILS des collaborateurs
 * @returns
 */
export async function inviteCollaboratorsByEmail(
  eventId: number,
  emails: string[]
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      attendee_emails: emails,
      invite_method: 'email'
    })
  });

  const result = await response.json();
  console.log('📧 Invitation par email réponse API:', result);

  if (!result.success) {
    throw new Error(result.message || 'Erreur envoi invitations par email');
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
 * ✅ Convertir Frontend → API avec scope et catégories
 */
export function convertFrontendEventToAPI(
  event: any,
  societeId: number,
   creatorId: number
): CreateEventInput {
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
    scope: event.scope,
    event_category_id: event.event_category_id,
    custom_category_label: event.custom_category_label,
    event_date: eventDate,
    start_time: startTime,
  });

  const payload: CreateEventInput = {
    societe_id: societeId,
    title: event.title,
    description: event.description,
    location: event.location,
    event_date: eventDate,
    start_time: startTime,
    end_time: endTime,
    color: event.color || '#E77131',
    status: event.status || 'pending',
    scope: event.scope || 'personal',
    event_category_id: event.event_category_id || undefined,
    custom_category_label: event.custom_category_label || undefined
  };

  // Si collaboratif, ajouter les emails des invités
  if (event.scope === 'collaborative' && event.attendees && event.attendees.length > 0) {
    // ✅ NOUVEAU: Envoyer les EMAILS directement au lieu des IDs
    (payload as any).attendee_emails = event.attendees;  // Les emails des collaborateurs sélectionnés
    payload.invite_method = event.invite_method || 'email';
  }

  return payload;
}

/**
 * Récupérer les collaborateurs d'une société
 */
export async function fetchCollaborators(societeId: number): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/collaborators/${societeId}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur récupération collaborateurs');
  }

  return result.data || [];
}