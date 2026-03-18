
// GoogleCalendar.tsx - VERSION AVEC COLLABORATEURS + MEMBRE_ID

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
  inviteCollaboratorsByEmail,
  convertAPIEventToFrontend,
  convertFrontendEventToAPI,
  fetchCollaborators
} from '../services/calendarApi';
import CalendarDayView from './CalendarDayView';

const mockCalendars: Calendar[] = [
  { id: 'personal', name: 'Personnel', color: '#E77131', isVisible: true },
  { id: 'work', name: 'Travail', color: '#FF6B35', isVisible: true },
  { id: 'meetings', name: 'Réunions', color: '#F4A460', isVisible: true }
];

interface Collaborator {
  id: number;
  membre_id: number;
  email: string;
  nom: string;
  prenom: string;
  poste_id: bigint;
  societe_id: number;
  assigned_at: string;
  expires_at: string | null;
}

const GoogleCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [calendars, setCalendars] = useState<Calendar[]>(mockCalendars);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [isCreatingNewEvent, setIsCreatingNewEvent] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  
  // Catégories
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  console.log(isLoadingCategories)

  // ✅ NOUVEAU : États collaborateurs
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<number[]>([]);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'collaborator' | null>(null);

  // ✅ MODIFIÉ : Récupérer societeId ET membreId depuis URL
  const { societeId: societeIdParam, membreId: membreIdParam } = useParams<{ 
    societeId: string;
    membreId: string;
  }>();
  
  const societeId = Number(societeIdParam);
  const membreId = Number(membreIdParam);

  // Sauvegarder en localStorage
  if (societeIdParam && membreIdParam) {
    localStorage.setItem('societeId', societeIdParam);
    localStorage.setItem('membreId', membreIdParam);
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

    // ✅ LOGIQUE MODIFIÉE
    let targetMembreId = membreId;  // Par défaut : événements de l'utilisateur connecté
    
    // ✅ Si admin ET collaborateur(s) sélectionné(s)
    if (userRole === 'admin' && selectedCollaboratorIds.length > 0) {
      
      console.log('👑 Admin avec collaborateurs sélectionnés:', selectedCollaboratorIds);
      
      // Option A : Charger TOUS les événements des collaborateurs sélectionnés
      // (Nécessite modification backend pour accepter plusieurs IDs)
      
      // Option B : Charger seulement pour le PREMIER collaborateur sélectionné
      targetMembreId = selectedCollaboratorIds[0];
      
      console.log(`📅 Chargement agenda du collaborateur ${targetMembreId}`);
      
    } else {
      console.log(`📅 Chargement agenda personnel (membre ${membreId})`);
    }

    const apiEvents = await fetchEvents(societeId, targetMembreId, startDate, endDate);
    const frontendEvents = apiEvents.map(convertAPIEventToFrontend);

    setAllEvents(frontendEvents);
    
  } catch (error) {
    console.error('Erreur chargement événements:', error);
  } finally {
    setIsLoading(false);
  }
}, [currentDate, societeId, membreId, userRole, selectedCollaboratorIds]);

  // ✅ NOUVEAU : Charger collaborateurs (seulement si admin)
  const loadCollaborators = useCallback(async () => {
    setIsLoadingCollaborators(true);
    try {
      const fetchedCollaborators = await fetchCollaborators(societeId);
      setCollaborators(fetchedCollaborators);
      console.log('✅ Collaborateurs chargés:', fetchedCollaborators);
    } catch (error) {
      console.error('Erreur chargement collaborateurs:', error);
    } finally {
      setIsLoadingCollaborators(false);
    }
  }, [societeId]);

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

  // ✅ NOUVEAU : Détecter rôle au chargement initial
  useEffect(() => {
    const detectRole = async () => {
      try {
        // Charger événements pour détecter le rôle
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + 14);

        const startDate = weekStart.toISOString().split('T')[0];
        const endDate = weekEnd.toISOString().split('T')[0];

        const response = await fetch(
          `https://staging.solutravo.zeta-app.fr/api/calendar/events?societe_id=${societeId}&membre_id=${membreId}&start_date=${startDate}&end_date=${endDate}`
        );
        const result = await response.json();

        if (result.success && result.role) {
          setUserRole(result.role);
          console.log('👤 Rôle détecté:', result.role);

          // Si admin, charger collaborateurs
          if (result.role === 'admin') {
            loadCollaborators();
          }
        }
      } catch (error) {
        console.error('Erreur détection rôle:', error);
      }
    };

    detectRole();
  }, [societeId, membreId, loadCollaborators]);

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [loadEvents, loadCategories]);

  // ✅ NOUVEAU : Toggle collaborateur

// ✅ MODIFIÉ : Un seul collaborateur à la fois
const handleToggleCollaborator = useCallback((collaboratorId: number) => {
  setSelectedCollaboratorIds(prev => {
    // Si on clique sur celui déjà sélectionné → désélectionner (retour à sa propre vue)
    if (prev.includes(collaboratorId)) {
      return [];  // ✅ Vide = retour à ses propres événements
    } else {
      return [collaboratorId];  // ✅ Un seul à la fois
    }
  });
}, []);

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

        // ✅ MODIFIÉ : Passer membreId
        const apiData = convertFrontendEventToAPI(eventToCreate, societeId, membreId);
        await createCalendarEvent(apiData);
      } else {
        // ✅ MODIFIÉ : Passer membreId
        const apiData = convertFrontendEventToAPI(event, societeId, membreId);
        await updateCalendarEvent(Number(event.id), societeId, membreId, apiData);
      }

      await loadEvents();
      setNewEventDate(null);
    } catch (error) {
      console.error('Erreur sauvegarde événement:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }, [isCreatingNewEvent, societeId, membreId, loadEvents, newEventDate]);

  const handleDeleteEvent = useCallback(async (eventId: string): Promise<void> => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      // ✅ MODIFIÉ : Passer membreId
      await deleteCalendarEvent(Number(eventId), societeId, membreId);
      await loadEvents();
    } catch (error) {
      console.error('Erreur suppression événement:', error);
      alert('Erreur lors de la suppression');
    }
  }, [societeId, membreId, loadEvents]);

  const handleInviteFromModal = async (emails: string[]): Promise<void> => {
    try {
      console.log('📧 [GoogleCalendar] handleInviteFromModal appelé avec emails:', emails);
      console.log('   eventId:', selectedEventId);
      
      await inviteCollaboratorsByEmail(Number(selectedEventId), emails);
      
      alert(`${emails.length} collaborateur(s) invité(s) par email`);
      setShowInviteModal(false);
      
    } catch (error) {
      console.error('Erreur invitation:', error);
      throw error;
    }
  };

  const handleInviteStandalone = async (emails: string[]): Promise<void> => {
    if (!selectedEventId) return;

    try {
      const eventIdNum = Number(selectedEventId);
      
      await inviteCollaboratorsByEmail(eventIdNum, emails);
      
      alert(`${emails.length} collaborateur(s) invité(s)`);
      setShowInviteModal(false);
      setSelectedEventId(null);
      
      await loadEvents();
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
        // ✅ NOUVEAU : Passer props collaborateurs
        collaborators={collaborators}
        selectedCollaboratorIds={selectedCollaboratorIds}
        onToggleCollaborator={handleToggleCollaborator}
        isLoadingCollaborators={isLoadingCollaborators}
        userRole={userRole}
      />

      <div className="calendar-main">
        <div className="calendar-header">
          <div className="calendar-header-left">
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
             {userRole === 'admin' && selectedCollaboratorIds.length > 0 && (
    <div style={{
      padding: '8px 16px',
      background: '#E8F5E9',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: 500,
      color: '#2E7D32',
      marginRight: '12px'
    }}>
      👁️ Vue : {collaborators.find(c => c.membre_id === selectedCollaboratorIds[0])?.prenom || 'Collaborateur'}
    </div>
  )}
            <div className="calendar-view-dropdown">
              <select 
                className="calendar-view-select"
                value={viewType}
                onChange={(e) => setViewType(e.target.value as ViewType)}
              >
                <option value="week">Semaine</option>
                <option value="day">Jour</option>
                <option value="month">Mois</option>
              </select>
              <i className="fas fa-chevron-down"></i>
            </div>
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
          currentMembreId={membreId}
      />

      {showInviteModal && selectedEventId && (
        <InviteAttendeesModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedEventId(null);
          }}
          onInvite={handleInviteStandalone}
          initialSelectedEmails={[]}
        />
      )}
    </div>
  );
};

export default GoogleCalendar;
