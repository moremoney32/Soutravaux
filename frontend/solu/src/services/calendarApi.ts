

// services/calendarApi.ts - VERSION AVEC MEMBRE_ID

const API_BASE_URL = 'https://staging.solutravo.zeta-app.fr/api';
//const API_BASE_URL = 'http://localhost:3000/api';

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
  reminders?: Array<{
    value: string;
    method: 'email' | 'notification';
  }>;
}

export interface CreateEventInput {
  societe_id: number;
  membre_id: number;  // ✅ AJOUTÉ
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
  attendee_emails?: string[];
  invite_method?: 'email' | 'sms' | 'push' | 'contact';
 reminders?: Array<{
    value: string;  // Minutes avant
    method: 'email' | 'notification';
  }>;
}

// ✅ MODIFIÉ : Ajouter membre_id
export async function fetchEvents(
  societeId: number,
  membreId: number,  // ✅ AJOUTÉ
  startDate: string,
  endDate: string
): Promise<CalendarEventAPI[]> {
  const params = new URLSearchParams({
    societe_id: String(societeId),
    membre_id: String(membreId),  // ✅ AJOUTÉ
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

export async function deleteCategory(categoryId: number, societeId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/categories/${categoryId}?societe_id=${societeId}`, {
    method: 'DELETE',
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur suppression catégorie');
  }
}

// ✅ MODIFIÉ : Ajouter membre_id
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

// ✅ MODIFIÉ : Ajouter membre_id
export async function updateCalendarEvent(
  eventId: number,
  societeId: number,
  membreId: number,  // ✅ AJOUTÉ
  data: Partial<CreateEventInput>
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      ...data, 
      societe_id: societeId,
      membre_id: membreId  // ✅ AJOUTÉ
    })
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur modification événement');
  }
}

// ✅ MODIFIÉ : Ajouter membre_id
export async function deleteCalendarEvent(
  eventId: number, 
  societeId: number,
  membreId: number  // ✅ AJOUTÉ
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      societe_id: societeId,
      membre_id: membreId  // ✅ AJOUTÉ
    })
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur suppression événement');
  }
}

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
    const dateStr = apiEvent.event_date.includes('T')
      ? apiEvent.event_date.split('T')[0]
      : apiEvent.event_date;

    const [year, month, day] = dateStr.split('-').map(Number);

    const startTimeParsed = parseTimeString(apiEvent.start_time);
    const endTimeParsed   = parseTimeString(apiEvent.end_time);

    const startDate = new Date(year, month - 1, day, startTimeParsed.hour, startTimeParsed.minute);
    const endDate   = new Date(year, month - 1, day, endTimeParsed.hour, endTimeParsed.minute);

    return {
      id:          String(apiEvent.id),
      title:       apiEvent.title,
      description: apiEvent.description,
      location:    apiEvent.location,
      startTime:   startDate,
      endTime:     endDate,
      color:       apiEvent.color,
      calendar:    'personal',
      status:      apiEvent.status,
      event_type:  apiEvent.event_type || 'task',
      isPast:      endDate < new Date(),

      // ✅ CHAMPS MANQUANTS — ajoutés
      scope:                 (apiEvent as any).scope || 'personal',
      event_category_id:     (apiEvent as any).event_category_id || undefined,
      custom_category_label: (apiEvent as any).custom_category_label || undefined,
      attendees: [
        ...(apiEvent.attendees?.map((a: any) => a.email || a.societe_name) || []),
        ...((apiEvent as any).invited_member_emails || [])
      ],

      // ✅ RAPPELS — le champ clé qui manquait
      reminders: (apiEvent as any).reminders || [],
      created_by_membre_id: (apiEvent as any).created_by_membre_id,
      invited_societes: (apiEvent as any).invited_societes || [],
      invited_externe_emails: (apiEvent as any).invited_externe_emails || [],
    };

  } catch (error) {
    console.error('❌ Erreur conversion événement:', apiEvent, error);
    return {
      id:        String(apiEvent.id),
      title:     apiEvent.title + ' (ERREUR DATE)',
      startTime: new Date(),
      endTime:   new Date(),
      color:     '#999999',
      calendar:  'personal',
      attendees: [],
      status:    apiEvent.status,
      event_type: 'task',
      isPast:    false,
      scope:     'personal',
      reminders: []
    };
  }
}

// ✅ MODIFIÉ : Ajouter creatorId (membre_id)
export function convertFrontendEventToAPI(
  event: any,
  societeId: number,
  creatorId: number  // ✅ membreId du créateur
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

  const payload: CreateEventInput = {
    societe_id: societeId,
    membre_id: creatorId,  // ✅ AJOUTÉ
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
    custom_category_label: event.custom_category_label || undefined,
    reminders: event.reminders
  };

  if (event.scope === 'collaborative' && event.attendees && event.attendees.length > 0) {
    (payload as any).attendee_emails = event.attendees;
    payload.invite_method = event.invite_method || 'email';
  }

  if (event.invited_externe_emails && event.invited_externe_emails.length > 0) {
    (payload as any).invited_externe_emails = event.invited_externe_emails;
  }

  return payload;
}

/**
 * ✅ NOUVEAU : Récupérer collaborateurs
 */
export async function fetchCollaborators(societeId: number): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/collaborators/${societeId}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur récupération collaborateurs');
  }

  return result.data || [];
}


/**
 * ✅ Rechercher des sociétés Solutravo
 */
export async function searchSocietes(
  query: string,
  excludeSocieteId: number
): Promise<any[]> {
  const params = new URLSearchParams({
    q: query,
    exclude_id: String(excludeSocieteId)
  });

  const response = await fetch(`${API_BASE_URL}/calendar/societes/search?${params}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur recherche sociétés');
  }

  return result.data || [];
}

/**
 * ✅ Inviter une société externe (hors Solutravo) par email
 */
export async function inviterSocieteExterneAPI(
  eventId: number,
  societeInvitanteId: number,
  membreId: number,
  emailExterne: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/invite-externe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      societe_invitante_id: societeInvitanteId,
      membre_id: membreId,
      email_externe: emailExterne
    })
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur invitation externe');
  }
}

/**
 * ✅ Inviter une société à un événement
 */
export async function inviterSocieteAPI(
  eventId: number,
  societeInvitanteId: number,
  societeInviteeId: number,
  membreId: number
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/invite-societe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      societe_invitante_id: societeInvitanteId,
      societe_invitee_id: societeInviteeId,
      membre_id: membreId
    })
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Erreur invitation société');
  }
}