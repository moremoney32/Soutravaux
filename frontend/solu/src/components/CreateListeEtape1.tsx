


import { useState } from 'react';
import type { CreateListeData } from "../types/create-liste.types";

interface CreateListeEtape1Props {
  data: CreateListeData;
  onUpdate: (data: Partial<CreateListeData>) => void;
  onSuivant: () => void;
}

const CreateListeEtape1 = ({ data, onUpdate, onSuivant }: CreateListeEtape1Props) => {
  const [erreur, setErreur] = useState(''); // État d'erreur ajouté

  // Fonction de validation avant de passer à l'étape suivante
  const handleSuivantAvecValidation = () => {
    // VALIDATION : Le nom ne doit pas être vide
    if (!data.nom.trim()) {
      setErreur('Le nom de la liste est obligatoire');
      return;
    }

    // Si validation réussie, passer à l'étape suivante
    setErreur('');
    onSuivant();
  };

  // Effacer l'erreur quand l'utilisateur commence à taper
  const handleNomChange = (nom: string) => {
    onUpdate({ nom });
    if (nom.trim() && erreur) {
      setErreur('');
    }
  };

  return (
    <div className="etape-campagne">
      <h3 className="etape-title-campagne">Nom</h3>

      <div className="form-group-campagne">
        <label htmlFor="nom-liste">Nom</label>
        <input
          type="text"
          id="nom-liste"
          className="input-campagne"
          value={data.nom}
          onChange={(e) => handleNomChange(e.target.value)}
          placeholder="Liste de contact 13/11/2025"
        />
      </div>

      {/* ACTIONS AVEC GESTION D'ERREUR */}
      <div className="actions-campagne">
        {erreur && (
          <div className="error-banner-campagne">
            <i className="fa-solid fa-circle-exclamation"></i>
            {erreur}
          </div>
        )}
        <button className="btn-primary check_button" onClick={handleSuivantAvecValidation}>
          Suivant
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default CreateListeEtape1;