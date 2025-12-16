import React, { useMemo } from 'react';
import type { CalendarEvent } from '../types/calendar';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  visibleCalendars: string[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

interface EventPosition {
  top: string;
  height: string;
}

/**
 * Vue hebdomadaire du calendrier
 * Affiche les événements positionnés selon leur horaire
 */
const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  currentDate,
  events,
  visibleCalendars,
  onEventClick,
  onTimeSlotClick
}) => {
  // Calcule le début de la semaine (lundi)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste pour lundi
    return new Date(d.setDate(diff));
  };

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  
  // Génère les 7 jours de la semaine
  const weekDays: Date[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [weekStart]);

  // 24 heures de 0 à 23
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const dayNames = ['LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.', 'DIM.'];
  const today = useMemo(() => new Date(), []);

  /**
   * Calcule le positionnement CSS d'un événement
   * en fonction de son horaire (top et height)
   */
  const getEventStyle = (event: CalendarEvent): EventPosition => {
    const startHour = event.startTime.getHours();
    const startMin = event.startTime.getMinutes();
    const endHour = event.endTime.getHours();
    const endMin = event.endTime.getMinutes();

    const topPercent = ((startHour + startMin / 60) / 24) * 100;
    const duration = (endHour + endMin / 60) - (startHour + startMin / 60);
    const heightPercent = (duration / 24) * 100;

    return {
      top: `${topPercent}%`,
      height: `${Math.max(heightPercent, 3)}%` // Minimum 3% pour visibilité
    };
  };

  /**
   * Vérifie si une date est aujourd'hui
   */
  const isToday = (date: Date): boolean => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /**
   * Filtre les événements pour un jour donné
   */
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter(
      (event) =>
        event.startTime.getDate() === date.getDate() &&
        event.startTime.getMonth() === date.getMonth() &&
        event.startTime.getFullYear() === date.getFullYear() &&
        visibleCalendars.includes(event.calendar)
    );
  };

  /**
   * Format l'heure en HH:MM
   */
  const formatTime = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`;
  };

  const handleTimeSlotClick = (date: Date, hour: number): void => {
    const clickDate = new Date(date);
    clickDate.setHours(hour, 0, 0, 0);
    onTimeSlotClick?.(clickDate, hour);
  };

  return (
    <div className="calendar-week-view">
      {/* En-tête avec les jours de la semaine */}
      <div className="calendar-week-header">
        <div className="calendar-time-column-header"></div>
        {weekDays.map((date, idx) => (
          <div
            key={`header-${idx}`}
            className={`calendar-day-header ${
              isToday(date) ? 'calendar-day-header-today' : ''
            }`}
          >
            <div className="calendar-day-name">{dayNames[idx]}</div>
            <div
              className={`calendar-day-number ${
                isToday(date) ? 'calendar-day-number-today' : ''
              }`}
            >
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Grille horaire avec événements */}
      <div className="calendar-week-grid">
        {/* Colonne des heures */}
        <div className="calendar-time-column">
          {hours.map((hour) => (
            <div key={`time-${hour}`} className="calendar-time-slot">
              <span className="calendar-time-label">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Colonnes des jours avec événements */}
        {weekDays.map((date, dayIdx) => {
          const dayEvents = getEventsForDay(date);
          
          return (
            <div key={`day-${dayIdx}`} className="calendar-day-column">
              {/* Créneaux horaires */}
              {hours.map((hour) => (
                <div
                  key={`slot-${dayIdx}-${hour}`}
                  className="calendar-hour-slot"
                  onClick={() => handleTimeSlotClick(date, hour)}
                  title={`Créer un événement à ${String(hour).padStart(2, '0')}:00`}
                ></div>
              ))}

              {/* Conteneur des événements */}
              <div className="calendar-events-container">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="calendar-event"
                    style={{
                      ...getEventStyle(event),
                      backgroundColor: event.color
                    }}
                    onClick={() => onEventClick?.(event)}
                    title={`${event.title} - ${formatTime(event.startTime)} à ${formatTime(event.endTime)}`}
                  >
                    <div className="calendar-event-time">
                      {formatTime(event.startTime)}
                    </div>
                    <div className="calendar-event-title">{event.title}</div>
                    {event.description && (
                      <div className="calendar-event-description">
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWeekView;
