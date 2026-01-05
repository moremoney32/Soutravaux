

// InviteAttendeesModal.tsx - VERSION CORRIGÉE SOCIÉTÉS

import React, { useState, useEffect } from 'react';

interface Societe {
  id: number;
  name: string;           // nom_societe
  email?: string;
  phone?: string;         // telephone
}

interface InviteAttendeesModalProps {
  isOpen: boolean;
  eventId: number;
  societeId: number;      // Société créatrice (à exclure)
  onClose: () => void;
  onInvite: (eventId: number, societeIds: number[], method: 'email' | 'sms' | 'push' | 'contact') => Promise<void>;
}

const InviteAttendeesModal: React.FC<InviteAttendeesModalProps> = ({
  isOpen,
  eventId,
  societeId,            // Société créatrice
  onClose,
  onInvite
}) => {
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [selectedSocietes, setSelectedSocietes] = useState<number[]>([]);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'sms' | 'push' | 'contact'>('push');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = 'http://localhost:3000/api';

  // Charger sociétés disponibles (sauf la créatrice)
  useEffect(() => {
    if (isOpen) {
      loadSocietes();
    }
  }, [isOpen, societeId]);

  const loadSocietes = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/calendar/societes?exclude_societe_id=${societeId}`
      );
      const result = await response.json();
      
      if (result.success) {
        setSocietes(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement sociétés:', error);
    }
  };

  const handleToggleSociete = (societeId: number) => {
    if (selectedSocietes.includes(societeId)) {
      setSelectedSocietes(selectedSocietes.filter(id => id !== societeId));
    } else {
      setSelectedSocietes([...selectedSocietes, societeId]);
    }
  };

  const handleInvite = async () => {
    if (selectedSocietes.length === 0) {
      alert('Sélectionnez au moins un collaborateur');
      return;
    }

    setIsLoading(true);
    try {
      await onInvite(eventId, selectedSocietes, inviteMethod);
      setSelectedSocietes([]);
      onClose();
    } catch (error) {
      console.error('Erreur invitation:', error);
      alert('Erreur lors de l\'envoi des invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSocietes = societes.filter(societe =>
    societe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vérifier disponibilité méthode invitation
  const canUseEmail = (societe: Societe) => societe.email;
  const canUseSMS = (societe: Societe) => societe.phone;

  if (!isOpen) return null;

  return (
    <div className="calendar-modal-overlay" onClick={onClose}>
      <div 
        className="calendar-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        {/* En-tête */}
        <div className="calendar-modal-header">
          <h2 className="calendar-modal-title">
            <i className="fas fa-building"></i>
            Inviter des collaborateurs de votre societe
          </h2>
          <button className="calendar-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Corps */}
        <div className="calendar-modal-body">
          {/* Barre de recherche */}
          <div className="calendar-form-group">
            <input
              type="text"
              className="calendar-form-input"
              placeholder="Rechercher un collaborateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Méthode d'invitation */}
          <div className="calendar-form-group">
            <label className="calendar-form-label">Méthode d'invitation</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`invite-method-btn ${inviteMethod === 'push' ? 'active' : ''}`}
                onClick={() => setInviteMethod('push')}
              >
                <i className="fas fa-bell"></i>
                Notification
              </button>
              <button
                type="button"
                className={`invite-method-btn ${inviteMethod === 'email' ? 'active' : ''}`}
                onClick={() => setInviteMethod('email')}
              >
                <i className="fas fa-envelope"></i>
                Email
              </button>
              <button
                type="button"
                className={`invite-method-btn ${inviteMethod === 'sms' ? 'active' : ''}`}
                onClick={() => setInviteMethod('sms')}
              >
                <i className="fas fa-sms"></i>
                SMS
              </button>
              <button
                type="button"
                className={`invite-method-btn ${inviteMethod === 'contact' ? 'active' : ''}`}
                onClick={() => setInviteMethod('contact')}
              >
                <i className="fas fa-address-book"></i>
                Contact
              </button>
            </div>
          </div>

          {/* Liste sociétés */}
          <div className="calendar-form-group">
            <label className="calendar-form-label">
              Sociétés disponibles ({filteredSocietes.length})
            </label>
            <div className="artisans-list">
              {filteredSocietes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  Aucun collaborateur disponible
                </p>
              ) : (
                filteredSocietes.map(societe => {
                  const canInvite = 
                    inviteMethod === 'push' || 
                    inviteMethod === 'contact' ||
                    (inviteMethod === 'email' && canUseEmail(societe)) ||
                    (inviteMethod === 'sms' && canUseSMS(societe));

                  return (
                    <label
                      key={societe.id}
                      className={`artisan-item ${!canInvite ? 'disabled' : ''}`}
                      title={!canInvite ? `${inviteMethod === 'email' ? 'Email' : 'Téléphone'} manquant` : ''}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSocietes.includes(societe.id)}
                        onChange={() => handleToggleSociete(societe.id)}
                        disabled={!canInvite}
                      />
                      <div className="artisan-info">
                        <div className="artisan-name">
                          <i className="fas fa-building" style={{ marginRight: '8px', color: '#E77131' }}></i>
                          {societe.name}
                        </div>
                        <div className="artisan-contact">
                          {societe.email && <span><i className="fas fa-envelope"></i> {societe.email}</span>}
                          {societe.phone && <span><i className="fas fa-phone"></i> {societe.phone}</span>}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Sélection */}
          {selectedSocietes.length > 0 && (
            <div className="selection-info">
              <i className="fas fa-check-circle"></i>
              {selectedSocietes.length} société{selectedSocietes.length > 1 ? 's' : ''} sélectionnée{selectedSocietes.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="calendar-modal-footer">
          <button className="calendar-btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button
            className="calendar-btn-primary"
            onClick={handleInvite}
            disabled={isLoading || selectedSocietes.length === 0}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Envoi...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Inviter ({selectedSocietes.length})
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .invite-method-btn {
          padding: 8px 16px;
          border: 1px solid var(--color-border);
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--color-gray-primary);
        }

        .invite-method-btn:hover {
          background: var(--color-light-gray);
        }

        .invite-method-btn.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .artisans-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-small);
          padding: 8px;
        }

        .artisan-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 8px;
          border: 1px solid transparent;
        }

        .artisan-item:hover:not(.disabled) {
          background: var(--color-light-gray);
          border-color: var(--color-primary);
        }

        .artisan-item.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .artisan-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--color-primary);
        }

        .artisan-info {
          flex: 1;
        }

        .artisan-name {
          font-weight: 500;
          color: var(--color-gray-primary);
          margin-bottom: 4px;
          display: flex;
          align-items: center;
        }

        .artisan-contact {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: var(--color-gray-secondary);
        }

        .artisan-contact span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .selection-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #e8f5e9;
          color: #2e7d32;
          border-radius: 4px;
          font-weight: 500;
          font-size: 13px;
        }

        .selection-info i {
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default InviteAttendeesModal;