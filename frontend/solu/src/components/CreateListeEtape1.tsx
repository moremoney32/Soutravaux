// src/components/create-liste/CreateListeEtape1.tsx

import type { CreateListeData } from "../types/create-liste.types";



interface CreateListeEtape1Props {
  data: CreateListeData;
  onUpdate: (data: Partial<CreateListeData>) => void;
  onSuivant: () => void;
}

const CreateListeEtape1 = ({ data, onUpdate, onSuivant }: CreateListeEtape1Props) => {
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
          onChange={(e) => onUpdate({ nom: e.target.value })}
          placeholder="Liste de contact 13/11/2025"
        />
      </div>

      <div className="actions-campagne">
        <button className="btn-primary check_button" onClick={onSuivant}>
          Suivant
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default CreateListeEtape1;