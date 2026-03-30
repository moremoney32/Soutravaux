
// // GoogleCalendar.tsx - VERSION AVEC COLLABORATEURS + MEMBRE_ID

// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import '../styles/GoogleCalendar.css';
// import type { Calendar, CalendarEvent, ViewType, EventCategory } from '../types/calendar';
// import CalendarWeekView from './CalendarWeekView';
// import CalendarMonthView from './CalendarMonthView';
// import CalendarEventModal from './CalendarEventModal';
// import CalendarSidebar from './CalendarSidebar';
// import InviteAttendeesModal from './InvitesAttentesModal';
// import {
//   fetchEvents,
//   fetchCategories,
//   createCategory,
//   createCalendarEvent,
//   updateCalendarEvent,
//   deleteCalendarEvent,
//   inviteCollaboratorsByEmail,
//   convertAPIEventToFrontend,
//   convertFrontendEventToAPI,
//   fetchCollaborators
// } from '../services/calendarApi';
// import CalendarDayView from './CalendarDayView';

// const mockCalendars: Calendar[] = [
//   { id: 'personal', name: 'Personnel', color: '#E77131', isVisible: true },
//   { id: 'work', name: 'Travail', color: '#FF6B35', isVisible: true },
//   { id: 'meetings', name: 'Réunions', color: '#F4A460', isVisible: true }
// ];

// interface Collaborator {
//   id: number;
//   membre_id: number;
//   email: string;
//   nom: string;
//   prenom: string;
//   poste_id: bigint;
//   societe_id: number;
//   assigned_at: string;
//   expires_at: string | null;
// }

// const GoogleCalendar: React.FC = () => {
//   const [currentDate, setCurrentDate] = useState<Date>(new Date());
//   const [viewType, setViewType] = useState<ViewType>('week');
//   const [calendars, setCalendars] = useState<Calendar[]>(mockCalendars);
//   const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
//   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
//   const [showEventModal, setShowEventModal] = useState<boolean>(false);
//   const [isCreatingNewEvent, setIsCreatingNewEvent] = useState<boolean>(false);
//   const [showInviteModal, setShowInviteModal] = useState(false);
//   const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  
//   // Catégories
//   const [categories, setCategories] = useState<EventCategory[]>([]);
//   const [isLoadingCategories, setIsLoadingCategories] = useState(false);
//   console.log(isLoadingCategories)

//   // ✅ NOUVEAU : États collaborateurs
//   const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
//   const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<number[]>([]);
//   const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
//   const [userRole, setUserRole] = useState<'admin' | 'collaborator' | null>(null);

//   // ✅ MODIFIÉ : Récupérer societeId ET membreId depuis URL
//   const { societeId: societeIdParam, membreId: membreIdParam } = useParams<{ 
//     societeId: string;
//     membreId: string;
//   }>();
  
//   const societeId = Number(societeIdParam);
//   const membreId = Number(membreIdParam);

//   // Sauvegarder en localStorage
//   if (societeIdParam && membreIdParam) {
//     localStorage.setItem('societeId', societeIdParam);
//     localStorage.setItem('membreId', membreIdParam);
//   }

//   const visibleCalendarIds = useMemo(
//     () => calendars.filter((cal) => cal.isVisible).map((cal) => cal.id),
//     [calendars]
//   );

//   const handlePrevious = useCallback((): void => {
//     setCurrentDate((prev) => {
//       const newDate = new Date(prev);
//       if (viewType === 'day') {
//         newDate.setDate(newDate.getDate() - 1);
//       } else if (viewType === 'week') {
//         newDate.setDate(newDate.getDate() - 7);
//       } else {
//         newDate.setMonth(newDate.getMonth() - 1);
//       }
//       return newDate;
//     });
//   }, [viewType]);

//   const handleNext = useCallback((): void => {
//     setCurrentDate((prev) => {
//       const newDate = new Date(prev);
//       if (viewType === 'day') {
//         newDate.setDate(newDate.getDate() + 1);
//       } else if (viewType === 'week') {
//         newDate.setDate(newDate.getDate() + 7);
//       } else {
//         newDate.setMonth(newDate.getMonth() + 1);
//       }
//       return newDate;
//     });
//   }, [viewType]);


// const loadEvents = useCallback(async () => {
//   setIsLoading(true);
//   try {
//     const weekStart = new Date(currentDate);
//     weekStart.setDate(weekStart.getDate() - 7);
//     const weekEnd = new Date(currentDate);
//     weekEnd.setDate(weekEnd.getDate() + 14);

//     const startDate = weekStart.toISOString().split('T')[0];
//     const endDate = weekEnd.toISOString().split('T')[0];

//     // ✅ LOGIQUE MODIFIÉE
//     let targetMembreId = membreId;  // Par défaut : événements de l'utilisateur connecté
    
//     // ✅ Si admin ET collaborateur(s) sélectionné(s)
//     if (userRole === 'admin' && selectedCollaboratorIds.length > 0) {
      
//       console.log('👑 Admin avec collaborateurs sélectionnés:', selectedCollaboratorIds);
      
//       // Option A : Charger TOUS les événements des collaborateurs sélectionnés
//       // (Nécessite modification backend pour accepter plusieurs IDs)
      
//       // Option B : Charger seulement pour le PREMIER collaborateur sélectionné
//       targetMembreId = selectedCollaboratorIds[0];
      
//       console.log(`📅 Chargement agenda du collaborateur ${targetMembreId}`);
      
//     } else {
//       console.log(`📅 Chargement agenda personnel (membre ${membreId})`);
//     }

//     const apiEvents = await fetchEvents(societeId, targetMembreId, startDate, endDate);
//     const frontendEvents = apiEvents.map(convertAPIEventToFrontend);

//     setAllEvents(frontendEvents);
    
//   } catch (error) {
//     console.error('Erreur chargement événements:', error);
//   } finally {
//     setIsLoading(false);
//   }
// }, [currentDate, societeId, membreId, userRole, selectedCollaboratorIds]);

//   // ✅ NOUVEAU : Charger collaborateurs (seulement si admin)
//   const loadCollaborators = useCallback(async () => {
//     setIsLoadingCollaborators(true);
//     try {
//       const fetchedCollaborators = await fetchCollaborators(societeId);
//       setCollaborators(fetchedCollaborators);
//       console.log('✅ Collaborateurs chargés:', fetchedCollaborators);
//     } catch (error) {
//       console.error('Erreur chargement collaborateurs:', error);
//     } finally {
//       setIsLoadingCollaborators(false);
//     }
//   }, [societeId]);

//   const loadCategories = useCallback(async () => {
//     setIsLoadingCategories(true);
//     try {
//       const fetchedCategories = await fetchCategories(societeId);
//       setCategories(fetchedCategories);
//       console.log('✅ Catégories chargées:', fetchedCategories);
//     } catch (error) {
//       console.error('Erreur chargement catégories:', error);
//     } finally {
//       setIsLoadingCategories(false);
//     }
//   }, [societeId]);

//   // ✅ NOUVEAU : Détecter rôle au chargement initial
//   useEffect(() => {
//     const detectRole = async () => {
//       try {
//         // Charger événements pour détecter le rôle
//         const weekStart = new Date();
//         weekStart.setDate(weekStart.getDate() - 7);
//         const weekEnd = new Date();
//         weekEnd.setDate(weekEnd.getDate() + 14);

//         const startDate = weekStart.toISOString().split('T')[0];
//         const endDate = weekEnd.toISOString().split('T')[0];

//         const response = await fetch(
//           `https://staging.solutravo.zeta-app.fr/api/calendar/events?societe_id=${societeId}&membre_id=${membreId}&start_date=${startDate}&end_date=${endDate}`
//         );
//         const result = await response.json();

//         if (result.success && result.role) {
//           setUserRole(result.role);
//           console.log('👤 Rôle détecté:', result.role);

//           // Si admin, charger collaborateurs
//           if (result.role === 'admin') {
//             loadCollaborators();
//           }
//         }
//       } catch (error) {
//         console.error('Erreur détection rôle:', error);
//       }
//     };

//     detectRole();
//   }, [societeId, membreId, loadCollaborators]);

//   useEffect(() => {
//     loadEvents();
//     loadCategories();
//   }, [loadEvents, loadCategories]);

//   // ✅ NOUVEAU : Toggle collaborateur

// // ✅ MODIFIÉ : Un seul collaborateur à la fois
// const handleToggleCollaborator = useCallback((collaboratorId: number) => {
//   setSelectedCollaboratorIds(prev => {
//     // Si on clique sur celui déjà sélectionné → désélectionner (retour à sa propre vue)
//     if (prev.includes(collaboratorId)) {
//       return [];  // ✅ Vide = retour à ses propres événements
//     } else {
//       return [collaboratorId];  // ✅ Un seul à la fois
//     }
//   });
// }, []);

//   const handleCreateCategory = useCallback(async (
//     label: string,
//     icon?: string,
//     color?: string,
//     requires_location?: boolean
//   ): Promise<EventCategory> => {
//     try {
//       const newCategory = await createCategory(societeId, label, icon, color, requires_location);
//       setCategories(prev => [...prev, newCategory]);
//       console.log('✅ Catégorie créée:', newCategory);
//       return newCategory;
//     } catch (error) {
//       console.error('Erreur création catégorie:', error);
//       throw error;
//     }
//   }, [societeId]);

//   const toggleCalendar = useCallback((id: string): void => {
//     setCalendars((prev) =>
//       prev.map((cal) =>
//         cal.id === id ? { ...cal, isVisible: !cal.isVisible } : cal
//       )
//     );
//   }, []);

//   const handleToday = useCallback((): void => {
//     setCurrentDate(new Date());
//   }, []);

//   const handleCreateEvent = useCallback((): void => {
//     setSelectedEvent(null);
//     setNewEventDate(currentDate);
//     setIsCreatingNewEvent(true);
//     setShowEventModal(true);
//   }, [currentDate]);

//   const handleEventClick = useCallback((event: CalendarEvent): void => {
//     setSelectedEvent(event);
//     setNewEventDate(null);
//     setIsCreatingNewEvent(false);
//     setShowEventModal(true);
//   }, []);

//   const handleTimeSlotClick = useCallback((date: Date, hour: number): void => {
//     const eventDate = new Date(date);
//     eventDate.setHours(hour, 0, 0, 0);

//     setNewEventDate(eventDate);
//     setSelectedEvent(null);
//     setIsCreatingNewEvent(true);
//     setShowEventModal(true);
//   }, []);

//   const handleDateSelect = useCallback((date: Date): void => {
//     setCurrentDate(date);
//   }, []);

//   const handleSaveEvent = useCallback(async (event: CalendarEvent): Promise<void> => {
//     try {
//       if (isCreatingNewEvent) {
//         const eventToCreate = { ...event };
//         if (newEventDate) {
//           const startHours = eventToCreate.startTime.getHours();
//           const startMinutes = eventToCreate.startTime.getMinutes();
//           const endHours = eventToCreate.endTime.getHours();
//           const endMinutes = eventToCreate.endTime.getMinutes();

//           eventToCreate.startTime = new Date(newEventDate);
//           eventToCreate.startTime.setHours(startHours, startMinutes, 0, 0);

//           eventToCreate.endTime = new Date(newEventDate);
//           eventToCreate.endTime.setHours(endHours, endMinutes, 0, 0);
//         }

//         // ✅ MODIFIÉ : Passer membreId
//         const apiData = convertFrontendEventToAPI(eventToCreate, societeId, membreId);
//         await createCalendarEvent(apiData);
//       } else {
//         // ✅ MODIFIÉ : Passer membreId
//         const apiData = convertFrontendEventToAPI(event, societeId, membreId);
//         await updateCalendarEvent(Number(event.id), societeId, membreId, apiData);
//       }

//       await loadEvents();
//       setNewEventDate(null);
//     } catch (error) {
//       console.error('Erreur sauvegarde événement:', error);
//       alert('Erreur lors de la sauvegarde');
//     }
//   }, [isCreatingNewEvent, societeId, membreId, loadEvents, newEventDate]);

//   const handleDeleteEvent = useCallback(async (eventId: string): Promise<void> => {
//     if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
//       return;
//     }

//     try {
//       // ✅ MODIFIÉ : Passer membreId
//       await deleteCalendarEvent(Number(eventId), societeId, membreId);
//       await loadEvents();
//     } catch (error) {
//       console.error('Erreur suppression événement:', error);
//       alert('Erreur lors de la suppression');
//     }
//   }, [societeId, membreId, loadEvents]);

//   const handleInviteFromModal = async (emails: string[]): Promise<void> => {
//     try {
//       console.log('📧 [GoogleCalendar] handleInviteFromModal appelé avec emails:', emails);
//       console.log('   eventId:', selectedEventId);
      
//       await inviteCollaboratorsByEmail(Number(selectedEventId), emails);
      
//       alert(`${emails.length} collaborateur(s) invité(s) par email`);
//       setShowInviteModal(false);
      
//     } catch (error) {
//       console.error('Erreur invitation:', error);
//       throw error;
//     }
//   };

//   const handleInviteStandalone = async (emails: string[]): Promise<void> => {
//     if (!selectedEventId) return;

//     try {
//       const eventIdNum = Number(selectedEventId);
      
//       await inviteCollaboratorsByEmail(eventIdNum, emails);
      
//       alert(`${emails.length} collaborateur(s) invité(s)`);
//       setShowInviteModal(false);
//       setSelectedEventId(null);
      
//       await loadEvents();
//     } catch (error) {
//       console.error('Erreur invitation:', error);
//       alert('Erreur lors de l\'envoi des invitations');
//     }
//   };

//   const formatDateRange = (): string => {
//     const weekStart = new Date(currentDate);
//     weekStart.setDate(weekStart.getDate() - (weekStart.getDay() || 7) + 1);
//     const weekEnd = new Date(weekStart);
//     weekEnd.setDate(weekEnd.getDate() + 6);

//     const startMonth = weekStart.toLocaleDateString('fr-FR', {
//       month: 'long',
//       year: 'numeric'
//     });
//     const endMonth = weekEnd.toLocaleDateString('fr-FR', {
//       month: 'long',
//       year: 'numeric'
//     });

//     return startMonth === endMonth
//       ? startMonth
//       : `${startMonth} - ${endMonth}`;
//   };

//   return (
//     <div className="calendar-container">
//       <CalendarSidebar
//         currentDate={currentDate}
//         calendars={calendars}
//         onToggleCalendar={toggleCalendar}
//         onCreateEvent={handleCreateEvent}
//         onDateSelect={handleDateSelect}
//         // ✅ NOUVEAU : Passer props collaborateurs
//         collaborators={collaborators}
//         selectedCollaboratorIds={selectedCollaboratorIds}
//         onToggleCollaborator={handleToggleCollaborator}
//         isLoadingCollaborators={isLoadingCollaborators}
//         userRole={userRole}
//       />

//       <div className="calendar-main">
//         <div className="calendar-header">
//           <div className="calendar-header-left">
//             <div className="calendar-logo">
//               <i className="fas fa-calendar"></i>
//               <span>Agenda</span>
//             </div>
//           </div>

//           <div className="calendar-header-center">
//             <button
//               className="calendar-btn-today"
//               onClick={handleToday}
//               title="Aller à aujourd'hui"
//             >
//               Aujourd'hui
//             </button>
//             <div className="calendar-navigation">
//               <button
//                 onClick={handlePrevious}
//                 title="Précédent"
//                 className="calendar-nav-btn"
//               >
//                 <i className="fas fa-chevron-left"></i>
//               </button>
//               <button
//                 onClick={handleNext}
//                 title="Suivant"
//                 className="calendar-nav-btn"
//               >
//                 <i className="fas fa-chevron-right"></i>
//               </button>
//             </div>
//             <span className="calendar-month-year">
//               {formatDateRange()}
//             </span>
//           </div>

//           <div className="calendar-header-right">
//              {userRole === 'admin' && selectedCollaboratorIds.length > 0 && (
//     <div style={{
//       padding: '8px 16px',
//       background: '#E8F5E9',
//       borderRadius: '6px',
//       fontSize: '13px',
//       fontWeight: 500,
//       color: '#2E7D32',
//       marginRight: '12px'
//     }}>
//       👁️ Vue : {collaborators.find(c => c.membre_id === selectedCollaboratorIds[0])?.prenom || 'Collaborateur'}
//     </div>
//   )}
//             <div className="calendar-view-dropdown">
//               <select 
//                 className="calendar-view-select"
//                 value={viewType}
//                 onChange={(e) => setViewType(e.target.value as ViewType)}
//               >
//                 <option value="week">Semaine</option>
//                 <option value="day">Jour</option>
//                 <option value="month">Mois</option>
//               </select>
//               <i className="fas fa-chevron-down"></i>
//             </div>
//           </div>
//         </div>

//         {!isLoading && viewType === 'day' && (
//           <CalendarDayView
//             currentDate={currentDate}
//             events={allEvents}
//             visibleCalendars={visibleCalendarIds}
//             onEventClick={handleEventClick}
//             onTimeSlotClick={handleTimeSlotClick}
//           />
//         )}

//         {!isLoading && viewType === 'week' && (
//           <CalendarWeekView
//             currentDate={currentDate}
//             events={allEvents}
//             visibleCalendars={visibleCalendarIds}
//             onEventClick={handleEventClick}
//             onTimeSlotClick={handleTimeSlotClick}
//           />
//         )}

//         {!isLoading && viewType === 'month' && (
//           <CalendarMonthView
//             currentDate={currentDate}
//             events={allEvents}
//             visibleCalendars={visibleCalendarIds}
//             onEventClick={handleEventClick}
//             onDateClick={handleDateSelect}
//             onTimeSlotClick={handleTimeSlotClick}
//           />
//         )}
//       </div>

//       <CalendarEventModal
//         onInvite={handleInviteFromModal}
//         event={selectedEvent}
//         isOpen={showEventModal}
//         onClose={() => {
//           setShowEventModal(false);
//           setSelectedEvent(null);
//           setIsCreatingNewEvent(false);
//           setNewEventDate(null);
//         }}
//         onSave={handleSaveEvent}
//         onDelete={handleDeleteEvent}
//         isNewEvent={isCreatingNewEvent}
//         categories={categories}
//         onFetchCategories={loadCategories}
//         onCreateCategory={handleCreateCategory}
//           currentMembreId={membreId}
//       />

//       {showInviteModal && selectedEventId && (
//         <InviteAttendeesModal
//           isOpen={showInviteModal}
//           onClose={() => {
//             setShowInviteModal(false);
//             setSelectedEventId(null);
//           }}
//           onInvite={handleInviteStandalone}
//           initialSelectedEmails={[]}
//         />
//       )}
//     </div>
//   );
// };

// export default GoogleCalendar;



// GoogleCalendar.tsx - VERSION AVEC FILTRES

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
  fetchCollaborators,
  inviterSocieteAPI
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

interface ActiveFilters {
  scopes: string[];
  statuts: string[];
  categoryIds: number[];
  periode: string;
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
  console.log(isLoadingCategories);

  // Collaborateurs
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<number[]>([]);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'collaborator' | null>(null);

  // Bottom sheet collaborateurs (mobile)
  const [showCollabSheet, setShowCollabSheet] = useState(false);

  // ✅ NOUVEAU : Filtres
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    scopes: [],
    statuts: [],
    categoryIds: [],
    periode: 'all'
  });

  const { societeId: societeIdParam, membreId: membreIdParam } = useParams<{
    societeId: string;
    membreId: string;
  }>();

  const societeId = Number(societeIdParam);
  const membreId = Number(membreIdParam);

  if (societeIdParam && membreIdParam) {
    localStorage.setItem('societeId', societeIdParam);
    localStorage.setItem('membreId', membreIdParam);
  }

  const visibleCalendarIds = useMemo(
    () => calendars.filter((cal) => cal.isVisible).map((cal) => cal.id),
    [calendars]
  );

  // ✅ Nombre de filtres actifs pour le badge
  const nombreFiltresActifs =
    activeFilters.scopes.length +
    activeFilters.statuts.length +
    activeFilters.categoryIds.length +
    (activeFilters.periode !== 'all' ? 1 : 0);

  // ✅ Événements filtrés
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {

      // ── Filtre scope ──────────────────────────────
      if (activeFilters.scopes.length > 0) {
        if (!activeFilters.scopes.includes(event.scope)) return false;
      }

      // ── Filtre statut ─────────────────────────────
      if (activeFilters.statuts.length > 0) {
        if (!activeFilters.statuts.includes(event.status)) return false;
      }

      // ── Filtre catégorie ──────────────────────────
      if (activeFilters.categoryIds.length > 0) {
        if (!event.event_category_id) return false;
        if (!activeFilters.categoryIds.includes(event.event_category_id)) return false;
      }

      // ── Filtre période ────────────────────────────
      if (activeFilters.periode !== 'all') {
        const now = new Date();
        const eventDate = new Date(event.startTime);

        if (activeFilters.periode === 'today') {
          if (eventDate.toDateString() !== now.toDateString()) return false;
        }
        if (activeFilters.periode === 'week') {
          const startWeek = new Date(now);
          startWeek.setDate(now.getDate() - now.getDay() + 1);
          startWeek.setHours(0, 0, 0, 0);
          const endWeek = new Date(startWeek);
          endWeek.setDate(startWeek.getDate() + 6);
          endWeek.setHours(23, 59, 59, 999);
          if (eventDate < startWeek || eventDate > endWeek) return false;
        }
        if (activeFilters.periode === 'month') {
          if (
            eventDate.getMonth() !== now.getMonth() ||
            eventDate.getFullYear() !== now.getFullYear()
          ) return false;
        }
      }

      return true;
    });
  }, [allEvents, activeFilters]);

  // ✅ Toggle filtre générique
  const toggleFilter = (
    key: 'scopes' | 'statuts' | 'categoryIds',
    value: string | number
  ) => {
    setActiveFilters(prev => {
      const arr = prev[key] as any[];
      const exists = arr.includes(value);
      return {
        ...prev,
        [key]: exists ? arr.filter(v => v !== value) : [...arr, value]
      };
    });
  };

  // ✅ Reset tous les filtres
  const resetFilters = () => {
    setActiveFilters({ scopes: [], statuts: [], categoryIds: [], periode: 'all' });
  };

  const handlePrevious = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewType === 'day') newDate.setDate(newDate.getDate() - 1);
      else if (viewType === 'week') newDate.setDate(newDate.getDate() - 7);
      else newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, [viewType]);

  const handleNext = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewType === 'day') newDate.setDate(newDate.getDate() + 1);
      else if (viewType === 'week') newDate.setDate(newDate.getDate() + 7);
      else newDate.setMonth(newDate.getMonth() + 1);
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

      if (userRole === 'admin' && selectedCollaboratorIds.length > 0) {
        console.log(`📅 Chargement agendas de ${selectedCollaboratorIds.length} collaborateur(s)`);
        const results = await Promise.all(
          selectedCollaboratorIds.map(id => fetchEvents(societeId, id, startDate, endDate))
        );
        // Fusionner + dédupliquer par id
        const merged = results.flat();
        const unique = Array.from(new Map(merged.map(e => [e.id, e])).values());
        setAllEvents(unique.map(convertAPIEventToFrontend));
      } else {
        console.log(`📅 Chargement agenda personnel (membre ${membreId})`);
        const apiEvents = await fetchEvents(societeId, membreId, startDate, endDate);
        setAllEvents(apiEvents.map(convertAPIEventToFrontend));
      }

    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, societeId, membreId, userRole, selectedCollaboratorIds]);

  const loadCollaborators = useCallback(async () => {
    setIsLoadingCollaborators(true);
    try {
      const fetchedCollaborators = await fetchCollaborators(societeId);
      setCollaborators(fetchedCollaborators);
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
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [societeId]);

  useEffect(() => {
    const detectRole = async () => {
      try {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + 14);

        const startDate = weekStart.toISOString().split('T')[0];
        const endDate = weekEnd.toISOString().split('T')[0];

        const response = await fetch(
        `https://solutravo.zeta-app.fr/api/calendar/events?societe_id=${societeId}&membre_id=${membreId}&start_date=${startDate}&end_date=${endDate}`
         //`http://localhost:3000/api/calendar/events?societe_id=${societeId}&membre_id=${membreId}&start_date=${startDate}&end_date=${endDate}`
        );
        // );
        const result = await response.json();

        if (result.success && result.role) {
          setUserRole(result.role);
          if (result.role === 'admin') loadCollaborators();
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

  const handleToggleCollaborator = useCallback((collaboratorId: number) => {
    setSelectedCollaboratorIds(prev =>
      prev.includes(collaboratorId)
        ? prev.filter(id => id !== collaboratorId)
        : [...prev, collaboratorId]
    );
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
      return newCategory;
    } catch (error) {
      console.error('Erreur création catégorie:', error);
      throw error;
    }
  }, [societeId]);

  const toggleCalendar = useCallback((id: string): void => {
    setCalendars((prev) =>
      prev.map((cal) => cal.id === id ? { ...cal, isVisible: !cal.isVisible } : cal)
    );
  }, []);

  const handleToday = useCallback((): void => setCurrentDate(new Date()), []);

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
        const apiData = convertFrontendEventToAPI(eventToCreate, societeId, membreId);
        // await createCalendarEvent(apiData);
        const eventId = await createCalendarEvent(apiData);


      // ✅ NOUVEAU : Inviter les sociétés sélectionnées
      const invitedSocieteIds = (event as any).invited_societe_ids || [];
      for (const societeInviteeId of invitedSocieteIds) {
        try {
          await inviterSocieteAPI(eventId, societeId, societeInviteeId, membreId);
          console.log(`✅ Société ${societeInviteeId} invitée`);
        } catch (err) {
          console.error(`❌ Erreur invitation société ${societeInviteeId}:`, err);
        }
      }
      } else {
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    try {
      await deleteCalendarEvent(Number(eventId), societeId, membreId);
      await loadEvents();
    } catch (error) {
      console.error('Erreur suppression événement:', error);
      alert('Erreur lors de la suppression');
    }
  }, [societeId, membreId, loadEvents]);

  const handleInviteFromModal = async (emails: string[]): Promise<void> => {
    try {
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
      await inviteCollaboratorsByEmail(Number(selectedEventId), emails);
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
    const startMonth = weekStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const endMonth = weekEnd.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;
  };

  return (
    <div className="calendar-container">
      <CalendarSidebar
        currentDate={currentDate}
        calendars={calendars}
        onToggleCalendar={toggleCalendar}
        onCreateEvent={handleCreateEvent}
        onDateSelect={handleDateSelect}
        collaborators={collaborators}
        selectedCollaboratorIds={selectedCollaboratorIds}
        onToggleCollaborator={handleToggleCollaborator}
        isLoadingCollaborators={isLoadingCollaborators}
        userRole={userRole}
      />

      <div className="calendar-main">
        <div className="calendar-header">
          <div className="calendar-header-left">
            <div
              className="calendar-logo"
              onClick={() => userRole === 'admin' && collaborators.length > 0 && setShowCollabSheet(true)}
              style={{ cursor: userRole === 'admin' && collaborators.length > 0 ? 'pointer' : 'default', position: 'relative' }}
              title="Voir les agendas des collaborateurs"
            >
              <i className="fas fa-calendar"></i>
              <span className="calendar-logo-text">Agenda</span>
              {selectedCollaboratorIds.length > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-8px', background: '#E77131', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {selectedCollaboratorIds.length}
                </span>
              )}
            </div>
          </div>

          <div className="calendar-header-center">
            <button className="calendar-btn-today" onClick={handleToday}>
              Aujourd'hui
            </button>
            <div className="calendar-navigation">
              <button onClick={handlePrevious} className="calendar-nav-btn">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button onClick={handleNext} className="calendar-nav-btn">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <span className="calendar-month-year">{formatDateRange()}</span>
          </div>

          <div className="calendar-header-right">

            {/* ✅ Badge vue collaborateur (caché sur mobile → accessible via Filtres) */}
            {userRole === 'admin' && selectedCollaboratorIds.length > 0 && (
              <div className="calendar-vue-badge-desktop" style={{
                padding: '8px 16px', background: '#E8F5E9',
                borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                color: '#2E7D32', marginRight: '12px', whiteSpace: 'nowrap'
              }}>
                👁️ Vue : {selectedCollaboratorIds
                    .map(id => collaborators.find(c => c.membre_id === id)?.prenom)
                    .filter(Boolean)
                    .join(' / ') || 'Collaborateur'}
              </div>
            )}

            {/* ✅ BOUTON FILTRES */}
            <div style={{ position: 'relative', marginRight: '10px' }}>
              <button
                onClick={() => setShowFilterMenu(prev => !prev)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px',
                  border: `2px solid ${nombreFiltresActifs > 0 ? '#E77131' : '#ddd'}`,
                  borderRadius: '8px',
                  background: nombreFiltresActifs > 0 ? '#FFF3E0' : 'white',
                  color: nombreFiltresActifs > 0 ? '#E77131' : '#555',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 500
                }}
              >
                🔽 Filtres
                {nombreFiltresActifs > 0 && (
                  <span style={{
                    background: '#E77131', color: 'white',
                    borderRadius: '50%', width: '18px', height: '18px',
                    fontSize: '11px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700
                  }}>
                    {nombreFiltresActifs}
                  </span>
                )}
              </button>

              {/* ✅ MENU DÉROULANT FILTRES */}
              {showFilterMenu && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                    onClick={() => setShowFilterMenu(false)}
                  />
                  <div style={{
                    position: window.innerWidth <= 768 ? 'fixed' : 'absolute',
                    top: window.innerWidth <= 768 ? '60px' : 'calc(100% + 8px)',
                    left: window.innerWidth <= 768 ? '8px' : 'auto',
                    right: window.innerWidth <= 768 ? '8px' : '0',
                    background: 'white', borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    border: '1px solid #eee',
                    width: window.innerWidth <= 768 ? 'auto' : '340px',
                    maxHeight: '75vh', overflowY: 'auto',
                    zIndex: 99999, padding: '16px'
                  }}>

                    {/* Header menu */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#333' }}>Filtres</span>
                      {nombreFiltresActifs > 0 && (
                        <button
                          onClick={resetFilters}
                          style={{
                            background: 'none', border: 'none',
                            color: '#E77131', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 600
                          }}
                        >
                          Tout effacer
                        </button>
                      )}
                    </div>

                    {/* ── SCOPE ─────────────────────────────── */}
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: '8px', margin: '0 0 8px 0' }}>
                        Portée
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                          { value: 'personal', label: '🙋 Personnel' },
                          { value: 'collaborative', label: '👥 Collaboratif' }
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => toggleFilter('scopes', value)}
                            style={{
                              padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
                              border: `2px solid ${activeFilters.scopes.includes(value) ? '#E77131' : '#eee'}`,
                              background: activeFilters.scopes.includes(value) ? '#FFF3E0' : 'white',
                              color: activeFilters.scopes.includes(value) ? '#E77131' : '#555',
                              cursor: 'pointer', fontWeight: 500
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── STATUT ────────────────────────────── */}
                    {/* <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                        Statut
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                          { value: 'pending',   label: '⏳ En attente' },
                          { value: 'confirmed', label: '✅ Confirmé' },
                          { value: 'cancelled', label: '❌ Annulé' },
                          { value: 'completed', label: '✔️ Terminé' }
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => toggleFilter('statuts', value)}
                            style={{
                              padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
                              border: `2px solid ${activeFilters.statuts.includes(value) ? '#E77131' : '#eee'}`,
                              background: activeFilters.statuts.includes(value) ? '#FFF3E0' : 'white',
                              color: activeFilters.statuts.includes(value) ? '#E77131' : '#555',
                              cursor: 'pointer', fontWeight: 500
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div> */}

                    {/* ── CATÉGORIE ─────────────────────────── */}
                    {categories.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                          Catégorie
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {categories.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => toggleFilter('categoryIds', cat.id)}
                              style={{
                                padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
                                border: `2px solid ${activeFilters.categoryIds.includes(cat.id) ? cat.color : '#eee'}`,
                                background: activeFilters.categoryIds.includes(cat.id) ? `${cat.color}20` : 'white',
                                color: activeFilters.categoryIds.includes(cat.id) ? cat.color : '#555',
                                cursor: 'pointer', fontWeight: 500
                              }}
                            >
                              {cat.icon} {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── PÉRIODE ───────────────────────────── */}
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                        Période
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                          { value: 'all',   label: '📅 Tout' },
                          { value: 'today', label: "☀️ Aujourd'hui" },
                          { value: 'week',  label: '📆 Cette semaine' },
                          { value: 'month', label: '🗓️ Ce mois' }
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setActiveFilters(prev => ({ ...prev, periode: value }))}
                            style={{
                              padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
                              border: `2px solid ${activeFilters.periode === value ? '#E77131' : '#eee'}`,
                              background: activeFilters.periode === value ? '#FFF3E0' : 'white',
                              color: activeFilters.periode === value ? '#E77131' : '#555',
                              cursor: 'pointer', fontWeight: 500
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </>
              )}
            </div>

            {/* ✅ SELECT VUE */}
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

        {/* ✅ VUES — filteredEvents au lieu de allEvents */}
        {!isLoading && viewType === 'day' && (
          <CalendarDayView
            currentDate={currentDate}
            events={filteredEvents}
            visibleCalendars={visibleCalendarIds}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}

        {!isLoading && viewType === 'week' && (
          <CalendarWeekView
            currentDate={currentDate}
            events={filteredEvents}
            visibleCalendars={visibleCalendarIds}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}

        {!isLoading && viewType === 'month' && (
          <CalendarMonthView
            currentDate={currentDate}
            events={filteredEvents}
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
        currentSocieteId={societeId}
        userRole={userRole}
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

      {/* ── PANNEAU LATÉRAL COLLABORATEURS (mobile) ──────────────────── */}
      {showCollabSheet && (
        <>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to   { transform: translateX(0); }
            }
          `}</style>

          {/* Zone cliquable à gauche = ferme le panneau (calendrier visible derrière) */}
          <div
            onClick={() => setShowCollabSheet(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.15)',
              zIndex: 8000
            }}
          />

          {/* Panneau latéral (droite) */}
          <div style={{
            position: 'fixed', top: 0, right: 0,
            width: '68%',
            height: '100%',
            background: 'white',
            boxShadow: '-6px 0 28px rgba(0,0,0,0.18)',
            zIndex: 8001,
            display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.26s ease-out'
          }}>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid #eee',
              background: '#f8f9fa'
            }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#333' }}>
                👥 Collaborateurs
              </span>
              <button
                onClick={() => setShowCollabSheet(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888', lineHeight: 1, padding: '0 4px' }}
              >×</button>
            </div>

            {/* Sous-titre */}
            <p style={{ margin: '8px 16px 4px', fontSize: '11px', color: '#999' }}>
              Appuyez pour filtrer l'agenda
            </p>

            {/* Liste collaborateurs */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {collaborators.length === 0 ? (
                <p style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                  Aucun collaborateur
                </p>
              ) : (
                collaborators.map(collab => {
                  const isSelected = selectedCollaboratorIds.includes(collab.membre_id);
                  const initials = `${collab.prenom?.[0] ?? ''}${(collab as any).nom?.[0] ?? ''}`.toUpperCase() || '?';
                  return (
                    <button
                      key={collab.membre_id}
                      onClick={() => handleToggleCollaborator(collab.membre_id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px',
                        border: `2px solid ${isSelected ? '#E77131' : '#eee'}`,
                        borderRadius: '10px',
                        background: isSelected ? '#FFF3E0' : 'white',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s ease',
                        width: '100%'
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: '32px', height: '32px', minWidth: '32px',
                        borderRadius: '50%',
                        background: isSelected ? '#E77131' : '#bbb',
                        color: 'white', fontSize: '11px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {initials}
                      </div>
                      {/* Nom */}
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {collab.prenom} {(collab as any).nom ?? ''}
                      </span>
                      {/* Checkmark */}
                      {isSelected && (
                        <span style={{ color: '#E77131', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>✓</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GoogleCalendar;
