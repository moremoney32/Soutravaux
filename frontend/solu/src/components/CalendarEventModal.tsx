import React, { useState, useEffect } from 'react';
import type { CalendarEvent } from '../types/calendar';

interface CalendarEventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  isNewEvent?: boolean;
}

/**
 * Modal pour afficher/éditer/créer un événement
 * Respecte la charte graphique
 */
const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isNewEvent = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isEditing, setIsEditing] = useState(isNewEvent);
  const [color, setColor] = useState('#E77131');

  // Initialise le formulaire quand l'événement change
  useEffect(() => {
    if (event && isOpen) {
      setTitle(event.title);
      setDescription(event.description || '');
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
      calendar: event?.calendar || 'personal'
    };

    onSave?.(updatedEvent);
    onClose();
  };

  const handleDelete = (): void => {
    if (event && confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      onDelete?.(event.id);
      onClose();
    }
  };

  const colorOptions = [
    { label: 'Orange (Primaire)', value: '#E77131' },
    { label: 'Orange clair', value: '#FF6B35' },
    { label: 'Orange pastel', value: '#F4A460' },
    { label: 'Orange foncé', value: '#D2691E' },
    { label: 'Gris', value: '#505151' }
  ];

  return (
    <div className="calendar-modal-overlay" onClick={onClose}>
      <div 
        className="calendar-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="calendar-modal-header">
          <h2 className="calendar-modal-title">
            {isEditing ? (isNewEvent ? 'Créer un événement' : 'Modifier l\'événement') : event?.title}
          </h2>
          <button 
            className="calendar-modal-close"
            onClick={onClose}
            title="Fermer"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <div className="calendar-modal-body">
          {isEditing ? (
            <form className="calendar-event-form" onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}>
              {/* Titre */}
              <div className="calendar-form-group">
                <label className="calendar-form-label">Titre</label>
                <input
                  type="text"
                  className="calendar-form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de l'événement"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="calendar-form-group">
                <label className="calendar-form-label">Description</label>
                <textarea
                  className="calendar-form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ajouter une description (optionnel)"
                  rows={3}
                />
              </div>

              {/* Heure début/fin */}
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
                      className={`calendar-color-option ${
                        color === option.value ? 'active' : ''
                      }`}
                      style={{ backgroundColor: option.value }}
                      onClick={() => setColor(option.value)}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <div className="calendar-event-details-view">
              {/* Couleur de l'événement */}
              <div
                className="calendar-event-color-bar"
                style={{ backgroundColor: event?.color }}
              ></div>

              {/* Détails */}
              <div className="calendar-event-info">
                <div className="calendar-detail-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <div className="calendar-detail-label">Heure</div>
                    <div className="calendar-detail-value">
                      {event?.startTime.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {event?.endTime.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <div className="calendar-detail-item">
                  <i className="fas fa-calendar"></i>
                  <div>
                    <div className="calendar-detail-label">Date</div>
                    <div className="calendar-detail-value">
                      {event?.startTime.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {event?.description && (
                  <div className="calendar-detail-item">
                    <i className="fas fa-align-left"></i>
                    <div>
                      <div className="calendar-detail-label">Description</div>
                      <div className="calendar-detail-value">
                        {event.description}
                      </div>
                    </div>
                  </div>
                )}

                {event?.attendees && event.attendees.length > 0 && (
                  <div className="calendar-detail-item">
                    <i className="fas fa-users"></i>
                    <div>
                      <div className="calendar-detail-label">Participants</div>
                      <div className="calendar-detail-value">
                        {event.attendees.join(', ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="calendar-modal-footer">
          {isEditing ? (
            <>
              <button
                className="calendar-btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Annuler
              </button>
              <button
                className="calendar-btn-primary"
                onClick={handleSave}
              >
                <i className="fas fa-save"></i>
                Enregistrer
              </button>
            </>
          ) : (
            <>
              <button
                className="calendar-btn-danger"
                onClick={handleDelete}
              >
                <i className="fas fa-trash"></i>
                Supprimer
              </button>
              <div className="calendar-modal-footer-spacer"></div>
              <button
                className="calendar-btn-secondary"
                onClick={onClose}
              >
                Fermer
              </button>
              <button
                className="calendar-btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <i className="fas fa-edit"></i>
                Modifier
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarEventModal;
