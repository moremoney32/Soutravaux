import { useState } from 'react';
import '../styles/modals-campagne.css';

interface ModalInsererStopProps {
  onClose: () => void;
  onInsert: (stopText: string) => void;
}

const ModalInsererStop = ({ onClose, onInsert }: ModalInsererStopProps) => {
  const [numeroStop, setNumeroStop] = useState('36111'); // Numéro par défaut
  const [erreur, setErreur] = useState('');

  const handleInsert = () => {
    if (!numeroStop.trim()) {
      setErreur('Veuillez entrer un numéro STOP');
      return;
    }

    // Validation : que des chiffres
    if (!/^\d+$/.test(numeroStop)) {
      setErreur('Le numéro STOP ne doit contenir que des chiffres');
      return;
    }

    // Créer le texte STOP
    const stopText = `STOP au ${numeroStop}`;
    onInsert(stopText);
  };

  return (
    <div className="modal-overlay-campagne" onClick={onClose}>
      <div className="modal-container-campagne" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-campagne">
          <h3 className="modal-title-campagne">Insérer la mention STOP</h3>
          <button className="modal-close-campagne" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body-campagne">
          <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
            La mention STOP est obligatoire pour les campagnes marketing. Elle permet aux destinataires de se désabonner.
          </p>
          
          <div className="form-group-modal-campagne">
            <label className="label-modal-campagne">Numéro STOP</label>
            <input
              type="text"
              className={`input-modal-campagne ${erreur ? 'input-error-campagne' : ''}`}
              placeholder="36111"
              value={numeroStop}
              onChange={(e) => {
                setNumeroStop(e.target.value);
                setErreur('');
              }}
            />
            {erreur && (
              <div className="error-message-campagne">
                <i className="fa-solid fa-circle-exclamation"></i>
                {erreur}
              </div>
            )}
            <small style={{ display: 'block', marginTop: '8px', color: '#888' }}>
              Le texte ajouté sera : <strong>STOP au {numeroStop || 'XXXXX'}</strong>
            </small>
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

export default ModalInsererStop;