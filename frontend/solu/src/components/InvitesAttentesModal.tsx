
// InviteAttendeesModal.tsx - VERSION COLLABORATEURS

import React, { useState, useEffect } from 'react';

interface Collaborator {
  id: number;
  membre_id: number;
  email: string;
  nom: string;
  prenom: string;
  poste_id: bigint;
  societe_id: number;
  assigned_at: string;
  expires_at: string | null;
}

// ✅ PROPS POUR INVITATION DES COLLABORATEURS...
interface InviteAttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (collaboratorEmails: string[]) => Promise<void>;  // ✅ EMAILS, pas IDs
  initialSelectedEmails?: string[];  // ✅ Emails
}

const InviteAttendeesModal: React.FC<InviteAttendeesModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  initialSelectedEmails = []
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(initialSelectedEmails);  // ✅ Emails
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);

   const API_BASE_URL = 'https://solutravo.zeta-app.fr/api';
 //const API_BASE_URL = 'http://localhost:3000/api';

  // Récupérer societeId depuis le localStorage
  const getSocieteId = (): number => {
    const userStr = localStorage.getItem('societeId');
    if (userStr) {
      return Number(userStr);
    }
    return 0;
  };

  // Charger les collaborateurs de la société
  const loadCollaborators = async () => {
    try {
      setLoadingCollaborators(true);
      const societeId = getSocieteId();
      
      if (!societeId) {
        console.error('Erreur: societeId non trouvée');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/collaborators/${societeId}`
      );
      const result = await response.json();
      
      if (result.success) {
        setCollaborators(result.data || []);
      } else {
        console.error('Erreur chargement collaborateurs:', result.message);
      }
    } catch (error) {
      console.error('Erreur chargement collaborateurs:', error);
    } finally {
      setLoadingCollaborators(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
      setSelectedCollaborators(initialSelectedEmails);
      setSearchTerm('');
    }
  }, [isOpen, initialSelectedEmails]);

  const handleToggleCollaborator = (email: string) => {
    // ✅ Travailler avec les EMAILS au lieu des IDs
    if (selectedCollaborators.includes(email)) {
      setSelectedCollaborators(selectedCollaborators.filter(e => e !== email));
    } else {
      setSelectedCollaborators([...selectedCollaborators, email]);
    }
  };

  // Sélectionner tous les collaborateurs
  const handleSelectAll = () => {
    if (selectedCollaborators.length === filteredCollaborators.length) {
      setSelectedCollaborators([]);
    } else {
      // Stocker les emails, pas les IDs
      setSelectedCollaborators(filteredCollaborators.map(c => c.email));
    }
  };

  const handleInvite = async () => {
    if (selectedCollaborators.length === 0) {
      alert('Sélectionnez au moins un collaborateur');
      return;
    }

    setIsLoading(true);
    try {
      console.log('📧 [Modal] Envoi des invitations avec emails:', selectedCollaborators);
      await onInvite(selectedCollaborators);  // ← Envoie les emails
      setSelectedCollaborators([]);
      onClose();
    } catch (error) {
      console.error('Erreur invitation:', error);
      alert('Erreur lors de l\'envoi des invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCollaborators = collaborators.filter(collab =>
    `${collab.nom} ${collab.prenom} ${collab.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="calendar-modal-overlay" onClick={onClose}>
      <div 
        className="calendar-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '650px' }}
      >
        {/* En-tête */}
        <div className="calendar-modal-header">
          <h2 className="calendar-modal-title">
            👥 Inviter des collaborateurs
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
              placeholder="🔍 Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Info méthode */}
          <div className="invite-method-info">
            ✉️ Les invitations seront envoyées par <strong>email</strong>
          </div>

          {/* Sélectionner tout */}
          {filteredCollaborators.length > 0 && (
            <div className="select-all-section">
              <label className="select-all-label">
                <input
                  type="checkbox"
                  checked={selectedCollaborators.length === filteredCollaborators.length && filteredCollaborators.length > 0}
                  onChange={handleSelectAll}
                />
                <span>Sélectionner tout</span>
              </label>
            </div>
          )}

          {/* Liste collaborateurs */}
          <div className="calendar-form-group">
            <label className="calendar-form-label">
              Collaborateurs disponibles ({filteredCollaborators.length})
            </label>
            <div className="collaborators-list">
              {loadingCollaborators ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  Chargement des collaborateurs...
                </p>
              ) : filteredCollaborators.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  {collaborators.length === 0
                    ? 'Aucun collaborateur trouvé pour votre société'
                    : 'Aucun collaborateur correspondant à votre recherche'
                  }
                </p>
              ) : (
                filteredCollaborators.map(collaborator => (
                  <label
                    key={collaborator.membre_id}
                    className={`collaborator-item ${selectedCollaborators.includes(collaborator.email) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCollaborators.includes(collaborator.email)}
                      onChange={() => handleToggleCollaborator(collaborator.email)}
                    />
                    <div className="collaborator-info">
                      <div className="collaborator-name">
                        👤 {collaborator.prenom} {collaborator.nom}
                      </div>
                      <div className="collaborator-contact">
                        <span>✉️ {collaborator.email}</span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Sélection actuelle */}
          {selectedCollaborators.length > 0 && (
            <div className="selection-info">
              ✓ {selectedCollaborators.length} collaborateur{selectedCollaborators.length > 1 ? 's' : ''} sélectionné{selectedCollaborators.length > 1 ? 's' : ''}
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
            disabled={isLoading || selectedCollaborators.length === 0}
          >
            {isLoading ? (
              <>⏳ Envoi en cours...</>
            ) : (
              <>📧 Inviter ({selectedCollaborators.length})</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .calendar-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .calendar-modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .calendar-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .calendar-modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .calendar-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .calendar-modal-close:hover {
          color: #333;
        }

        .calendar-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }

        .calendar-form-group {
          margin-bottom: 16px;
        }

        .calendar-form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .calendar-form-input:focus {
          outline: none;
          border-color: #E77131;
          box-shadow: 0 0 0 3px rgba(231, 113, 49, 0.1);
        }

        .calendar-form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 12px;
          color: #333;
          font-size: 14px;
        }

        .invite-method-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #E8F5E9;
          border-left: 3px solid #4CAF50;
          border-radius: 6px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #2E7D32;
        }

        .select-all-section {
          padding: 12px;
          background: #f9f9f9;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .select-all-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 500;
          color: #333;
          user-select: none;
        }

        .select-all-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #E77131;
        }

        .collaborators-list {
          max-height: 350px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 8px;
          background: white;
        }

        .collaborator-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 8px;
          border: 2px solid transparent;
          background: white;
        }

        .collaborator-item:hover {
          background: #f5f5f5;
          border-color: #E77131;
        }

        .collaborator-item.selected {
          background: #FFF3E0;
          border-color: #E77131;
        }

        .collaborator-item input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #E77131;
          flex-shrink: 0;
        }

        .collaborator-info {
          flex: 1;
          min-width: 0;
        }

        .collaborator-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          line-height: 1.25rem;
        }

        .collaborator-contact {
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: #666;
        }

        .collaborator-contact span {
          display: flex;
          align-items: center;
          gap: 6px;
          word-break: break-all;
        }

        .selection-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #E8F5E9;
          color: #2E7D32;
          border-radius: 6px;
          font-weight: 500;
          font-size: 13px;
          margin-top: 16px;
        }

        .calendar-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .calendar-btn-secondary,
        .calendar-btn-primary {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .calendar-btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .calendar-btn-secondary:hover {
          background: #e0e0e0;
        }

        .calendar-btn-primary {
          background: #E77131;
          color: white;
        }

        .calendar-btn-primary:hover:not(:disabled) {
          background: #d65a1a;
          box-shadow: 0 4px 12px rgba(231, 113, 49, 0.3);
        }

        .calendar-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Scrollbar styling */
        .collaborators-list::-webkit-scrollbar {
          width: 8px;
        }

        .collaborators-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .collaborators-list::-webkit-scrollbar-thumb {
          background: #E77131;
          border-radius: 4px;
        }

        .collaborators-list::-webkit-scrollbar-thumb:hover {
          background: #d65a1a;
        }

        @media (max-width: 768px) {
         .collaborator-contact {
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: #666;
          margin-top: 8px;
        }
 
  }
      `}</style>
    </div>
  );
};

export default InviteAttendeesModal;

