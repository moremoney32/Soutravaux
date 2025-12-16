import React, { useState } from 'react';
import type { Calendar } from '../types/calendar';

interface CalendarSidebarProps {
  currentDate: Date;
  calendars: Calendar[];
  onToggleCalendar: (id: string) => void;
  onCreateEvent?: () => void;
  onDateSelect?: (date: Date) => void;
}

/**
 * Composant Sidebar du calendrier
 * Affiche: Mini calendrier, liste des agendas, boutons d'action
 * Respecte la charte graphique avec la couleur primaire #E77131
 */
const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  currentDate,
  calendars,
  onToggleCalendar,
  onCreateEvent,
  onDateSelect
}) => {
  const [miniCalendarDate, setMiniCalendarDate] = useState(currentDate);

  // Utilitaires pour le mini calendrier
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

  // Vérifie si un jour est aujourd'hui
  const isToday = (day: number | null): boolean => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      miniCalendarDate.getMonth() === today.getMonth() &&
      miniCalendarDate.getFullYear() === today.getFullYear()
    );
  };

  // Navigation du mini calendrier
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

  // Sélection d'un jour
  const handleDayClick = (day: number): void => {
    const selectedDate = new Date(
      miniCalendarDate.getFullYear(),
      miniCalendarDate.getMonth(),
      day
    );
    onDateSelect?.(selectedDate);
  };

  // Sépare les calendriers
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

      {/* Section Pages de réservation */}
      <div className="calendar-settings-section">
        <div className="calendar-section-header">
          <h3 className="calendar-settings-title">Pages de réservation</h3>
          <button 
            className="calendar-add-btn"
            title="Ajouter une page de réservation"
          >
            <i className="fas fa-plus"></i>
          </button>
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
    </div>
  );
};

export default CalendarSidebar;
