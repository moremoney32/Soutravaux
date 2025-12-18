import type { Calendar, CalendarEvent } from '../types/calendar';

/**
 * Données mockées pour le calendrier
 * Respecte la charte graphique (couleur primaire: #E77131)
 */

export const mockCalendars: Calendar[] = [
  {
    id: 'personal',
    name: 'Franck Ngongang',
    color: '#E77131', // Couleur primaire de la charte
    isVisible: true
  },
  {
    id: 'work',
    name: 'Travail - Solutravo',
    color: '#FF6B35', // Variante orange
    isVisible: true
  },
  {
    id: 'meetings',
    name: 'Réunions importantes',
    color: '#F4A460', // Orange clair
    isVisible: true
  },
  {
    id: 'tasks',
    name: 'Tâches',
    color: '#D2691E', // Orange foncé
    isVisible: true
  },
  {
    id: 'holidays',
    name: 'Jours fériés au Cameroun',
    color: '#505151', // Couleur grise primaire
    isVisible: false
  }
];

/**
 * Génère les événements pour la semaine actuelle
 */
export const generateMockEvents = (baseDate: Date = new Date()): CalendarEvent[] => {
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(baseDate);

  return [
    // Lundi 10:00 - 11:00
    {
      id: 'event-1',
      title: 'Réunion d\'équipe - Solutravo',
      description: 'Planification hebdomadaire du projet',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 1, 10, 0),
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 1, 11, 0),
      color: '#E77131',
      calendar: 'work',
      attendees: ['Franck', 'Jean', 'Marie']
    },
    // Lundi 14:30 - 15:30
    {
      id: 'event-2',
      title: 'Présentation client',
      description: 'Présentation de la plateforme',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 1, 14, 30),
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 1, 15, 30),
      color: '#FF6B35',
      calendar: 'meetings',
      attendees: ['Franck', 'Client A']
    },
    // Mardi 09:00 - 10:30
    {
      id: 'event-3',
      title: 'Développement - Module Calendrier',
      description: 'Implémentation de la vue calendrier',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 2, 9, 0),
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 2, 10, 30),
      color: '#E77131',
      calendar: 'work'
    },
    // Mardi 11:00 - 12:00
    {
      id: 'event-4',
      title: 'Code review',
      description: 'Révision des PR en attente',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 2, 11, 0),
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 2, 12, 0),
      color: '#F4A460',
      calendar: 'work',
      attendees: ['Franck', 'Dev Team']
    },
    // Mercredi 13:00 - 14:00
    {
      id: 'event-5',
      title: 'Appel avec le designer',
      description: 'Discussions sur la charte graphique',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 3, 13, 0),
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 3, 14, 0),
      color: '#FF6B35',
      calendar: 'meetings',
      attendees: ['Franck', 'Designer']
    },
    // Jeudi 10:00 - 11:30
    {
      id: 'event-6',
      title: 'Sprint Planning',
      description: 'Planification du sprint suivant',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 4, 10, 0),
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 4, 11, 30),
      color: '#E77131',
      calendar: 'work',
      attendees: ['Franck', 'Équipe Solutravo']
    },
    // Vendredi 15:00 - 16:00
    {
      id: 'event-7',
      title: 'Standup Final de semaine',
      description: 'Récapitulatif des tâches',
      startTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 5, 15, 0),
      endTime: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 5, 16, 0),
      color: '#D2691E',
      calendar: 'tasks'
    }
  ];
};

/**
 * Statistiques mockées pour le dashboard
 */
export const mockStatistics = {
  totalEvents: 15,
  eventsThisWeek: 7,
  eventsNextWeek: 5,
  participantsTotal: 23,
  upcomingMeetings: 3,
  completedTasks: 12,
  pendingTasks: 5
};

/**
 * Calendriers suggérés à ajouter
 */
export const suggestedCalendars: Calendar[] = [
  {
    id: 'birthdays',
    name: 'Anniversaires',
    color: '#E91E63',
    isVisible: false
  },
  {
    id: 'team-events',
    name: 'Événements d\'équipe',
    color: '#9C27B0',
    isVisible: false
  },
  {
    id: 'client-deliverables',
    name: 'Livrables clients',
    color: '#2196F3',
    isVisible: false
  }
];
