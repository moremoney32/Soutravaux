

import React, { useMemo, useEffect, useRef } from 'react';
import type { CalendarEvent } from '../types/calendar';
import { calculateEventLayouts } from '../helpers/eventLayoutHelper';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  visibleCalendars: string[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  currentDate,
  events,
  visibleCalendars,
  onEventClick,
  onTimeSlotClick
}) => {
  // ✅ AJOUTÉ : Ref pour le container scrollable
  const gridRef = useRef<HTMLDivElement>(null);
  
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  
  const weekDays: Date[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [weekStart]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const dayNames = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  const today = useMemo(() => new Date(), []);

  // ✅ NOUVEAU : Vérifier si aujourd'hui est dans la semaine affichée
  const isTodayInWeek = useMemo(() => {
    return weekDays.some(day => 
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  }, [weekDays, today]);

  // ✅ NOUVEAU : Auto-scroll à l'heure actuelle
  useEffect(() => {
    if (!gridRef.current || !isTodayInWeek) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Commencer 2h avant l'heure actuelle
    const targetHour = Math.max(0, currentHour - 2);
    const hourHeight = gridRef.current.scrollHeight / 24;
    const scrollPosition = targetHour * hourHeight;
    
    setTimeout(() => {
      gridRef.current?.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }, 100);
    
  }, [currentDate, isTodayInWeek]);

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
      left: layout ? `${layout.left}%` : '0%',
      width: layout ? `${layout.width}%` : '100%'
    };
  };

  const isToday = (date: Date): boolean => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter(
      (event) =>
        event.startTime.getDate() === date.getDate() &&
        event.startTime.getMonth() === date.getMonth() &&
        event.startTime.getFullYear() === date.getFullYear() &&
        visibleCalendars.includes(event.calendar)
    );
  };

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

  // Événements multi-jours : ont un end_date différent de event_date
  const multiDayEvents = useMemo(() => {
    return events.filter(event => {
      if (!event.end_date) return false;
      const startDay = `${event.startTime.getFullYear()}-${String(event.startTime.getMonth()+1).padStart(2,'0')}-${String(event.startTime.getDate()).padStart(2,'0')}`;
      return event.end_date > startDay && visibleCalendars.includes(event.calendar);
    });
  }, [events, visibleCalendars]);

  // Calcule les colonnes du bandeau pour un événement multi-jours dans la semaine
  const getMultiDaySpan = (event: CalendarEvent): { startCol: number; endCol: number } | null => {
    const weekStartStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,'0')}-${String(weekStart.getDate()).padStart(2,'0')}`;
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEndStr = `${weekEndDate.getFullYear()}-${String(weekEndDate.getMonth()+1).padStart(2,'0')}-${String(weekEndDate.getDate()).padStart(2,'0')}`;
    const eventStartStr = `${event.startTime.getFullYear()}-${String(event.startTime.getMonth()+1).padStart(2,'0')}-${String(event.startTime.getDate()).padStart(2,'0')}`;
    const eventEndStr = event.end_date!;
    if (eventEndStr < weekStartStr || eventStartStr > weekEndStr) return null;
    const clampedStart = eventStartStr < weekStartStr ? weekStartStr : eventStartStr;
    const clampedEnd = eventEndStr > weekEndStr ? weekEndStr : eventEndStr;
    const startCol = weekDays.findIndex(d => {
      const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return ds === clampedStart;
    });
    const endCol = weekDays.findIndex(d => {
      const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return ds === clampedEnd;
    });
    return { startCol: startCol === -1 ? 0 : startCol, endCol: endCol === -1 ? 6 : endCol };
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

      {/* Bandeau événements multi-jours */}
      {multiDayEvents.length > 0 && (() => {
        // Calcule les spans visibles dans la semaine
        const spanned = multiDayEvents
          .map(ev => ({ ev, span: getMultiDaySpan(ev) }))
          .filter(({ span }) => span !== null) as { ev: CalendarEvent; span: { startCol: number; endCol: number } }[];

        // Assigne une lane (ligne) à chaque event pour éviter le chevauchement
        const lanes: { startCol: number; endCol: number }[] = [];
        const laneAssignments = spanned.map(({ span }) => {
          const lane = lanes.findIndex(occupied =>
            occupied === null || span.startCol > occupied.endCol || span.endCol < occupied.startCol
          );
          const assignedLane = lane === -1 ? lanes.length : lane;
          lanes[assignedLane] = span;
          return assignedLane;
        });

        const numLanes = Math.max(...laneAssignments, 0) + 1;
        const laneH = 22;
        const bannerH = numLanes * laneH + 4;

        return (
          <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', background: '#fafafa', height: `${bannerH}px`, overflow: 'hidden' }}>
            {/* Spacer colonne heures — doit correspondre au 60px du CSS grid */}
            <div style={{ width: '60px', flexShrink: 0 }}></div>
            {/* Zone overlay des 7 jours */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              {spanned.map(({ ev, span }, idx) => {
                const lane = laneAssignments[idx];
                const weekStartStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,'0')}-${String(weekStart.getDate()).padStart(2,'0')}`;
                const weekEndDate = new Date(weekStart); weekEndDate.setDate(weekEndDate.getDate() + 6);
                const weekEndStr = `${weekEndDate.getFullYear()}-${String(weekEndDate.getMonth()+1).padStart(2,'0')}-${String(weekEndDate.getDate()).padStart(2,'0')}`;
                const eventStartStr = `${ev.startTime.getFullYear()}-${String(ev.startTime.getMonth()+1).padStart(2,'0')}-${String(ev.startTime.getDate()).padStart(2,'0')}`;
                const startsInWeek = eventStartStr >= weekStartStr;
                const endsInWeek = ev.end_date! <= weekEndStr;
                const leftPct = (span.startCol / 7) * 100;
                const widthPct = ((span.endCol - span.startCol + 1) / 7) * 100;
                return (
                  <div
                    key={ev.id}
                    onClick={() => onEventClick?.(ev)}
                    title={ev.title}
                    style={{
                      position: 'absolute',
                      top: `${lane * laneH + 2}px`,
                      left: `calc(${leftPct}% + 2px)`,
                      width: `calc(${widthPct}% - 4px)`,
                      height: `${laneH - 2}px`,
                      background: ev.color,
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 500,
                      borderRadius: `${startsInWeek ? '4px' : '0'} ${endsInWeek ? '4px' : '0'} ${endsInWeek ? '4px' : '0'} ${startsInWeek ? '4px' : '0'}`,
                      padding: '2px 6px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      boxSizing: 'border-box',
                      lineHeight: `${laneH - 6}px`
                    }}
                  >
                    {startsInWeek && ev.title}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Ajouter ref au container scrollable */}
      <div className="calendar-week-grid" ref={gridRef}>
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
          const layouts = calculateEventLayouts(dayEvents);
          
          return (
            <div key={`day-${dayIdx}`} className="calendar-day-column">
              {hours.map((hour) => (
                <div
                  key={`slot-${dayIdx}-${hour}`}
                  className="calendar-hour-slot"
                  onClick={() => handleTimeSlotClick(date, hour)}
                  title={`Créer un événement à ${String(hour).padStart(2, '0')}:00`}
                ></div>
              ))}

              <div className="calendar-events-container">
                {layouts.map((layout) => (
                  <div
                    key={layout.event.id}
                    className="calendar-event"
                    style={{
                      ...getEventStyle(layout.event, layout),
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
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWeekView;
