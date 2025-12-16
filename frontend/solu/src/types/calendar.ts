export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color: string;
  calendar: string;
  attendees?: string[];
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
}

export type ViewType = 'day' | 'week' | 'month' | 'agenda';
