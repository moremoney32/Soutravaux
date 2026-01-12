



// // InviteAttendeesModal.tsx - VERSION EMAIL UNIQUEMENT

// import React, { useState, useEffect } from 'react';

// interface Societe {
//   id: number;
//   name: string;
//   email?: string;
//   phone?: string;
// }

// interface InviteAttendeesModalProps {
//   isOpen: boolean;
//   eventId: number;
//   societeId: number;
//   onClose: () => void;
//   onInvite: (eventId: number, societeIds: number[], method: 'email') => Promise<void>;
// }




// const InviteAttendeesModal: React.FC<InviteAttendeesModalProps> = ({
//   isOpen,
//   eventId,
//   societeId,
//   onClose,
//   onInvite
// }) => {
//   const [societes, setSocietes] = useState<Societe[]>([]);
//   const [selectedSocietes, setSelectedSocietes] = useState<number[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   //const API_BASE_URL = 'http://localhost:3000/api';

//   const API_BASE_URL = 'https://staging.solutravo.zeta-app.fr/api';

//   useEffect(() => {
//     if (isOpen) {
//       loadSocietes();
//     }
//   }, [isOpen, societeId]);

//   const loadSocietes = async () => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/calendar/societes?exclude_societe_id=${societeId}`
//       );
//       const result = await response.json();
      
//       if (result.success) {
//         setSocietes(result.data);
//       }
//     } catch (error) {
//       console.error('Erreur chargement sociétés:', error);
//     }
//   };

//   const handleToggleSociete = (societeId: number) => {
//     if (selectedSocietes.includes(societeId)) {
//       setSelectedSocietes(selectedSocietes.filter(id => id !== societeId));
//     } else {
//       setSelectedSocietes([...selectedSocietes, societeId]);
//     }
//   };

//   const handleInvite = async () => {
//     if (selectedSocietes.length === 0) {
//       alert('Sélectionnez au moins un collaborateur');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await onInvite(eventId, selectedSocietes, 'email');
//       setSelectedSocietes([]);
//       onClose();
//     } catch (error) {
//       console.error('Erreur invitation:', error);
//       alert('Erreur lors de l\'envoi des invitations');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filteredSocietes = societes.filter(societe =>
//     societe.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
//     societe.email // ✅ Afficher uniquement ceux qui ont un email
//   );

//   if (!isOpen) return null;

//   return (
//     <div className="calendar-modal-overlay" onClick={onClose}>
//       <div 
//         className="calendar-modal-content"
//         onClick={(e) => e.stopPropagation()}
//         style={{ maxWidth: '600px' }}
//       >
//         {/* En-tête */}
//         <div className="calendar-modal-header">
//           <h2 className="calendar-modal-title">
//             <i className="fas fa-building"></i>
//             Inviter des collaborateurs
//           </h2>
//           <button className="calendar-modal-close" onClick={onClose}>×</button>
//         </div>

//         {/* Corps */}
//         <div className="calendar-modal-body">
//           {/* Barre de recherche */}
//           <div className="calendar-form-group">
//             <input
//               type="text"
//               className="calendar-form-input"
//               placeholder="Rechercher un collaborateur..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               autoFocus
//             />
//           </div>

//           {/* ✅ Info méthode (fixe) */}
//           <div className="invite-method-info">
//             <i className="fas fa-envelope"></i>
//             Les invitations seront envoyées par <strong>email</strong>
//           </div>

//           {/* Liste sociétés */}
//           <div className="calendar-form-group">
//             <label className="calendar-form-label">
//               Collaborateurs disponibles ({filteredSocietes.length})
//             </label>
//             <div className="artisans-list">
//               {filteredSocietes.length === 0 ? (
//                 <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
//                   {searchTerm 
//                     ? 'Aucun collaborateur trouvé' 
//                     : 'Aucun collaborateur avec email disponible'
//                   }
//                 </p>
//               ) : (
//                 filteredSocietes.map(societe => (
//                   <label
//                     key={societe.id}
//                     className="artisan-item"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={selectedSocietes.includes(societe.id)}
//                       onChange={() => handleToggleSociete(societe.id)}
//                     />
//                     <div className="artisan-info">
//                       <div className="artisan-name">
//                         <i className="fas fa-building" style={{ marginRight: '8px', color: '#E77131' }}></i>
//                         {societe.name}
//                       </div>
//                       <div className="artisan-contact">
//                         <span>
//                           <i className="fas fa-envelope"></i> {societe.email}
//                         </span>
//                       </div>
//                     </div>
//                   </label>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Sélection */}
//           {selectedSocietes.length > 0 && (
//             <div className="selection-info">
//               <i className="fas fa-check-circle"></i>
//               {selectedSocietes.length} collaborateur{selectedSocietes.length > 1 ? 's' : ''} sélectionné{selectedSocietes.length > 1 ? 's' : ''}
//             </div>
//           )}
//         </div>

//         {/* Pied de page */}
//         <div className="calendar-modal-footer">
//           <button className="calendar-btn-secondary" onClick={onClose}>
//             Annuler
//           </button>
//           <button
//             className="calendar-btn-primary"
//             onClick={handleInvite}
//             disabled={isLoading || selectedSocietes.length === 0}
//           >
//             {isLoading ? (
//               <>
//                 <i className="fas fa-spinner fa-spin"></i>
//                 Envoi...
//               </>
//             ) : (
//               <>
//                 <i className="fas fa-paper-plane"></i>
//                 Inviter ({selectedSocietes.length})
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       <style>{`
//         .invite-method-info {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 12px 16px;
//           background: #E8F5E9;
//           border-left: 3px solid #4CAF50;
//           border-radius: 4px;
//           margin-bottom: 16px;
//           font-size: 14px;
//           color: #2E7D32;
//         }

//         .invite-method-info i {
//           font-size: 16px;
//         }

//         .artisans-list {
//           max-height: 300px;
//           overflow-y: auto;
//           border: 1px solid var(--color-border);
//           border-radius: var(--radius-small);
//           padding: 8px;
//         }

//         .artisan-item {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 12px;
//           border-radius: 4px;
//           cursor: pointer;
//           transition: all 0.2s;
//           margin-bottom: 8px;
//           border: 1px solid transparent;
//         }

//         .artisan-item:hover {
//           background: var(--color-light-gray);
//           border-color: var(--color-primary);
//         }

//         .artisan-item input[type="checkbox"] {
//           width: 18px;
//           height: 18px;
//           cursor: pointer;
//           accent-color: var(--color-primary);
//         }

//         .artisan-info {
//           flex: 1;
//         }

//         .artisan-name {
//           font-weight: 500;
//           color: var(--color-gray-primary);
//           margin-bottom: 4px;
//           display: flex;
//           align-items: center;
//         }

//         .artisan-contact {
//           display: flex;
//           gap: 12px;
//           font-size: 12px;
//           color: var(--color-gray-secondary);
//         }

//         .artisan-contact span {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//         }

//         .selection-info {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 12px;
//           background: #E8F5E9;
//           color: #2E7D32;
//           border-radius: 4px;
//           font-weight: 500;
//           font-size: 13px;
//         }

//         .selection-info i {
//           font-size: 16px;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default InviteAttendeesModal;


// InviteAttendeesModal.tsx - VERSION CORRIGÉE

import React, { useState, useEffect } from 'react';

interface Societe {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

// ✅ PROPS CORRIGÉES
interface InviteAttendeesModalProps {
  isOpen: boolean;
  eventId: string;  // ✅ string au lieu de number
  onClose: () => void;
  onInvite: (societeIds: number[]) => Promise<void>;  // ✅ Simplifié
  initialSelectedIds?: number[];  // ✅ Ajouté
}

const InviteAttendeesModal: React.FC<InviteAttendeesModalProps> = ({
  isOpen,
  // eventId,
  onClose,
  onInvite,
  initialSelectedIds = []
}) => {
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [selectedSocietes, setSelectedSocietes] = useState<number[]>(initialSelectedIds);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  //const API_BASE_URL = 'https://staging.solutravo.zeta-app.fr/api';
  const API_BASE_URL = 'http://localhost:3000/api';

  // ✅ Récupérer societeId depuis le localStorage ou context
  const getSocieteId = (): number => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.societeId || 0;
    }
    return 0;
  };

  useEffect(() => {
    if (isOpen) {
      loadSocietes();
      // ✅ Réinitialiser avec les IDs initiaux
      setSelectedSocietes(initialSelectedIds);
    }
  }, [isOpen, initialSelectedIds]);

  const loadSocietes = async () => {
    try {
      const societeId = getSocieteId();
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

  // ✅ Handler simplifié
  const handleInvite = async () => {
    if (selectedSocietes.length === 0) {
      alert('Sélectionnez au moins un collaborateur');
      return;
    }

    setIsLoading(true);
    try {
      await onInvite(selectedSocietes);  // ✅ Passe juste les IDs
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
    societe.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    societe.email
  );

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
              placeholder="🔍 Rechercher un collaborateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Info méthode */}
          <div className="invite-method-info">
            ✉️ Les invitations seront envoyées par <strong>email</strong>
          </div>

          {/* Liste sociétés */}
          <div className="calendar-form-group">
            <label className="calendar-form-label">
              Collaborateurs disponibles ({filteredSocietes.length})
            </label>
            <div className="artisans-list">
              {filteredSocietes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  {searchTerm 
                    ? 'Aucun collaborateur trouvé' 
                    : 'Aucun collaborateur avec email disponible'
                  }
                </p>
              ) : (
                filteredSocietes.map(societe => (
                  <label
                    key={societe.id}
                    className={`artisan-item ${selectedSocietes.includes(societe.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSocietes.includes(societe.id)}
                      onChange={() => handleToggleSociete(societe.id)}
                    />
                    <div className="artisan-info">
                      <div className="artisan-name">
                        🏢 {societe.name}
                      </div>
                      <div className="artisan-contact">
                        <span>
                          ✉️ {societe.email}
                        </span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Sélection */}
          {selectedSocietes.length > 0 && (
            <div className="selection-info">
              ✓ {selectedSocietes.length} collaborateur{selectedSocietes.length > 1 ? 's' : ''} sélectionné{selectedSocietes.length > 1 ? 's' : ''}
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
              <>⏳ Envoi...</>
            ) : (
              <>📧 Inviter ({selectedSocietes.length})</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .invite-method-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #E8F5E9;
          border-left: 3px solid #4CAF50;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #2E7D32;
        }

        .artisans-list {
          max-height: 350px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 8px;
        }

        .artisan-item {
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

        .artisan-item:hover {
          background: #f5f5f5;
          border-color: #E77131;
        }

        .artisan-item.selected {
          background: #FFF3E0;
          border-color: #E77131;
        }

        .artisan-item input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #E77131;
        }

        .artisan-info {
          flex: 1;
        }

        .artisan-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .artisan-contact {
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: #666;
        }

        .artisan-contact span {
          display: flex;
          align-items: center;
          gap: 6px;
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
        }
      `}</style>
    </div>
  );
};

export default InviteAttendeesModal;
