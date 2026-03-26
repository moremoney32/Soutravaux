// import React, { useState } from 'react';
// import type { Calendar } from '../types/calendar';

// interface CalendarSidebarProps {
//   currentDate: Date;
//   calendars: Calendar[];
//   onToggleCalendar: (id: string) => void;
//   onCreateEvent?: () => void;
//   onDateSelect?: (date: Date) => void;
// }

// /**
//  * Composant Sidebar du calendrier
//  * Affiche: Mini calendrier, liste des agendas, boutons d'action
//  * Respecte la charte graphique avec la couleur primaire #E77131
//  */
// const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
//   currentDate,
//   calendars,
//   onToggleCalendar,
//   onCreateEvent,
//   onDateSelect
// }) => {
//   const [miniCalendarDate, setMiniCalendarDate] = useState(currentDate);

//   // Utilitaires pour le mini calendrier
//   const getDaysInMonth = (date: Date): number => {
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (date: Date): number => {
//     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//   };

//   const daysInMonth = getDaysInMonth(miniCalendarDate);
//   const firstDay = getFirstDayOfMonth(miniCalendarDate);
//   const days: (number | null)[] = [];

//   for (let i = 0; i < firstDay; i++) {
//     days.push(null);
//   }
//   for (let i = 1; i <= daysInMonth; i++) {
//     days.push(i);
//   }

//   // Vérifie si un jour est aujourd'hui
//   const isToday = (day: number | null): boolean => {
//     if (!day) return false;
//     const today = new Date();
//     return (
//       day === today.getDate() &&
//       miniCalendarDate.getMonth() === today.getMonth() &&
//       miniCalendarDate.getFullYear() === today.getFullYear()
//     );
//   };

//   // Navigation du mini calendrier
//   const handlePrevMonth = (): void => {
//     setMiniCalendarDate(
//       new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() - 1)
//     );
//   };

//   const handleNextMonth = (): void => {
//     setMiniCalendarDate(
//       new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1)
//     );
//   };

//   // Sélection d'un jour
//   const handleDayClick = (day: number): void => {
//     const selectedDate = new Date(
//       miniCalendarDate.getFullYear(),
//       miniCalendarDate.getMonth(),
//       day
//     );
//     onDateSelect?.(selectedDate);
//   };

//   // Sépare les calendriers
//   const myCalendars = calendars.filter((_, idx) => idx < 3);
//   const otherCalendars = calendars.filter((_, idx) => idx >= 3);

//   return (
//     <div className="calendar-sidebar">
//       {/* Bouton Créer */}
//       <button 
//         className="calendar-create-btn"
//         onClick={onCreateEvent}
//         title="Créer un nouvel événement"
//       >
//         <i className="fas fa-plus"></i>
//         <span>Créer</span>
//       </button>

//       {/* Mini Calendrier */}
//       <div className="calendar-mini-section">
//         <div className="calendar-mini-nav">
//           <button 
//             className="calendar-mini-prev"
//             onClick={handlePrevMonth}
//             title="Mois précédent"
//           >
//             <i className="fas fa-chevron-left"></i>
//           </button>
//           <span className="calendar-mini-month">
//             {miniCalendarDate.toLocaleDateString('fr-FR', { 
//               month: 'long', 
//               year: 'numeric' 
//             })}
//           </span>
//           <button 
//             className="calendar-mini-next"
//             onClick={handleNextMonth}
//             title="Mois suivant"
//           >
//             <i className="fas fa-chevron-right"></i>
//           </button>
//         </div>

//         <div className="calendar-mini-calendar">
//           <div className="calendar-weekdays">
//             {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, idx) => (
//               <div key={`weekday-${idx}`} className="calendar-weekday">
//                 {day}
//               </div>
//             ))}
//           </div>
//           <div className="calendar-days-grid">
//             {days.map((day, idx) => (
//               <button
//                 key={`day-${idx}`}
//                 className={`calendar-day ${!day ? 'calendar-day-empty' : ''} ${
//                   isToday(day) ? 'calendar-day-today' : ''
//                 }`}
//                 disabled={!day}
//                 onClick={() => day && handleDayClick(day)}
//               >
//                 {day}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Section Pages de réservation */}
//       <div className="calendar-settings-section">
//         <div className="calendar-section-header">
//           <h3 className="calendar-settings-title">Pages de réservation</h3>
//           {/* <button 
//             className="calendar-add-btn"
//             title="Ajouter une page de réservation"
//           >
//             <i className="fas fa-plus"></i>
//           </button> */}
//         </div>
//       </div>

//       {/* Mes Agendas */}
//       <div className="calendar-calendars-section">
//         <h3 className="calendar-section-title">Mes agendas</h3>
//         <div className="calendar-list">
//           {myCalendars.map((calendar) => (
//             <label 
//               key={calendar.id} 
//               className="calendar-list-item"
//               title={calendar.name}
//             >
//               <input
//                 type="checkbox"
//                 checked={calendar.isVisible}
//                 onChange={() => onToggleCalendar(calendar.id)}
//                 className="calendar-checkbox"
//               />
//               <span
//                 className="calendar-color-dot"
//                 style={{ backgroundColor: calendar.color }}
//               ></span>
//               <span className="calendar-name">{calendar.name}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Autres Agendas */}
//       {otherCalendars.length > 0 && (
//         <div className="calendar-other-calendars">
//           <div className="calendar-section-header">
//             <h3 className="calendar-section-title">Autres agendas</h3>
//             <button 
//               className="calendar-add-btn"
//               title="Ajouter un agenda"
//             >
//               <i className="fas fa-plus"></i>
//             </button>
//           </div>
//           <div className="calendar-list">
//             {otherCalendars.map((calendar) => (
//               <label 
//                 key={calendar.id} 
//                 className="calendar-list-item"
//                 title={calendar.name}
//               >
//                 <input
//                   type="checkbox"
//                   checked={calendar.isVisible}
//                   onChange={() => onToggleCalendar(calendar.id)}
//                   className="calendar-checkbox"
//                 />
//                 <span
//                   className="calendar-color-dot"
//                   style={{ backgroundColor: calendar.color }}
//                 ></span>
//                 <span className="calendar-name">{calendar.name}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CalendarSidebar;



// CalendarSidebar.tsx - VERSION AVEC LISTE COLLABORATEURS

import React, { useState } from 'react';
import type { Calendar } from '../types/calendar';

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

interface CalendarSidebarProps {
  currentDate: Date;
  calendars: Calendar[];
  onToggleCalendar: (id: string) => void;
  onCreateEvent?: () => void;
  onDateSelect?: (date: Date) => void;
  // ✅ NOUVEAU : Props collaborateurs
  collaborators?: Collaborator[];
  selectedCollaboratorIds?: number[];
  onToggleCollaborator?: (id: number) => void;
  isLoadingCollaborators?: boolean;
  userRole?: 'admin' | 'collaborator' | null;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  currentDate,
  calendars,
  onToggleCalendar,
  onCreateEvent,
  onDateSelect,
  collaborators = [],
  selectedCollaboratorIds = [],
  onToggleCollaborator,
  isLoadingCollaborators = false,
  userRole = null
}) => {
  const [miniCalendarDate, setMiniCalendarDate] = useState(currentDate);

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(miniCalendarDate);
  const firstDay = getFirstDayOfMonth(miniCalendarDate);
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isToday = (day: number | null): boolean => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      miniCalendarDate.getMonth() === today.getMonth() &&
      miniCalendarDate.getFullYear() === today.getFullYear()
    );
  };

  const handlePrevMonth = (): void => {
    setMiniCalendarDate(
      new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() - 1)
    );
  };

  const handleNextMonth = (): void => {
    setMiniCalendarDate(
      new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1)
    );
  };

  const handleDayClick = (day: number): void => {
    const selectedDate = new Date(
      miniCalendarDate.getFullYear(),
      miniCalendarDate.getMonth(),
      day
    );
    onDateSelect?.(selectedDate);
  };

  const myCalendars = calendars.filter((_, idx) => idx < 3);
  const otherCalendars = calendars.filter((_, idx) => idx >= 3);

  return (
    <div className="calendar-sidebar">
      {/* Bouton Créer */}
      <button 
        className="calendar-create-btn"
        onClick={onCreateEvent}
        title="Créer un nouvel événement"
      >
        <i className="fas fa-plus"></i>
        <span>Créer</span>
      </button>

      {/* Mini Calendrier */}
      <div className="calendar-mini-section">
        <div className="calendar-mini-nav">
          <button 
            className="calendar-mini-prev"
            onClick={handlePrevMonth}
            title="Mois précédent"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="calendar-mini-month">
            {miniCalendarDate.toLocaleDateString('fr-FR', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
          <button 
            className="calendar-mini-next"
            onClick={handleNextMonth}
            title="Mois suivant"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="calendar-mini-calendar">
          <div className="calendar-weekdays">
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, idx) => (
              <div key={`weekday-${idx}`} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-days-grid">
            {days.map((day, idx) => (
              <button
                key={`day-${idx}`}
                className={`calendar-day ${!day ? 'calendar-day-empty' : ''} ${
                  isToday(day) ? 'calendar-day-today' : ''
                }`}
                disabled={!day}
                onClick={() => day && handleDayClick(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* ✅ NOUVEAU : SECTION COLLABORATEURS (ADMIN ONLY) */}
      {/* ═══════════════════════════════════════════════ */}
      {/* {userRole === 'admin' && (
        <div className="calendar-collaborators-section">
          <h3 className="calendar-section-title">
            👥 Collaborateurs
          </h3>
          
          {isLoadingCollaborators ? (
            <div className="calendar-loading">
              <i className="fas fa-spinner fa-spin"></i> Chargement...
            </div>
          ) : collaborators.length === 0 ? (
            <p className="calendar-empty-message">
              Aucun collaborateur trouvé
            </p>
          ) : (
            <div className="calendar-list">
              {collaborators.map((collab) => (
                <label 
                  key={collab.membre_id} 
                  className="calendar-list-item collaborator-item"
                  title={`${collab.prenom} ${collab.nom} - ${collab.email}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCollaboratorIds.includes(collab.membre_id)}
                    onChange={() => onToggleCollaborator?.(collab.membre_id)}
                    className="calendar-checkbox"
                  />
                  <span className="collaborator-avatar">
                    {collab.prenom.charAt(0)}{collab.nom.charAt(0)}
                  </span>
                  <span className="calendar-name">
                    {collab.prenom} {collab.nom}
                  </span>
                </label>
              ))}
            </div>
          )}

          {selectedCollaboratorIds.length > 0 && (
            <div className="collaborators-selection-info">
              ✓ {selectedCollaboratorIds.length} sélectionné{selectedCollaboratorIds.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )} */}


{userRole === 'admin' && (
  <div className="calendar-collaborators-section">
    <h3 className="calendar-section-title">
      👥 Collaborateurs
    </h3>
    
    {isLoadingCollaborators ? (
      <div className="calendar-loading">
        <i className="fas fa-spinner fa-spin"></i> Chargement...
      </div>
    ) : collaborators.length === 0 ? (
      <p className="calendar-empty-message">
        Aucun collaborateur trouvé
      </p>
    ) : (
      <div className="calendar-list">
        {collaborators.map((collab) => (
          <label 
            key={collab.membre_id} 
            className="calendar-list-item collaborator-item"
            title={`${collab.prenom} ${collab.nom} - ${collab.email}`}
          >
              <input
              type="checkbox"
              checked={selectedCollaboratorIds.includes(collab.membre_id)}
              onChange={() => onToggleCollaborator?.(collab.membre_id)}
              className="calendar-checkbox"
            />
            <span className="collaborator-avatar">
              {collab.prenom.charAt(0)}{collab.nom.charAt(0)}
            </span>
            <span className="calendar-name">
              {collab.prenom} {collab.nom}
            </span>
          </label>
        ))}
      </div>
    )}

    {selectedCollaboratorIds.length > 0 && (
      <div className="collaborators-selection-info">
        👁️ Vue : {selectedCollaboratorIds
          .map(id => collaborators.find(c => c.membre_id === id)?.prenom)
          .filter(Boolean)
          .join(' / ')}
      </div>
    )}
  </div>
)}

      {/* Section Pages de réservation */}
      <div className="calendar-settings-section">
        <div className="calendar-section-header">
          <h3 className="calendar-settings-title">Pages de réservation</h3>
        </div>
      </div>

      {/* Mes Agendas */}
      <div className="calendar-calendars-section">
        <h3 className="calendar-section-title">Mes agendas</h3>
        <div className="calendar-list">
          {myCalendars.map((calendar) => (
            <label 
              key={calendar.id} 
              className="calendar-list-item"
              title={calendar.name}
            >
              <input
                type="checkbox"
                checked={calendar.isVisible}
                onChange={() => onToggleCalendar(calendar.id)}
                className="calendar-checkbox"
              />
              <span
                className="calendar-color-dot"
                style={{ backgroundColor: calendar.color }}
              ></span>
              <span className="calendar-name">{calendar.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Autres Agendas */}
      {otherCalendars.length > 0 && (
        <div className="calendar-other-calendars">
          <div className="calendar-section-header">
            <h3 className="calendar-section-title">Autres agendas</h3>
            <button 
              className="calendar-add-btn"
              title="Ajouter un agenda"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
          <div className="calendar-list">
            {otherCalendars.map((calendar) => (
              <label 
                key={calendar.id} 
                className="calendar-list-item"
                title={calendar.name}
              >
                <input
                  type="checkbox"
                  checked={calendar.isVisible}
                  onChange={() => onToggleCalendar(calendar.id)}
                  className="calendar-checkbox"
                />
                <span
                  className="calendar-color-dot"
                  style={{ backgroundColor: calendar.color }}
                ></span>
                <span className="calendar-name">{calendar.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ✅ STYLES POUR COLLABORATEURS */}
      <style>{`
        .calendar-collaborators-section {
          padding: 12px 16px;
          border-bottom: 1px solid #e0e0e0;
        }

        .calendar-loading {
          text-align: center;
          padding: 16px;
          color: #999;
          font-size: 13px;
        }
          .calendar-checkbox{
          border:none;
          }

        .calendar-empty-message {
          text-align: center;
          padding: 16px;
          color: #999;
          font-size: 12px;
        }

        .collaborator-item {
          padding: 10px 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .collaborator-item:hover {
          background: #f5f5f5;
        }

        .collaborator-avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E77131 0%, #F59E6C 100%);
          color: white;
          font-size: 10px;
          font-weight: 600;
          margin-right: 8px;
        }

        .collaborators-selection-info {
          margin-top: 12px;
          padding: 8px 12px;
          background: #E8F5E9;
          border-left: 3px solid #4CAF50;
          border-radius: 4px;
          font-size: 12px;
          color: #2E7D32;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default CalendarSidebar;
