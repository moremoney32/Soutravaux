
import React, { useState, useEffect } from 'react';
import '../styles/scraping.css';
import type { 
  ActiviteOption, 
  DepartementOption, 
  EntrepriseScraped, 
  RegionOption, 
  ScrapingFilters, 
  VilleOption 
} from '../types/scraping.type';
import { 
  mockActivites, 
  mockEntreprises, 
  mockVilles, 
  mockDepartements, 
  mockRegions 
} from '../data/scrapingData';

export const nombreResultatsOptions = [
  { value: 5, label: '5 résultats' },
  { value: 10, label: '10 résultats' },
  { value: 20, label: '20 résultats' },
  { value: 30, label: '30 résultats' },
  { value: 50, label: '50 résultats' },
  { value: 100, label: '100 résultats' }
];

const ScrapingPage: React.FC = () => {
  // ============================================
  // ÉTATS
  // ============================================
  const [filters, setFilters] = useState<ScrapingFilters>({
    region: '',
    departement: '',
    ville: '',
    activite: '',
    nombre_resultats:12
  });

  const [regions] = useState<RegionOption[]>(mockRegions);
  const [departements] = useState<DepartementOption[]>(mockDepartements);
  const [villes] = useState<VilleOption[]>(mockVilles);
  const [activites] = useState<ActiviteOption[]>(mockActivites);
  
  const [entreprises, setEntreprises] = useState<EntrepriseScraped[]>([]);
  const [filteredDepartements, setFilteredDepartements] = useState<DepartementOption[]>(mockDepartements);
  const [filteredVilles, setFilteredVilles] = useState<VilleOption[]>(mockVilles);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ============================================
  // CHARGER LES ENTREPRISES AU MONTAGE
  // ============================================
  useEffect(() => {
    setEntreprises(mockEntreprises);
    setHasSearched(true);
  }, []);

  // ============================================
  // FILTRER DÉPARTEMENTS SELON RÉGION
  // ============================================
  useEffect(() => {
    if (filters.region) {
      const filtered = departements.filter(d => d.region === filters.region);
      setFilteredDepartements(filtered);
      
      // Réinitialiser département si plus dans la liste
      if (filters.departement && !filtered.find(d => d.code === filters.departement)) {
        setFilters(prev => ({ ...prev, departement: '', ville: '' }));
      }
    } else {
      setFilteredDepartements(departements);
    }
  }, [filters.region, departements, filters.departement]);

  // ============================================
  // FILTRER VILLES SELON DÉPARTEMENT
  // ============================================
  useEffect(() => {
    if (filters.departement) {
      const filtered = villes.filter(v => v.departement === filters.departement);
      setFilteredVilles(filtered);
      
      // Réinitialiser ville si plus dans la liste
      if (filters.ville && !filtered.find(v => v.code === filters.ville)) {
        setFilters(prev => ({ ...prev, ville: '' }));
      }
    } else if (filters.region) {
      // Si région sélectionnée mais pas département, montrer toutes les villes de la région
      const filtered = villes.filter(v => v.region === filters.region);
      setFilteredVilles(filtered);
    } else {
      setFilteredVilles(villes);
    }
  }, [filters.departement, filters.region, villes, filters.ville]);

  // ============================================
  // GÉRER LES CHANGEMENTS DE FILTRES
  // ============================================
  const handleFilterChange = (field: keyof ScrapingFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // ============================================
  // RECHERCHER (AVEC SIMULATION)
  // ============================================
  const handleSearch = () => {
    setIsLoading(true);
    setSelectedIds(new Set());

    // Simulation d'une requête API
    setTimeout(() => {
      let filtered = [...mockEntreprises];

      // Filtrer par région
      if (filters.region) {
        const regionObj = regions.find(r => r.code === filters.region);
        if (regionObj) {
          // Filtrer les entreprises dont le département appartient à la région
          const deptsInRegion = departements
            .filter(d => d.region === filters.region)
            .map(d => d.nom);
          
          filtered = filtered.filter(e => deptsInRegion.includes(e.departement));
        }
      }

      // Filtrer par département
      if (filters.departement) {
        const dept = departements.find(d => d.code === filters.departement);
        if (dept) {
          filtered = filtered.filter(e => e.departement === dept.nom);
        }
      }

      // Filtrer par ville
      if (filters.ville) {
        const ville = villes.find(v => v.code === filters.ville);
        if (ville) {
          filtered = filtered.filter(e => e.ville === ville.nom);
        }
      }

      // Filtrer par activité
      if (filters.activite) {
        const activite = activites.find(a => a.id === filters.activite);
        if (activite) {
          filtered = filtered.filter(e =>
            e.activite.toLowerCase().includes(activite.nom.toLowerCase())
          );
        }
      }

      // Limiter au nombre de résultats demandé
      filtered = filtered.slice(0, filters.nombre_resultats);

      setEntreprises(filtered);
      setHasSearched(true);
      setIsLoading(false);
    }, 1500);
  };

  // ============================================
  // RÉINITIALISER LES FILTRES
  // ============================================
  const handleReset = () => {
    setFilters({ 
      region: '',
      departement: '', 
      ville: '', 
      activite: '', 
      nombre_resultats: 20 
    });
    setEntreprises(mockEntreprises);
    setSelectedIds(new Set());
    setHasSearched(true);
  };

  // ============================================
  // SÉLECTIONNER/DÉSÉLECTIONNER UNE ENTREPRISE
  // ============================================
  const handleSelectEntreprise = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // ============================================
  // SÉLECTIONNER/DÉSÉLECTIONNER TOUT
  // ============================================
  const handleSelectAll = () => {
    if (selectedIds.size === entreprises.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entreprises.map(e => e.id)));
    }
  };

  // ============================================
  // ENVOYER CAMPAGNE SMS
  // ============================================
  const handleSendCampaign = () => {
    const selectedEntreprises = entreprises.filter(e => selectedIds.has(e.id));

    alert(`Campagne SMS envoyée à ${selectedEntreprises.length} entreprises !
    
Numéros : ${selectedEntreprises.map(e => e.telephone).join(', ')}`);

    // TODO: Rediriger vers la page de création de campagne
    // navigate('/campagne/:membreId', { state: { contacts: selectedEntreprises } });
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="scraping-page">
      <div className="scraping-container">
        
        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}
        <header className="scraping-header">
          <h2 className="scraping-title">
            Générateur de prospects depuis Google Maps
          </h2>

          <p className="scraping-subtitle">
            Transformez Google Maps en machine à clients.
          </p>

          <p className="scraping-description">
            Trouvez des entreprises BTP en France et lancez vos campagnes SMS automatisées.
          </p>
        </header>

        {/* ===================================== */}
        {/* SECTION FILTRES */}
        {/* ===================================== */}
        <section className="scraping-filters-section">
          <h3 className="scraping-filters-title">
            <i className="fas fa-filter"></i>
            Filtres de recherche
          </h3>

          <div className="scraping-filters-grid">
            
            {/* ========== RÉGION ========== */}
            <div className="scraping-filter-group">
              <label className="scraping-filter-label" htmlFor="scraping-region">
                <i className="fas fa-globe-europe"></i> Région
              </label>
              <select
                id="scraping-region"
                className="scraping-filter-select"
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value="">-- Toutes les régions --</option>
                {regions.map(region => (
                  <option key={region.code} value={region.code}>
                    {region.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* ========== DÉPARTEMENT ========== */}
            <div className="scraping-filter-group">
              <label className="scraping-filter-label" htmlFor="scraping-departement">
                <i className="fas fa-map-marked-alt"></i> Département
              </label>
              <select
                id="scraping-departement"
                className="scraping-filter-select"
                value={filters.departement}
                onChange={(e) => handleFilterChange('departement', e.target.value)}
                disabled={!filters.region}
              >
                <option value="">-- Tous les départements --</option>
                {filteredDepartements.map(dept => (
                  <option key={dept.code} value={dept.code}>
                    {dept.code} - {dept.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* ========== VILLE ========== */}
            <div className="scraping-filter-group">
              <label className="scraping-filter-label" htmlFor="scraping-ville">
                <i className="fas fa-city"></i> Ville
              </label>
              <select
                id="scraping-ville"
                className="scraping-filter-select"
                value={filters.ville}
                onChange={(e) => handleFilterChange('ville', e.target.value)}
                disabled={!filters.departement}
              >
                <option value="">-- Toutes les villes --</option>
                {filteredVilles.map(ville => (
                  <option key={ville.code} value={ville.code}>
                    {ville.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* ========== ACTIVITÉ ========== */}
            <div className="scraping-filter-group">
              <label className="scraping-filter-label" htmlFor="scraping-activite">
                <i className="fas fa-briefcase"></i> Activité
              </label>
              <select
                id="scraping-activite"
                className="scraping-filter-select"
                value={filters.activite}
                onChange={(e) => handleFilterChange('activite', e.target.value)}
              >
                <option value="">-- Toutes les activités --</option>
                {activites.map(act => (
                  <option key={act.id} value={act.id}>
                    {act.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* ========== NOMBRE DE RÉSULTATS ========== */}
            <div className="scraping-filter-group">
              <label className="scraping-filter-label" htmlFor="scraping-nombre">
                <i className="fas fa-hashtag"></i> Nombre de résultats
              </label>
              <input
                type="number"
                id="scraping-nombre"
                className="scraping-filter-select"
                value={filters.nombre_resultats}
                onChange={(e) => handleFilterChange('nombre_resultats', Number(e.target.value))}
                min="5"
                max="100"
                step="5"
                placeholder="Ex: 20"
                style={{ padding: '10px 12px' }}
              />
              <small style={{ 
                fontSize: '11px', 
                color: 'var(--color-gray-secondary)',
                marginTop: '4px',
                display: 'block'
              }}>
                Entre 5 et 100 résultats
              </small>
            </div>
          </div>

          {/* ========== BOUTONS D'ACTION ========== */}
          <div className="scraping-buttons-group">
            <button
              className="scraping-btn-search"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Recherche en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i>
                  Rechercher
                </>
              )}
            </button>

            <button className="scraping-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Réinitialiser
            </button>
          </div>
        </section>

        {/* ===================================== */}
        {/* SECTION RÉSULTATS */}
        {/* ===================================== */}
        <section className="scraping-results-section">
          <div className="scraping-results-header">
            <h3 className="scraping-results-title">
              <i className="fas fa-list"></i>
              Résultats
              <span className="scraping-results-count">{entreprises.length}</span>
            </h3>

            <div className="scraping-actions-group">
              <button
                className="scraping-btn-select-all"
                onClick={handleSelectAll}
                disabled={entreprises.length === 0}
              >
                <i className={selectedIds.size === entreprises.length ?
                  'fas fa-check-square' : 'far fa-square'}></i>
                {selectedIds.size === entreprises.length ?
                  'Tout désélectionner' : 'Tout sélectionner'}
              </button>

              <button
                className="scraping-btn-send-campaign"
                onClick={handleSendCampaign}
                disabled={selectedIds.size === 0}
              >
                <i className="fas fa-paper-plane"></i>
                Envoyer campagne SMS
                {selectedIds.size > 0 && (
                  <span className="scraping-selected-count">
                    ({selectedIds.size})
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ========== LOADING ========== */}
          {isLoading && (
            <div className="scraping-loading">
              <div className="scraping-loading-spinner"></div>
              <p>Recherche en cours...</p>
            </div>
          )}

          {/* ========== PAS DE RÉSULTATS ========== */}
          {!isLoading && hasSearched && entreprises.length === 0 && (
            <div className="scraping-no-results">
              <i className="fas fa-search"></i>
              <p>Aucune entreprise trouvée avec ces critères.</p>
              <p>Essayez de modifier vos filtres.</p>
            </div>
          )}

          {/* ========== TABLE DES RÉSULTATS ========== */}
          {!isLoading && entreprises.length > 0 && (
            <div className="scraping-table-container">
              <table className="scraping-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>
                      <input
                        type="checkbox"
                        className="scraping-checkbox"
                        checked={selectedIds.size === entreprises.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Entreprise</th>
                    <th>Contact</th>
                    <th>Activité</th>
                    <th>SIRET</th>
                    <th>Localisation</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {entreprises.map(entreprise => (
                    <tr
                      key={entreprise.id}
                      className={selectedIds.has(entreprise.id) ? 'scraping-row-selected' : ''}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="scraping-checkbox"
                          checked={selectedIds.has(entreprise.id)}
                          onChange={() => handleSelectEntreprise(entreprise.id)}
                        />
                      </td>
                      <td>
                        <div className="scraping-entreprise-name">
                          {entreprise.nom_societe}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-gray-secondary)' }}>
                          {entreprise.prenom} {entreprise.nom}
                        </div>
                      </td>
                      <td>
                        <div className="scraping-contact-info">
                          <div className="scraping-phone">
                            <i className="fas fa-phone"></i>
                            {entreprise.telephone}
                          </div>
                          <div className="scraping-email">
                            <i className="fas fa-envelope"></i>
                            {entreprise.email}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="scraping-badge scraping-badge-activite">
                          {entreprise.activite}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--color-gray-secondary)' }}>
                        {entreprise.siret}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        <div>{entreprise.ville}</div>
                        <div style={{ color: 'var(--color-gray-secondary)' }}>
                          {entreprise.departement} ({entreprise.code_postal})
                        </div>
                      </td>
                      <td>
                        {entreprise.note !== null && entreprise.note !== undefined ? (
                          <div className="scraping-rating">
                            <span className="scraping-rating-stars">
                              {'★'.repeat(Math.round(entreprise.note))}
                            </span>
                            <span>{entreprise.note}</span>
                            <span className="scraping-rating-count">
                              ({entreprise.nombre_avis})
                            </span>
                          </div>
                        ) : (
                          <span className="scraping-no-rating" style={{
                            fontSize: '11px',
                            color: 'var(--color-gray-secondary)'
                          }}>
                            Pas d'avis
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ScrapingPage;