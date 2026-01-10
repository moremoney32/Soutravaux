export type EventScope = 'personal' | 'collaborative';
export type EventStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// Catégorie d'événement (depuis backend)
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


// export interface CalendarEvent {
//   id: string;
//   title: string;
//   description?: string;
//   startTime: Date;
//   endTime: Date;
//   color: string;
//   calendar: string;
//   attendees?: string[];
// }

// Interface principale événement
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color: string;
  calendar: string;
  location?: string;
  status: EventStatus;
  scope: EventScope;
  event_category_id?: number;           // Référence catégorie prédéfinie
  custom_category_label?: string;       // Label personnalisé si pas de catégorie_id
  category?: EventCategory;              // Objet catégorie complet (si chargé)
  attendees?: number[];                 // IDs sociétés invitées (si collaborative)
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
}

export type ViewType = 'day' | 'week' | 'month' | 'agenda';

