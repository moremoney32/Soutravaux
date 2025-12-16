import React, { useState, useCallback, useMemo } from 'react';
import '../styles/GoogleCalendar.css';
import type { Calendar, CalendarEvent, ViewType } from '../types/calendar';
// import CalendarSidebar from './CalendarSideBar';
import CalendarWeekView from './CalendarWeekView';
import CalendarMonthView from './CalendarMonthView';
import CalendarEventModal from './CalendarEventModal';
import { mockCalendars, generateMockEvents } from '../data/mockCalendarData';
import CalendarSidebar from './CalendarSidebar';

/**
 * Composant principal du calendrier
 * Intègre la sidebar, la vue hebdomadaire et la navigation
 * Respecte la charte graphique (couleur primaire: #E77131)
 */
const GoogleCalendar: React.FC = () => {
  // État global du calendrier
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [calendars, setCalendars] = useState<Calendar[]>(mockCalendars);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>(generateMockEvents(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [isCreatingNewEvent, setIsCreatingNewEvent] = useState<boolean>(false);

  /**
   * Obtient les calendriers visibles
   */
  const visibleCalendarIds = useMemo(
    () => calendars.filter((cal) => cal.isVisible).map((cal) => cal.id),
    [calendars]
  );

  /**
   * Toggle la visibilité d'un calendrier
   */
  const toggleCalendar = useCallback((id: string): void => {
    setCalendars((prev) =>
      prev.map((cal) =>
        cal.id === id ? { ...cal, isVisible: !cal.isVisible } : cal
      )
    );
  }, []);

  /**
   * Navigation vers la semaine précédente
   */
  const handlePreviousWeek = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  /**
   * Navigation vers la semaine suivante
   */
  const handleNextWeek = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  /**
   * Revenir à aujourd'hui
   */
  const handleToday = useCallback((): void => {
    setCurrentDate(new Date());
  }, []);

  /**
   * Gère la création d'un événement
   */
  const handleCreateEvent = useCallback((): void => {
    setSelectedEvent(null);
    setIsCreatingNewEvent(true);
    setShowEventModal(true);
  }, []);

  /**
   * Gère la sélection d'un événement
   */
  const handleEventClick = useCallback((event: CalendarEvent): void => {
    setSelectedEvent(event);
    setIsCreatingNewEvent(false);
    setShowEventModal(true);
  }, []);

  /**
   * Gère la sélection d'un créneau horaire
   */
  const handleTimeSlotClick = useCallback((date: Date, _hour: number): void => {
    setCurrentDate(date);
    setSelectedEvent(null);
    setIsCreatingNewEvent(true);
    setShowEventModal(true);
  }, []);

  /**
   * Gère la sélection d'une date dans le mini calendrier
   */
  const handleDateSelect = useCallback((date: Date): void => {
    setCurrentDate(date);
  }, []);

  /**
   * Sauvegarde un événement (création ou modification)
   */
  const handleSaveEvent = useCallback((event: CalendarEvent): void => {
    setAllEvents((prev) => {
      const exists = prev.find((e) => e.id === event.id);
      if (exists) {
        return prev.map((e) => (e.id === event.id ? event : e));
      }
      return [...prev, event];
    });
  }, []);

  /**
   * Supprime un événement
   */
  const handleDeleteEvent = useCallback((eventId: string): void => {
    setAllEvents((prev) => prev.filter((e) => e.id !== eventId));
  }, []);

  /**
   * Format la date pour affichage
   */
  const formatDateRange = (): string => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() || 7) + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startMonth = weekStart.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
    const endMonth = weekEnd.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });

    return startMonth === endMonth
      ? startMonth
      : `${startMonth} - ${endMonth}`;
  };

  return (
    <div className="calendar-container">
      {/* Sidebar gauche */}
      <CalendarSidebar
        currentDate={currentDate}
        calendars={calendars}
        onToggleCalendar={toggleCalendar}
        onCreateEvent={handleCreateEvent}
        onDateSelect={handleDateSelect}
      />

      {/* Zone principale */}
      <div className="calendar-main">
        {/* En-tête */}
        <div className="calendar-header">
          <div className="calendar-header-left">
            <button 
              className="calendar-hamburger"
              title="Menu"
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="calendar-logo">
              <i className="fas fa-calendar"></i>
              <span>Agenda</span>
            </div>
          </div>

          <div className="calendar-header-center">
            <button 
              className="calendar-btn-today"
              onClick={handleToday}
              title="Aller à aujourd'hui"
            >
              Aujourd'hui
            </button>
            <div className="calendar-navigation">
              <button 
                onClick={handlePreviousWeek}
                title="Semaine précédente"
                className="calendar-nav-btn"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button 
                onClick={handleNextWeek}
                title="Semaine suivante"
                className="calendar-nav-btn"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <span className="calendar-month-year">
              {formatDateRange()}
            </span>
          </div>

          <div className="calendar-header-right">
            <button 
              className="calendar-btn-search"
              title="Rechercher"
            >
              <i className="fas fa-search"></i>
            </button>
            <button 
              className="calendar-btn-help"
              title="Aide"
            >
              <i className="fas fa-question-circle"></i>
            </button>
            <button 
              className="calendar-btn-settings"
              title="Paramètres"
            >
              <i className="fas fa-cog"></i>
            </button>
            
            {/* Sélecteur de vue */}
            <div className="calendar-view-selector">
              <button
                className={`calendar-view-btn ${viewType === 'week' ? 'active' : ''}`}
                onClick={() => setViewType('week')}
                title="Vue semaine"
              >
                <i className="fas fa-calendar-week"></i>
              </button>
              <button
                className={`calendar-view-btn ${viewType === 'month' ? 'active' : ''}`}
                onClick={() => setViewType('month')}
                title="Vue mois"
              >
                <i className="fas fa-th"></i>
              </button>
            </div>

            <button 
              className="calendar-btn-apps"
              title="Applications"
            >
              <i className="fas fa-th-large"></i>
            </button>
            <div className="calendar-user-avatar" title="Profil utilisateur">
              F
            </div>
          </div>
        </div>

        {/* Vue calendrier */}
        {viewType === 'week' && (
          <CalendarWeekView
            currentDate={currentDate}
            events={allEvents}
            visibleCalendars={visibleCalendarIds}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}

        {/* Placeholder pour autres vues */}
        {viewType === 'month' && (
          <CalendarMonthView
            currentDate={currentDate}
            events={allEvents}
            visibleCalendars={visibleCalendarIds}
            onEventClick={handleEventClick}
            onDateClick={handleDateSelect}
          />
        )}
        {viewType === 'day' && (
          <div className="calendar-day-view">
            <p>Vue jour en construction</p>
          </div>
        )}
        {viewType === 'agenda' && (
          <div className="calendar-agenda-view">
            <p>Vue agenda en construction</p>
          </div>
        )}
      </div>

      {/* Panneau droit (notifications/détails) */}
      <div className="calendar-sidebar-right">
        <div className="calendar-notification">
          {selectedEvent ? (
            <div className="calendar-event-details">
              <h4>{selectedEvent.title}</h4>
              <p>{selectedEvent.description}</p>
              <p>
                {selectedEvent.startTime.toLocaleString('fr-FR')} -{' '}
                {selectedEvent.endTime.toLocaleString('fr-FR')}
              </p>
            </div>
          ) : (
            <i className="fas fa-check"></i>
          )}
        </div>
      </div>

      {/* Modal d'événement */}
      <CalendarEventModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
          setIsCreatingNewEvent(false);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        isNewEvent={isCreatingNewEvent}
      />
    </div>
  );
};

export default GoogleCalendar;
