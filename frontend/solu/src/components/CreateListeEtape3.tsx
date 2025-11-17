// src/components/create-liste/CreateListeEtape3.tsx

import type { CreateListeData } from "../types/create-liste.types";

interface CreateListeEtape3Props {
  data: CreateListeData;
  onUpdate: (data: Partial<CreateListeData>) => void;
  onSuivant: () => void;
  onPrecedent: () => void;
}

const CreateListeEtape3 = ({ data, onSuivant, onPrecedent }: CreateListeEtape3Props) => {
  return (
    <div className="etape-campagne">
      <h3 className="etape-title-campagne">Valider</h3>

      <div className="valider-section-campagne">
        <h4 className="valider-subtitle-campagne">Aperçu</h4>
        <p className="valider-description-campagne">
          Il s'agit d'un aperçu des numéros de téléphone saisis. Les noms de champs ne peuvent
          contenir que des lettres, des chiffres, des tirets et des traits d'union.
        </p>

        <div className="numeros-list-campagne">
          <div className="numeros-header-campagne">NUMÉRO</div>
          {data.numeros.length > 0 ? (
            data.numeros.map((numero, index) => (
              <div key={index} className="numero-item-campagne">
                {numero}
              </div>
            ))
          ) : (
            <div className="no-data-campagne">Aucun numéro ajouté</div>
          )}
        </div>
      </div>

      <div className="actions-campagne">
        <button className="btn-secondary check_button" onClick={onPrecedent}>
          <i className="fa-solid fa-chevron-left"></i>
          Précédent
        </button>
        <button className="btn-primary check_button" onClick={onSuivant}>
          Suivant
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default CreateListeEtape3;