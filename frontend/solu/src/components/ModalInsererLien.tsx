

import { useState } from 'react';
import '../styles/modals-campagne.css';

interface ModalInsererLienProps {
  onClose: () => void;
  onInsert: (lien: string) => void;
}

const ModalInsererLien = ({ onClose, onInsert }: ModalInsererLienProps) => {
  const [lien, setLien] = useState('');
  const [erreur, setErreur] = useState('');

  const handleInsert = () => {
    // Validation simple
    if (!lien.trim()) {
      setErreur('Veuillez entrer un lien');
      return;
    }

    // Vérification simple : doit commencer par http:// ou https://
    if (!lien.startsWith('http://') && !lien.startsWith('https://')) {
      setErreur("Le lien doit commencer par 'http://' ou 'https://'");
      return;
    }

    // Insérer le lien exactement comme saisi
    onInsert(lien);
  };

  return (
    <div className="modal-overlay-campagne" onClick={onClose}>
      <div className="modal-container-campagne" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-campagne">
          <h3 className="modal-title-campagne">Insérer un lien</h3>
          <button className="modal-close-campagne" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body-campagne">
          <div className="form-group-modal-campagne">
            <label className="label-modal-campagne">Lien</label>
            <input
              type="text"
              className={`input-modal-campagne ${erreur ? 'input-error-campagne' : ''}`}
              placeholder="https://exemple.com"
              value={lien}
              onChange={(e) => {
                setLien(e.target.value);
                setErreur('');
              }}
            />
            {erreur && (
              <div className="error-message-campagne">
                <i className="fa-solid fa-circle-exclamation"></i>
                {erreur}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer-campagne">
          <button className="btn-tertiary" onClick={onClose}>
            Annuler
          </button>
          <button className="btn-primary" onClick={handleInsert}>
            Insérer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInsererLien;