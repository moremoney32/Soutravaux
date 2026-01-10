// types/calendar.ts

export interface CalendarEvent {
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
    
    // ✅ ANCIEN (gardé pour compatibilité)
    event_type: 'task' | 'work' | 'meeting';
    
    // ✅ NOUVEAU
    scope: 'personal' | 'collaborative';
    event_category_id?: number;
    custom_category_label?: string;
    
    created_at: string;
    updated_at: string;
    
    // Relations
    societe_name?: string;
    attendees?: EventAttendee[];
    category?: EventCategory;
  }
  
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
  
  export interface EventAttendee {
    id: number;
    event_id: number;
    societe_id: number;
    societe_name: string;
    contact_email?: string;
    contact_phone?: string;
    invite_method: 'email' | 'sms' | 'push' | 'contact';
    status: 'pending' | 'accepted' | 'declined';
    notified_at?: string;
    responded_at?: string;
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
    
    // ✅ ANCIEN (gardé)
    event_type?: 'task' | 'work' | 'meeting';
    
    // ✅ NOUVEAU
    scope: 'personal' | 'collaborative';
    event_category_id?: number;
    custom_category_label?: string;
    invite_method?: 'email' | 'sms' | 'push' | 'contact';
    
    // Invitations (si scope = collaborative)
    attendee_societe_ids?: number[];
  }
  
  export interface CreateCategoryInput {
    societe_id: number;
    label: string;
    icon?: string;
    color?: string;
    requires_location?: boolean;
  }