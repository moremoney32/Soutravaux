

import React, { useState, useEffect, useRef } from 'react';
import type { CalendarEvent, EventScope, EventCategory } from '../types/calendar';
import InviteAttendeesModal from './InvitesAttentesModal';
import LocationAutocomplete from './LocationAutocomplete';
import TimeRangePicker from './TimeRangePicker';
import { searchSocietes, inviterSocieteAPI, inviterSocieteExterneAPI } from '../services/calendarApi';

interface CalendarEventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  onInvite?: (emails: string[]) => Promise<void>;
  onComplete?: (eventId: string) => void;
  onCancel?: (eventId: string) => void;
  isNewEvent?: boolean;
  categories?: EventCategory[];
  onFetchCategories?: () => Promise<void>;
  onCreateCategory?: (label: string, icon?: string, color?: string, requires_location?: boolean) => Promise<EventCategory>;
  onDeleteCategory?: (categoryId: number) => Promise<void>;
  currentMembreId?: number;
  currentSocieteId?: number;
  userRole?: 'admin' | 'collaborator' | null;
  initialDate?: Date;
}

interface Reminder {
  value: string;
  method: 'email' | 'notification';
}

interface SocieteResult {
  id: number;
  nomsociete: string;
  email: string;
  ville: string;
  logo?: string;
  nom_responsable: string;
  prenom_responsable: string;
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
  onCreateCategory,
  onDeleteCategory,
  currentMembreId,
  currentSocieteId,
  userRole = null,
  initialDate
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
  const [reminders, setReminders] = useState<Reminder[]>([
    { value: '60', method: 'email' }
  ]);
  const [scope, setScope] = useState<EventScope>('personal');
  const [eventCategoryId, setEventCategoryId] = useState<number | undefined>(undefined);
  const [customCategoryLabel, setCustomCategoryLabel] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'sms' | 'push' | 'contact'>('email');
  console.log('Selected Attendees:', inviteMethod);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateCategoryInput, setShowCreateCategoryInput] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [multiDayEndDate, setMultiDayEndDate] = useState('');
  const [multiDayEndTime, setMultiDayEndTime] = useState('');
  const [categoryDropdownPos, setCategoryDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const categoryTriggerRef = useRef<HTMLDivElement>(null);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📌');
  const [newCategoryColor, setNewCategoryColor] = useState('#E77131');
  const [newCategoryRequiresLocation, setNewCategoryRequiresLocation] = useState(false);
  const [newCategoryError, setNewCategoryError] = useState('');

  // ✅ États invitation société
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SocieteResult[]>([]);
  const [selectedSocietes, setSelectedSocietes] = useState<SocieteResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSocieteSearch, setShowSocieteSearch] = useState(false); // ✅ toggle section
  const [invitingSocieteId, setInvitingSocieteId] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Onglets formulaire
  const [activeTab, setActiveTab] = useState<'infos' | 'invites'>('infos');

  // États invitation externe
  const [showExternePopup, setShowExternePopup] = useState(false);
  const [externeEmail, setExterneEmail] = useState('');
  const [isSendingExterne, setIsSendingExterne] = useState(false);
  const [externeEmailsList, setExterneEmailsList] = useState<string[]>([]); // pour mode création

  const colorOptions = [
    { label: 'Orange', value: '#E77131' },
    { label: 'Orange clair', value: '#FF6B35' },
    { label: 'Orange pastel', value: '#F4A460' },
    { label: 'Rouge', value: '#EF5350' },
    { label: 'Bleu', value: '#42A5F5' },
    { label: 'Vert', value: '#66BB6A' }
  ];

  const isOwner = !event?.created_by_membre_id ||
    event?.created_by_membre_id === currentMembreId;

   console.log(showSocieteSearch)
   console.log(showExternePopup)

  const isPastEvent = event ? event.endTime < new Date() : false;
  const eventStatus = event?.status || 'pending';

  const statusDisplay = {
    pending: { label: 'En attente', color: '#FFA726', icon: '⏳' },
    confirmed: { label: 'Confirmé', color: '#66BB6A', icon: '✓' },
    cancelled: { label: 'Annulé', color: '#EF5350', icon: '✗' },
    completed: { label: 'Terminé', color: '#78909C', icon: '✔' }
  };

  // ═══════════════════════════════════════════════
  // HANDLERS RAPPELS
  // ═══════════════════════════════════════════════
  const handleAddReminder = () => {
    if (reminders.length < 5) {
      setReminders([...reminders, { value: '60', method: 'email' }]);
    } else {
      alert('Maximum 5 rappels');
    }
  };

  const handleRemoveReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const handleReminderChange = (index: number, field: 'value' | 'method', value: string) => {
    const updated = [...reminders];
    updated[index][field] = value as any;
    setReminders(updated);
  };

  // ═══════════════════════════════════════════════
  // HANDLERS RECHERCHE SOCIÉTÉ
  // ═══════════════════════════════════════════════
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setShowSearchResults(true);
    searchTimeout.current = setTimeout(async () => {
      if (!currentSocieteId) return;
      setIsSearching(true);
      try {
        const results = await searchSocietes(value, currentSocieteId);
        setSearchResults(results.filter(s => !selectedSocietes.some(sel => sel.id === s.id)));
      } catch (error) {
        console.error('Erreur recherche:', error);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSearchFocus = async () => {
    if (searchQuery.length < 2) return;
    setShowSearchResults(true);
    if (searchResults.length === 0 && currentSocieteId) {
      setIsSearching(true);
      try {
        const results = await searchSocietes(searchQuery, currentSocieteId);
        setSearchResults(results.filter(s => !selectedSocietes.some(sel => sel.id === s.id)));
      } catch (error) {
        console.error('Erreur chargement sociétés:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSelectSociete = (societe: SocieteResult) => {
    setSelectedSocietes(prev => [...prev, societe]);
    setSearchResults(prev => prev.filter(s => s.id !== societe.id));
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleRemoveSociete = (societeId: number) => {
    setSelectedSocietes(prev => prev.filter(s => s.id !== societeId));
  };

  const handleInviterSociete = async (societe: SocieteResult) => {
    if (!event?.id || !currentSocieteId || !currentMembreId) return;
    setInvitingSocieteId(societe.id);
    try {
      await inviterSocieteAPI(Number(event.id), currentSocieteId, societe.id, currentMembreId);
      alert(`✅ ${societe.nomsociete} a été invitée avec succès !`);
      setShowSocieteSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    } finally {
      setInvitingSocieteId(null);
    }
  };

  const handleInviterExterne = async (): Promise<void> => {
    if (!externeEmail.trim() || !event?.id || !currentSocieteId || !currentMembreId) return;
    setIsSendingExterne(true);
    try {
      await inviterSocieteExterneAPI(Number(event.id), currentSocieteId, currentMembreId, externeEmail.trim());
      alert(`✅ Invitation envoyée à ${externeEmail.trim()}`);
      setExterneEmail('');
      setShowExternePopup(false);
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    } finally {
      setIsSendingExterne(false);
    }
  };

  // Mode création : ajoute l'email à la liste locale (envoi après création de l'event)ppoo
  const handleAddExterneEmail = (): void => {
    if (!externeEmail.trim()) return;
    setExterneEmailsList(prev => [...prev, externeEmail.trim()]);
    setExterneEmail('');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ═══════════════════════════════════════════════
  // EFFET : Initialisation
  // ═══════════════════════════════════════════════
  useEffect(() => {
    if (event && isOpen) {
      setActiveTab('infos');
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setScope(event.scope);
      setEventCategoryId(event.event_category_id);
      setCustomCategoryLabel(event.custom_category_label || '');
      setSelectedAttendees(event.attendees || []);
      setStartTime(event.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setEndTime(event.endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setColor(event.color);
      setIsEditing(false);
      setSelectedSocietes([]);
      setSearchQuery('');
      setShowSocieteSearch(false);
      setShowExternePopup(false);
      setExterneEmail('');
      setExterneEmailsList((event as any).invited_externe_emails || []);

      if (event.reminders && event.reminders.length > 0) {
        setReminders(event.reminders);
      } else {
        setReminders([]);
      }

      if (event.end_date) {
        setIsMultiDay(true);
        setMultiDayEndDate(event.end_date);
        // heure de fin = heure stockée dans endTime (qui vient du dernier jour)
        setMultiDayEndTime(event.endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setIsMultiDay(false);
        setMultiDayEndDate('');
        setMultiDayEndTime('');
      }

    } else if (isNewEvent && isOpen) {
      setActiveTab('infos');
      setTitle('');
      setDescription('');
      setLocation('');
      setScope('personal');
      setEventCategoryId(undefined);
      setCustomCategoryLabel('');
      setSelectedAttendees([]);
      setColor('#E77131');
      setInviteMethod('email');
      setIsEditing(true);
      setReminders([{ value: '60', method: 'email' }]);
      setIsMultiDay(false);
      setMultiDayEndDate('');
      setMultiDayEndTime('');
      setSelectedSocietes([]);
      setSearchQuery('');
      setShowSocieteSearch(false);
      setShowExternePopup(false);
      setExterneEmail('');
      setExterneEmailsList([]);

      const now = initialDate || new Date();
      const totalMinutes = now.getHours() * 60 + now.getMinutes();
      const roundedStart = Math.ceil(totalMinutes / 15) * 15;
      const safeStart = roundedStart >= 24 * 60 ? 23 * 60 : roundedStart;
      const safeEnd = safeStart + 60 >= 24 * 60 ? 23 * 60 + 45 : safeStart + 60;
      const startH = Math.floor(safeStart / 60);
      const startM = safeStart % 60;
      const endH = Math.floor(safeEnd / 60);
      const endM = safeEnd % 60;
      setStartTime(`${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`);
      setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    }
  }, [event, isOpen, isNewEvent]);

  if (!isOpen) return null;

  // ═══════════════════════════════════════════════
  // HANDLERS SAVE / DELETE
  // ═══════════════════════════════════════════════
  const handleSave = (): void => {
    if (!title.trim()) { alert('Le titre est requis'); return; }

    const [startHour, startMin] = startTime.split(':').map(Number);
    const baseDate = event?.startTime || new Date();

    // Pour multi-jours : endTime est sur la date de fin avec l'heure de fin du dernier jour
    let computedEndTime: Date;
    if (isMultiDay && multiDayEndDate && multiDayEndTime) {
      const [endHour, endMin] = multiDayEndTime.split(':').map(Number);
      const endBase = new Date(multiDayEndDate + 'T00:00:00');
      computedEndTime = new Date(endBase.getFullYear(), endBase.getMonth(), endBase.getDate(), endHour, endMin);
    } else {
      const [endHour, endMin] = endTime.split(':').map(Number);
      computedEndTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), endHour, endMin);
    }

    const updatedEvent: CalendarEvent = {
      id: event?.id || `event-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), startHour, startMin),
      endTime: computedEndTime,
      color,
      calendar: event?.calendar || 'personal',
      location: location.trim() || undefined,
      status: 'pending',
      scope,
      event_category_id: eventCategoryId,
      custom_category_label: customCategoryLabel || undefined,
      attendees: scope === 'collaborative' ? selectedAttendees : [],
      reminders,
      end_date: isMultiDay && multiDayEndDate ? multiDayEndDate : undefined,
      invited_societe_ids: selectedSocietes.map(s => s.id) as any,
      ...(externeEmailsList.length > 0 ? { invited_externe_emails: externeEmailsList } as any : {})
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

  const handleInviteComplete = async (emails: string[]): Promise<void> => {
    setSelectedAttendees(emails);
    if (event && event.id && onInvite) {
      try {
        await onInvite(emails);
      } catch (error) {
        alert("Impossible d'inviter les participants");
      }
    }
    setShowInviteModal(false);
  };

  const formatReminderLabel = (value: string): string => {
    const minutes = Number(value);
    if (minutes === 0) return "À l'heure de l'événement";
    if (minutes === 5) return '5 minutes avant';
    if (minutes === 10) return '10 minutes avant';
    if (minutes === 15) return '15 minutes avant';
    if (minutes === 30) return '30 minutes avant';
    if (minutes === 60) return '1 heure avant';
    if (minutes === 120) return '2 heures avant';
    if (minutes === 1440) return '1 jour avant';
    if (minutes === 2880) return '2 jours avant';
    if (minutes === 10080) return '1 semaine avant';
    return `${minutes} minutes avant`;
  };

  const handleCreateCategory = async (): Promise<void> => {
    if (!newCategoryLabel.trim()) { setNewCategoryError('Veuillez entrer un nom pour la catégorie'); return; }
    setNewCategoryError('');
    if (onCreateCategory) {
      try {
        const newCategory = await onCreateCategory(newCategoryLabel.trim(), newCategoryIcon, newCategoryColor, newCategoryRequiresLocation);
        setEventCategoryId(newCategory.id);
        setCustomCategoryLabel('');
        setShowCreateCategoryInput(false);
        setNewCategoryLabel('');
        setNewCategoryIcon('📌');
        setNewCategoryColor('#E77131');
        setNewCategoryRequiresLocation(false);
        setNewCategoryError('');
      } catch (error: any) {
        const status = error?.response?.status || error?.status;
        const msg = error?.response?.data?.message || error?.message || '';
        if (status === 409 || msg.includes('existe déjà')) {
          setNewCategoryError('Cette catégorie existe déjà');
        } else {
          setNewCategoryError('Erreur lors de la création de la catégorie');
        }
      }
    }
  };

  const selectedCategory = eventCategoryId ? categories.find(c => c.id === eventCategoryId) : null;
  const currentStatus = statusDisplay[eventStatus as keyof typeof statusDisplay] || statusDisplay.pending;

  // ═══════════════════════════════════════════════
  // JSX INLINE : Bloc recherche Solutravo
  // (inline pour éviter le saut de curseur)
  // ═══════════════════════════════════════════════
  const renderSocieteSearch = (showInviteButton: boolean) => (
    <div ref={searchRef} style={{ position: 'relative' }}>
      {/* Tags sociétés sélectionnées (création) */}
      {!showInviteButton && selectedSocietes.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {selectedSocietes.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFF3E0', border: '1px solid #E77131', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', color: '#E77131' }}>
              🏢 {s.nomsociete}
              <button type="button" onClick={() => handleRemoveSociete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E77131', fontSize: '13px', padding: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <input
        type="text"
        value={searchQuery}
        onChange={e => handleSearchChange(e.target.value)}
        onFocus={handleSearchFocus}
        placeholder="Rechercher une societe..."
        style={{ width: '100%', padding: '9px 11px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
      />
      {showSearchResults && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', border: '1px solid #eee', zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
          {isSearching ? (
            <div style={{ padding: '14px', textAlign: 'center', color: '#999', fontSize: '13px' }}>🔍 Recherche...</div>
          ) : searchResults.length === 0 ? (
            <div style={{ padding: '14px', textAlign: 'center', color: '#999', fontSize: '13px' }}>Aucune société trouvée</div>
          ) : (
            searchResults.map(societe => (
              <div key={societe.id}
                onClick={!showInviteButton ? () => handleSelectSociete(societe) : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', cursor: showInviteButton ? 'default' : 'pointer', borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!showInviteButton) e.currentTarget.style.background = '#f9f9f9'; }}
                onMouseLeave={e => { if (!showInviteButton) e.currentTarget.style.background = 'white'; }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E77131', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                  {societe.nomsociete.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#333' }}>{societe.nomsociete}</div>
                  {societe.ville && <div style={{ fontSize: '11px', color: '#999' }}>📍 {societe.ville}</div>}
                </div>
                {showInviteButton ? (
                  <button type="button" onClick={() => handleInviterSociete(societe)} disabled={invitingSocieteId === societe.id}
                    style={{ padding: '5px 11px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, background: invitingSocieteId === societe.id ? '#ccc' : '#E77131', color: 'white' }}>
                    {invitingSocieteId === societe.id ? '...' : '+ Inviter'}
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', color: '#E77131', fontWeight: 600, whiteSpace: 'nowrap' }}>+ Choisir</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════
  return (
    <>
      <div className="calendar-modal-overlay" onClick={onClose}>
        <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>

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
              <form className="calendar-event-form" onSubmit={(e) => { e.preventDefault(); }}>

                {/* ── ONGLETS ─────────────────────────────── */}
                <div className="cm-tabs">
                  <button type="button" className={`cm-tab ${activeTab === 'infos' ? 'cm-tab-active' : ''}`} onClick={() => setActiveTab('infos')}>
                    📋 Informations
                  </button>
                  <button type="button" className={`cm-tab ${activeTab === 'invites' ? 'cm-tab-active' : ''}`} onClick={() => setActiveTab('invites')}>
                    👥 Invités {(selectedAttendees.length > 0 || selectedSocietes.length > 0 || externeEmailsList.length > 0) && <span className="cm-tab-badge">{selectedAttendees.length + selectedSocietes.length + externeEmailsList.length}</span>}
                  </button>
                </div>

                {/* ══ ONGLET 1 : INFORMATIONS ══ */}
                {activeTab === 'infos' && (
                  <div className="cm-tab-content">

                    {/* Portée compacte */}
                    <div className="cm-field-row">
                      <span className="cm-field-label">Portée</span>
                      <div className="cm-scope-pills">
                        <button type="button"
                          className={`cm-pill ${scope === 'personal' ? 'cm-pill-blue' : ''}`}
                          onClick={() => setScope('personal')}>
                          🙋 Moi seul
                        </button>
                        <button type="button"
                          className={`cm-pill ${scope === 'collaborative' ? 'cm-pill-green' : ''}`}
                          onClick={() => setScope('collaborative')}>
                          👥 Avec d'autres
                        </button>
                      </div>
                    </div>

                    {/* Catégorie */}
                    <div className="cm-field-row">
                      <span className="cm-field-label">Catégorie</span>
                      <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                        {/* Déclencheur dropdown custom */}
                        <div
                          ref={categoryTriggerRef}
                          onClick={() => {
                            if (!showCategoryDropdown && categoryTriggerRef.current) {
                              const rect = categoryTriggerRef.current.getBoundingClientRect();
                              setCategoryDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
                            }
                            setShowCategoryDropdown(prev => !prev);
                          }}
                          style={{ flex: 1, padding: '7px 10px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', minWidth: 0 }}
                        >
                          <span style={{ color: eventCategoryId ? '#333' : '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {eventCategoryId
                              ? (() => { const cat = categories.find(c => c.id === eventCategoryId); return cat ? `${cat.icon} ${cat.label}` : '-- Catégorie --'; })()
                              : '-- Catégorie --'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#888', flexShrink: 0, marginLeft: '4px' }}>▼</span>
                        </div>

                        {/* Liste déroulante — position:fixed pour éviter le clipping du modal */}
                        {showCategoryDropdown && categoryDropdownPos && (
                          <>
                            <div onClick={() => setShowCategoryDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
                            <div style={{ position: 'fixed', top: categoryDropdownPos.top, left: categoryDropdownPos.left, width: categoryDropdownPos.width, background: 'white', border: '1px solid #ddd', borderRadius: '6px', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', zIndex: 9999, maxHeight: '240px', overflowY: 'auto' }}>
                              <div
                                onClick={() => { setEventCategoryId(undefined); setShowCategoryDropdown(false); }}
                                style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: '#999', borderBottom: '1px solid #f0f0f0' }}
                              >-- Catégorie --</div>
                              {categories.map(cat => (
                                <div
                                  key={cat.id}
                                  style={{ display: 'flex', alignItems: 'center', fontSize: '13px', background: eventCategoryId === cat.id ? '#fff3e8' : 'transparent', borderBottom: '1px solid #f9f9f9' }}
                                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = '#E77131'; el.querySelectorAll('span, button').forEach((c: Element) => { (c as HTMLElement).style.color = 'white'; }); }}
                                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = eventCategoryId === cat.id ? '#fff3e8' : 'transparent'; el.querySelectorAll('span').forEach((c: Element) => { (c as HTMLElement).style.color = ''; }); el.querySelectorAll('button').forEach((c: Element) => { (c as HTMLElement).style.color = '#e53935'; }); }}
                                >
                                  <span
                                    onClick={() => { setEventCategoryId(cat.id); setCustomCategoryLabel(''); setShowCategoryDropdown(false); }}
                                    style={{ flex: 1, padding: '10px 14px', cursor: 'pointer' }}
                                  >
                                    {cat.icon} {cat.label}
                                  </span>
                                  {!cat.is_predefined && onDeleteCategory && (
                                    <button
                                      type="button"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          await onDeleteCategory(cat.id);
                                          if (eventCategoryId === cat.id) setEventCategoryId(undefined);
                                        } catch { /* ignore */ }
                                      }}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935', fontSize: '16px', lineHeight: 1, padding: '10px 14px', fontWeight: 'bold', flexShrink: 0 }}
                                      title="Supprimer cette catégorie"
                                    >×</button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        <button type="button" onClick={() => setShowCreateCategoryInput(!showCreateCategoryInput)}
                          style={{ padding: '7px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          + Nouvelle
                        </button>
                      </div>
                    </div>

                    {showCreateCategoryInput && (
                      <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '10px', border: '1px solid #ddd', marginTop: '-4px' }}>
                        <input type="text" value={newCategoryLabel} onChange={(e) => { setNewCategoryLabel(e.target.value); setNewCategoryError(''); }} placeholder="Nom de la catégorie"
                          style={{ width: '100%', padding: '7px', border: `1px solid ${newCategoryError ? '#e53935' : '#ddd'}`, borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box', marginBottom: newCategoryError ? '4px' : '8px' }} />
                        {newCategoryError && (
                          <div style={{ color: '#e53935', fontSize: '12px', marginBottom: '8px' }}>{newCategoryError}</div>
                        )}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {['📌', '💼', '🏗️', '🔧', '🤝', '📦', '⚙️', '📋', '🎓', '✏️', '🎯', '🚀'].map((icon) => (
                            <button key={icon} type="button" onClick={() => setNewCategoryIcon(icon)}
                              style={{ padding: '5px 7px', backgroundColor: newCategoryIcon === icon ? '#42A5F5' : '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                              {icon}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={handleCreateCategory} style={{ flex: 1, padding: '7px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Créer</button>
                          <button type="button" onClick={() => { setShowCreateCategoryInput(false); setNewCategoryLabel(''); setNewCategoryError(''); }} style={{ flex: 1, padding: '7px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Annuler</button>
                        </div>
                      </div>
                    )}

                    {/* Titre */}
                    <div className="cm-field-row">
                      <span className="cm-field-label">Titre *</span>
                      <input type="text" className="calendar-form-input cm-input" value={title}
                        onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Réunion client" required />
                    </div>

                    {/* Description */}
                    <div className="cm-field-row cm-field-row-top">
                      <span className="cm-field-label">Note</span>
                      <textarea className="calendar-form-textarea cm-input" value={description}
                        onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Détails..." style={{ resize: 'none' }} />
                    </div>

                    {/* Lieu */}
                    <div className="cm-field-row">
                      <span className="cm-field-label">📍 Lieu</span>
                      <div style={{ flex: 1 }}>
                        <LocationAutocomplete value={location} onChange={setLocation}
                          placeholder="Ex: 12 rue de la Paix, Paris" required={selectedCategory?.requires_location} />
                      </div>
                    </div>

                    {/* Heures */}
                    <div className="cm-field-row">
                      <span className="cm-field-label">🕐 Horaires</span>
                      <div style={{ flex: 1 }}>
                        <TimeRangePicker
                          startTime={startTime} endTime={endTime}
                          onStartTimeChange={setStartTime} onEndTimeChange={setEndTime}
                          defaultDuration={60}
                          startExtra={
                            <button
                              type="button"
                              onClick={() => { setIsMultiDay(p => { if (!p) setMultiDayEndTime(endTime); else { setMultiDayEndDate(''); setMultiDayEndTime(''); } return !p; }); }}
                              style={{ fontSize: '11px', padding: '3px 10px', border: `1px solid ${isMultiDay ? '#E77131' : '#ddd'}`, borderRadius: '12px', background: isMultiDay ? '#fff3e8' : 'white', color: isMultiDay ? '#E77131' : '#999', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: isMultiDay ? 600 : 400 }}
                            >
                              📅 Sur plusieurs jours{isMultiDay ? ' ✓' : ''}
                            </button>
                          }
                        />
                        {isMultiDay && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>Fin le :</span>
                            <input
                              type="date"
                              value={multiDayEndDate}
                              onChange={e => setMultiDayEndDate(e.target.value)}
                              style={{ flex: 1, minWidth: '120px', padding: '5px 8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}
                            />
                            <span style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>à</span>
                            <input
                              type="time"
                              value={multiDayEndTime}
                              onChange={e => setMultiDayEndTime(e.target.value)}
                              style={{ width: '100px', padding: '5px 8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rappel compact */}
                    <div className="cm-field-row">
                      <span className="cm-field-label">🔔 Rappel</span>
                      <div style={{ display: 'flex', gap: '6px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        {reminders.map((reminder, index) => (
                          <div key={index} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <select value={reminder.value} onChange={(e) => handleReminderChange(index, 'value', e.target.value)}
                              style={{ padding: '5px 6px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', background: 'white' }}>
                              <option value="5">5 min</option>
                              <option value="15">15 min</option>
                              <option value="30">30 min</option>
                              <option value="60">1h</option>
                              <option value="120">2h</option>
                              <option value="1440">1 jour</option>
                              <option value="2880">2 jours</option>
                              <option value="10080">1 semaine</option>
                            </select>
                            <button type="button" onClick={() => handleRemoveReminder(index)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: '14px', padding: '0 2px' }}>✕</button>
                          </div>
                        ))}
                        {reminders.length < 3 && (
                          <button type="button" onClick={handleAddReminder}
                            style={{ padding: '5px 8px', border: '1px dashed #ddd', background: 'white', borderRadius: '6px', color: '#999', fontSize: '11px', cursor: 'pointer' }}>
                            + rappel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Couleur compacte */}
                    <div className="cm-field-row">
                      <span className="cm-field-label">Couleur</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'white', flexWrap: 'wrap',marginTop:"10px" }}>
                        {colorOptions.map((option) => (
                          <button key={option.value} type="button"
                            onClick={() => setColor(option.value)}
                            style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px', aspectRatio: '1/1', borderRadius: '50%', backgroundColor: option.value, border: color === option.value ? '3px solid #333' : '2px solid transparent', cursor: 'pointer', flexShrink: 0, padding: 0, boxShadow: color === option.value ? '0 0 0 2px white, 0 0 0 4px #333' : 'none', display: 'block' }} />
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* ══ ONGLET 2 : INVITÉS... ══ */}
                {activeTab === 'invites' && (
                  <div className="cm-tab-content">
                    {scope !== 'collaborative' ? (
                      <div style={{ textAlign: 'center', padding: '30px 20px', color: '#aaa' }}>
                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>🙋</div>
                        <p style={{ fontSize: '13px', margin: 0,lineHeight:"1.5" }}>Passez en mode <strong>"Avec d'autres"</strong> dans l'onglet Informations pour inviter des collaborateurs ou sociétés.</p>
                      </div>
                    ) : (
                      <>
                        {/* Collaborateurs */}
                        <button type="button" className="calendar-btn-invite-full" onClick={() => setShowInviteModal(true)} style={{ marginBottom: '10px' }}>
                          <span className="icon">👥</span>
                          <span>Collaborateurs</span>
                          {selectedAttendees.length > 0 && <span className="badge-count">{selectedAttendees.length}</span>}
                        </button>

                        {/* Société Solutravo */}
                        <div style={{ background: userRole === 'collaborator' ? '#f5f5f5' : '#fafafa', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '10px', marginBottom: '10px', opacity: userRole === 'collaborator' ? 0.6 : 1, pointerEvents: userRole === 'collaborator' ? 'none' : 'auto' }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>
                            🏢 Inviter une société (qui utilise Solutravo)
                            {userRole === 'collaborator' && <span style={{ marginLeft: '6px', fontSize: '10px', background: '#f0f0f0', color: '#999', borderRadius: '4px', padding: '1px 5px' }}>Admin uniquement</span>}
                          </div>
                          {!isNewEvent && event?.invited_societes && event.invited_societes.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                              {event.invited_societes.map(s => (
                                <span key={s.id} style={{ background: '#FFF3E0', color: '#E65100', borderRadius: '14px', padding: '3px 8px', fontSize: '11px', border: '1px solid #FFCC80' }}>🏢 {s.nomsociete}</span>
                              ))}
                            </div>
                          )}
                          {renderSocieteSearch(!!event?.id)}
                        </div>

                        {/* Société externe */}
                        <div style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '10px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>📧 Inviter une société externe</div>
                          {!event?.id && (
                            <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', background: '#fff8e1', padding: '4px 8px', borderRadius: '4px' }}>
                              ℹ️ L'invitation sera envoyée après la création
                            </div>
                          )}
                          {externeEmailsList.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                              {externeEmailsList.map((em, i) => (
                                <span key={i} style={{ background: '#E8F5E9', color: '#2E7D32', borderRadius: '14px', padding: '3px 8px', fontSize: '11px', border: '1px solid #A5D6A7', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  {em}
                                  <button type="button" onClick={() => setExterneEmailsList(prev => prev.filter((_, j) => j !== i))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2E7D32', fontSize: '11px', padding: 0 }}>✕</button>
                                </span>
                              ))}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input type="email" value={externeEmail} onChange={e => setExterneEmail(e.target.value)}
                              placeholder="contact@entreprise.fr"
                              style={{ flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', outline: 'none', minWidth: 0 }} />
                            <button type="button"
                              onClick={event?.id ? handleInviterExterne : handleAddExterneEmail}
                              disabled={isSendingExterne || !externeEmail.trim()}
                              style={{ padding: '8px 12px', background: isSendingExterne ? '#ccc' : '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {isSendingExterne ? '...' : (event?.id ? '📨 Envoyer' : '+ Ajouter')}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

              </form>

            ) : (
              // ── VUE DÉTAILS (lecture) ────────────────────
              <div className="calendar-event-details-view">
                <div className="event-info-header">
                  <div className="badge" style={{ backgroundColor: selectedCategory?.color || '#E77131' }}>
                    {selectedCategory?.icon || '📌'} {selectedCategory?.label || customCategoryLabel || 'Événement'}
                  </div>
                  <div className="badge" style={{ backgroundColor: currentStatus.color }}>
                    {currentStatus.icon} {currentStatus.label}
                  </div>
                  {scope === 'collaborative' && (
                    <div className="badge" style={{ backgroundColor: '#4CAF50' }}>👥 Collaboratif</div>
                  )}
                </div>

                <div className="calendar-event-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                  {/* Date + heure — même ligne */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    {event?.end_date ? (
                      <span style={{ fontSize: '14px' }}>
                        <strong>📅</strong> {event.startTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        <span style={{ color: '#E77131', margin: '0 6px' }}>→</span>
                        {new Date(event.end_date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    ) : (
                      <span style={{ fontSize: '14px' }}><strong>📅</strong> {event?.startTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    )}
                    <span style={{ color: '#ddd' }}>·</span>
                    <span style={{ fontSize: '14px' }}><strong>🕐</strong> {event?.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} – {event?.endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Titre */}
                  <div style={{ fontSize: '14px' }}><strong>📌 Titre :</strong> {title}</div>

                  {/* Catégorie */}
                  {selectedCategory && (
                    <div style={{ fontSize: '14px' }}><strong>🏷️ Catégorie :</strong> {selectedCategory.icon} {selectedCategory.label}</div>
                  )}

                  {/* Description */}
                  {description && (
                    <div style={{ fontSize: '14px' }}><strong>📝 Description :</strong> {description}</div>
                  )}

                  {/* Lieu */}
                  {location && (
                    <div style={{ fontSize: '14px' }}><strong>📍 Lieu :</strong> {location}</div>
                  )}

                  {/* Rappels */}
                  {reminders.length > 0 && (
                    <div style={{ fontSize: '14px' }}><strong>🔔 Rappels :</strong> {reminders.map(r => formatReminderLabel(r.value)).join(' · ')}</div>
                  )}

                  {/* Collaborateurs invités */}
                  {selectedAttendees.length > 0 && (
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '5px' }}>👥 Collaborateurs invités ({selectedAttendees.length})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {selectedAttendees.map((email, i) => (
                          <span key={i} style={{ background: '#E8F5E9', color: '#2E7D32', borderRadius: '14px', padding: '3px 10px', fontSize: '12px', border: '1px solid #A5D6A7' }}>
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sociétés Solutravo invitées */}
                  {(event as any)?.invited_societes?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '5px' }}>🏢 Sociétés Solutravo invitées ({(event as any).invited_societes.length})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {(event as any).invited_societes.map((s: any) => (
                          <span key={s.id} style={{ background: '#FFF3E0', color: '#E65100', borderRadius: '14px', padding: '3px 10px', fontSize: '12px', border: '1px solid #FFCC80' }}>
                            🏢 {s.nomsociete}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sociétés externes invitées */}
                  {(event as any)?.invited_externe_emails?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '5px' }}>📧 Sociétés externes invitées ({(event as any).invited_externe_emails.length})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {(event as any).invited_externe_emails.map((email: string, i: number) => (
                          <span key={i} style={{ background: '#E3F2FD', color: '#1565C0', borderRadius: '14px', padding: '3px 10px', fontSize: '12px', border: '1px solid #90CAF9' }}>
                            📧 {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

          {/* FOOTER */}
          <div className="calendar-modal-footer">
            {isEditing ? (
              scope === 'collaborative' && activeTab === 'infos' ? (
                /* Avec d'autres + Tab Infos → forcer à aller sur Invités */
                <button className="calendar-btn-primary" onClick={() => setActiveTab('invites')}>
                  Continuer → Invités
                </button>
              ) : (
                /* Moi seul (tab 1) OU Avec d'autres tab Invités → Annuler + Enregistrer */
                <>
                  <button className="calendar-btn-secondary" onClick={onClose}>Annuler</button>
                  <button className="calendar-btn-primary" onClick={handleSave}>Enregistrer</button>
                </>
              )
            ) : (
              <>
                <button className="calendar-btn-secondary" onClick={onClose}>Fermer</button>
                {!isPastEvent && isOwner && (
                  <>
                    <button className="calendar-btn-danger" onClick={handleDelete}>Supprimer</button>
                    {scope === 'collaborative' && (
                      <button className="calendar-btn-invite" onClick={() => setShowInviteModal(true)}>
                        👥 Gérer invités
                      </button>
                    )}
                    <button className="calendar-btn-primary" onClick={() => setIsEditing(true)}>Modifier</button>
                  </>
                )}
              </>
            )}
          </div>

          {/* STYLES */}
          <style>{`
            /* ── Onglets ── */
            .cm-tabs { display: flex; border-bottom: 2px solid #f0f0f0; margin-bottom: 12px; gap: 0; }
            .cm-tab { flex: 1; padding: 9px 6px; background: none; border: none; font-size: 13px; font-weight: 500; color: #999; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 5px; }
            .cm-tab-active { color: #E77131; border-bottom-color: #E77131; }
            .cm-tab-badge { background: #E77131; color: white; font-size: 10px; padding: 1px 6px; border-radius: 10px; font-weight: 600; }
            /* ── Contenu onglet ── */
            .cm-tab-content { display: flex; flex-direction: column; gap: 8px; }
            /* ── Ligne label + champ ── */
            .cm-field-row { display: flex; align-items: center; gap: 8px; }
            .cm-field-row-top { align-items: flex-start; }
            .cm-field-label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.3px; width: 68px; flex-shrink: 0; }
            .cm-input { flex: 1; padding: 8px 10px !important; font-size: 13px !important; }
            /* ── Pills portée ── */
            .cm-scope-pills { display: flex; gap: 6px; flex-wrap: wrap; }
            .cm-pill { padding: 5px 12px; border: 1.5px solid #ddd; border-radius: 20px; background: white; font-size: 12px; cursor: pointer; color: #555; font-weight: 500; transition: all 0.15s; }
            .cm-pill-blue { border-color: #42A5F5; background: #E3F2FD; color: #1565C0; }
            .cm-pill-green { border-color: #4CAF50; background: #E8F5E9; color: #2E7D32; }
            /* ── Bouton inviter ── */
            .calendar-btn-invite-full { width: 100%; padding: 10px 16px; background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); color: white; border: none; border-radius: 8px; font-weight: 500; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
            .calendar-btn-invite-full .icon { font-size: 16px; }
            .calendar-btn-invite-full .badge-count { background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 10px; font-size: 11px; }
            /* ── Autres ── */
            .badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 14px; color: white; font-size: 11px; font-weight: 500; }
            .event-info-header { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
            .calendar-btn-invite { padding: 8px 14px; border: none; border-radius: 6px; background: #4CAF50; color: white; cursor: pointer; font-weight: 500; font-size: 13px; }
            .calendar-form-select { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; background: white; cursor: pointer; }
            .calendar-form-select option { font-size: 12px; }
            /* ── Responsive mobile ── */
            @media (max-width: 500px) {
              .cm-field-row { flex-direction: column; align-items: flex-start; gap: 3px; }
              .cm-field-label { width: auto; font-size: 10px; }
              .cm-input { width: 100% !important; box-sizing: border-box; }
              .cm-scope-pills { width: 100%; }
              .cm-pill { flex: 1; text-align: center; padding: 7px 6px; }
              .cm-tabs { gap: 0; }
              .cm-tab { font-size: 12px; padding: 10px 4px; }
              .cm-tab-content { gap: 10px; }
              .calendar-btn-invite-full { padding: 13px 12px; font-size: 14px; }
              .calendar-btn-invite-full .icon { font-size: 18px; }
              /* Pas de scroll horizontal */
              .cm-tab-content, .cm-field-row { overflow-x: hidden; max-width: 100%; }
            }
          `}</style>
        </div>
      </div>

      {showInviteModal && (
        <InviteAttendeesModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteComplete}
          initialSelectedEmails={selectedAttendees}
        />
      )}
    </>
  );
};

export default CalendarEventModal;
