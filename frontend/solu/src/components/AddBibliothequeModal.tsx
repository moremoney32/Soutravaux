// import React from 'react';
// import '../styles/AddBibliothequeModal.css';
// import type { Bibliotheque } from './BibiothequeDashboard';


// interface AddBibliothequeModalProps {
//   bibliotheques: Bibliotheque[];
//   onClose: () => void;
//   onSelect: (bibliotheque: Bibliotheque) => void;
// }

// const AddBibliothequeModal: React.FC<AddBibliothequeModalProps> = ({
//   bibliotheques,
//   onClose,
//   onSelect
// }) => {
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h3>Ajouter une Bibliothèque</h3>
//           <button className="close-button" onClick={onClose}>×</button>
//         </div>
        
//         <div className="modal-body">
//           <p className="modal-description">
//             Sélectionnez une bibliothèque pour demander l'accès
//           </p>
          
//           <div className="bibliotheques-list">
//             {bibliotheques.map((bibliotheque) => (
//               <div 
//                 key={bibliotheque.id}
//                 className="bibliotheque-item"
//                 onClick={() => onSelect(bibliotheque)}
//               >
//                 <div className="item-icon">
//                   <span>{bibliotheque.logo || '📚'}</span>
//                 </div>
//                 <div className="item-content">
//                   <h4>{bibliotheque.name}</h4>
//                   <span className="item-status">
//                     {bibliotheque.hasAccess ? 'Accès accordé' : 'Demander l\'accès'}
//                   </span>
//                 </div>
//                 <div className="item-arrow">→</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddBibliothequeModal;


import React from 'react';

import '../styles/AddBibliothequeModal.css';
import type { Bibliotheque } from './BibiothequeDashboard';

interface AddBibliothequeModalProps {
  bibliotheques: Bibliotheque[];
  onClose: () => void;
  onSelect: (bibliotheque: Bibliotheque) => void;
}

const AddBibliothequeModal: React.FC<AddBibliothequeModalProps> = ({
  bibliotheques,
  onClose,
  onSelect
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ajouter une Bibliothèque</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Sélectionnez une bibliothèque pour demander l'accès
          </p>
          
          <div className="bibliotheques-list">
            {bibliotheques.map((bibliotheque) => (
              <div 
                key={bibliotheque.id}
                className="bibliotheque-item"
                onClick={() => onSelect(bibliotheque)}
              >
                <div className="item-icon">
                  <span>{bibliotheque.logo || '📚'}</span>
                </div>
                <div className="item-content">
                  <h4>{bibliotheque.name}</h4>
                  <span className="item-status">
                    {bibliotheque.hasAccess ? 'Accès accordé' : 'Demander l\'accès'}
                  </span>
                </div>
                <div className="item-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBibliothequeModal;