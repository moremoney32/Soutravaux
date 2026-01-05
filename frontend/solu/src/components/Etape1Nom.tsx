

import { useState } from 'react';
import type { CampagneData } from "../types/campagne.types";

interface Etape1NomProps {
  data: CampagneData;
  onUpdate: (data: Partial<CampagneData>) => void;
  onSuivant: () => void;
}

const Etape1Nom = ({ data, onUpdate, onSuivant }: Etape1NomProps) => {
  const [erreur, setErreur] = useState('');

  const handleSuivant = () => {
    // VALIDATION : Nom obligatoire
    if (!data.nom.trim()) {
      setErreur('Le nom de la campagne est obligatoire');
      return;
    }

    setErreur('');
    onSuivant();
  };

  return (
    <div className="etape-campagne">
      {/* <h3 className="etape-title-campagne">Nom</h3> */}

      <div className="form-group-campagne">
        <label htmlFor="nom-campagne">Nom</label>
        <input
          type="text"
          id="nom-campagne"
          className={`input-campagne ${erreur ? 'input-error-campagne' : ''}`}
          value={data.nom}
          onChange={(e) => {
            onUpdate({ nom: e.target.value });
            setErreur(''); // Effacer l'erreur quand on tape
          }}
          placeholder="Campagne 14/11/2025 17:30"
        />
        {erreur && (
          <div className="error-banner-campagne slip-text-campagne">
            <i className="fa-solid fa-circle-exclamation"></i>
            {erreur}
          </div>
        )}
      </div>

       <div className="checkbox-group-campagne">
        <input
          type="checkbox"
          id="marketing-campagne"
          checked={data.marketingPurpose}
          onChange={(e) => onUpdate({ marketingPurpose: e.target.checked })}
        />
        <label htmlFor="marketing-campagne">Campagne à but marketing</label>
      </div> 

      <div className="actions-campagne">
        <button className="btn-primary check_button" onClick={handleSuivant}>
          Suivant
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Etape1Nom;
