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


// Interface principale événement
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  end_date?: string;          // YYYY-MM-DD — présent si événement multi-jours
  color: string;
  calendar: string;
  location?: string;
  status: EventStatus;
  scope: EventScope;
  event_category_id?: number;           // Référence catégorie prédéfinie
  custom_category_label?: string;       // Label personnalisé si pas de catégorie_id
  category?: EventCategory;              // Objet catégorie complet (si chargé)
  attendees?: string[];                 // Emails des collaborateurs invités (si collaborative)
  created_by_membre_id?: number;

  reminders?: Array<{
    value: string;  // Minutes avant
    method: 'email' | 'notification';
  }>;
  invited_societe_ids?: number[];
  invited_societes?: Array<{ id: number; nomsociete: string }>;
  invited_externe_emails?: string[];
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
}

export type ViewType = 'day' | 'week' | 'month' | 'agenda';

