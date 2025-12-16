import React from 'react';
import type { CalendarEvent } from '../types/calendar';

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  visibleCalendars: string[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

/**
 * Vue mensuelle du calendrier
 * Affiche un mois entier avec les événements
 */
const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentDate,
  events,
  visibleCalendars,
  onEventClick,
  onDateClick
}) => {
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthDays: (number | null)[] = [];

  // Remplit le tableau avec null pour les jours du mois précédent
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    monthDays.push(null);
  }
  // Ajoute les jours du mois
  for (let i = 1; i <= daysInMonth; i++) {
    monthDays.push(i);
  }

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();

  /**
   * Vérifie si une date est aujourd'hui
   */
  const isToday = (day: number | null): boolean => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  /**
   * Obtient les événements pour un jour donné
   */
  const getEventsForDay = (day: number | null): CalendarEvent[] => {
    if (!day) return [];
    
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(
      (event) =>
        event.startTime.getDate() === date.getDate() &&
        event.startTime.getMonth() === date.getMonth() &&
        event.startTime.getFullYear() === date.getFullYear() &&
        visibleCalendars.includes(event.calendar)
    );
  };

  const handleDayClick = (day: number | null): void => {
    if (day) {
      const selectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      onDateClick?.(selectedDate);
    }
  };

  // Génère les semaines
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < monthDays.length; i += 7) {
    weeks.push(monthDays.slice(i, i + 7));
  }

  return (
    <div className="calendar-month-view-container">
      {/* En-tête des jours */}
      <div className="calendar-month-header">
        {dayNames.map((name) => (
          <div key={name} className="calendar-month-day-name">
            {name}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="calendar-month-grid">
        {weeks.map((week, weekIdx) => (
          <div key={`week-${weekIdx}`} className="calendar-month-week">
            {week.map((day, dayIdx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = day !== null;
              const isTodayDate = isToday(day);

              return (
                <div
                  key={`day-${weekIdx}-${dayIdx}`}
                  className={`calendar-month-day ${
                    !isCurrentMonth ? 'calendar-month-day-empty' : ''
                  } ${isTodayDate ? 'calendar-month-day-today' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="calendar-month-day-number">{day}</div>
                  <div className="calendar-month-day-events">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="calendar-month-event"
                        style={{ backgroundColor: event.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="calendar-month-event-more">
                        +{dayEvents.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarMonthView;
