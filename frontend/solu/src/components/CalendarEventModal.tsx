

// CalendarEventModal.tsx 

import React, { useState, useEffect } from 'react';
import type { CalendarEvent, EventScope, EventCategory } from '../types/calendar';
import InviteAttendeesModal from './InvitesAttentesModal';


interface CalendarEventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  onInvite?: (eventId: string, societeIds: number[]) => Promise<void>;
  onComplete?: (eventId: string) => void;
  onCancel?: (eventId: string) => void;
  isNewEvent?: boolean;
  categories?: EventCategory[];
  onFetchCategories?: () => Promise<void>;
  onCreateCategory?: (label: string, icon?: string, color?: string, requires_location?: boolean) => Promise<EventCategory>;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onInvite,
  isNewEvent = false,
  categories = [],
  onCreateCategory
}) => {
  // ═══════════════════════════════════════════════
  // ÉTATS
  // ═══════════════════════════════════════════════
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('#E77131');
  const [isEditing, setIsEditing] = useState(isNewEvent);
  
  // ✅ MODIFIÉ : Remplacer eventType par eventCategoryId et customCategoryLabel
  const [scope, setScope] = useState<EventScope>('personal');
  const [eventCategoryId, setEventCategoryId] = useState<number | undefined>(undefined);
  const [customCategoryLabel, setCustomCategoryLabel] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'sms' | 'push' | 'contact'>('email');
  console.log('Selected Attendees:', inviteMethod);
  
  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateCategoryInput, setShowCreateCategoryInput] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📌');
  const [newCategoryColor, setNewCategoryColor] = useState('#E77131');
  const [newCategoryRequiresLocation, setNewCategoryRequiresLocation] = useState(false);


  // ═══════════════════════════════════════════════
  // CONFIGURATION CATÉGORIES (depuis props)
  // ═══════════════════════════════════════════════
  const colorOptions = [
    { label: 'Orange', value: '#E77131' },
    { label: 'Orange clair', value: '#FF6B35' },
    { label: 'Orange pastel', value: '#F4A460' },
    { label: 'Rouge', value: '#EF5350' },
    { label: 'Bleu', value: '#42A5F5' },
    { label: 'Vert', value: '#66BB6A' }
  ];


  const isPastEvent = event ? event.endTime < new Date() : false;
  const eventStatus = event?.status || 'pending';

  const statusDisplay = {
    pending: { label: 'En attente', color: '#FFA726', icon: '⏳' },
    confirmed: { label: 'Confirmé', color: '#66BB6A', icon: '✓' },
    cancelled: { label: 'Annulé', color: '#EF5350', icon: '✗' },
    completed: { label: 'Terminé', color: '#78909C', icon: '✔' }
  };

  // ═══════════════════════════════════════════════
  // EFFET : Initialisation des valeurs
  // ═══════════════════════════════════════════════
  useEffect(() => {
    if (event && isOpen) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setScope(event.scope);
      setEventCategoryId(event.event_category_id);
      setCustomCategoryLabel(event.custom_category_label || '');
      setSelectedAttendees(event.attendees || []);
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
      // Reset pour nouvel événement
      setTitle('');
      setDescription('');
      setLocation('');
      setScope('personal');
      setEventCategoryId(undefined);
      setCustomCategoryLabel('');
      setSelectedAttendees([]);
      setStartTime('09:00');
      setEndTime('10:00');
      setColor('#E77131');
      setInviteMethod('email');
      setIsEditing(true);
    }
  }, [event, isOpen, isNewEvent]);

  if (!isOpen) return null;

  // ═══════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════
  const handleSave = (): void => {
    // Validation titre
    if (!title.trim()) {
      alert('Le titre est requis');
      return;
    }

    // Validation lieu (si requis par la catégorie)
    // const selectedCategory = eventCategoryId 
    //   ? categories.find(c => c.id === eventCategoryId)
    //   : null;
    
    // if (selectedCategory?.requires_location && !location.trim()) {
    //   alert('Le lieu est requis pour cette catégorie');
    //   return;
    // }

    // Construction dates
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
      scope,
      event_category_id: eventCategoryId,
      custom_category_label: customCategoryLabel || undefined,
      attendees: scope === 'collaborative' ? selectedAttendees : []
    };

    console.log('📤 Saving event:', updatedEvent);
    onSave?.(updatedEvent);
    onClose();
  };

  const handleDelete = (): void => {
    if (event && confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      onDelete?.(event.id);
      onClose();
    }
  };

  const handleInviteComplete = async (societeIds: number[]): Promise<void> => {
    setSelectedAttendees(societeIds);
    
    // Si événement existe et onInvite fourni
    if (event && event.id && onInvite) {
      try {
        await onInvite(event.id, societeIds);
      } catch (error) {
        console.error('Erreur invitation:', error);
        alert('Impossible d\'inviter les participants');
      }
    }
    
    setShowInviteModal(false);
  };

  const handleCreateCategory = async (): Promise<void> => {
    if (!newCategoryLabel.trim()) {
      alert('Veuillez entrer un nom pour la catégorie');
      return;
    }

    if (onCreateCategory) {
      try {
        const newCategory = await onCreateCategory(
          newCategoryLabel.trim(),
          newCategoryIcon,
          newCategoryColor,
          newCategoryRequiresLocation
        );
        setEventCategoryId(newCategory.id);
        setCustomCategoryLabel('');
        setShowCreateCategoryInput(false);
        setNewCategoryLabel('');
        setNewCategoryIcon('📌');
        setNewCategoryColor('#E77131');
        setNewCategoryRequiresLocation(false);
      } catch (error) {
        console.error('Erreur création catégorie:', error);
        alert('Erreur lors de la création de la catégorie');
      }
    }
  };

  // const handleComplete = (): void => {
  //   if (event && confirm('Marquer cet événement comme terminé ?')) {
  //     onComplete?.(event.id);
  //     onClose();
  //   }
  // };

  // const handleCancelEvent = (): void => {
  //   if (event && confirm('Annuler cet événement ?')) {
  //     onCancel?.(event.id);
  //     onClose();
  //   }
  // };


  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════
  const selectedCategory = eventCategoryId 
    ? categories.find(c => c.id === eventCategoryId)
    : null;

  const currentStatus = statusDisplay[eventStatus as keyof typeof statusDisplay] || statusDisplay.pending;

  // ═══════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════
  return (
    <>
      <div className="calendar-modal-overlay" onClick={onClose}>
        <div 
          className="calendar-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="calendar-modal-header">
            <h2 className="calendar-modal-title">
              {isEditing ? (isNewEvent ? 'Créer un événement' : 'Modifier') : event?.title}
            </h2>
            <button className="calendar-modal-close" onClick={onClose}>×</button>
          </div>

          {/* BODY */}
          <div className="calendar-modal-body">
            {isEditing ? (
              <form className="calendar-event-form" onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}>
                
                {/* ════════════════════════════════════ */}
                {/* 1️⃣ PORTÉE (Personnel / Collaboratif) */}
                {/* ════════════════════════════════════ */}
                <div className="calendar-form-group">
                  <label className="calendar-form-label">
                    Portée de l'événement *
                  </label>
                  
                  <div className="scope-selector">
                    <label 
                      className={`scope-option ${scope === 'personal' ? 'active' : ''}`}
                      style={{
                        borderColor: scope === 'personal' ? '#42A5F5' : '#ddd',
                        background: scope === 'personal' ? '#E3F2FD' : 'white'
                      }}
                    >
                      <input
                        type="radio"
                        name="scope"
                        value="personal"
                        checked={scope === 'personal'}
                        onChange={() => setScope('personal')}
                      />
                      <div className="scope-content">
                        <div className="scope-icon">🙋‍♂️</div>
                        <div className="scope-text">
                          <div className="scope-title">Moi uniquement</div>
                          <div className="scope-desc">Événement personnel, pas d'invitation</div>
                        </div>
                      </div>
                    </label>

                    <label 
                      className={`scope-option ${scope === 'collaborative' ? 'active' : ''}`}
                      style={{
                        borderColor: scope === 'collaborative' ? '#4CAF50' : '#ddd',
                        background: scope === 'collaborative' ? '#E8F5E9' : 'white'
                      }}
                    >
                      <input
                        type="radio"
                        name="scope"
                        value="collaborative"
                        checked={scope === 'collaborative'}
                        onChange={() => setScope('collaborative')}
                      />
                      <div className="scope-content">
                        <div className="scope-icon">👥</div>
                        <div className="scope-text">
                          <div className="scope-title">Avec d'autres</div>
                          <div className="scope-desc">Inviter des collaborateurs/sociétés</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* ════════════════════════════════════ */}
                {/* 2️⃣ CATÉGORIE D'ÉVÉNEMENT            */}
                {/* ════════════════════════════════════ */}
                <div className="calendar-form-group">
                  <label className="calendar-form-label">
                    Catégorie d'événement
                  </label>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <select
                      className="calendar-form-select"
                      value={eventCategoryId || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          setEventCategoryId(Number(value));
                          setCustomCategoryLabel('');
                        } else {
                          setEventCategoryId(undefined);
                        }
                      }}
                      style={{ flex: 1 }}
                    >
                      <option value="">-- Sélectionner une catégorie --</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => setShowCreateCategoryInput(!showCreateCategoryInput)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      + Nouvelle catégorie
                    </button>
                  </div>

                  {/* Formulaire création catégorie */}
                  {showCreateCategoryInput && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      marginBottom: '12px',
                      border: '1px solid #ddd'
                    }}>
                      <div className="calendar-form-group" style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Label *</label>
                        <input
                          type="text"
                          value={newCategoryLabel}
                          onChange={(e) => setNewCategoryLabel(e.target.value)}
                          placeholder="Ex: Visite client"
                          style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '4px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div className="calendar-form-group" style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Icône</label>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {['📌', '💼', '🏗️', '🔧', '🤝', '📦', '⚙️', '📋', '🎓', '✏️', '🎯', '🚀'].map((icon) => (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => setNewCategoryIcon(icon)}
                              style={{
                                padding: '8px 10px',
                                backgroundColor: newCategoryIcon === icon ? '#42A5F5' : '#e0e0e0',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                color: newCategoryIcon === icon ? 'white' : 'black'
                              }}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* <div className="calendar-form-group" style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Couleur</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          {['#E77131', '#FF6B35', '#F4A460', '#EF5350', '#42A5F5', '#66BB6A'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setNewCategoryColor(c)}
                              style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: c,
                                border: newCategoryColor === c ? '3px solid black' : '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            />
                          ))}
                        </div>
                      </div> */}

                      {/* <div className="calendar-form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={newCategoryRequiresLocation}
                            onChange={(e) => setNewCategoryRequiresLocation(e.target.checked)}
                          />
                          <span style={{ fontSize: '14px' }}>Cette catégorie requiert un lieu</span>
                        </label>
                      </div> */}

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Créer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateCategoryInput(false);
                            setNewCategoryLabel('');
                          }}
                          style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: '#999',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Catégorie personnalisée sans référence */}
                  {!eventCategoryId && customCategoryLabel && (
                    <div style={{
                      padding: '8px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '4px',
                      marginTop: '8px',
                      fontSize: '12px'
                    }}>
                      📌 {customCategoryLabel}
                    </div>
                  )}
                </div>

                {/* ════════════════════════════════════ */}
                {/* BOUTON INVITER (Si Collaboratif)     */}
                {/* ════════════════════════════════════ */}
                {scope === 'collaborative' && (
                  <div className="calendar-form-group invite-participants-group">
                    <button
                      type="button"
                      className="calendar-btn-invite-full"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <span className="icon">👥</span>
                      <span>Inviter des participants</span>
                      {selectedAttendees.length > 0 && (
                        <span className="badge-count">{selectedAttendees.length}</span>
                      )}
                    </button>
                  </div>
                )}

                {/* ════════════════════════════════════ */}
                {/* TITRE                                 */}
                {/* ════════════════════════════════════ */}
                <div className="calendar-form-group">
                  <label className="calendar-form-label">Titre *</label>
                  <input
                    type="text"
                    className="calendar-form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Réunion client"
                    required
                  />
                </div>

                {/* ════════════════════════════════════ */}
                {/* DESCRIPTION                           */}
                {/* ════════════════════════════════════ */}
                <div className="calendar-form-group">
                  <label className="calendar-form-label">Description</label>
                  <textarea
                    className="calendar-form-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Détails de l'événement..."
                  />
                </div>

                {/* ════════════════════════════════════ */}
                {/* LIEU                                  */}
                {/* ════════════════════════════════════ */}
                <div className="calendar-form-group">
                  <label className="calendar-form-label">
                    📍 Lieu 
                  </label>
                  <input
                    type="text"
                    className="calendar-form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: 12 rue de la Paix, Paris"
                    required={selectedCategory?.requires_location}
                  />
                </div>

                {/* ════════════════════════════════════ */}
                {/* HEURES DÉBUT/FIN                      */}
                {/* ════════════════════════════════════ */}
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

                {/* ════════════════════════════════════ */}
                {/* COULEUR                               */}
                {/* ════════════════════════════════════ */}
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
              // ════════════════════════════════════
              // VUE DÉTAILS (Mode lecture)
              // ════════════════════════════════════
              <div className="calendar-event-details-view">
                <div className="event-info-header">
                  <div className="badge" style={{ backgroundColor: selectedCategory?.color || '#E77131' }}>
                    {selectedCategory?.icon || '📌'} {selectedCategory?.label || customCategoryLabel || 'Événement'}
                  </div>
                  <div className="badge" style={{ backgroundColor: currentStatus.color }}>
                    {currentStatus.icon} {currentStatus.label}
                  </div>
                  {scope === 'collaborative' && (
                    <div className="badge" style={{ backgroundColor: '#4CAF50' }}>
                      👥 Collaboratif
                    </div>
                  )}
                </div>

                <div className="calendar-event-info">
                  <p><strong>📅</strong> {event?.startTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <p><strong>🕐</strong> {startTime} - {endTime}</p>
                  {location && <p><strong>📍</strong> {location}</p>}
                  {description && <p><strong>📝</strong> {description}</p>}
                  {selectedAttendees.length > 0 && (
                    <p><strong>👥</strong> {selectedAttendees.length} participant(s) invité(s)</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
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
                    {scope === 'collaborative' && (
                      <button className="calendar-btn-invite" onClick={() => setShowInviteModal(true)}>
                        👥 Gérer invités
                      </button>
                    )}
                    {/* {eventStatus === 'pending' && (
                      <>
                         <button className="calendar-btn-success" onClick={handleComplete}>
                          ✓ Terminer
                        </button> 
                        <button className="calendar-btn-warning" onClick={handleCancelEvent}>
                          ✗ Annuler
                        </button>
                      </>
                    )} */}
                    <button className="calendar-btn-primary" onClick={() => setIsEditing(true)}>Modifier</button>
                  </>
                )}
              </>
            )}
          </div>

          {/* STYLES */}
          <style>{`
            /* Scope Selector */
            .scope-selector {
              display: grid;
              gap: 12px;
            }
            
            .scope-option {
              display: block;
              padding: 14px;
              border: 2px solid #ddd;
              border-radius: 10px;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .scope-option:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .scope-option input[type="radio"] {
              display: none;
            }
              .invite-participants-group{
              display: flex;
              gap:10px;
              align-items:center ! important;
              }
            
            .scope-content {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            
            .scope-icon {
              font-size: 32px;
            }
            
            .scope-text {
              flex: 1;
              text-align: left;
            }
            
            .scope-title {
              font-weight: 500;
              font-size: 13px;
              margin-bottom: 4px;
              color: #333;
            }
            
            .scope-desc {
              font-size: 12px;
              color: #666;
            }
            
            /* Select & Custom Type */
            .calendar-form-select {
              width: 100%;
              padding: 10px 12px;
              border: 1px solid #ddd;
              border-radius: 6px;
              font-size: 14px;
              background: white;
              cursor: pointer;
            }
              .calendar-form-select option{
             font-size:12px;
             font-weight:350;
              width: 100%;
            }
            
            .create-type-link {
              margin-top: 8px;
              background: none;
              border: none;
              color: #4CAF50;
              font-size: 13px;
              cursor: pointer;
              text-decoration: underline;
              padding: 0;
            }
            
            .custom-type-creator {
              margin-top: 12px;
              padding: 12px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            
            /* Bouton Inviter */
            .calendar-btn-invite-full {
              width: 100%;
              padding: 14px 20px;
              background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
              color: white;
              border: none;
              border-radius: 10px;
              font-weight: 500;
              font-size: 13px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              transition: all 0.2s;
              box-shadow: 0 2px 8px rgba(76, 175, 80, 0.25);
            }
            
            .calendar-btn-invite-full:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 16px rgba(76, 175, 80, 0.35);
            }
            
            .calendar-btn-invite-full .icon {
              font-size: 20px;
            }
            
            .calendar-btn-invite-full .badge-count {
              background: rgba(255,255,255,0.25);
              padding: 3px 10px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
            }
            
            /* Badges */
            .badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 5px 12px;
              border-radius: 14px;
              color: white;
              font-size: 11px;
              font-weight: 500;
            }
            
            .event-info-header {
              display: flex;
              gap: 8px;
              margin-bottom: 16px;
              flex-wrap: wrap;
            }
            
            /* Petits boutons */
            .calendar-btn-primary-sm,
            .calendar-btn-secondary-sm {
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              border: none;
              cursor: pointer;
              font-weight:450;
            }
            
            .calendar-btn-primary-sm {
              background: #4CAF50;
              color: white;
            }
            
            .calendar-btn-primary-sm:hover {
              background: #45a049;
            }
            
            .calendar-btn-secondary-sm {
              background: #eee;
              color: #333;
            }
            
            .calendar-btn-secondary-sm:hover {
              background: #ddd;
            }
            
            /* Boutons footer */
            .calendar-btn-success {
              padding: 10px 16px;
              border: none;
              border-radius: 6px;
              background: #4CAF50;
              color: white;
              cursor: pointer;
              font-weight:450;
            }
            
            .calendar-btn-warning {
              padding: 10px 16px;
              border: none;
              border-radius: 6px;
              background: #FFA726;
              color: white;
              cursor: pointer;
              font-weight:450;
            }
            
            .calendar-btn-invite {
              padding: 10px 16px;
              border: none;
              border-radius: 6px;
              background: #4CAF50;
              color: white;
              cursor: pointer;
              font-weight: 450;
            }
            
            /* Color picker */
            .calendar-color-picker {
              display: grid;
              grid-template-columns: repeat(6, 1fr);
              gap: 5px;
              justify-items: center ! important;  /* ← AJOUTÉ : Centre les éléments */
  align-items: center ! important;    /* ← AJOUTÉ : Centre verticalement */
            }
            
            .calendar-color-option {
              width: 25px;
              height: 25px;
              border-radius: 50%;
              border: 2px solid transparent;
              cursor: pointer;
              transition: all 0.2s;
               flex-shrink: 0 !important;
            }
            
            .calendar-color-option:hover {
              transform: scale(1.1);
            }
            
            .calendar-color-option.active {
              border-color: #333;
              box-shadow: 0 0 0 2px white, 0 0 0 4px #333;
            }

            @media (max-width: 768px) {
            
 
  .calendar-color-option {
  width:35px !important;
  height:35px !important;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 50%;
    aspect-ratio: 1 / 1;
            }
}
          `}</style>
        </div>
      </div>

      {/* Modal Invitations */}
      {showInviteModal && (
  <InviteAttendeesModal
    isOpen={showInviteModal}
    onClose={() => setShowInviteModal(false)}
    onInvite={handleInviteComplete}  // ✅ Type correct
    eventId={event?.id || `temp-${Date.now()}`}  // ✅ String
    initialSelectedIds={selectedAttendees}  // ✅ Prop acceptée
  />
)}
    </>
  );
};

export default CalendarEventModal;
