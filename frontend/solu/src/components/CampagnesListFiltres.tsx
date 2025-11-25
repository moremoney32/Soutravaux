

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/filtres-campagne.css';
import type { CampagneAPI, CampagneFiltersAPI } from '../types/campagne.types';
import { calculateCampagneStats, getAllCampagnes, getCampagneGlobalStatus } from '../services/filtresCampagnesData';
import { useMembreId } from '../hooks/useMembreId';

interface CampagnesListFiltresProps {
  onCreateCampagne: () => void;
}

interface CampagneFilters {
  telephone: string;
  smsMin: string;
  smsMax: string;
  message: string;
  dateDebut: string;
  dateFin: string;
  supprimees: boolean;
}

const CampagnesListFiltres = ({ onCreateCampagne }: CampagnesListFiltresProps) => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<CampagneFilters>({
    telephone: '',
    smsMin: '',
    smsMax: '',
    message: '',
    dateDebut: '',
    dateFin: '',
    supprimees: false,
  });

  const [campagnes, setCampagnes] = useState<CampagneAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCampagnes, setTotalCampagnes] = useState(0);
  const [perPage, setPerPage] = useState(6);

  let userId = useMembreId();
  let numericUserId = Number(userId);

  const loadCampagnes = async (page: number = 1, appliedFilters?: CampagneFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiFilters: CampagneFiltersAPI = {};
      const filtersToUse = appliedFilters || filters;

      if (filtersToUse.telephone) apiFilters.telephone = filtersToUse.telephone;
      if (filtersToUse.smsMin) apiFilters.smsMin = filtersToUse.smsMin;
      if (filtersToUse.smsMax) apiFilters.smsMax = filtersToUse.smsMax;
      if (filtersToUse.message) apiFilters.message = filtersToUse.message;
      if (filtersToUse.dateDebut) apiFilters.dateDebut = filtersToUse.dateDebut;
      if (filtersToUse.dateFin) apiFilters.dateFin = filtersToUse.dateFin;
      if (filtersToUse.supprimees) apiFilters.supprimees = filtersToUse.supprimees;

      const response = await getAllCampagnes(numericUserId, page, apiFilters);

      if (response.success) {
        setCampagnes(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
        setTotalCampagnes(response.data.total);
        setPerPage(response.data.per_page);
      }
    } catch (err) {
      console.error('Erreur chargement campagnes:', err);
      setError('Impossible de charger les campagnes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampagnes(1);
  }, []);
  const handleDeleteCampagne = async (campagneId: string, campagneName: string) => {
    // Confirmation avant suppression
    const confirmation = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la campagne "${campagneName}" ?\n\nCette action est irréversible.`
    );

    if (!confirmation) return;

    try {
      const response = await fetch(
        `https://backendstaging.solutravo-compta.fr/api/campaigns/${campagneId}`,
        {
          method: 'DELETE',
          headers: {
            'accept': 'application/json',
            'X-CSRF-TOKEN': '',
          },
        }
      );

      if (response.ok) {
        alert('Campagne supprimée avec succès !');

        // Gestion intelligente de la pagination
        if (campagnes.length === 1 && currentPage > 1) {
          loadCampagnes(currentPage - 1, filters);
        } else {
          loadCampagnes(currentPage, filters);
        }
      } else {
        const errorData = await response.json();
        alert(`Erreur : ${errorData.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      alert('Une erreur est survenue lors de la suppression');
    }
  };

  const handleFilterChange = (field: keyof CampagneFilters, value: string | boolean) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleFilter = () => {
    setCurrentPage(1);
    loadCampagnes(1, filters);
  };

  const handleResetFilters = () => {
    const emptyFilters: CampagneFilters = {
      telephone: '',
      smsMin: '',
      smsMax: '',
      message: '',
      dateDebut: '',
      dateFin: '',
      supprimees: false,
    };
    setFilters(emptyFilters);
    setCurrentPage(1);
    loadCampagnes(1, emptyFilters);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadCampagnes(page, filters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getStatusBadge = (status: 'completed' | 'pending' | 'failed') => {
    switch (status) {
      case 'completed':
        return <span className="badge-status badge-success">Envoyé</span>;
      case 'pending':
        return <span className="badge-status badge-warning">En cours</span>;
      case 'failed':
        return <span className="badge-status badge-danger">Échec</span>;
      default:
        return <span className="badge-status badge-secondary">Inconnu</span>;
    }
  };

  const getTauxColor = (taux: number) => {
    if (taux >= 90) return '#28a745';
    if (taux >= 70) return '#ffc107';
    return '#dc3545';
  };

  const handleViewDetails = (campagneId: string) => {
    navigate(`/statistique/campaigns/${campagneId}`);
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

  if (isLoading && campagnes.length === 0) {
    return (
      <div className="wrapper-filtres">
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Chargement des campagnes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrapper-filtres">
        <div className="error-state">
          <i className="fa-solid fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => loadCampagnes(1)}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper-filtres">
      {/* HEADER */}
      <div className="header-filtres">
        <h5 className="title-filtres">Mes Campagnes SMS</h5>
        <button className="btn-create-filtres" onClick={onCreateCampagne}>
          <i className="fa-solid fa-plus"></i>
          Créer une campagne
        </button>
      </div>

      {/* SECTION FILTRES */}
      <div className="section-filtres">
        <h3 className="subtitle-filtres">
          <i className="fa-solid fa-filter"></i>
          Filtres de recherche
        </h3>

        <div className="grid-filtres">
          <div className="group-filtres">
            <label className="label-filtres">Numéro de téléphone</label>
            <input
              type="text"
              className="input-filtres"
              placeholder="Ex: 0612345678"
              value={filters.telephone}
              onChange={(e) => handleFilterChange('telephone', e.target.value)}
            />
          </div>

          <div className="group-filtres">
            <label className="label-filtres">SMS min/campagne</label>
            <input
              type="number"
              className="input-filtres"
              placeholder="Minimum"
              value={filters.smsMin}
              onChange={(e) => handleFilterChange('smsMin', e.target.value)}
            />
          </div>

          <div className="group-filtres">
            <label className="label-filtres">SMS max/campagne</label>
            <input
              type="number"
              className="input-filtres"
              placeholder="Maximum"
              value={filters.smsMax}
              onChange={(e) => handleFilterChange('smsMax', e.target.value)}
            />
          </div>

          <div className="group-filtres">
            <label className="label-filtres">Message</label>
            <input
              type="text"
              className="input-filtres"
              placeholder="Rechercher dans les messages"
              value={filters.message}
              onChange={(e) => handleFilterChange('message', e.target.value)}
            />
          </div>

          <div className="group-filtres group-toggle-filtres">
            <label className="label-filtres">Campagnes supprimées</label>
            <div className="toggle-container-filtres">
              <span className={!filters.supprimees ? 'text-active-filtres' : 'text-inactive-filtres'}>
                Non
              </span>
              <label className="switch-filtres">
                <input
                  type="checkbox"
                  checked={filters.supprimees}
                  onChange={(e) => handleFilterChange('supprimees', e.target.checked)}
                />
                <span className="slider-filtres"></span>
              </label>
              <span className={filters.supprimees ? 'text-active-filtres' : 'text-inactive-filtres'}>
                Oui
              </span>
            </div>
          </div>
        </div>

        <div className="buttons-filtres">
          <button className="btn-primary check_button" onClick={handleFilter}>
            <i className="fa-solid fa-search"></i>
            Filtrer
          </button>
          <button className="btn-tertiary" onClick={handleResetFilters}>
            <i className="fa-solid fa-eraser"></i>
            Effacer les filtres
          </button>
        </div>
      </div>

      {/*TABLEAU DES CAMPAGNES (NOUVEAU FORMAT) */}
      <div className="section-table-filtres">
        <div className="table-header-filtres">
          <h5 className='h3'>Liste des campagnes ({totalCampagnes})</h5>
        </div>

        {campagnes.length > 0 ? (
          <>
            <div className="table-wrapper-campagnes">
              <table className="table-campagnes">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nom de la campagne</th>
                    <th>Expéditeur</th>
                    <th>Message</th>
                    <th>Date d'envoi</th>
                    <th>SMS envoyés</th>
                    <th>SMS reçus</th>
                    <th>Clics</th>
                    <th>Taux</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campagnes.map((campagne, index) => {
                    const stats = calculateCampagneStats(campagne.recipients);
                    const globalStatus = getCampagneGlobalStatus(campagne.recipients);
                    const rowNumber = ((currentPage - 1) * perPage) + index + 1;

                    return (
                      <tr key={campagne.id}  onClick={() => handleViewDetails(campagne.id)} className='tr-campagne-clickable-pointer'>
                        <td className="td-number">{rowNumber}</td>
                        <td className="td-name">
                          <div className="campagne-name-cell">
                            {campagne.name}
                          </div>
                        </td>
                        <td>{campagne.sender}</td>
                        <td className="td-message">
                          <span className="message-preview" title={campagne.message}>
                            {campagne.message.substring(0, 40)}...
                          </span>
                        </td>
                        <td className="td-date">
                          {formatDate(campagne.scheduled_at)}
                        </td>
                        <td className="td-stat td-center">
                          <span className="stat-badge stat-primary">
                            {stats.total}
                          </span>
                        </td>
                        <td className="td-stat td-center">
                          <span className="stat-badge stat-success">
                            {stats.delivered}
                          </span>
                        </td>
                        <td className="td-stat td-center">
                          <span className="stat-badge stat-info">
                            {stats.clicked}
                          </span>
                        </td>
                        <td className="td-taux td-center">
                          <span
                            className="taux-badge"
                            style={{
                              background: stats.tauxReussite >= 90 ? '#E8F5E9' : stats.tauxReussite >= 70 ? '#FFF3E0' : '#FFEBEE',
                              color: getTauxColor(stats.tauxReussite)
                            }}
                          >
                            {stats.tauxReussite}%
                          </span>
                        </td>
                        <td className="td-center">
                          {getStatusBadge(globalStatus)}
                        </td>
                        <td className="td-actions">
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-view"
                              // onClick={() => handleViewDetails(campagne.id)}
                              title="Voir les statistiques"
                            >
                              <i className="fa-solid fa-chart-pie"></i>
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteCampagne(campagne.id, campagne.name)}
                              title="Supprimer"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination-filtres">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                  Précédent
                </button>

                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}

            <div className="pagination-info">
              <p>
                Affichage de {((currentPage - 1) * perPage) + 1} à {Math.min(currentPage * perPage, totalCampagnes)} sur {totalCampagnes} campagnes
              </p>
            </div>
          </>
        ) : (
          <div className="empty-state-filtres">
            <i className="fa-solid fa-inbox"></i>
            <h3>Aucune campagne trouvée</h3>
            <p>
              {Object.values(filters).some(v => v !== '' && v !== false)
                ? 'Aucune campagne ne correspond à vos critères de recherche'
                : 'Commencez par créer votre première campagne SMS'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampagnesListFiltres;