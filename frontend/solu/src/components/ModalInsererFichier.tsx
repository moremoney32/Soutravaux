// src/components/campagne/ModalInsererFichier.tsx

import { useState } from 'react';
import '../styles/modals-campagne.css';

interface ModalInsererFichierProps {
  onClose: () => void;
  onInsert: (fileName: string) => void;
}

const ModalInsererFichier = ({ onClose, onInsert }: ModalInsererFichierProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleInsert = () => {
    if (selectedFile) {
      onInsert(selectedFile.name);
    }
  };

  return (
    <div className="modal-overlay-campagne" onClick={onClose}>
      <div className="modal-container-campagne" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-campagne">
          <h3 className="modal-title-campagne">Insérer un fichier</h3>
          <button className="modal-close-campagne" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body-campagne">
          <div className="form-group-modal-campagne">
            <label className="label-modal-campagne">Fichier</label>
            <div className="file-upload-modal-campagne">
              <input
                type="file"
                id="file-upload-modal"
                className="file-input-hidden-campagne"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
              <label htmlFor="file-upload-modal" className="file-upload-button-campagne">
                <i className="fa-solid fa-cloud-arrow-up"></i>
                Sélectionner un fichier
              </label>
              {selectedFile && (
                <div className="file-selected-campagne">
                  <i className="fa-solid fa-file"></i>
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer-campagne">
          <button className="btn-tertiary" onClick={onClose}>
            Annuler
          </button>
          <button 
            className="btn-primary" 
            onClick={handleInsert}
            disabled={!selectedFile}
          >
            Insérer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInsererFichier;