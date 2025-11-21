

import { useState } from 'react';
import type { CreateListeData, ContactInvalide } from "../types/create-liste.types";

interface CreateListeEtape4Props {
  data: CreateListeData;
  onPrecedent: () => void;
  onCreer: () => void;
  isLoading?: boolean;
}

const CreateListeEtape4 = ({ data, onPrecedent, onCreer, isLoading = false }: CreateListeEtape4Props) => {
  const [erreur, setErreur] = useState('');

   const handleCreer = () => {
    // Réinitialiser l'erreur
    setErreur('');

    // Validation : vérifier qu'il y a au moins un contact valide
    if (data.contactsValides === 0) {
      setErreur('Vous devez avoir au moins un contact valide pour créer la liste.');
      return;
    }

    // Si tout est OK, créer la liste
    onCreer();
  };
  

  // Mock data pour contacts par pays
  const contactsParPays = [
    { pays: 'France', flagCode: 'fr', count: data.contactsValides }, // ← Changé de numerosValides à contactsValides
  ];

  // Compter les contacts invalides par motif
  const getContactsInvalidesStats = () => {
    if (!data.contactsInvalides || data.contactsInvalides.length === 0) {
      return [];
    }

    const motifs: { [key: string]: number } = {};
    data.contactsInvalides.forEach((contactInvalide: ContactInvalide) => {
      const motif = contactInvalide.motif;
      motifs[motif] = (motifs[motif] || 0) + 1;
    });

    return Object.entries(motifs).map(([motif, count]) => ({
      motif,
      count
    }));
  };

  const contactsInvalidesStats = getContactsInvalidesStats();

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
              </tr>
            </thead>
            <tbody>
              {contactsParPays.map((contact, index) => (
                <tr key={index}>
                  <td>
                    <span className="pays-flag-campagne">{contact.flagCode}</span>
                    {contact.pays}
                  </td>
                  <td>
                    <div className="volume-cell-campagne">
                      <span className="volume-count-campagne">{contact.count}</span>
                      <div className="volume-bar-campagne">
                        <div 
                          className="volume-progress-campagne"
                          style={{ width: `${(contact.count / (contact.count + (data.contactsInvalides?.length || 0))) * 100}%` }} // ← Changé contactsInvalides
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CONTACTS INVALIDES */}
        <div className="resume-section-campagne">
          <h4 className="resume-section-title-campagne">
            Contacts invalides 
            {data.contactsInvalides && data.contactsInvalides.length > 0 && ( // ← Changé contactsInvalides
              <span className="badge-invalides-campagne">
                {data.contactsInvalides.length} {/* ← Changé contactsInvalides */}
              </span>
            )}
          </h4>
          
          <table className="table-resume-campagne">
            <thead>
              <tr>
                <th>MOTIF</th>
                <th>VOLUME</th>
              </tr>
            </thead>
            <tbody>
              {contactsInvalidesStats.length > 0 ? (
                contactsInvalidesStats.map((stat, index) => (
                  <tr key={index}>
                    <td>{stat.motif}</td>
                    <td>
                      <span className="volume-count-campagne invalid-count-campagne">
                        {stat.count}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="no-data-campagne">
                    Aucun contact invalide
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* AFFICHAGE DES CONTACTS INVALIDES DÉTAILLÉS */}
          {data.contactsInvalides && data.contactsInvalides.length > 0 && ( // ← Changé contactsInvalides
            <div className="numeros-invalides-details-campagne">
              <h5 className="details-title-campagne">Contacts invalides détectés :</h5>
              <div className="numeros-list-campagne">
                {data.contactsInvalides.map((contactInvalide: ContactInvalide, index: number) => (
                  <span key={index} className="numero-invalide-item-campagne" title={contactInvalide.motif}>
                    {contactInvalide.numero}
                    {contactInvalide.name && ` (${contactInvalide.name})`} {/* ← Affiche le nom si disponible */}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOUTONS D'ACTIONS */}
      <div className="actions-campagne">
        {erreur && (
          <div className="error-banner-campagne">
            <i className="fa-solid fa-circle-exclamation"></i>
            {erreur}
          </div>
        )}
        <button 
          className="btn-secondary check_button" 
          onClick={onPrecedent}
          disabled={isLoading}
        >
          <i className="fa-solid fa-chevron-left"></i>
          Précédent
        </button>
        <button 
          className="btn-primary check_button" 
          onClick={handleCreer}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Création en cours...
            </>
          ) : (
            <>
              Créer
              <i className="fa-solid fa-chevron-right"></i>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateListeEtape4;