



import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderCampagne from './HeaderCampagne';
// import SidebarCampagne from './SidebarCampagne';
import '../styles/CampagnesDetails.css';
import type { CampagneDetailResponse } from '../types/campagne.types';
import { getCampagneDetails } from '../services/filtresCampagnesData';

interface CliqueurStatistique {
  id: string; 
  numero: string;
  nom: string | null;
  email: string | null;
  date_clic: string;
  heure_clic: string;
  nb_clics: number;
}

//  INTERFACE CORRIGÉE
interface SmsNonRecuStatistique {
  id: string; 
  numero: string; // Pour l'affichage
  phone_number: string; // Pour l'API
  nom: string | null;
  email: string | null;
  date_echec: string;
  raison: string;
  is_blacklisted: boolean;
}

const CampagneDetails = () => {
  const { campagneId } = useParams<{ campagneId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'cliqueurs' | 'non-recus'>('overview');
  const [searchCliqueurs, setSearchCliqueurs] = useState('');
  const [searchNonRecus, setSearchNonRecus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  let membreId = localStorage.getItem("membreId");
  let userId = Number(membreId);

  // ÉTATS POUR LES DONNÉES DE L'API
  const [campagneData, setCampagneData] = useState<CampagneDetailResponse | null>(null);
  const [cliqueurs, setCliqueurs] = useState<CliqueurStatistique[]>([]);
  const [smsNonRecus, setSmsNonRecus] = useState<SmsNonRecuStatistique[]>([]);

  useEffect(() => {
    const loadCampagneDetails = async () => {
      if (!campagneId) {
        setError('ID de campagne manquant');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getCampagneDetails(campagneId);
        console.log('📊 Données API reçues:', data);
        setCampagneData(data);
        
        //  TRANSFORMATION DES CLIQUEURS
        const clickedData: CliqueurStatistique[] = data.detail_stat.clicked.map((c, index) => {
          const clickedDate = new Date(c.sent_at);
          
          return {
            id: `cliqueur-${index}`,
            numero: c.phone_number,
            nom: c.nom || null,
            email: c.email || null,
            date_clic: clickedDate.toLocaleDateString('fr-FR'),
            heure_clic: clickedDate.toLocaleTimeString('fr-FR'),
            nb_clics: c.total_clicked || c.click_count || 1
          };
        });
        setCliqueurs(clickedData);
        console.log(' Cliqueurs transformés:', clickedData);

        //  TRANSFORMATION DES SMS NON-REÇUS (CORRIGÉE)
        const failedData: SmsNonRecuStatistique[] = data.detail_stat.failed.map((f, index) => {
          const failedDate = new Date(f.failed_at);
          
          return {
            id: f.id || `failed-${index}`, // Utiliser l'ID de l'API ou générer un ID
            numero: f.phone_number, //  Pour l'affichage
            phone_number: f.phone_number, //  Pour l'API de blocage
            nom: f.nom || null,
            email: f.email || null,
            date_echec: `${failedDate.toLocaleDateString('fr-FR')} ${failedDate.toLocaleTimeString('fr-FR')}`,
            raison: f.raison || f.reason || 'Raison inconnue', //  Gérer les deux noms
            is_blacklisted:f.is_blacklisted
          };
        });
        setSmsNonRecus(failedData);
        console.log(' SMS non-reçus transformés:', failedData);

      } catch (err) {
        console.error('❌ Erreur chargement détails campagne:', err);
        setError('Impossible de charger les détails de la campagne');
      } finally {
        setIsLoading(false);
      }
    };

    loadCampagneDetails();
  }, [campagneId]);

  const filteredCliqueurs = cliqueurs.filter(c => 
    (c.numero && c.numero.includes(searchCliqueurs)) ||
    (c.nom && c.nom.toLowerCase().includes(searchCliqueurs.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchCliqueurs.toLowerCase()))
  );

  const filteredNonRecus = smsNonRecus.filter(s => 
    (s.numero && s.numero.includes(searchNonRecus)) ||
    (s.nom && s.nom.toLowerCase().includes(searchNonRecus.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchNonRecus.toLowerCase())) ||
    (s.raison && s.raison.toLowerCase().includes(searchNonRecus.toLowerCase()))
  );

  //  FONCTION API POUR BLOQUER/DÉBLOQUER
  const blockUnblockContacts = async (phoneNumbers: string[], shouldBlock: boolean) => {
    try {
      const response = await fetch(
        'https://backendstaging.solutravo-compta.fr/api/contacts/block',
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '',
          },
          body: JSON.stringify({
            phone_number: phoneNumbers,
            societe_id: userId,
            block: shouldBlock
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du blocage/déblocage');
      }

      const result = await response.json();
      console.log(' Résultat API blocage:', result);
      return result;

    } catch (error: any) {
      console.error('❌ Erreur API block/unblock:', error);
      throw error;
    }
  };

  //  BLOQUER/DÉBLOQUER UN NUMÉRO INDIVIDUELLEMENT (CORRIGÉ)
  const handleToggleBlacklist = async (smsId: string, currentStatus: boolean) => {
    const sms = smsNonRecus.find(s => s.id === smsId);
    if (!sms) {
      console.error('❌ SMS non trouvé:', smsId);
      return;
    }

    const action = currentStatus ? 'débloquer' : 'bloquer';
    
    if (!confirm(`⚠️ Voulez-vous vraiment ${action} le numéro ${sms.numero} ?`)) {
      return;
    }

    try {
      //  Utiliser phone_number pour l'API
      await blockUnblockContacts([sms.phone_number], !currentStatus);

      // Mise à jour locale après succès
      setSmsNonRecus(prev => 
        prev.map(s => 
          s.id === smsId 
            ? { ...s, is_blacklisted: !currentStatus }
            : s
        )
      );

      alert(` Numéro ${currentStatus ? 'débloqué' : 'bloqué'} avec succès !`);
    } catch (error: any) {
      console.error('❌ Erreur blacklist:', error);
      alert(`❌ Erreur : ${error.message || 'Une erreur est survenue'}`);
    }
  };

  //  BLOQUER TOUS LES NUMÉROS EN ÉCHEC (CORRIGÉ)
  const handleBlacklistAll = async () => {
    const nonBlacklisted = smsNonRecus.filter(s => !s.is_blacklisted);
    
    if (nonBlacklisted.length === 0) {
      alert('ℹ️ Tous les numéros sont déjà bloqués');
      return;
    }

    if (!confirm(`⚠️ Voulez-vous vraiment bloquer ${nonBlacklisted.length} numéro(s) ?\n\nCette action bloquera tous les numéros en échec.`)) {
      return;
    }

    try {
      //  Utiliser phone_number pour l'API
      const phoneNumbers = nonBlacklisted.map(s => s.phone_number);

      console.log('📤 Numéros à bloquer:', phoneNumbers);

      // Appel API pour bloquer tous les numéros
      await blockUnblockContacts(phoneNumbers, true);

      // Mise à jour locale après succès
      setSmsNonRecus(prev => 
        prev.map(sms => ({ ...sms, is_blacklisted: true }))
      );

      alert(` ${nonBlacklisted.length} numéro(s) bloqué(s) avec succès !`);
    } catch (error: any) {
      console.error('❌ Erreur blocage multiple:', error);
      alert(`❌ Erreur : ${error.message || 'Une erreur est survenue'}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // CALCULS DES STATISTIQUES
  const stats = campagneData?.stats;
  const tauxReception = stats && stats.total_sent > 0 
    ? ((stats.total_delivered / stats.total_sent) * 100).toFixed(2) 
    : '0.00';
  const tauxClics = stats && stats.total_sent > 0 
    ? ((stats.total_clicked / stats.total_sent) * 100).toFixed(2) 
    : '0.00';
  const tauxDesabonnements = stats && stats.total_sent > 0 
    ? ((stats.total_stop / stats.total_sent) * 100).toFixed(2) 
    : '0.00';

  if (isLoading) {
    return (
      <div className="page-campagne">
        <div className="main-content-campagne">
          <HeaderCampagne />
          <div className="loading-state">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campagneData) {
    return (
      <div className="page-campagne">
        <div className="main-content-campagne">
          <HeaderCampagne />
          <div className="error-state">
            <i className="fa-solid fa-exclamation-triangle"></i>
            <p>{error || 'Impossible de charger les détails'}</p>
            <button className="btn-primary" onClick={() => navigate(`/campagne/${userId}`)}>
              Retour aux campagnes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-campagne">
      {/* <SidebarCampagne /> */}
      
      <div className="main-content-campagne">
        <HeaderCampagne />
        
        <div className="container-campagne">
          {/* HEADER */}
          <div className="details-header">
            <div className="details-header-left">
              <button className="btn-back" onClick={() => navigate(`/campagne/${userId}`)}>
                <i className="fa-solid fa-arrow-left"></i>
                Retour aux campagnes
              </button>
              <h2 className="details-title">{campagneData.campaign.name}</h2>
              <p className="details-subtitle">
                Statistiques et rapport d'envoi
              </p>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="stats-overview-grid">
            <div className="stat-overview-card stat-primary">
              <div className="stat-overview-icon">
                <i className="fa-solid fa-paper-plane"></i>
              </div>
              <div className="stat-overview-content">
                <div className="stat-overview-value">{stats?.total_sent || 0}</div>
                <div className="stat-overview-label">SMS envoyés</div>
              </div>
            </div>

            <div className="stat-overview-card stat-success">
              <div className="stat-overview-icon">
                <i className="fa-solid fa-check-circle"></i>
              </div>
              <div className="stat-overview-content">
                <div className="stat-overview-value">{tauxReception}%</div>
                <div className="stat-overview-label">SMS reçus</div>
                <div className="stat-overview-detail">{stats?.total_delivered || 0} SMS</div>
              </div>
            </div>

            <div className="stat-overview-card stat-info">
              <div className="stat-overview-icon">
                <i className="fa-solid fa-mouse-pointer"></i>
              </div>
              <div className="stat-overview-content">
                <div className="stat-overview-value">{tauxClics}%</div>
                <div className="stat-overview-label">Cliqueurs</div>
                <div className="stat-overview-detail">{stats?.total_clicked || 0} clics</div>
              </div>
            </div>

            <div className="stat-overview-card stat-warning">
              <div className="stat-overview-icon">
                <i className="fa-solid fa-hand"></i>
              </div>
              <div className="stat-overview-content">
                <div className="stat-overview-value">{tauxDesabonnements}%</div>
                <div className="stat-overview-label">Stop</div>
                <div className="stat-overview-detail">{stats?.total_stop || 0} désabonnements</div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="details-tabs">
            <button 
              className={`details-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fa-solid fa-chart-pie"></i>
              Vue d'ensemble
            </button>
            <button 
              className={`details-tab ${activeTab === 'cliqueurs' ? 'active' : ''}`}
              onClick={() => setActiveTab('cliqueurs')}
            >
              <i className="fa-solid fa-mouse-pointer"></i>
              Cliqueurs ({cliqueurs.length})
            </button>
            <button 
              className={`details-tab ${activeTab === 'non-recus' ? 'active' : ''}`}
              onClick={() => setActiveTab('non-recus')}
            >
              <i className="fa-solid fa-exclamation-triangle"></i>
              SMS non-reçus ({smsNonRecus.length})
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="details-content">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="overview-tab">
                {/* RÉCAPITULATIF */}
                <div className="details-section">
                  <h5 className="details-section-title">
                    <i className="fa-solid fa-info-circle"></i>
                    Récapitulatif de l'envoi
                  </h5>
                  <div className="recap-grid">
                    <div className="recap-item">
                      <span className="recap-label">Date d'envoi</span>
                      <span className="recap-value">{formatDate(campagneData.campaign.scheduled_at)}</span>
                    </div>
                    <div className="recap-item">
                      <span className="recap-label">Expéditeur</span>
                      <span className="recap-value">{campagneData.campaign.sender}</span>
                    </div>
                    <div className="recap-item">
                      <span className="recap-label">Nombre de SMS</span>
                      <span className="recap-value">
                        <i className="fa-solid fa-paper-plane"></i> {stats?.total_sent || 0}
                      </span>
                    </div>
                    <div className="recap-item">
                      <span className="recap-label">SMS délivrés</span>
                      <span className="recap-value">{stats?.total_delivered || 0}</span>
                    </div>
                    <div className="recap-item">
                      <span className="recap-label">SMS non-reçus</span>
                      <span className="recap-value">{stats?.total_failed || 0}</span>
                    </div>
                    <div className="recap-item">
                      <span className="recap-label">Désabonnements</span>
                      <span className="recap-value">{stats?.total_stop || 0}</span>
                    </div>
                  </div>

                  <div className="message-preview-section">
                    <h4>Message envoyé</h4>
                    <div className="message-preview-box">
                      <p>{campagneData.campaign.message}</p>
                      {campagneData.campaign.message.match(/(https?:\/\/[^\s]+)/g)?.map((link, i) => (
                        <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="message-link-detail">
                          <i className="fa-solid fa-link"></i>
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RAPPORT DE RÉCEPTION */}
                <div className="details-section">
                  <h3 className="details-section-title">
                    <i className="fa-solid fa-signal"></i>
                    Rapport de réception
                  </h3>
                  
                  <div className="reception-stats">
                    <div className="reception-stat-item reception-success">
                      <div className="reception-stat-header">
                        <span className="reception-stat-label">SMS reçus</span>
                        <span className="reception-stat-count">{stats?.total_delivered || 0}</span>
                      </div>
                      <div className="reception-stat-bar">
                        <div 
                          className="reception-stat-progress reception-success-bar"
                          style={{ width: `${tauxReception}%` }}
                        ></div>
                      </div>
                      <span className="reception-stat-percent">{tauxReception}%</span>
                    </div>

                    <div className="reception-stat-item reception-danger">
                      <div className="reception-stat-header">
                        <span className="reception-stat-label">SMS non-reçus</span>
                        <span className="reception-stat-count">{stats?.total_failed || 0}</span>
                      </div>
                      <div className="reception-stat-bar">
                        <div 
                          className="reception-stat-progress reception-danger-bar"
                          style={{ width: `${100 - parseFloat(tauxReception)}%` }}
                        ></div>
                      </div>
                      <span className="reception-stat-percent">{(100 - parseFloat(tauxReception)).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* STATISTIQUES */}
                <div className="details-section">
                  <h3 className="details-section-title">
                    <i className="fa-solid fa-chart-bar"></i>
                    Statistiques
                  </h3>
                  
                  <div className="statistics-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Action</th>
                          <th>Nombre</th>
                          <th>%</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Désabonnements (STOP)</td>
                          <td>{stats?.total_stop || 0}</td>
                          <td>{tauxDesabonnements}%</td>
                        </tr>
                        <tr className="row-clickable" onClick={() => setActiveTab('cliqueurs')}>
                          <td>
                            Cliqueurs web
                            <i className="fa-solid fa-chevron-right"></i>
                          </td>
                          <td>{stats?.total_clicked || 0}</td>
                          <td>{tauxClics}%</td>
                        </tr>
                        <tr className="row-clickable" onClick={() => setActiveTab('non-recus')}>
                          <td>
                            SMS non-reçus
                            <i className="fa-solid fa-chevron-right"></i>
                          </td>
                          <td>{stats?.total_failed || 0}</td>
                          <td>{(100 - parseFloat(tauxReception)).toFixed(2)}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* CLIQUEURS TAB */}
            {activeTab === 'cliqueurs' && (
              <div className="cliqueurs-tab">
                <div className="details-section">
                  <div className="section-header-with-search">
                    <h3 className="details-section-title">
                      <i className="fa-solid fa-mouse-pointer"></i>
                      Liste des cliqueurs ({filteredCliqueurs.length})
                    </h3>
                    <div className="search-box">
                      <i className="fa-solid fa-search"></i>
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchCliqueurs}
                        onChange={(e) => setSearchCliqueurs(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="cliqueurs-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Numéro</th>
                          <th>Nom</th>
                          <th>Email</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCliqueurs.length > 0 ? (
                          filteredCliqueurs.map((cliqueur) => (
                            <tr key={cliqueur.id}>
                              <td>{cliqueur.numero}</td>
                              <td>{cliqueur.nom || '-'}</td>
                              <td>{cliqueur.email || '-'}</td>
                              <td>{cliqueur.date_clic} {cliqueur.heure_clic}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="empty-row">
                              Aucun cliqueur trouvé
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-footer">
                    <span>{filteredCliqueurs.length} contact(s)</span>
                  </div>
                </div>
              </div>
            )}

            {/* SMS NON-REÇUS TAB */}
            {activeTab === 'non-recus' && (
              <div className="non-recus-tab">
                <div className="details-section">
                  <div className="section-header-with-search">
                    <h3 className="details-section-title">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      Liste des SMS non-reçus ({filteredNonRecus.length})
                    </h3>
                    <div className="search-box">
                      <i className="fa-solid fa-search"></i>
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchNonRecus}
                        onChange={(e) => setSearchNonRecus(e.target.value)}
                      />
                    </div>
                  </div>

                  {smsNonRecus.filter(s => !s.is_blacklisted).length > 0 && (
                    <div className="non-recus-actions">
                      <button className="btn-blacklist-all" onClick={handleBlacklistAll}>
                        <i className="fa-solid fa-ban"></i>
                        Bloquer tous les numéros en échec
                      </button>
                      <p className="blacklist-notice">
                        <i className="fa-solid fa-info-circle"></i>
                        Cette action bloquera définitivement tous les numéros qui n'ont pas reçu le SMS
                      </p>
                    </div>
                  )}

                  <div className="cliqueurs-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Numéro</th>
                          <th>Nom</th>
                          <th>Email</th>
                          <th>Date d'échec</th>
                          <th>Raison</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNonRecus.length > 0 ? (
                          filteredNonRecus.map((sms) => (
                            <tr key={sms.id}>
                              <td>{sms.numero}</td>
                              <td>{sms.nom || '-'}</td>
                              <td>{sms.email || '-'}</td>
                              <td>{sms.date_echec}</td>
                              <td>
                                <span className="raison-badge">
                                  {sms.raison}
                                </span>
                              </td>
                              <td>
                                {sms.is_blacklisted ? (
                                  <button
                                    className="btn-unblock-individual"
                                    onClick={() => handleToggleBlacklist(sms.id, true)}
                                    title="Débloquer ce numéro"
                                  >
                                    <i className="fa-solid fa-unlock"></i>
                                    Débloquer
                                  </button>
                                ) : (
                                  <button
                                    className="btn-block-individual"
                                    onClick={() => handleToggleBlacklist(sms.id, false)}
                                    title="Bloquer ce numéro"
                                  >
                                    <i className="fa-solid fa-ban"></i>
                                    Bloquer
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="empty-row">
                              Aucun SMS non-reçu trouvé
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-footer">
                    <span>{filteredNonRecus.length} contact(s)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampagneDetails;