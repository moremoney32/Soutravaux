

import type { CampagneData } from "../types/campagne.types";

interface Etape5ResumeProps {
  data: CampagneData;
  onPrecedent: () => void;
  onCreer: () => void;
  isLoading?: boolean;
}

const Etape5Resume = ({ data, onPrecedent, onCreer,isLoading = false }: Etape5ResumeProps) => {
  
  //Formater la date et l'heure
  const formatPlanification = () => {
    if (data.planification.type === 'instantane'){
      return 'Envoi instantané';
    } else {
      if (data.planification.date && data.planification.heure) {
        const date = new Date(data.planification.date).toLocaleDateString('fr-FR');
        return `${date} à ${data.planification.heure}`;
      }
      return 'Date non définie';
    }
  };

  //  Calculer le nombre total de SMS
  const totalSMS = data.contactsValides * (data.smsCount || 1);

  //  Type de contact dynamique
  const getContactTypeLabel = () => {
    if (data.contactType === 'enregistres') {
      return 'Contacts enregistrés';
    }
    return 'Liste de contact manuelle';
  };

  // Fonction pour formater le message avec les liens cliquables
  const formatMessageWithLinks = (message: string) => {
    return message.split(' ').map((word, index) => {
      // Détecter les liens (commençant par http ou contenant 🔗)
      if (word.startsWith('http') || /🔗/.test(word)) {
        const lienUrl = word.replace('🔗', '').trim();
        return (
          <a 
            key={index}
            href={lienUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="message-link-resume-campagne"
          >
            {word}
          </a>
        );
      }
      return word + ' ';
    });
  };

  return (
    <div className="etape-campagne">
      <div className="stats-grid-campagne">
        <div className="stat-card-campagne">
          <div className="stat-value-campagne">{totalSMS}</div>
          <div className="stat-label-campagne">
            Total SMS <i className="fa-solid fa-circle-info"></i>
          </div>
        </div>
        <div className="stat-card-campagne">
          <div className="stat-value-campagne">{data.contactsValides}</div>
          <div className="stat-label-campagne">
            Contacts valides <i className="fa-solid fa-circle-info"></i>
          </div>
        </div>
        <div className="stat-card-campagne">
          <div className="stat-value-campagne">0</div>
          <div className="stat-label-campagne">
            Contacts désabonnés (STOP) <i className="fa-solid fa-circle-info"></i>
          </div>
        </div>
        <div className="stat-card-campagne">
          <div className="stat-value-campagne">{data.contacts.length - data.contactsValides}</div>
          <div className="stat-label-campagne">
            Contacts invalides (NPAI) <i className="fa-solid fa-circle-info"></i>
          </div>
        </div>
      </div>

      <h3 className="section-title-campagne">Résumé</h3>

      <div className="resume-grid-campagne">
        <div className="resume-card-campagne">
          <div className="resume-icon-campagne">
            <i className="fa-solid fa-calendar"></i>
          </div>
          <div className="resume-content-campagne">
            <div className="resume-date-campagne">
              <i className="fa-solid fa-calendar-days"></i>
              {formatPlanification()}
            </div>
            <div className="resume-label-campagne">Planification</div>
          </div>
        </div>

        {/*  TYPE DE CONTACT DYNAMIQUE */}
        <div className="resume-card-campagne">
          <div className="resume-icon-campagne">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="resume-content-campagne">
            <div className="resume-title-campagne">{getContactTypeLabel()}</div>
            <div className="resume-label-campagne">Liste de contact choisie</div>
          </div>
        </div>

        {/*  EXPÉDITEUR DYNAMIQUE */}
        <div className="resume-card-campagne">
          <div className="resume-icon-campagne">
            <i className="fa-solid fa-paper-plane"></i>
          </div>
          <div className="resume-content-campagne">
            <div className="resume-title-campagne">
              {data.expediteur || 'Aucun expéditeur'}
            </div>
            <div className="resume-label-campagne">Expéditeur personnalisé</div>
          </div>
        </div>

        <div className="resume-card-campagne">
          <div className="resume-icon-campagne">
            <i className="fa-solid fa-font"></i>
          </div>
          <div className="resume-content-campagne">
            <div className="resume-title-campagne">{data.nom}</div>
            <div className="resume-label-campagne">Nom de la campagne</div>
          </div>
        </div>
      </div>

      <h4 className="section-title-campagne">Message</h4>
      <div className="message-preview-resume-campagne">
        {data.message ? (
          <div className="message-content-resume-campagne">
            {formatMessageWithLinks(data.message)}
          </div>
        ) : (
          <p>(Aucun message)</p>
        )}
      </div>

      {/*  LIENS ET FICHIERS DYNAMIQUES */}
      <div className="info-sections-campagne">
        {/* SECTION LIENS */}
        <div className="info-section-campagne">
          <h5>Liens inclus dans le message</h5>
          {data.liens && data.liens.length > 0 ? (
            <div className="liens-list-resume-campagne">
              {data.liens.map((lien, index) => (
                <div key={index} className="lien-item-resume-campagne">
                  <div className="lien-icon-resume-campagne">
                    <i className="fa-solid fa-link"></i>
                  </div>
                  <a href={lien} target="_blank" rel="noopener noreferrer" className="lien-text-resume-campagne">
                    {lien}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p>Aucun lien court ne sera envoyé dans cette campagne.</p>
          )}
        </div>

        {/* SECTION FICHIERS (EN COMMENTAIRE) */}
        {/* <div className="info-section-campagne">
          <h5>Fichiers joints</h5>
          {data.fichiers && data.fichiers.length > 0 ? (
            <div className="fichiers-list-resume-campagne">
              {data.fichiers.map((fichier, index) => (
                <div key={index} className="fichier-item-resume-campagne">
                  <div className="fichier-icon-resume-campagne">
                    <i className="fa-solid fa-file"></i>
                  </div>
                  <span className="fichier-text-resume-campagne">{fichier}</span>
                  <span className="fichier-comment-campagne">(Ce fichier sera joint au message)</span>
                </div>
              ))}
            </div>
          ) : (
            <p>Aucun fichier ne sera envoyé lors de cette campagne.</p>
          )}
        </div> */}
      </div>

      <div className="actions-campagne">
          <button className="btn-secondary check_button" onClick={onPrecedent}>
            <i className="fa-solid fa-chevron-left"></i>
            Précédent
          </button>
          <button className="btn-primary btn-create-campagne check_button" onClick={onCreer}   disabled={isLoading}>
            {/* <i className="fa-solid fa-check"></i>
            Validation ({totalSMS} SMS) */}
            {isLoading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Création en cours...
            </>
          ) : (
            <>
               Validation ({totalSMS} SMS)
              <i className="fa-solid fa-chevron-right"></i>
            </>
          )}
          </button>
      </div>
    </div>
  );
};

export default Etape5Resume;