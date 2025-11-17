// src/components/create-liste/CreateListeEtape4.tsx

import type { CreateListeData } from "../types/create-liste.types";



interface CreateListeEtape4Props {
  data: CreateListeData;
  onPrecedent: () => void;
  onCreer: () => void;
}

const CreateListeEtape4 = ({ data, onPrecedent, onCreer }: CreateListeEtape4Props) => {
  // Mock data pour contacts par pays
  const contactsParPays = [
    { pays: 'France', flag: 'fr', count: data.numerosValides, percentage: 100 },
  ];

  return (
    <div className="etape-campagne">
      <div className="resume-grid-liste-campagne">
        {/* CONTACTS PAR PAYS */}
        <div className="resume-section-campagne">
          <h4 className="resume-section-title-campagne">Contacts par pays</h4>
          
          <table className="table-resume-campagne">
            <thead>
              <tr>
                <th>PAYS</th>
                <th>VOLUME</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {contactsParPays.map((contact, index) => (
                <tr key={index}>
                  <td>
                    <span className="pays-flag-campagne">{contact.flag}</span>
                    {contact.pays}
                  </td>
                  <td>
                    <div className="volume-cell-campagne">
                      <span className="volume-count-campagne">{contact.count}</span>
                      <div className="volume-bar-campagne">
                        <div 
                          className="volume-progress-campagne"
                          style={{ width: `${contact.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button className="btn-icon-delete-campagne">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CONTACTS INVALIDES */}
        <div className="resume-section-campagne">
          <h4 className="resume-section-title-campagne">Contacts invalides</h4>
          
          <table className="table-resume-campagne">
            <thead>
              <tr>
                <th>MOTIF</th>
                <th>VOLUME</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={2} className="no-data-campagne">
                  Aucune entrée correspondante n'a été trouvée
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="actions-campagne">
        <button className="btn-secondary check_button" onClick={onPrecedent}>
          <i className="fa-solid fa-chevron-left"></i>
          Précédent
        </button>
        <button className="btn-primary check_button" onClick={onCreer}>
          Créer
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default CreateListeEtape4;