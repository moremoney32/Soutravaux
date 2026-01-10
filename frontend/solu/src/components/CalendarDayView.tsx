import React, { useMemo } from 'react';
import type { CalendarEvent } from '../types/calendar';
import '../styles/GoogleCalendar.css';

interface CalendarDayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  visibleCalendars: string[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  currentDate,
  events,
  visibleCalendars,
  onEventClick,
  onTimeSlotClick
}) => {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const today = useMemo(() => new Date(), []);

  const isToday = (date: Date): boolean => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDay = (): CalendarEvent[] => {
    return events.filter(
      (event) =>
        event.startTime.getDate() === currentDate.getDate() &&
        event.startTime.getMonth() === currentDate.getMonth() &&
        event.startTime.getFullYear() === currentDate.getFullYear() &&
        visibleCalendars.includes(event.calendar)
    );
  };
  const currentTimePosition = useMemo(() => {
    if (!isToday(currentDate)) return null;
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const percent = ((hours + minutes / 60) / 24) * 100;
    
    return `${percent}%`;
  }, [currentDate, today]);
  const getEventStyle = (event: CalendarEvent) => {
    const startHour = event.startTime.getHours();
    const startMin = event.startTime.getMinutes();
    const endHour = event.endTime.getHours();
    const endMin = event.endTime.getMinutes();

    const topPercent = ((startHour + startMin / 60) / 24) * 100;
    const duration = (endHour + endMin / 60) - (startHour + startMin / 60);
    const heightPercent = (duration / 24) * 100;

    return {
      top: `${topPercent}%`,
      height: `${Math.max(heightPercent, 3)}%`
    };
  };

  const formatTime = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`;
  };

  const dayEvents = getEventsForDay();
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  return (
    <div className="calendar-day-view">
      {/* En-tête du jour */}
      <div className="calendar-day-header-single">
        <div className="calendar-time-column-header"></div>
        <div className={`calendar-day-header ${isToday(currentDate) ? 'calendar-day-header-today' : ''}`}>
          <div className="calendar-day-name-full">
            {dayNames[currentDate.getDay()].toUpperCase()}
          </div>
          <div className={`calendar-day-number-large ${isToday(currentDate) ? 'calendar-day-number-today' : ''}`}>
            {currentDate.getDate()}
          </div>
        </div>
      </div>

      {/* Grille horaire */}
      <div className="calendar-day-grid">
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

        {/* Colonne du jour */}
        <div className="calendar-day-column-single">
          {hours.map((hour) => (
            <div
              key={`slot-${hour}`}
              className="calendar-hour-slot"
              onClick={() => onTimeSlotClick?.(currentDate, hour)}
            ></div>
          ))}
          {currentTimePosition && (
            <div 
              className="calendar-current-time-line"
              style={{ top: currentTimePosition }}
            />
          )}

          {/* Événements */}
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
      </div>
    </div>
  );
};

export default CalendarDayView;