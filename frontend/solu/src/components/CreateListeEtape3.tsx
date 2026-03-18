

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
        <h4 className="valider-subtitle-campagne">Aperçu des contacts</h4>
        <p className="valider-description-campagne">
          Aperçu des contacts valides qui seront ajoutés à votre liste.
        </p>

        <div className="contacts-list-campagne">
          <div className="contacts-header-campagne">
            <span>NOM</span>
            <span>NUMÉRO</span>
            <span>EMAIL</span>
          </div>
          {data.contacts && data.contacts.length > 0 ? (
            data.contacts.map((contact, index) => (
              <div key={index} className="contact-item-campagne">
                <span className="contact-name-campagne">
                  {contact.name || "Non renseigné"}
                </span>
                <span className="contact-phone-campagne">
                  {contact.phone_number}
                </span>
                <span className="contact-email-campagne">
                  {contact.email || "Non renseigné"}
                </span>
              </div>
            ))
          ) : (
            <div className="no-data-campagne">Aucun contact valide</div>
          )}
        </div>

        {/* AFFICHAGE DES STATISTIQUES */}
        <div className="validation-stats-campagne">
          <div className="stat-item-campagne">
            <span className="stat-label-campagne">Contacts valides :</span>
            <span className="stat-value-campagne valid-stat-campagne">
              {data.contactsValides || 0}
            </span>
          </div>
          <div className="stat-item-campagne">
            <span className="stat-label-campagne">Contacts invalides :</span>
            <span className="stat-value-campagne invalid-stat-campagne">
              {data.contactsInvalides?.length || 0}
            </span>
          </div>
          <div className="stat-item-campagne">
            <span className="stat-label-campagne">Total :</span>
            <span className="stat-value-campagne">
              {(data.contactsValides || 0) + (data.contactsInvalides?.length || 0)}
            </span>
          </div>
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