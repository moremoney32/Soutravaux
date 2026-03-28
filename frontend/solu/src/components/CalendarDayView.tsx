

import React, { useEffect, useMemo, useRef } from 'react';
import type { CalendarEvent } from '../types/calendar';
import '../styles/GoogleCalendar.css';
import { calculateEventLayouts } from '../helpers/eventLayoutHelper';
//** */
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
   // ✅ AJOUTÉ : Ref pour le container scrollable
  const gridRef = useRef<HTMLDivElement>(null);

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

   // ✅ NOUVEAU : Auto-scroll à l'heure actuelle au chargement
  useEffect(() => {
    if (!gridRef.current || !isToday(currentDate)) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    console.log(currentMinutes)
    
    // Calculer position scroll (commencer 2h avant l'heure actuelle)
    const targetHour = Math.max(0, currentHour - 2);
    const hourHeight = gridRef.current.scrollHeight / 24;
    const scrollPosition = targetHour * hourHeight;
    
    // Petit délai pour laisser le DOM se rendre
    setTimeout(() => {
      gridRef.current?.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }, 100);
    
  }, [currentDate, isToday]); // Se déclenche au changement de date

  // ✅ MODIFIÉ : Accepter layout en paramètre
  const getEventStyle = (
    event: CalendarEvent, 
    layout?: { left: number; width: number }
  ) => {
    const startHour = event.startTime.getHours();
    const startMin = event.startTime.getMinutes();
    const endHour = event.endTime.getHours();
    const endMin = event.endTime.getMinutes();

    const topPercent = ((startHour + startMin / 60) / 24) * 100;
    const duration = (endHour + endMin / 60) - (startHour + startMin / 60);
    const heightPercent = (duration / 24) * 100;

    return {
      top: `${topPercent}%`,
      height: `${Math.max(heightPercent, 3)}%`,
      // ✅ AJOUTÉ : Position et largeur depuis layout
      left: layout ? `${layout.left}%` : '0%',
      width: layout ? `${layout.width}%` : '100%'
    };
  };

  const formatTime = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`;
  };

  const dayEvents = getEventsForDay();
  // ✅ AJOUTÉ : Calculer layouts pour gérer chevauchements
  const layouts = calculateEventLayouts(dayEvents);
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
      <div className="calendar-day-grid" ref={gridRef}>
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

          {/* ✅ MODIFIÉ : Mapper layouts au lieu de dayEvents */}
          <div className="calendar-events-container">
            {layouts.map((layout) => (
              <div
                key={layout.event.id}
                className="calendar-event"
                style={{
                  ...getEventStyle(layout.event, layout), // ✅ Passer layout
                  backgroundColor: layout.event.color
                }}
                onClick={() => onEventClick?.(layout.event)}
                title={`${layout.event.title} - ${formatTime(layout.event.startTime)} à ${formatTime(layout.event.endTime)}`}
              >
                <div className="calendar-event-time">
                  {formatTime(layout.event.startTime)}
                </div>
                <div className="calendar-event-title">{layout.event.title}</div>
                {layout.event.description && (
                  <div className="calendar-event-description">
                    {layout.event.description}
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