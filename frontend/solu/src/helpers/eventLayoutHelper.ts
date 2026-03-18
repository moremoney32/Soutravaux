// utils/eventLayoutHelper.ts
import type { CalendarEvent } from '../types/calendar';

export interface EventLayout {
  event: CalendarEvent;
  left: number;    // % (0-100)
  width: number;   // % (0-100)
  column: number;  // Index colonne
}

/**
 * Vérifie si deux événements se chevauchent temporellement
 */
function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

/**
 * Calcule les positions pour événements qui se chevauchent
 */
export function calculateEventLayouts(events: CalendarEvent[]): EventLayout[] {
  if (events.length === 0) return [];
  
  // Trier par heure de début, puis par durée (plus longs en premier)
  const sorted = [...events].sort((a, b) => {
    const startDiff = a.startTime.getTime() - b.startTime.getTime();
    if (startDiff !== 0) return startDiff;
    
    const aDuration = a.endTime.getTime() - a.startTime.getTime();
    const bDuration = b.endTime.getTime() - b.startTime.getTime();
    return bDuration - aDuration; // Plus longs en premier
  });

  const layouts: EventLayout[] = [];
  
  for (const event of sorted) {
    // Trouver événements qui chevauchent celui-ci
    const overlapping = layouts.filter(layout => 
      eventsOverlap(layout.event, event)
    );
    
    if (overlapping.length === 0) {
      // Pas de chevauchement → pleine largeur
      layouts.push({
        event,
        left: 0,
        width: 100,
        column: 0
      });
    } else {
      // Trouver première colonne libre
      const usedColumns = overlapping.map(l => l.column);
      let column = 0;
      while (usedColumns.includes(column)) {
        column++;
      }
      
      // Calculer nombre total de colonnes nécessaires
      const totalColumns = Math.max(...usedColumns, column) + 1;
      
      // Recalculer largeur de tous les événements chevauchants
      const columnWidth = 100 / totalColumns;
      
      for (const layout of overlapping) {
        layout.width = columnWidth;
        layout.left = layout.column * columnWidth;
      }
      
      // Ajouter nouvel événement
      layouts.push({
        event,
        left: column * columnWidth,
        width: columnWidth,
        column
      });
    }
  }
  
  return layouts;
}