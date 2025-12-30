




// // CalendarEventModal.tsx 

// import React, { useState, useEffect } from 'react';
// import type { CalendarEvent } from '../types/calendar';

// interface CalendarEventModalProps {
//   event: CalendarEvent | null;
//   isOpen: boolean;
//   onClose: () => void;
//   onSave?: (event: CalendarEvent) => void;
//   onDelete?: (eventId: string) => void;
//   onInvite?: (eventId: string) => void;
//   isNewEvent?: boolean;
// }

// const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
//   event,
//   isOpen,
//   onClose,
//   onSave,
//   onDelete,
//   onInvite,
//   isNewEvent = false
// }) => {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [location, setLocation] = useState('');  // ← NOUVEAU
//   const [startTime, setStartTime] = useState('');
//   const [endTime, setEndTime] = useState('');
//   const [isEditing, setIsEditing] = useState(isNewEvent);
//   const [color, setColor] = useState('#E77131');
//   const [status, setStatus] = useState<'pending' | 'confirmed' | 'cancelled' | 'completed'>('pending');  // ← NOUVEAU

//   const isPastEvent = event ? event.endTime < new Date() : false;

//   useEffect(() => {
//     if (event && isOpen) {
//       setTitle(event.title);
//       setDescription(event.description || '');
//       setLocation((event as any).location || '');  // ← NOUVEAU
//       setStartTime(event.startTime.toLocaleTimeString('fr-FR', {
//         hour: '2-digit',
//         minute: '2-digit'
//       }));
//       setEndTime(event.endTime.toLocaleTimeString('fr-FR', {
//         hour: '2-digit',
//         minute: '2-digit'
//       }));
//       setColor(event.color);
//       setStatus((event as any).status || 'pending');  // ← NOUVEAU
//       setIsEditing(false);
//     } else if (isNewEvent && isOpen) {
//       setTitle('');
//       setDescription('');
//       setLocation('');  // ← NOUVEAU
//       setStartTime('09:00');
//       setEndTime('10:00');
//       setColor('#E77131');
//       setStatus('pending');  // ← NOUVEAU
//       setIsEditing(true);
//     }
//   }, [event, isOpen, isNewEvent]);

//   if (!isOpen) return null;

//   const handleSave = (): void => {
//     if (!title.trim()) {
//       alert('Le titre est requis');
//       return;
//     }

//     const [startHour, startMin] = startTime.split(':').map(Number);
//     const [endHour, endMin] = endTime.split(':').map(Number);

//     const baseDate = event?.startTime || new Date();
//     const updatedEvent: CalendarEvent = {
//       id: event?.id || `event-${Date.now()}`,
//       title: title.trim(),
//       description: description.trim() || undefined,
//       startTime: new Date(
//         baseDate.getFullYear(),
//         baseDate.getMonth(),
//         baseDate.getDate(),
//         startHour,
//         startMin
//       ),
//       endTime: new Date(
//         baseDate.getFullYear(),
//         baseDate.getMonth(),
//         baseDate.getDate(),
//         endHour,
//         endMin
//       ),
//       color,
//       calendar: event?.calendar || 'personal',
//       location: location.trim() || undefined,  // ← NOUVEAU
//       status  // ← NOUVEAU
//     } as any;

//     onSave?.(updatedEvent);
//     onClose();
//   };

//   const handleDelete = (): void => {
//     if (event && confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
//       onDelete?.(event.id);
//       onClose();
//     }
//   };

//   const handleInvite = (): void => {
//     if (event) {
//       onInvite?.(event.id);
//     }
//   };

//   // ✅ NOUVELLES COULEURS (12 au lieu de 5)
//   const colorOptions = [
//     { label: 'Orange (Primaire)', value: '#E77131' },
//     { label: 'Orange clair', value: '#FF6B35' },
//     { label: 'Orange pastel', value: '#F4A460' },
//     { label: 'Orange foncé', value: '#D2691E' },
//     { label: 'Rouge', value: '#EF5350' },
//     { label: 'Rose', value: '#EC407A' },
//     { label: 'Violet', value: '#AB47BC' },
//     { label: 'Bleu', value: '#42A5F5' },
//     { label: 'Vert', value: '#66BB6A' },
//     { label: 'Jaune', value: '#FFCA28' },
//     { label: 'Gris', value: '#505151' },
//     { label: 'Gris clair', value: '#78909C' }
//   ];

//   // ✅ STATUTS
//   const statusOptions = [
//     { label: 'En attente', value: 'pending', color: '#FFA726', icon: '⏳' },
//     { label: 'Confirmé', value: 'confirmed', color: '#66BB6A', icon: '✓' },
//     { label: 'Annulé', value: 'cancelled', color: '#EF5350', icon: '✗' },
//     { label: 'Terminé', value: 'completed', color: '#78909C', icon: '✔' }
//   ];

//   const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

//   return (
//     <div className="calendar-modal-overlay" onClick={onClose}>
//       <div 
//         className="calendar-modal-content"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* En-tête */}
//         <div className="calendar-modal-header">
//           <h2 className="calendar-modal-title">
//             {isPastEvent && <span className="event-past-badge">Passé</span>}
//             {isEditing ? (isNewEvent ? 'Créer un événement' : 'Modifier l\'événement') : event?.title}
//           </h2>
//           <button 
//             className="calendar-modal-close"
//             onClick={onClose}
//             title="Fermer"
//           >
//             ×
//           </button>
//         </div>

//         {/* Contenu */}
//         <div className="calendar-modal-body">
//           {isEditing ? (
//             <form className="calendar-event-form" onSubmit={(e) => {
//               e.preventDefault();
//               handleSave();
//             }}>
//               <div className="calendar-form-group">
//                 <label className="calendar-form-label">Titre *</label>
//                 <input
//                   type="text"
//                   className="calendar-form-input"
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   placeholder="Titre de l'événement"
//                   autoFocus
//                   required
//                 />
//               </div>

//               <div className="calendar-form-group">
//                 <label className="calendar-form-label">Description</label>
//                 <textarea
//                   className="calendar-form-textarea"
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="Ajouter une description (optionnel)"
//                   rows={3}
//                 />
//               </div>

//               {/* ✅ NOUVEAU : Champ Location */}
//               <div className="calendar-form-group">
//                 <label className="calendar-form-label">📍 Lieu</label>
//                 <input
//                   type="text"
//                   className="calendar-form-input"
//                   value={location}
//                   onChange={(e) => setLocation(e.target.value)}
//                   placeholder="Ex: 12 rue de la Paix, Paris"
//                 />
//               </div>

//               <div className="calendar-form-row">
//                 <div className="calendar-form-group">
//                   <label className="calendar-form-label">Début</label>
//                   <input
//                     type="time"
//                     className="calendar-form-input"
//                     value={startTime}
//                     onChange={(e) => setStartTime(e.target.value)}
//                   />
//                 </div>
//                 <div className="calendar-form-group">
//                   <label className="calendar-form-label">Fin</label>
//                   <input
//                     type="time"
//                     className="calendar-form-input"
//                     value={endTime}
//                     onChange={(e) => setEndTime(e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* ✅ NOUVEAU : Sélecteur statut */}
//               <div className="calendar-form-group">
//                 <label className="calendar-form-label">Statut</label>
//                 <div className="calendar-status-picker">
//                   {statusOptions.map((option) => (
//                     <button
//                       key={option.value}
//                       type="button"
//                       className={`calendar-status-option ${
//                         status === option.value ? 'active' : ''
//                       }`}
//                       style={{ 
//                         borderColor: status === option.value ? option.color : 'transparent',
//                         color: status === option.value ? option.color : '#999'
//                       }}
//                       onClick={() => setStatus(option.value as any)}
//                     >
//                       <span>{option.icon}</span>
//                       <span>{option.label}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="calendar-form-group">
//                 <label className="calendar-form-label">Couleur</label>
//                 <div className="calendar-color-picker">
//                   {colorOptions.map((option) => (
//                     <button
//                       key={option.value}
//                       type="button"
//                       className={`calendar-color-option ${
//                         color === option.value ? 'active' : ''
//                       }`}
//                       style={{ backgroundColor: option.value }}
//                       onClick={() => setColor(option.value)}
//                       title={option.label}
//                     />
//                   ))}
//                 </div>
//               </div>
//             </form>
//           ) : (
//             <div className="calendar-event-details-view">
//               {/* ✅ Overlay grisé si passé - MAIS TOUJOURS FERMABLE */}
//               {isPastEvent && (
//                 <div className="event-past-overlay" style={{ pointerEvents: 'none' }}>
//                   <i className="fas fa-history"></i>
//                   <p>Cet événement est terminé</p>
//                 </div>
//               )}

//               <div
//                 className="calendar-event-color-bar"
//                 style={{ backgroundColor: event?.color }}
//               ></div>

//               {/* ✅ NOUVEAU : Badge statut */}
//               <div className="calendar-event-status-badge" style={{ backgroundColor: currentStatus.color }}>
//                 <span>{currentStatus.icon}</span>
//                 <span>{currentStatus.label}</span>
//               </div>

//               <div className="calendar-event-info">
//                 <div className="calendar-detail-item">
//                   <i className="fas fa-clock"></i>
//                   <div>
//                     <div className="calendar-detail-label">Heure</div>
//                     <div className="calendar-detail-value">
//                       {event?.startTime.toLocaleTimeString('fr-FR', {
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })} - {event?.endTime.toLocaleTimeString('fr-FR', {
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="calendar-detail-item">
//                   <i className="fas fa-calendar"></i>
//                   <div>
//                     <div className="calendar-detail-label">Date</div>
//                     <div className="calendar-detail-value">
//                       {event?.startTime.toLocaleDateString('fr-FR', {
//                         weekday: 'long',
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric'
//                       })}
//                     </div>
//                   </div>
//                 </div>

//                 {/* ✅ NOUVEAU : Afficher location */}
//                 {(event as any)?.location && (
//                   <div className="calendar-detail-item">
//                     <i className="fas fa-map-marker-alt"></i>
//                     <div>
//                       <div className="calendar-detail-label">Lieu</div>
//                       <div className="calendar-detail-value">
//                         {(event as any).location}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {event?.description && (
//                   <div className="calendar-detail-item">
//                     <i className="fas fa-align-left"></i>
//                     <div>
//                       <div className="calendar-detail-label">Description</div>
//                       <div className="calendar-detail-value">
//                         {event.description}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {event?.attendees && event.attendees.length > 0 && (
//                   <div className="calendar-detail-item">
//                     <i className="fas fa-users"></i>
//                     <div>
//                       <div className="calendar-detail-label">Participants</div>
//                       <div className="calendar-detail-value">
//                         {event.attendees.join(', ')}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Pied de page */}
//         <div className="calendar-modal-footer">
//           {isEditing ? (
//             <>
//               <button
//                 className="calendar-btn-secondary"
//                 onClick={() => {
//                   if (isNewEvent) {
//                     onClose();
//                   } else {
//                     setIsEditing(false);
//                   }
//                 }}
//               >
//                 Annuler
//               </button>
//               <button
//                 className="calendar-btn-primary"
//                 onClick={handleSave}
//               >
//                 <i className="fas fa-save"></i>
//                 Enregistrer
//               </button>
//             </>
//           ) : (
//             <>
//               {/* ✅ TOUJOURS pouvoir fermer */}
//               <button
//                 className="calendar-btn-secondary"
//                 onClick={onClose}
//               >
//                 Fermer
//               </button>

//               {!isPastEvent && (
//                 <>
//                   <button
//                     className="calendar-btn-danger"
//                     onClick={handleDelete}
//                   >
//                     <i className="fas fa-trash"></i>
//                     Supprimer
//                   </button>
                  
//                   {onInvite && (
//                     <button
//                       className="calendar-btn-invite"
//                       onClick={handleInvite}
//                       title="Inviter des sociétés"
//                     >
//                       <i className="fas fa-user-plus"></i>
//                       Inviter
//                     </button>
//                   )}
                  
//                   <div className="calendar-modal-footer-spacer"></div>
                  
//                   <button
//                     className="calendar-btn-primary"
//                     onClick={() => setIsEditing(true)}
//                   >
//                     <i className="fas fa-edit"></i>
//                     Modifier
//                   </button>
//                 </>
//               )}
//             </>
//           )}
//         </div>

//         {/* ✅ STYLES */}
//         <style>{`
//           .event-past-badge {
//             display: inline-block;
//             background: #9e9e9e;
//             color: white;
//             padding: 4px 12px;
//             border-radius: 12px;
//             font-size: 11px;
//             font-weight: 600;
//             margin-right: 8px;
//             text-transform: uppercase;
//           }

//           .event-past-overlay {
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background: rgba(255, 255, 255, 0.85);
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             z-index: 1;
//             border-radius: 8px;
//           }

//           .event-past-overlay i {
//             font-size: 48px;
//             color: #9e9e9e;
//             margin-bottom: 12px;
//           }

//           .event-past-overlay p {
//             font-size: 16px;
//             color: #9e9e9e;
//             font-weight: 500;
//           }

//           .calendar-btn-invite {
//             padding: 10px 16px;
//             border: none;
//             border-radius: 6px;
//             font-weight: 500;
//             font-size: 13px;
//             cursor: pointer;
//             transition: all 0.2s;
//             display: flex;
//             align-items: center;
//             gap: 6px;
//             background: #4CAF50;
//             color: white;
//           }

//           .calendar-btn-invite:hover {
//             background: #45a049;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.15);
//           }

//           .calendar-event-status-badge {
//             display: inline-flex;
//             align-items: center;
//             gap: 6px;
//             padding: 6px 12px;
//             border-radius: 16px;
//             color: white;
//             font-size: 12px;
//             font-weight: 600;
//             margin-bottom: 16px;
//           }

//           .calendar-status-picker {
//             display: grid;
//             grid-template-columns: repeat(2, 1fr);
//             gap: 8px;
//           }

//           .calendar-status-option {
//             display: flex;
//             align-items: center;
//             gap: 8px;
//             padding: 10px 12px;
//             border: 2px solid transparent;
//             border-radius: 8px;
//             background: #f5f5f5;
//             cursor: pointer;
//             transition: all 0.2s;
//             font-size: 13px;
//             font-weight: 500;
//           }

//           .calendar-status-option:hover {
//             background: #eeeeee;
//           }

//           .calendar-status-option.active {
//             background: white;
//             border-width: 2px;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.1);
//           }

//           .calendar-color-picker {
//             display: grid;
//             grid-template-columns: repeat(6, 1fr);
//             gap: 8px;
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// };

// export default CalendarEventModal;



// CalendarEventModal.tsx - AVEC TYPE ÉVÉNEMENT
// CalendarEventModal.tsx - AVEC TYPE ÉVÉNEMENT

import React, { useState, useEffect } from 'react';
import type { CalendarEvent } from '../types/calendar';

interface CalendarEventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  onInvite?: (eventId: string) => void;
  onComplete?: (eventId: string) => void;
  onCancel?: (eventId: string) => void;
  isNewEvent?: boolean;
}

type EventType = 'task' | 'work' | 'meeting';

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onInvite,
  onComplete,
  onCancel,
  isNewEvent = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isEditing, setIsEditing] = useState(isNewEvent);
  const [color, setColor] = useState('#E77131');
  const [eventType, setEventType] = useState<EventType>('task');

  const isPastEvent = event ? event.endTime < new Date() : false;
  const eventStatus = (event as any)?.status || 'pending';

  useEffect(() => {
    if (event && isOpen) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation((event as any).location || '');
      setEventType((event as any).event_type || 'task');
      setStartTime(event.startTime.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }));
      setEndTime(event.endTime.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }));
      setColor(event.color);
      setIsEditing(false);
    } else if (isNewEvent && isOpen) {
      setTitle('');
      setDescription('');
      setLocation('');
      setEventType('task');
      setStartTime('09:00');
      setEndTime('10:00');
      setColor('#E77131');
      setIsEditing(true);
    }
  }, [event, isOpen, isNewEvent]);

  if (!isOpen) return null;

  const handleSave = (): void => {
    if (!title.trim()) {
      alert('Le titre est requis');
      return;
    }

    if (eventType !== 'task' && !location.trim()) {
      alert('Le lieu est requis pour les chantiers et réunions');
      return;
    }

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const baseDate = event?.startTime || new Date();
    const updatedEvent: CalendarEvent = {
      id: event?.id || `event-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        startHour,
        startMin
      ),
      endTime: new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        endHour,
        endMin
      ),
      color,
      calendar: event?.calendar || 'personal',
      location: location.trim() || undefined,
      status: 'pending',
      event_type: eventType
    } as any;

    onSave?.(updatedEvent);
    onClose();
  };

  const handleDelete = (): void => {
    if (event && confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      onDelete?.(event.id);
      onClose();
    }
  };

  const handleInvite = (): void => {
    if (event) {
      onInvite?.(event.id);
    }
  };

  const handleComplete = (): void => {
    if (event && confirm('Marquer cet événement comme terminé ?')) {
      onComplete?.(event.id);
      onClose();
    }
  };

  const handleCancelEvent = (): void => {
    if (event && confirm('Annuler cet événement ?')) {
      onCancel?.(event.id);
      onClose();
    }
  };

  const colorOptions = [
    { label: 'Orange', value: '#E77131' },
    { label: 'Orange clair', value: '#FF6B35' },
    { label: 'Orange pastel', value: '#F4A460' },
    { label: 'Rouge', value: '#EF5350' },
    { label: 'Bleu', value: '#42A5F5' },
    { label: 'Vert', value: '#66BB6A' }
  ];

  const eventTypes = [
    { 
      value: 'task' as EventType, 
      label: 'Tâche personnelle', 
      icon: '📝',
      description: 'Pour vous seulement',
      color: '#42A5F5'
    },
    { 
      value: 'work' as EventType, 
      label: 'Chantier/Travail', 
      icon: '👷',
      description: 'Avec d\'autres sociétés',
      color: '#E77131'
    },
    { 
      value: 'meeting' as EventType, 
      label: 'Réunion', 
      icon: '📅',
      description: 'Rendez-vous collectif',
      color: '#66BB6A'
    }
  ];

  const statusDisplay = {
    pending: { label: 'En attente', color: '#FFA726', icon: '⏳' },
    confirmed: { label: 'Confirmé', color: '#66BB6A', icon: '✓' },
    cancelled: { label: 'Annulé', color: '#EF5350', icon: '✗' },
    completed: { label: 'Terminé', color: '#78909C', icon: '✔' }
  };

  const currentStatus = statusDisplay[eventStatus as keyof typeof statusDisplay] || statusDisplay.pending;
  const currentEventType = eventTypes.find(t => t.value === eventType) || eventTypes[0];

  return (
    <div className="calendar-modal-overlay" onClick={onClose}>
      <div 
        className="calendar-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="calendar-modal-header">
          <h2 className="calendar-modal-title">
            {isEditing ? (isNewEvent ? 'Créer un événement' : 'Modifier') : event?.title}
          </h2>
          <button className="calendar-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="calendar-modal-body">
          {isEditing ? (
            <form className="calendar-event-form" onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}>
              {/* Type événement */}
              <div className="calendar-form-group">
                <label className="calendar-form-label">Type *</label>
                <div className="event-type-selector">
                  {eventTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={`event-type-option ${eventType === type.value ? 'active' : ''}`}
                      style={{ 
                        borderColor: eventType === type.value ? type.color : '#ddd',
                        background: eventType === type.value ? `${type.color}10` : 'white'
                      }}
                      onClick={() => setEventType(type.value)}
                    >
                      <div className="event-type-icon">{type.icon}</div>
                      <div className="event-type-text">
                        <div className="event-type-label">{type.label}</div>
                        <div className="event-type-desc">{type.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Titre */}
              <div className="calendar-form-group">
                <label className="calendar-form-label">Titre *</label>
                <input
                  type="text"
                  className="calendar-form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    eventType === 'task' ? 'Ex: Appeler client' :
                    eventType === 'work' ? 'Ex: Chantier Place du Marché' :
                    'Ex: Réunion planification'
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="calendar-form-group">
                <label className="calendar-form-label">Description</label>
                <textarea
                  className="calendar-form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Lieu */}
              <div className="calendar-form-group">
                <label className="calendar-form-label">
                  📍 Lieu {eventType !== 'task' && '*'}
                </label>
                <input
                  type="text"
                  className="calendar-form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: 12 rue de la Paix, Paris"
                  required={eventType !== 'task'}
                />
              </div>

              {/* Heures */}
              <div className="calendar-form-row">
                <div className="calendar-form-group">
                  <label className="calendar-form-label">Début</label>
                  <input
                    type="time"
                    className="calendar-form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="calendar-form-group">
                  <label className="calendar-form-label">Fin</label>
                  <input
                    type="time"
                    className="calendar-form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Couleur */}
              <div className="calendar-form-group">
                <label className="calendar-form-label">Couleur</label>
                <div className="calendar-color-picker">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`calendar-color-option ${color === option.value ? 'active' : ''}`}
                      style={{ backgroundColor: option.value }}
                      onClick={() => setColor(option.value)}
                    />
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <div className="calendar-event-details-view">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <div className="badge" style={{ backgroundColor: currentEventType.color }}>
                  {currentEventType.icon} {currentEventType.label}
                </div>
                <div className="badge" style={{ backgroundColor: currentStatus.color }}>
                  {currentStatus.icon} {currentStatus.label}
                </div>
              </div>

              <div className="calendar-event-info">
                <p><strong>📅</strong> {event?.startTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p><strong>🕐</strong> {startTime} - {endTime}</p>
                {location && <p><strong>📍</strong> {location}</p>}
                {description && <p><strong>📝</strong> {description}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="calendar-modal-footer">
          {isEditing ? (
            <>
              <button className="calendar-btn-secondary" onClick={onClose}>Annuler</button>
              <button className="calendar-btn-primary" onClick={handleSave}>Enregistrer</button>
            </>
          ) : (
            <>
              <button className="calendar-btn-secondary" onClick={onClose}>Fermer</button>
              {!isPastEvent && (
                <>
                  <button className="calendar-btn-danger" onClick={handleDelete}>Supprimer</button>
                  {onInvite && eventType !== 'task' && (
                    <button className="calendar-btn-invite" onClick={handleInvite}>Inviter</button>
                  )}
                  <button className="calendar-btn-primary" onClick={() => setIsEditing(true)}>Modifier</button>
                </>
              )}
            </>
          )}
        </div>

        <style>{`
          .event-type-selector {
            display: grid;
            gap: 10px;
          }
          .event-type-option {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .event-type-option:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .event-type-option.active { border-width: 2px; }
          .event-type-icon { font-size: 28px; }
          .event-type-text { flex: 1; text-align: left; }
          .event-type-label { font-weight: 600; font-size: 14px; }
          .event-type-desc { font-size: 12px; color: #666; }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 12px;
            color: white;
            font-size: 11px;
            font-weight: 600;
          }
          .calendar-color-picker {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 8px;
          }
          .calendar-color-option {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid transparent;
            cursor: pointer;
          }
          .calendar-color-option.active {
            border-color: #333;
            box-shadow: 0 0 0 2px white, 0 0 0 4px #333;
          }
          .calendar-btn-invite {
            padding: 10px 16px;
            border: none;
            border-radius: 6px;
            background: #4CAF50;
            color: white;
            cursor: pointer;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CalendarEventModal;
