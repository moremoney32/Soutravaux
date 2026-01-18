
// GoogleCalendar.tsx 

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/GoogleCalendar.css';
import type { Calendar, CalendarEvent, ViewType, EventCategory } from '../types/calendar';
import CalendarWeekView from './CalendarWeekView';
import CalendarMonthView from './CalendarMonthView';
import CalendarEventModal from './CalendarEventModal';
import CalendarSidebar from './CalendarSidebar';
import InviteAttendeesModal from './InvitesAttentesModal';
import {
  fetchEvents,
  fetchCategories,
  createCategory,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  inviteCollaboratorsByEmail,  // ✅ NOUVEAU: Invitations par email
  convertAPIEventToFrontend,
  convertFrontendEventToAPI
} from '../services/calendarApi';
import CalendarDayView from './CalendarDayView';

const mockCalendars: Calendar[] = [
  { id: 'personal', name: 'Personnel', color: '#E77131', isVisible: true },
  { id: 'work', name: 'Travail', color: '#FF6B35', isVisible: true },
  { id: 'meetings', name: 'Réunions', color: '#F4A460', isVisible: true }
];

const GoogleCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>('day');
  const [calendars, setCalendars] = useState<Calendar[]>(mockCalendars);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [isCreatingNewEvent, setIsCreatingNewEvent] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  
  // ✅ NOUVEAU : État des catégories
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  console.log(isLoadingCategories)

  const { societeId: societeIdParam } = useParams<{ societeId: string }>();
  const societeId = Number(societeIdParam);
  if (societeIdParam) {
    localStorage.setItem('societeId', societeIdParam);
  }

  const visibleCalendarIds = useMemo(
    () => calendars.filter((cal) => cal.isVisible).map((cal) => cal.id),
    [calendars]
  );

  const handlePrevious = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewType === 'day') {
        newDate.setDate(newDate.getDate() - 1);
      } else if (viewType === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
    });
  }, [viewType]);

  const handleNext = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewType === 'day') {
        newDate.setDate(newDate.getDate() + 1);
      } else if (viewType === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, [viewType]);

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

      setAllEvents(frontendEvents);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, societeId]);

  // ✅ NOUVEAU : Charger les catégories au démarrage
  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const fetchedCategories = await fetchCategories(societeId);
      setCategories(fetchedCategories);
      console.log('✅ Catégories chargées:', fetchedCategories);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [societeId]);

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [loadEvents, loadCategories]);

  // ✅ NOUVEAU : Handler pour créer une catégorie
  const handleCreateCategory = useCallback(async (
    label: string,
    icon?: string,
    color?: string,
    requires_location?: boolean
  ): Promise<EventCategory> => {
    try {
      const newCategory = await createCategory(societeId, label, icon, color, requires_location);
      setCategories(prev => [...prev, newCategory]);
      console.log('✅ Catégorie créée:', newCategory);
      return newCategory;
    } catch (error) {
      console.error('Erreur création catégorie:', error);
      throw error;
    }
  }, [societeId]);

  const toggleCalendar = useCallback((id: string): void => {
    setCalendars((prev) =>
      prev.map((cal) =>
        cal.id === id ? { ...cal, isVisible: !cal.isVisible } : cal
      )
    );
  }, []);

  const handleToday = useCallback((): void => {
    setCurrentDate(new Date());
  }, []);

  const handleCreateEvent = useCallback((): void => {
    setSelectedEvent(null);
    setNewEventDate(currentDate);
    setIsCreatingNewEvent(true);
    setShowEventModal(true);
  }, [currentDate]);

  const handleEventClick = useCallback((event: CalendarEvent): void => {
    setSelectedEvent(event);
    setNewEventDate(null);
    setIsCreatingNewEvent(false);
    setShowEventModal(true);
  }, []);

  const handleTimeSlotClick = useCallback((date: Date, hour: number): void => {
    const eventDate = new Date(date);
    eventDate.setHours(hour, 0, 0, 0);

    setNewEventDate(eventDate);
    setSelectedEvent(null);
    setIsCreatingNewEvent(true);
    setShowEventModal(true);
  }, []);

  const handleDateSelect = useCallback((date: Date): void => {
    setCurrentDate(date);
  }, []);

  const handleSaveEvent = useCallback(async (event: CalendarEvent): Promise<void> => {
    try {
      if (isCreatingNewEvent) {
        const eventToCreate = { ...event };
        if (newEventDate) {
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
        await createCalendarEvent(apiData);
      } else {
        const apiData = convertFrontendEventToAPI(event, societeId, societeId);
        await updateCalendarEvent(Number(event.id), societeId, apiData);
      }

      await loadEvents();
      setNewEventDate(null);
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
      await loadEvents();
    } catch (error) {
      console.error('Erreur suppression événement:', error);
      alert('Erreur lors de la suppression');
    }
  }, [societeId, loadEvents]);

  // ════════════════════════════════════════════════
  // ✅ CORRECTION 2 : Handlers Invitations
  // ════════════════════════════════════════════════

  // Handler pour CalendarEventModal (invitations depuis la modal événement)
  const handleInviteFromModal = async (emails: string[]): Promise<void> => {
    try {
      console.log('📧 [GoogleCalendar] handleInviteFromModal appelé avec emails:', emails);
      console.log('   eventId:', selectedEventId);
      
      // ✅ Appeler directement inviteCollaboratorsByEmail avec les emails
      await inviteCollaboratorsByEmail(Number(selectedEventId), emails);
      
      alert(`${emails.length} collaborateur(s) invité(s) par email`);
      setShowInviteModal(false);
      
    } catch (error) {
      console.error('Erreur invitation:', error);
      throw error;
    }
  };

  // Handler pour InviteAttendeesModal standalone (depuis liste événements)
  const handleInviteStandalone = async (emails: string[]): Promise<void> => {
    if (!selectedEventId) return;

    try {
      const eventIdNum = Number(selectedEventId);
      
      await inviteCollaboratorsByEmail(eventIdNum, emails);
      
      alert(`${emails.length} collaborateur(s) invité(s)`);
      setShowInviteModal(false);
      setSelectedEventId(null);
      
      await loadEvents(); // Recharger pour voir les mises à jour
    } catch (error) {
      console.error('Erreur invitation:', error);
      alert('Erreur lors de l\'envoi des invitations');
    }
  };

  // ✅ CORRECTION 3 : Handler obsolète (gardé pour rétrocompatibilité)
  // const handleInvite = async (
  //   eventId: number,
  //   societeIds: number[],
  //   method: 'email' | 'sms' | 'push' | 'contact'
  // ) => {
  //   try {
  //     await inviteArtisans(eventId, societeIds, method);
  //     alert(`${societeIds.length} société(s) invitée(s) par ${method}`);
  //     setShowInviteModal(false);
  //   } catch (error) {
  //     console.error('Erreur invitation:', error);
  //     alert('Erreur lors de l\'envoi des invitations');
  //   }
  // };

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
            {/* <button className="calendar-hamburger" title="Menu">
              <i className="fas fa-bars"></i>
            </button> */}
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
                onClick={handlePrevious}
                title="Précédent"
                className="calendar-nav-btn"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                onClick={handleNext}
                title="Suivant"
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
            {/* <button className="calendar-btn-search" title="Rechercher">
              <i className="fas fa-search"></i>
            </button>
            <button className="calendar-btn-help" title="Aide">
              <i className="fas fa-question-circle"></i>
            </button>
            <button className="calendar-btn-settings" title="Paramètres">
              <i className="fas fa-cog"></i>
            </button> */}

            <div className="calendar-view-dropdown">
              <select 
                className="calendar-view-select"
                value={viewType}
                onChange={(e) => setViewType(e.target.value as ViewType)}
              >
                <option value="day">Jour</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </select>
              <i className="fas fa-chevron-down"></i>
            </div>

            {/* <button className="calendar-btn-apps" title="Applications">
              <i className="fas fa-th-large"></i>
            </button> */}
            {/* <div className="calendar-user-avatar" title="Profil">
              F
            </div> */}
          </div>
        </div>

        {!isLoading && viewType === 'day' && (
          <CalendarDayView
            currentDate={currentDate}
            events={allEvents}
            visibleCalendars={visibleCalendarIds}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
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
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}
      </div>

      {/* <div className="calendar-sidebar-right">
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
      </div> */}

      {/* ════════════════════════════════════════════════ */}
      {/* ✅ MODAL ÉVÉNEMENT (CORRIGÉE)                    */}
      {/* ════════════════════════════════════════════════ */}
      <CalendarEventModal
        onInvite={handleInviteFromModal}
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
          setIsCreatingNewEvent(false);
          setNewEventDate(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        isNewEvent={isCreatingNewEvent}
        categories={categories}
        onFetchCategories={loadCategories}
        onCreateCategory={handleCreateCategory}
      />

      {/* ════════════════════════════════════════════════ */}
      {/* ✅ MODAL INVITATIONS STANDALONE (CORRIGÉE)       */}
      {/* ════════════════════════════════════════════════ */}
      {showInviteModal && selectedEventId && (
        <InviteAttendeesModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedEventId(null);
          }}
          onInvite={handleInviteStandalone}  // ✅ (emails: string[]) => Promise<void>
          initialSelectedEmails={[]}
        />
      )}
    </div>
  );
};

export default GoogleCalendar;
