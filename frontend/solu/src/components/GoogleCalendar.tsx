
// GoogleCalendar.tsx - CRÉATION DATE CORRIGÉE

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/GoogleCalendar.css';
import type { Calendar, CalendarEvent, ViewType } from '../types/calendar';
import CalendarWeekView from './CalendarWeekView';
import CalendarMonthView from './CalendarMonthView';
import CalendarEventModal from './CalendarEventModal';
import CalendarSidebar from './CalendarSidebar';
import InviteAttendeesModal from './InvitesAttentesModal';
import {
  fetchEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  inviteArtisans,
  convertAPIEventToFrontend,
  convertFrontendEventToAPI
} from '../services/calendarApi';

const mockCalendars: Calendar[] = [
  { id: 'personal', name: 'Personnel', color: '#E77131', isVisible: true },
  { id: 'work', name: 'Travail', color: '#FF6B35', isVisible: true },
  { id: 'meetings', name: 'Réunions', color: '#F4A460', isVisible: true }
];

const GoogleCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [calendars, setCalendars] = useState<Calendar[]>(mockCalendars);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [isCreatingNewEvent, setIsCreatingNewEvent] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);  // ← NOUVEAU

  const { societeId: societeIdParam } = useParams<{ societeId: string }>();
  
  // ✅ CHANGEMENT 2 : Convertir en nombre (avec fallback sur localStorage si URL vide)
  const societeId = Number(societeIdParam);

  //const societeId = Number(localStorage.getItem("societeId") || "11");

  const visibleCalendarIds = useMemo(
    () => calendars.filter((cal) => cal.isVisible).map((cal) => cal.id),
    [calendars]
  );

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - 7);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 14);

      const startDate = weekStart.toISOString().split('T')[0];
      const endDate = weekEnd.toISOString().split('T')[0];

      const apiEvents = await fetchEvents(societeId, startDate, endDate);
      const frontendEvents = apiEvents.map(convertAPIEventToFrontend);
      
      // console.log('📅 Événements chargés:', frontendEvents);
      setAllEvents(frontendEvents);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, societeId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const toggleCalendar = useCallback((id: string): void => {
    setCalendars((prev) =>
      prev.map((cal) =>
        cal.id === id ? { ...cal, isVisible: !cal.isVisible } : cal
      )
    );
  }, []);

  const handlePreviousWeek = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  const handleNextWeek = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  const handleToday = useCallback((): void => {
    setCurrentDate(new Date());
  }, []);

  // ✅ CORRIGÉ : Créer événement avec date choisie
  const handleCreateEvent = useCallback((): void => {
    setSelectedEvent(null);
    setNewEventDate(currentDate);  // ← Utiliser currentDate
    setIsCreatingNewEvent(true);
    setShowEventModal(true);
  }, [currentDate]);

  const handleEventClick = useCallback((event: CalendarEvent): void => {
    setSelectedEvent(event);
    setNewEventDate(null);
    setIsCreatingNewEvent(false);
    setShowEventModal(true);
  }, []);

  // ✅ CORRIGÉ : Créer événement à la date/heure cliquée
  const handleTimeSlotClick = useCallback((date: Date, hour: number): void => {
    console.log('🕐 Clic créneau:', { date: date.toString(), hour });
    
    // Créer date avec l'heure cliquée
    const eventDate = new Date(date);
    eventDate.setHours(hour, 0, 0, 0);
    
    setNewEventDate(eventDate);  // ← Date précise
    setSelectedEvent(null);
    setIsCreatingNewEvent(true);
    setShowEventModal(true);
  }, []);

  // ✅ CORRIGÉ : Sélectionner date dans mini calendrier
  const handleDateSelect = useCallback((date: Date): void => {
    console.log('📅 Date sélectionnée:', date.toString());
    setCurrentDate(date);
  }, []);

  // ✅ CORRIGÉ : Utiliser newEventDate pour création
  const handleSaveEvent = useCallback(async (event: CalendarEvent): Promise<void> => {
    try {
      if (isCreatingNewEvent) {
        // ✅ CORRECTION : Utiliser newEventDate si disponible
        const eventToCreate = { ...event };
        if (newEventDate) {
          console.log('📆 Création événement pour date:', newEventDate.toString());
          
          // Garder les heures du formulaire, mais utiliser la date choisie
          const startHours = eventToCreate.startTime.getHours();
          const startMinutes = eventToCreate.startTime.getMinutes();
          const endHours = eventToCreate.endTime.getHours();
          const endMinutes = eventToCreate.endTime.getMinutes();
          
          eventToCreate.startTime = new Date(newEventDate);
          eventToCreate.startTime.setHours(startHours, startMinutes, 0, 0);
          
          eventToCreate.endTime = new Date(newEventDate);
          eventToCreate.endTime.setHours(endHours, endMinutes, 0, 0);
        }
        
        const apiData = convertFrontendEventToAPI(eventToCreate, societeId, societeId);
        console.log('📤 Envoi API:', apiData);
        
        const eventId = await createCalendarEvent(apiData);
        console.log('✅ Événement créé:', eventId);
      } else {
        const apiData = convertFrontendEventToAPI(event, societeId, societeId);
        await updateCalendarEvent(Number(event.id), societeId, apiData);
        console.log('✅ Événement modifié:', event.id);
      }

      await loadEvents();
      setNewEventDate(null);  // Reset
    } catch (error) {
      console.error('Erreur sauvegarde événement:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }, [isCreatingNewEvent, societeId, loadEvents, newEventDate]);

  const handleDeleteEvent = useCallback(async (eventId: string): Promise<void> => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await deleteCalendarEvent(Number(eventId), societeId);
      console.log('✅ Événement supprimé:', eventId);
      await loadEvents();
    } catch (error) {
      console.error('Erreur suppression événement:', error);
      alert('Erreur lors de la suppression');
    }
  }, [societeId, loadEvents]);

  const handleInviteClick = (eventId: string) => {
    setSelectedEventId(Number(eventId));
    setShowInviteModal(true);
  };

  const handleInvite = async (
    eventId: number,
    societeIds: number[],
    method: 'email' | 'sms' | 'push' | 'contact'
  ) => {
    try {
      await inviteArtisans(eventId, societeIds, method);
      alert(`${societeIds.length} société(s) invitée(s) par ${method}`);
      setShowInviteModal(false);
    } catch (error) {
      console.error('Erreur invitation:', error);
      alert('Erreur lors de l\'envoi des invitations');
    }
  };

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
      <CalendarSidebar
        currentDate={currentDate}
        calendars={calendars}
        onToggleCalendar={toggleCalendar}
        onCreateEvent={handleCreateEvent}
        onDateSelect={handleDateSelect}
      />

      <div className="calendar-main">
        <div className="calendar-header">
          <div className="calendar-header-left">
            <button className="calendar-hamburger" title="Menu">
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
            <button className="calendar-btn-search" title="Rechercher">
              <i className="fas fa-search"></i>
            </button>
            <button className="calendar-btn-help" title="Aide">
              <i className="fas fa-question-circle"></i>
            </button>
            <button className="calendar-btn-settings" title="Paramètres">
              <i className="fas fa-cog"></i>
            </button>
            
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

            <button className="calendar-btn-apps" title="Applications">
              <i className="fas fa-th-large"></i>
            </button>
            <div className="calendar-user-avatar" title="Profil">
              F
            </div>
          </div>
        </div>

        {isLoading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', color: '#E77131' }}></i>
            <p>Chargement des événements...</p>
          </div>
        )}

        {!isLoading && viewType === 'week' && (
          <CalendarWeekView
            currentDate={currentDate}
            events={allEvents}
            visibleCalendars={visibleCalendarIds}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}

        {!isLoading && viewType === 'month' && (
          <CalendarMonthView
            currentDate={currentDate}
            events={allEvents}
            visibleCalendars={visibleCalendarIds}
            onEventClick={handleEventClick}
            onDateClick={handleDateSelect}
          />
        )}
      </div>

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

      <CalendarEventModal
        onInvite={handleInviteClick}
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
          setIsCreatingNewEvent(false);
          setNewEventDate(null);  // ← Reset
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        isNewEvent={isCreatingNewEvent}
      />

      <InviteAttendeesModal
        isOpen={showInviteModal}
        eventId={selectedEventId!}
        societeId={societeId}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />
    </div>
  );
};

export default GoogleCalendar;
