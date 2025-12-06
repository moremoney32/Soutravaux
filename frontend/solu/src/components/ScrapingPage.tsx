
// import React, { useState, useEffect } from 'react';
// import '../styles/scraping.css';
// import type {
//     ActiviteOption,
//     DepartementOption,
//     EntrepriseScraped,
//     RegionOption,
//     ScrapingFilters,
//     VilleOption
// } from '../types/scraping.type';
// import {
//     mockActivites,
//     mockVilles,
//     mockDepartements,
//     mockRegions
// } from '../data/scrapingData';
// import { scrapeGoogleMaps } from '../services/scrapingServices';


// export const nombreResultatsOptions = [
//     { value: 5, label: '5 résultats' },
//     { value: 10, label: '10 résultats' },
//     { value: 20, label: '20 résultats' },
//     { value: 30, label: '30 résultats' },
//     { value: 50, label: '50 résultats' },
//     { value: 100, label: '100 résultats' }
// ];

// const ScrapingPage: React.FC = () => {
//  
//     // ÉTATS
//  
//     const [filters, setFilters] = useState<ScrapingFilters>({
//         region: '',
//         departement: '',
//         ville: '',
//         activite: '',
//         nombre_resultats: 0
//     });

//     const [regions] = useState<RegionOption[]>(mockRegions);
//     const [departements] = useState<DepartementOption[]>(mockDepartements);
//     const [villes] = useState<VilleOption[]>(mockVilles);
//     const [activites] = useState<ActiviteOption[]>(mockActivites);

//     const [entreprises, setEntreprises] = useState<EntrepriseScraped[]>([]);
//     const [filteredDepartements, setFilteredDepartements] = useState<DepartementOption[]>(mockDepartements);
//     const [filteredVilles, setFilteredVilles] = useState<VilleOption[]>(mockVilles);
//     const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
//     const [isLoading, setIsLoading] = useState(false);
//     const [hasSearched, setHasSearched] = useState(false);
//     const [errorMessage, setErrorMessage] = useState<string>('');
//     const [scrapingProgress, setScrapingProgress] = useState<string>('');

//     // Stats du scraping
//     const [stats, setStats] = useState<{
//         total_vise: number;
//         total_trouve: number;
//         avec_telephone: number;
//         avec_email: number;
//         avec_siret: number;
//         avec_gerant: number;
//         duree_secondes: number;
//     } | null>(null);

//  
//     // FILTRER DÉPARTEMENTS SELON RÉGION
//  
//     useEffect(() => {
//         if (filters.region) {
//             const filtered = departements.filter(d => d.region === filters.region);
//             setFilteredDepartements(filtered);

//             if (filters.departement && !filtered.find(d => d.code === filters.departement)) {
//                 setFilters(prev => ({ ...prev, departement: '', ville: '' }));
//             }
//         } else {
//             setFilteredDepartements(departements);
//         }
//     }, [filters.region, departements, filters.departement]);

//  
//     // FILTRER VILLES SELON DÉPARTEMENT
//  
//     useEffect(() => {
//         if (filters.departement) {
//             const filtered = villes.filter(v => v.departement === filters.departement);
//             setFilteredVilles(filtered);

//             if (filters.ville && !filtered.find(v => v.code === filters.ville)) {
//                 setFilters(prev => ({ ...prev, ville: '' }));
//             }
//         } else if (filters.region) {
//             const filtered = villes.filter(v => v.region === filters.region);
//             setFilteredVilles(filtered);
//         } else {
//             setFilteredVilles(villes);
//         }
//     }, [filters.departement, filters.region, villes, filters.ville]);

//     const handleFilterChange = (field: keyof ScrapingFilters, value: string | number) => {
//     // Si c'est le nombre de résultats, convertir en nombre
//     const finalValue = field === 'nombre_resultats' ? Number(value) : value;

//     console.log(`🔧 Filtre changé: ${field} = ${finalValue}`); // DEBUG

//     setFilters(prev => ({ 
//         ...prev, 
//         [field]: finalValue 
//     }));
//     setErrorMessage('');
// };

//  
//     // RECHERCHER (APPEL API RÉEL)
//  
//     const handleSearch = async () => {
//         // Validation
//         if (!filters.ville) {
//             setErrorMessage('Veuillez sélectionner une ville');
//             return;
//         }

//         setIsLoading(true);
//         setSelectedIds(new Set());
//         setErrorMessage('');
//         setScrapingProgress('🕷️ Scraping Google Maps en cours...');

//         try {
//             // Appel API
//             const { entreprises: results, stats: scrapingStats } = await scrapeGoogleMaps(filters);

//             setEntreprises(results);
//             setStats(scrapingStats);
//             setHasSearched(true);
//             setScrapingProgress('');

//             console.log(' Scraping terminé:', {
//                 total: results.length,
//                 stats: scrapingStats
//             });

//         } catch (error: any) {
//             console.error(' Erreur scraping:', error);
//             setErrorMessage(error.message || 'Une erreur est survenue lors du scraping');
//             setScrapingProgress('');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//  
//     // RÉINITIALISER LES FILTRES
//  
//     const handleReset = () => {
//         setFilters({
//             region: '',
//             departement: '',
//             ville: '',
//             activite: '',
//             nombre_resultats: 0
//         });
//         setEntreprises([]);
//         setSelectedIds(new Set());
//         setHasSearched(false);
//         setErrorMessage('');
//         setStats(null);
//     };

//  
//     // SÉLECTIONNER/DÉSÉLECTIONNER UNE ENTREPRISE
//  
//     const handleSelectEntreprise = (id: string) => {
//         setSelectedIds(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(id)) {
//                 newSet.delete(id);
//             } else {
//                 newSet.add(id);
//             }
//             return newSet;
//         });
//     };

//  
//     // SÉLECTIONNER/DÉSÉLECTIONNER TOUT
//  
//     const handleSelectAll = () => {
//         if (selectedIds.size === entreprises.length) {
//             setSelectedIds(new Set());
//         } else {
//             setSelectedIds(new Set(entreprises.map(e => e.id)));
//         }
//     };


//     // Dans ScrapingPage.tsx - Solution simple mais limitée
// const handleExportFrontend = () => {
//     const dataToExport = selectedIds.size > 0 
//         ? entreprises.filter(e => selectedIds.has(e.id))
//         : entreprises;

//     if (dataToExport.length === 0) {
//         alert('Aucune donnée à exporter');
//         return;
//     }

//     // Conversion en CSV
//     const headers = ['Nom Société', 'Téléphone', 'Email', 'Ville', 'SIRET', 'Note'];
//     const csvContent = [
//         headers.join(','),
//         ...dataToExport.map(e => [
//             `"${e.nom_societe}"`,
//             `"${e.telephone}"`,
//             `"${e.email}"`,
//             `"${e.ville}"`,
//             `"${e.siret}"`,
//             e.note || ''
//         ].join(','))
//     ].join('\n');

//     // Téléchargement
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `entreprises_${new Date().toISOString().split('T')[0]}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// };

//  
//     // ENVOYER CAMPAGNE SMS
//  
//     const handleSendCampaign = () => {
//         const selectedEntreprises = entreprises.filter(e => selectedIds.has(e.id));

//         alert(`Campagne SMS envoyée à ${selectedEntreprises.length} entreprises !

// Numéros : ${selectedEntreprises.map(e => e.telephone).join(', ')}`);

//         // TODO: Rediriger vers la page de création de campagne
//         // navigate('/campagne/:membreId', { state: { contacts: selectedEntreprises } });
//     };

// 
//     // RENDER
//     // ============================================
//     return (
//         <div className="scraping-page">
//             <div className="scraping-container">

//          
//                 {/* HEADER */}
//          
//                 <header className="scraping-header">
//                     <h2 className="scraping-title">
//                         Générateur de prospects depuis Google Maps
//                     </h2>

//                     <p className="scraping-subtitle">
//                         Transformez Google Maps en machine à clients.
//                     </p>

//                     <p className="scraping-description">
//                         Trouvez des entreprises BTP en France et lancez vos campagnes SMS automatisées.
//                     </p>
//                 </header>

//          
//                 {/* STATS DU SCRAPING */}
//          
//                 {stats && (
//                     <div className="scraping-stats-banner">
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-search"></i>
//                             <span>Recherchées: {stats.total_vise}</span>
//                         </div>
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-check-circle"></i>
//                             <span>Trouvées: {stats.total_trouve}</span>
//                         </div>
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-phone"></i>
//                             <span>Téléphones: {stats.avec_telephone}</span>
//                         </div>
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-envelope"></i>
//                             <span>Emails: {stats.avec_email}</span>
//                         </div>
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-id-card"></i>
//                             <span>SIRET: {stats.avec_siret}</span>
//                         </div>
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-clock"></i>
//                             <span>Durée: {stats.duree_secondes}s</span>
//                         </div>
//                     </div>
//                 )}

//          
//                 {/* MESSAGE D'ERREUR */}
//          
//                 {errorMessage && (
//                     <div className="scraping-error-message">
//                         <i className="fas fa-exclamation-triangle"></i>
//                         {errorMessage}
//                     </div>
//                 )}

//          
//                 {/* PROGRESSION DU SCRAPING */}
//          
//                 {scrapingProgress && (
//                     <div className="scraping-progress-message">
//                         <i className="fas fa-spinner fa-spin"></i>
//                         {scrapingProgress}
//                     </div>
//                 )}

//          
//                 {/* SECTION FILTRES */}
//          
//                 <section className="scraping-filters-section">
//                     <h3 className="scraping-filters-title">
//                         <i className="fas fa-filter"></i>
//                         Filtres de recherche
//                     </h3>

//                     <div className="scraping-filters-grid">
//                         {/* ========== ACTIVITÉ ========== */}
//                         <div className="scraping-filter-group">
//                             <label className="scraping-filter-label" htmlFor="scraping-activite">
//                                 <i className="fas fa-briefcase"></i> Activité
//                             </label>
//                             <select
//                                 id="scraping-activite"
//                                 className="scraping-filter-select"
//                                 value={filters.activite}
//                                 onChange={(e) => handleFilterChange('activite', e.target.value)}
//                             >
//                                 <option value="">-- Toutes les activités --</option>
//                                 {activites.map(act => (
//                                     <option key={act.id} value={act.id}>
//                                         {act.nom}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* ========== RÉGION ========== */}
//                         <div className="scraping-filter-group">
//                             <label className="scraping-filter-label" htmlFor="scraping-region">
//                                 <i className="fas fa-globe-europe"></i> Région
//                             </label>
//                             <select
//                                 id="scraping-region"
//                                 className="scraping-filter-select"
//                                 value={filters.region}
//                                 onChange={(e) => handleFilterChange('region', e.target.value)}
//                             >
//                                 <option value="">-- Toutes les régions --</option>
//                                 {regions.map(region => (
//                                     <option key={region.code} value={region.code}>
//                                         {region.nom}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* ========== DÉPARTEMENT ========== */}
//                         <div className="scraping-filter-group">
//                             <label className="scraping-filter-label" htmlFor="scraping-departement">
//                                 <i className="fas fa-map-marked-alt"></i> Département
//                             </label>
//                             <select
//                                 id="scraping-departement"
//                                 className="scraping-filter-select"
//                                 value={filters.departement}
//                                 onChange={(e) => handleFilterChange('departement', e.target.value)}
//                                 disabled={!filters.region}
//                             >
//                                 <option value="">-- Tous les départements --</option>
//                                 {filteredDepartements.map(dept => (
//                                     <option key={dept.code} value={dept.code}>
//                                         {dept.code} - {dept.nom}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* ========== VILLE ========== */}
//                         <div className="scraping-filter-group">
//                             <label className="scraping-filter-label" htmlFor="scraping-ville">
//                                 <i className="fas fa-city"></i> Ville *
//                             </label>
//                             <select
//                                 id="scraping-ville"
//                                 className="scraping-filter-select"
//                                 value={filters.ville}
//                                 onChange={(e) => handleFilterChange('ville', e.target.value)}
//                                 disabled={!filters.departement}
//                             >
//                                 <option value="">-- Toutes les villes --</option>
//                                 {filteredVilles.map(ville => (
//                                     <option key={ville.code} value={ville.code}>
//                                         {ville.nom}
//                                     </option>
//                                 ))}
//                             </select>
//                             <small style={{
//                                 fontSize: '11px',
//                                 color: 'var(--color-danger)',
//                                 marginTop: '4px',
//                                 display: 'block'
//                             }}>
//                                 * Champ obligatoire
//                             </small>
//                         </div>

//                         {/* ========== NOMBRE DE RÉSULTATS ========== */}
//                         <div className="scraping-filter-group">
//                             <label className="scraping-filter-label" htmlFor="scraping-nombre">
//                                 <i className="fas fa-hashtag"></i> Nombre de résultats
//                             </label>
//                             <input
//                                 type="number"
//                                 id="scraping-nombre"
//                                 className="scraping-filter-select"
//                                 value={filters.nombre_resultats}
//                                 onChange={(e) => handleFilterChange('nombre_resultats', Number(e.target.value))}
//                                 min="5"
//                                 max="100"
//                                 step="5"
//                                 placeholder="Ex: 20"
//                                 style={{ padding: '10px 12px' }}
//                             />
//                             <small style={{
//                                 fontSize: '11px',
//                                 color: 'var(--color-gray-secondary)',
//                                 marginTop: '4px',
//                                 display: 'block'
//                             }}>
//                                 Entre 5 et 100 résultats
//                             </small>
//                         </div>
//                     </div>

//                     {/* ========== BOUTONS D'ACTION ========== */}
//                     <div className="scraping-buttons-group">
//                         <button
//                             className="scraping-btn-search"
//                             onClick={handleSearch}
//                             disabled={isLoading || !filters.ville}
//                         >
//                             {isLoading ? (
//                                 <>
//                                     <i className="fas fa-spinner fa-spin"></i>
//                                     Scraping en cours...
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="fas fa-search"></i>
//                                     Rechercher
//                                 </>
//                             )}
//                         </button>

//                         <button className="scraping-btn-reset" onClick={handleReset}>
//                             <i className="fas fa-redo"></i>
//                             Réinitialiser
//                         </button>
//                     </div>
//                 </section>

//          
//                 {/* SECTION RÉSULTATS */}
//          
//                 <section className="scraping-results-section">
//                     <div className="scraping-results-header">
//                         <h3 className="scraping-results-title">
//                             <i className="fas fa-list"></i>
//                             Résultats
//                             <span className="scraping-results-count">{entreprises.length}</span>
//                         </h3>

//                         <div className="scraping-actions-group">
//                             <button
//     className="scraping-btn-export"
//     onClick={handleExportFrontend}
//     disabled={entreprises.length === 0}
// >
//     <i className="fas fa-file-export"></i>
//     Exporter
//      {selectedIds.size > 0 && (
//         <span className="scraping-selected-count">
//             ({selectedIds.size})
//         </span>
//     )} 
// </button>

// <button
//     className="scraping-btn-mailing"
//     // onClick={handleMailingSecure}
//      disabled={selectedIds.size === 0}
// >
//     <i className="fas fa-envelope"></i>
//     Envoyer mailing
//     <span className="scraping-selected-count">
//         ({selectedIds.size})
//     </span>
// </button>
//                             <button
//                                 className="scraping-btn-select-all"
//                                 onClick={handleSelectAll}
//                                 disabled={entreprises.length === 0}
//                             >
//                                 <i className={selectedIds.size === entreprises.length ?
//                                     'fas fa-check-square' : 'far fa-square'}></i>
//                                 {selectedIds.size === entreprises.length ?
//                                     'Tout désélectionner' : 'Tout sélectionner'}
//                             </button>

//                             <button
//                                 className="scraping-btn-send-campaign"
//                                 onClick={handleSendCampaign}
//                                 disabled={selectedIds.size === 0}
//                             >
//                                 <i className="fas fa-paper-plane"></i>
//                                 Envoyer campagne SMS
//                                 {selectedIds.size > 0 && (
//                                     <span className="scraping-selected-count">
//                                         ({selectedIds.size})
//                                     </span>
//                                 )}
//                             </button>
//                         </div>
//                     </div>

//                     {/* ========== LOADING ========== */}
//                     {isLoading && (
//                         <div className="scraping-loading">
//                             <div className="scraping-loading-spinner"></div>
//                             <p>🕷️ Scraping Google Maps...</p>
//                             <p style={{ fontSize: '12px', color: 'var(--color-gray-secondary)' }}>
//                                 Cela peut prendre maximun 5 minutes
//                             </p>
//                         </div>
//                     )}

//                     {/* ========== PAS DE RÉSULTATS ========== */}
//                     {!isLoading && hasSearched && entreprises.length === 0 && (
//                         <div className="scraping-no-results">
//                             <i className="fas fa-search"></i>
//                             <p>Aucune entreprise trouvée avec ces critères.</p>
//                             <p>Essayez de modifier vos filtres.</p>
//                         </div>
//                     )}

//                     {/* ========== TABLE DES RÉSULTATS ========== */}
//                     {!isLoading && entreprises.length > 0 && (
//                         <div className="scraping-table-container">
//                             <table className="scraping-table">
//                                 <thead>
//                                     <tr>
//                                         <th style={{ width: '50px' }}>
//                                             <input
//                                                 type="checkbox"
//                                                 className="scraping-checkbox"
//                                                 checked={selectedIds.size === entreprises.length}
//                                                 onChange={handleSelectAll}
//                                             />
//                                         </th>
//                                         <th>Entreprise</th>
//                                         <th>Contact</th>
//                                         <th>Description</th>
//                                         <th>SIRET</th>
//                                         <th>Localisation</th>
//                                         <th>Note</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {entreprises.map(entreprise => (
//                                         <tr
//                                             key={entreprise.id}
//                                             className={selectedIds.has(entreprise.id) ? 'scraping-row-selected' : ''}
//                                         >
//                                             <td>
//                                                 <input
//                                                     type="checkbox"
//                                                     className="scraping-checkbox"
//                                                     checked={selectedIds.has(entreprise.id)}
//                                                     onChange={() => handleSelectEntreprise(entreprise.id)}
//                                                 />
//                                             </td>
//                                             <td>
//                                                 <div className="scraping-entreprise-name">
//                                                     {entreprise.nom_societe}
//                                                 </div>
//                                                 <div style={{ fontSize: '11px', color: 'var(--color-gray-secondary)' }}>
//                                                     {entreprise.prenom} {entreprise.nom}
//                                                 </div>
//                                             </td>
//                                             <td>
//                                                 <div className="scraping-contact-info">
//                                                     <div className="scraping-phone">
//                                                         <i className="fas fa-phone"></i>
//                                                         {entreprise.telephone}
//                                                     </div>
//                                                     {entreprise.email !== 'Non disponible' && (
//                                                         <div className="scraping-email">
//                                                             <i className="fas fa-envelope"></i>
//                                                             {entreprise.email}
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                             <td>
//                                                 <span className="scraping-badge scraping-badge-activite">
//                                                     {entreprise.activite}
//                                                 </span>
//                                             </td>
//                                             <td style={{ fontSize: '12px', color: 'var(--color-gray-secondary)' }}>
//                                                 {entreprise.siret}
//                                             </td>
//                                             <td style={{ fontSize: '12px' }}>
//                                                 <div>{entreprise.ville}</div>
//                                                 <div style={{ color: 'var(--color-gray-secondary)' }}>
//                                                      {entreprise.departement} ({entreprise.code_postal}) 
//                                                 </div>
//                                             </td>
//                                             <td>
//                                                 {entreprise.note !== null && entreprise.note !== undefined ? (
//                                                     <div className="scraping-rating">
//                                                         <span className="scraping-rating-stars">
//                                                             {'★'.repeat(Math.round(entreprise.note))}
//                                                         </span>
//                                                         <span>{entreprise.note}</span>
//                                                         <span className="scraping-rating-count">
//                                                             ({entreprise.nombre_avis})
//                                                         </span>
//                                                     </div>
//                                                 ) : (
//                                                     <span className="scraping-no-rating" style={{
//                                                         fontSize: '11px',
//                                                         color: 'var(--color-gray-secondary)'
//                                                     }}>
//                                                         Pas d'avis
//                                                     </span>
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </section>
//             </div>
//         </div>
//     );
// };

// export default ScrapingPage;




// src/pages/ScrapingPage.tsx
// src/pages/ScrapingPage.tsx

// src/pages/ScrapingPage.tsx

import React, { useState, useEffect } from 'react';
import '../styles/scraping.css';
import type {
    ActiviteOption,
    EntrepriseScraped,
    ScrapingFilters
} from '../types/scraping.type';
import { mockActivites } from '../data/scrapingData';
import { scrapeGoogleMaps } from '../services/scrapingServices';
import {
    getAllRegions,
    getDepartementsFromRegion,
    getVillesFromMultipleDepartements,
    type Region,
    type Departement,
    type Ville
} from '../services/geoService';
import CustomSelect from '../components/CustomSelect';

const ScrapingPage: React.FC = () => {
    // ÉTATS
    const [filters, setFilters] = useState<ScrapingFilters>({
        region: '',
        departement: [],
        ville: [],
        activite: '',
        nombre_resultats: 0
    });

    // Données API
    const [regions, setRegions] = useState<Region[]>([]);
    const [departements, setDepartements] = useState<Departement[]>([]);
    const [villes, setVilles] = useState<Ville[]>([]);
    const [activites] = useState<ActiviteOption[]>(mockActivites);

    // Loading states
    const [loadingRegions, setLoadingRegions] = useState(false);
    const [loadingDepartements, setLoadingDepartements] = useState(false);
    const [loadingVilles, setLoadingVilles] = useState(false);

    const [entreprises, setEntreprises] = useState<EntrepriseScraped[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [scrapingProgress, setScrapingProgress] = useState<string>('');

    const [stats, setStats] = useState<{
        total_vise: number;
        total_trouve: number;
        avec_telephone: number;
        avec_email: number;
        avec_siret: number;
        avec_gerant: number;
        duree_secondes: number;
        villes_scrappees?: string[];
    } | null>(null);

    // CHARGER LES RÉGIONS AU MONTAGE
    useEffect(() => {
        async function loadRegions() {
            setLoadingRegions(true);
            const data = await getAllRegions();
            setRegions(data);
            setLoadingRegions(false);
            console.log(' Régions chargées:', data.length);
        }
        loadRegions();
    }, []);

    // CHARGER DÉPARTEMENTS QUAND RÉGION CHANGE
    useEffect(() => {
        async function loadDepartements() {
            if (!filters.region) {
                setDepartements([]);
                return;
            }

            setLoadingDepartements(true);
            const data = await getDepartementsFromRegion(filters.region);
            setDepartements(data);
            setLoadingDepartements(false);
            console.log(' Départements chargés:', data.length);
        }
        loadDepartements();
    }, [filters.region]);

    // CHARGER VILLES QUAND DÉPARTEMENTS CHANGENT
    useEffect(() => {
        async function loadVilles() {
            if (filters.departement.length === 0) {
                setVilles([]);
                return;
            }

            setLoadingVilles(true);
            const departementsData = filters.departement.map(code => ({
                code,
                region: filters.region
            }));
            const data = await getVillesFromMultipleDepartements(departementsData);
            setVilles(data);
            setLoadingVilles(false);
            console.log(' Villes chargées:', data.length);
        }
        loadVilles();
    }, [filters.departement, filters.region]);

    // GÉRER CHANGEMENT RÉGION
    const handleRegionChange = (value: string | string[]) => {
        setFilters({
            region: value as string,
            departement: [],
            ville: [],
            activite: filters.activite,
            nombre_resultats: filters.nombre_resultats
        });
        setErrorMessage('');
    };

    // GÉRER CHANGEMENT DÉPARTEMENTS
    const handleDepartementChange = (value: string | string[]) => {
        setFilters(prev => ({
            ...prev,
            departement: value as string[],
            ville: []
        }));
        setErrorMessage('');
    };

    // GÉRER CHANGEMENT VILLES
    const handleVilleChange = (value: string | string[]) => {
        setFilters(prev => ({
            ...prev,
            ville: value as string[]
        }));
        setErrorMessage('');
    };

    // AUTRES FILTRES
    const handleFilterChange = (field: keyof ScrapingFilters, value: string | number) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setErrorMessage('');
    };

    // RECHERCHER
    const handleSearch = async () => {
        if (!filters.region) {
            setErrorMessage('Veuillez sélectionner une région');
            return;
        }

        if (filters.departement.length === 0) {
            setErrorMessage('Veuillez sélectionner au moins un département');
            return;
        }

        setIsLoading(true);
        setSelectedIds(new Set());
        setErrorMessage('');
        setEntreprises([]);
        setStats(null);
        setScrapingProgress('🕷️ Scraping en cours...');

        try {
            const { entreprises: results, stats: scrapingStats } = await scrapeGoogleMaps(filters);

            setEntreprises(results);
            setStats(scrapingStats);
            setHasSearched(true);
            setScrapingProgress('');

        } catch (error: any) {
            console.error('❌ Erreur scraping:', error);
            setErrorMessage(error.message || 'Erreur lors du scraping');
            setScrapingProgress('');
        } finally {
            setIsLoading(false);
        }
    };

    // RÉINITIALISER
    const handleReset = () => {
        setFilters({
            region: '',
            departement: [],
            ville: [],
            activite: '',
            nombre_resultats: 20
        });
        setEntreprises([]);
        setSelectedIds(new Set());
        setHasSearched(false);
        setErrorMessage('');
        setStats(null);
    };


    // SÉLECTION ENTREPRISES

    const handleSelectEntreprise = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === entreprises.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(entreprises.map(e => e.id)));
        }
    };


const handleExportFrontend = () => {
    const dataToExport = selectedIds.size > 0 
        ? entreprises.filter(e => selectedIds.has(e.id))
        : entreprises;

    if (dataToExport.length === 0) {
        alert('Aucune donnée à exporter');
        return;
    }

    // BOM UTF-8 pour Excel (évite les problèmes d'encodage)
    const BOM = '\uFEFF';

    const headers = [
        'Nom Société',
        'Gérant',
        'Activité',
        'Téléphone',
        'Email',
        'SIRET',
        'Adresse',
        'Code Postal',
        'Ville',
        'Département',
        'Note',
        'Nombre Avis'
    ];

    const csvRows = dataToExport.map(e => [
        `"${e.nom_societe}"`,
        `"${e.prenom && e.nom ? `${e.prenom} ${e.nom}` : 'Non disponible'}"`,
        `"${e.activite}"`,
        `"${e.telephone}"`,
        `"${e.email}"`,
        `"${e.siret}"`,
        `"${e.adresse_etablissement || e.adresse || 'Non disponible'}"`,
        `"${e.code_postal_etablissement || e.code_postal || ''}"`,
        `"${e.ville_etablissement || e.ville || ''}"`,
        `"${e.departement || ''}"`,
        e.note || '',
        e.nombre_avis || 0
    ].join(';'));  

    const csvContent = BOM + [headers.join(';'), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `entreprises_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


    // CAMPAGNE SMS

    const handleSendCampaign = () => {
        const selected = entreprises.filter(e => selectedIds.has(e.id));
        alert(`Campagne SMS à ${selected.length} entreprises`);
    };


    // RENDER

    return (
        <div className="scraping-page">
            <div className="scraping-container">

                {/* HEADER */}
                <header className="scraping-header">
                    <h2 className="scraping-title">
                        Générateur de prospects depuis Google Maps
                    </h2>
                    <p className="scraping-subtitle">
                        Transformez Google Maps en machine à clients.
                    </p>
                </header>

                {/* STATS DU SCRAPING */}
                {stats && (
                    <div className="scraping-stats-banner">
                        <div className="scraping-stat-item">
                            <i className="fas fa-search"></i>
                            <span>Visé: {stats.total_vise}</span>
                        </div>
                        <div className="scraping-stat-item">
                            <i className="fas fa-check-circle"></i>
                            <span>Trouvé: {stats.total_trouve}</span>
                        </div>
                        <div className="scraping-stat-item">
                            <i className="fas fa-phone"></i>
                            <span>Tél: {stats.avec_telephone}</span>
                        </div>
                        <div className="scraping-stat-item">
                            <i className="fas fa-envelope"></i>
                            <span>Email: {stats.avec_email}</span>
                        </div>
                        <div className="scraping-stat-item">
                            <i className="fas fa-id-card"></i>
                            <span>SIRET: {stats.avec_siret}</span>
                        </div>
                        <div className="scraping-stat-item">
                            <i className="fas fa-clock"></i>
                            <span>{stats.duree_secondes}s</span>
                        </div>
                        {stats.villes_scrappees && stats.villes_scrappees.length > 0 && (
                            <div className="scraping-stat-item">
                                <i className="fas fa-city"></i>
                                <span>{stats.villes_scrappees.length} villes</span>
                            </div>
                        )}
                    </div>
                )}

                {/* MESSAGE D'ERREUR */}
                {errorMessage && (
                    <div className="scraping-error-message">
                        <i className="fas fa-exclamation-triangle"></i>
                        {errorMessage}
                    </div>
                )}

                {/* PROGRESSION DU SCRAPING */}
                {scrapingProgress && (
                    <div className="scraping-progress-message">
                        <i className="fas fa-spinner fa-spin"></i>
                        {scrapingProgress}
                    </div>
                )}

                {/* SECTION FILTRES */}
                <section className="scraping-filters-section">
                    <h3 className="scraping-filters-title">
                        <i className="fas fa-filter"></i>
                        Filtres de recherche
                    </h3>

                    <div className="scraping-filters-grid">
                        {/* ========== ACTIVITÉ ========== */}
                        <div className="scraping-filter-group">
                            <label className="scraping-filter-label">
                                <i className="fas fa-briefcase"></i> Activité
                            </label>
                            <CustomSelect
                                options={activites.map(a => ({ code: a.id, nom: a.nom }))}
                                value={filters.activite}
                                onChange={(value) => handleFilterChange('activite', value as string)}
                                placeholder="Toutes les activités"
                                icon="fas fa-briefcase"
                            />
                        </div>

                        {/* ========== RÉGION ========== */}
                        <div className="scraping-filter-group">
                            <label className="scraping-filter-label">
                                <i className="fas fa-globe-europe"></i> Région *
                            </label>
                            <CustomSelect
                                options={regions}
                                value={filters.region}
                                onChange={handleRegionChange}
                                placeholder="Sélectionner une région"
                                loading={loadingRegions}
                                icon="fas fa-globe-europe"
                            />
                        </div>

                        {/* ========== DÉPARTEMENTS ========== */}
                        <div className="scraping-filter-group">
                            <label className="scraping-filter-label">
                                <i className="fas fa-map-marked-alt"></i> Départements *
                            </label>
                            <CustomSelect
                                options={departements}
                                value={filters.departement}
                                onChange={handleDepartementChange}
                                placeholder="Sélectionner département(s)"
                                multiple
                                disabled={!filters.region}
                                loading={loadingDepartements}
                                showSelectAll
                                icon="fas fa-map-marked-alt"
                            />
                        </div>

                        {/* ========== VILLES ========== */}
                        <div className="scraping-filter-group">
                            <label className="scraping-filter-label">
                                <i className="fas fa-city"></i> Villes
                            </label>
                            <CustomSelect
                                options={villes}
                                value={filters.ville}
                                onChange={handleVilleChange}
                                placeholder="Toutes les villes (optionnel)"
                                multiple
                                disabled={filters.departement.length === 0}
                                loading={loadingVilles}
                                showSelectAll
                                showPopulation
                                icon="fas fa-city"
                            />
                        </div>

                        {/* ========== NOMBRE DE RÉSULTATS ========== */}
                        <div className="scraping-filter-group">
                            <label className="scraping-filter-label">
                                <i className="fas fa-hashtag"></i> Nombre de résultats
                            </label>
                            <input
                                type="number"
                                value={filters.nombre_resultats}
                                onChange={(e) => handleFilterChange('nombre_resultats', Number(e.target.value))}
                                min="5"
                                max="100"
                                step="5"
                                className="scraping-filter-select"
                                style={{ padding: '12px 16px' }}
                            />
                        </div>
                    </div>

                    {/* ========== BOUTONS D'ACTION ========== */}
                    <div className="scraping-buttons-group">
                        <button
                            className="scraping-btn-search"
                            onClick={handleSearch}
                            disabled={isLoading || !filters.region || filters.departement.length === 0}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Scraping en cours...
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

                {/* SECTION RÉSULTATS */}
                <section className="scraping-results-section">
                    <div className="scraping-results-header">
                        <h3 className="scraping-results-title">
                            <i className="fas fa-list"></i>
                            Résultats
                            <span className="scraping-results-count">{entreprises.length}</span>
                        </h3>

                        <div className="scraping-actions-group">
                            <button
                                className="scraping-btn-reset"
                                // onClick={handleExportFrontend}
                                disabled={entreprises.length === 0}
                            >
                                <i className="fas fa-envelope"></i>
                                Envoyer campagne DE Mails
                                {selectedIds.size > 0 && (
                                    <span className="scraping-selected-count">
                                        ({selectedIds.size})
                                    </span>
                                )}
                            </button>
                            <button
                                className="scraping-btn-reset"
                                onClick={handleExportFrontend}
                                disabled={entreprises.length === 0}
                            >
                                <i className="fas fa-file-export"></i>
                                Exporter
                                {selectedIds.size > 0 && (
                                    <span className="scraping-selected-count">
                                        ({selectedIds.size})
                                    </span>
                                )}
                            </button>

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
                                Envoyer campagne SMS Rapide
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
                            <p>🕷️ Scraping Google Maps...</p>
                            <p style={{ fontSize: '12px', color: 'var(--color-gray-secondary)' }}>
                                Cela peut prendre jusqu'à 3 minutes car nous devons respecter les limites de Google.
                            </p>
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
                                        <th>Description</th>
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
                                                    {entreprise.email !== 'Non disponible' && (
                                                        <div className="scraping-email">
                                                            <i className="fas fa-envelope"></i>
                                                            {entreprise.email}
                                                        </div>
                                                    )}
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
                                                {entreprise.ville_etablissement || entreprise.ville ? (
                                                    <>
                                                        <div style={{ fontWeight: '500' }}>
                                                            {entreprise.ville_etablissement || entreprise.ville}
                                                        </div>
                                                        <div style={{ color: 'var(--color-gray-secondary)' }}>
                                                            {entreprise.code_postal_etablissement || entreprise.code_postal}
                                                        </div>
                                                        {entreprise.adresse_etablissement && (
                                                            <div style={{ fontSize: '10px', color: 'var(--color-gray-light)', marginTop: '2px' }}>
                                                                {entreprise.adresse_etablissement}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div style={{ color: 'var(--color-gray-secondary)' }}>
                                                        Adresse non disponible
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {entreprise.note ? (
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




// src/pages/ScrapingPage.tsx

// import React, { useState, useEffect } from 'react';
// import '../styles/scraping.css';
// import type {
//     ActiviteOption,
//     DepartementOption,
//     EntrepriseScraped,
//     RegionOption,
//     ScrapingFilters,
//     VilleOption
// } from '../types/scraping.type';
// import {
//     mockActivites,
//     mockVilles,
//     mockDepartements,
//     mockRegions
// } from '../data/scrapingData';
// import { scrapeGoogleMaps } from '../services/scrapingServices';

// const ScrapingPage: React.FC = () => {
//  
//     // ÉTATS
//  
//     const [filters, setFilters] = useState<ScrapingFilters>({
//         region: '',
//         departement: '',
//         ville: '',
//         activite: '',
//         nombre_resultats: 20
//     });

//     const [regions] = useState<RegionOption[]>(mockRegions);
//     const [departements] = useState<DepartementOption[]>(mockDepartements);
//     const [villes] = useState<VilleOption[]>(mockVilles);
//     const [activites] = useState<ActiviteOption[]>(mockActivites);

//     const [entreprises, setEntreprises] = useState<EntrepriseScraped[]>([]);
//     const [filteredDepartements, setFilteredDepartements] = useState<DepartementOption[]>(mockDepartements);
//     const [filteredVilles, setFilteredVilles] = useState<VilleOption[]>(mockVilles);
//     const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
//     const [isLoading, setIsLoading] = useState(false);
//     const [hasSearched, setHasSearched] = useState(false);
//     const [errorMessage, setErrorMessage] = useState<string>('');
//     const [scrapingProgress, setScrapingProgress] = useState<string>('');

//     const [stats, setStats] = useState<{
//         total_vise: number;
//         total_trouve: number;
//         avec_telephone: number;
//         avec_email: number;
//         avec_siret: number;
//         avec_gerant: number;
//         duree_secondes: number;
//     } | null>(null);

//  
//     // FILTRER DÉPARTEMENTS SELON RÉGION
//  
//     useEffect(() => {
//         if (filters.region) {
//             const filtered = departements.filter(d => d.region === filters.region);
//             setFilteredDepartements(filtered);

//             if (filters.departement && !filtered.find(d => d.code === filters.departement)) {
//                 setFilters(prev => ({ ...prev, departement: '', ville: '' }));
//             }
//         } else {
//             setFilteredDepartements(departements);
//         }
//     }, [filters.region, departements, filters.departement]);

//  
//     // FILTRER VILLES SELON DÉPARTEMENT
//  
//     useEffect(() => {
//         if (filters.departement) {
//             const filtered = villes.filter(v => v.departement === filters.departement);
//             setFilteredVilles(filtered);

//             if (filters.ville && !filtered.find(v => v.code === filters.ville)) {
//                 setFilters(prev => ({ ...prev, ville: '' }));
//             }
//         } else if (filters.region) {
//             const filtered = villes.filter(v => v.region === filters.region);
//             setFilteredVilles(filtered);
//         } else {
//             setFilteredVilles(villes);
//         }
//     }, [filters.departement, filters.region, villes, filters.ville]);

//  
//     // GÉRER LES CHANGEMENTS DE FILTRES
//  
//     const handleFilterChange = (field: keyof ScrapingFilters, value: string | number) => {
//         const finalValue = field === 'nombre_resultats' ? Number(value) : value;

//         console.log(`🔧 Filtre changé: ${field} = ${finalValue}`);

//         setFilters(prev => ({
//             ...prev,
//             [field]: finalValue
//         }));
//         setErrorMessage('');
//     };

//  
//     // RECHERCHER AVEC SSE (TEMPS RÉEL)
//  
//     const handleSearch = async () => {
//         // Validation
//         if (!filters.ville) {
//             setErrorMessage('Veuillez sélectionner une ville');
//             return;
//         }

//         setIsLoading(true);
//         setSelectedIds(new Set());
//         setErrorMessage('');
//         setEntreprises([]);
//         setStats(null);
//         setScrapingProgress('🕷️ Connexion au serveur de scraping...');

//         try {
//             // Appel SSE avec callback de progression
//             const { entreprises: results, stats: scrapingStats } = await scrapeGoogleMaps(
//                 filters,
//                 (progressEntreprises, progressStats) => {
//                     // Mise à jour en temps réel
//                     setEntreprises(progressEntreprises);

//                     if (progressStats) {
//                         setStats(progressStats);
//                     }

//                     setScrapingProgress(
//                         `🕷️ Scraping en cours... ${progressEntreprises.length}/${filters.nombre_resultats || 20} entreprises`
//                     );
//                 }
//             );

//             setEntreprises(results);
//             setStats(scrapingStats);
//             setHasSearched(true);
//             setScrapingProgress('');

//             console.log(' Scraping terminé:', {
//                 total: results.length,
//                 stats: scrapingStats
//             });

//         } catch (error: any) {
//             console.error('❌ Erreur scraping:', error);
//             setErrorMessage(error.message || 'Une erreur est survenue lors du scraping');
//             setScrapingProgress('');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//  
//     // RÉINITIALISER LES FILTRES
//  
//     const handleReset = () => {
//         setFilters({
//             region: '',
//             departement: '',
//             ville: '',
//             activite: '',
//             nombre_resultats: 20
//         });
//         setEntreprises([]);
//         setSelectedIds(new Set());
//         setHasSearched(false);
//         setErrorMessage('');
//         setStats(null);
//     };

//  
//     // SÉLECTIONNER/DÉSÉLECTIONNER UNE ENTREPRISE
//  
//     const handleSelectEntreprise = (id: string) => {
//         setSelectedIds(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(id)) {
//                 newSet.delete(id);
//             } else {
//                 newSet.add(id);
//             }
//             return newSet;
//         });
//     };

//  
//     // SÉLECTIONNER/DÉSÉLECTIONNER TOUT
//  
//     const handleSelectAll = () => {
//         if (selectedIds.size === entreprises.length) {
//             setSelectedIds(new Set());
//         } else {
//             setSelectedIds(new Set(entreprises.map(e => e.id)));
//         }
//     };

//  
//     // ENVOYER CAMPAGNE SMS
//  
//     const handleSendCampaign = () => {
//         const selectedEntreprises = entreprises.filter(e => selectedIds.has(e.id));

//         alert(`Campagne SMS envoyée à ${selectedEntreprises.length} entreprises !
    
// Numéros : ${selectedEntreprises.map(e => e.telephone).join(', ')}`);
//     };

//  
//     // RENDER
//  
//     return (
//         <div className="scraping-page">
//             <div className="scraping-container">

//                 <header className="scraping-header">
//                     <h2 className="scraping-title">
//                         Générateur de prospects depuis Google Maps
//                     </h2>
//                     <p className="scraping-subtitle">
//                         Transformez Google Maps en machine à clients.
//                     </p>
//                     <p className="scraping-description">
//                         Trouvez des entreprises BTP en France et lancez vos campagnes SMS automatisées.
//                     </p>
//                 </header>

//                 {/* STATS */}
//                 {stats && (
//                     <div className="scraping-stats-banner">
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-search"></i>
//                             <span>Recherchées: {stats.total_vise}</span>
//                         </div>
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-check-circle"></i>
//                             <span>Trouvées: {stats.total_trouve}</span>
//                         </div>
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-phone"></i>
//                             <span>Téléphones: {stats.avec_telephone}</span>
//                         </div>
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-envelope"></i>
//                             <span>Emails: {stats.avec_email}</span>
//                         </div>
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-id-card"></i>
//                             <span>SIRET: {stats.avec_siret}</span>
//                         </div>
//                         <div className="scraping-stat-item">
//                             <i className="fas fa-clock"></i>
//                             <span>Durée: {stats.duree_secondes}s</span>
//                         </div>
//                     </div>
//                 )}

//                 {/* ERREUR */}
//                 {errorMessage && (
//                     <div className="scraping-error-message">
//                         <i className="fas fa-exclamation-triangle"></i>
//                         {errorMessage}
//                     </div>
//                 )}

//                 {/* PROGRESSION */}
//                 {scrapingProgress && (
//                     <div className="scraping-progress-message">
//                         <i className="fas fa-spinner fa-spin"></i>
//                         {scrapingProgress}
//                     </div>
//                 )}

//                 {/* FILTRES */}
//                 <section className="scraping-filters-section">
//                     <h3 className="scraping-filters-title">
//                         <i className="fas fa-filter"></i>
//                         Filtres de recherche
//                     </h3>

// <div className="scraping-filters-grid">
//   {/* ========== ACTIVITÉ ========== */}
//   <div className="scraping-filter-group">
//     <label className="scraping-filter-label" htmlFor="scraping-activite">
//       <i className="fas fa-briefcase"></i> Activité
//     </label>
//     <select
//       id="scraping-activite"
//       className="scraping-filter-select"
//       value={filters.activite}
//       onChange={(e) => handleFilterChange('activite', e.target.value)}
//     >
//       <option value="">-- Toutes les activités --</option>
//       {activites.map(act => (
//         <option key={act.id} value={act.id}>
//           {/* ✅ RESTAURÉ : value={act.id} au lieu de act.nom */}
//           {act.nom}
//         </option>
//       ))}
//     </select>
//   </div>

//   {/* ========== RÉGION ========== */}
//   <div className="scraping-filter-group">
//     <label className="scraping-filter-label" htmlFor="scraping-region">
//       <i className="fas fa-globe-europe"></i> Région
//     </label>
//     <select
//       id="scraping-region"
//       className="scraping-filter-select"
//       value={filters.region}
//       onChange={(e) => handleFilterChange('region', e.target.value)}
//     >
//       <option value="">-- Toutes les régions --</option>
//       {regions.map(region => (
//         <option key={region.code} value={region.code}>
//           {/* ✅ RESTAURÉ : value={region.code} au lieu de region.nom */}
//           {region.nom}
//         </option>
//       ))}
//     </select>
//   </div>

//   {/* ========== DÉPARTEMENT ========== */}
//   <div className="scraping-filter-group">
//     <label className="scraping-filter-label" htmlFor="scraping-departement">
//       <i className="fas fa-map-marked-alt"></i> Département
//     </label>
//     <select
//       id="scraping-departement"
//       className="scraping-filter-select"
//       value={filters.departement}
//       onChange={(e) => handleFilterChange('departement', e.target.value)}
//       disabled={!filters.region}
//     >
//       <option value="">-- Tous les départements --</option>
//       {filteredDepartements.map(dept => (
//         <option key={dept.code} value={dept.code}>
//           {/* ✅ BON : value={dept.code} */}
//           {dept.code} - {dept.nom}
//         </option>
//       ))}
//     </select>
//   </div>

//   {/* ========== VILLE ========== */}
//   <div className="scraping-filter-group">
//     <label className="scraping-filter-label" htmlFor="scraping-ville">
//       <i className="fas fa-city"></i> Ville *
//     </label>
//     <select
//       id="scraping-ville"
//       className="scraping-filter-select"
//       value={filters.ville}
//       onChange={(e) => handleFilterChange('ville', e.target.value)}
//       disabled={!filters.departement}
//     >
//       <option value="">-- Toutes les villes --</option>
//       {filteredVilles.map(ville => (
//         <option key={ville.code} value={ville.code}>
//           {/* ✅ RESTAURÉ : value={ville.code} au lieu de ville.nom */}
//           {ville.nom}
//         </option>
//       ))}
//     </select>
//     <small style={{
//       fontSize: '11px',
//       color: 'var(--color-danger)',
//       marginTop: '4px',
//       display: 'block'
//     }}>
//       * Champ obligatoire
//     </small>
//   </div>

//   {/* ========== NOMBRE DE RÉSULTATS ========== */}
//   <div className="scraping-filter-group">
//     <label className="scraping-filter-label" htmlFor="scraping-nombre">
//       <i className="fas fa-hashtag"></i> Nombre de résultats
//     </label>
//     <input
//       type="number"
//       id="scraping-nombre"
//       className="scraping-filter-select"
//       value={filters.nombre_resultats}
//       onChange={(e) => handleFilterChange('nombre_resultats', Number(e.target.value))}
//       min="5"
//       max="100"
//       step="5"
//       placeholder="Ex: 20"
//       style={{ padding: '10px 12px' }}
//     />
//     <small style={{
//       fontSize: '11px',
//       color: 'var(--color-gray-secondary)',
//       marginTop: '4px',
//       display: 'block'
//     }}>
//       Entre 5 et 100 résultats
//     </small>
//   </div>
// </div>

//                     <div className="scraping-buttons-group">
//                         <button
//                             className="scraping-btn-search"
//                             onClick={handleSearch}
//                             disabled={isLoading || !filters.ville}
//                         >
//                             {isLoading ? (
//                                 <>
//                                     <i className="fas fa-spinner fa-spin"></i>
//                                     Scraping en cours...
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="fas fa-search"></i>
//                                     Rechercher
//                                 </>
//                             )}
//                         </button>

//                         <button className="scraping-btn-reset" onClick={handleReset}>
//                             <i className="fas fa-redo"></i>
//                             Réinitialiser
//                         </button>
//                     </div>
//                 </section>

//                 {/* RÉSULTATS */}
//                 <section className="scraping-results-section">
//                     <div className="scraping-results-header">
//                         <h3 className="scraping-results-title">
//                             <i className="fas fa-list"></i>
//                             Résultats
//                             <span className="scraping-results-count">{entreprises.length}</span>
//                         </h3>

//                         <div className="scraping-actions-group">
//                             <button
//                                 className="scraping-btn-select-all"
//                                 onClick={handleSelectAll}
//                                 disabled={entreprises.length === 0}
//                             >
//                                 <i className={selectedIds.size === entreprises.length ?
//                                     'fas fa-check-square' : 'far fa-square'}></i>
//                                 {selectedIds.size === entreprises.length ?
//                                     'Tout désélectionner' : 'Tout sélectionner'}
//                             </button>

//                             <button
//                                 className="scraping-btn-send-campaign"
//                                 onClick={handleSendCampaign}
//                                 disabled={selectedIds.size === 0}
//                             >
//                                 <i className="fas fa-paper-plane"></i>
//                                 Envoyer campagne SMS
//                                 {selectedIds.size > 0 && (
//                                     <span className="scraping-selected-count">
//                                         ({selectedIds.size})
//                                     </span>
//                                 )}
//                             </button>
//                         </div>
//                     </div>

//                     {/* LOADING */}
//                     {isLoading && (
//                         <div className="scraping-loading">
//                             <div className="scraping-loading-spinner"></div>
//                             <p>🕷️ Scraping Google Maps...</p>
//                             <p style={{ fontSize: '12px', color: 'var(--color-gray-secondary)' }}>
//                                 Résultats affichés en temps réel
//                             </p>
//                         </div>
//                     )}

//                     {/* PAS DE RÉSULTATS */}
//                     {!isLoading && hasSearched && entreprises.length === 0 && (
//                         <div className="scraping-no-results">
//                             <i className="fas fa-search"></i>
//                             <p>Aucune entreprise trouvée avec ces critères.</p>
//                             <p>Essayez de modifier vos filtres.</p>
//                         </div>
//                     )}

//                     {/* TABLE */}
//                     {entreprises.length > 0 && (
//                         <div className="scraping-table-container">
//                             <table className="scraping-table">
//                                 <thead>
//                                     <tr>
//                                         <th style={{ width: '50px' }}>
//                                             <input
//                                                 type="checkbox"
//                                                 className="scraping-checkbox"
//                                                 checked={selectedIds.size === entreprises.length}
//                                                 onChange={handleSelectAll}
//                                             />
//                                         </th>
//                                         <th>Entreprise</th>
//                                         <th>Contact</th>
//                                         <th>Activité</th>
//                                         <th>SIRET</th>
//                                         <th>Localisation</th>
//                                         <th>Note</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {entreprises.map(entreprise => (
//                                         <tr
//                                             key={entreprise.id}
//                                             className={selectedIds.has(entreprise.id) ? 'scraping-row-selected' : ''}
//                                         >
//                                             <td>
//                                                 <input
//                                                     type="checkbox"
//                                                     className="scraping-checkbox"
//                                                     checked={selectedIds.has(entreprise.id)}
//                                                     onChange={() => handleSelectEntreprise(entreprise.id)}
//                                                 />
//                                             </td>
//                                             <td>
//                                                 <div className="scraping-entreprise-name">
//                                                     {entreprise.nom_societe}
//                                                 </div>
//                                                 <div style={{ fontSize: '11px', color: 'var(--color-gray-secondary)' }}>
//                                                     {entreprise.prenom} {entreprise.nom}
//                                                 </div>
//                                             </td>
//                                             <td>
//                                                 <div className="scraping-contact-info">
//                                                     <div className="scraping-phone">
//                                                         <i className="fas fa-phone"></i>
//                                                         {entreprise.telephone}
//                                                     </div>
//                                                     {entreprise.email !== 'Non disponible' && (
//                                                         <div className="scraping-email">
//                                                             <i className="fas fa-envelope"></i>
//                                                             {entreprise.email}
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                             <td>
//                                                 <span className="scraping-badge scraping-badge-activite">
//                                                     {entreprise.activite}
//                                                 </span>
//                                             </td>
//                                             <td style={{ fontSize: '12px', color: 'var(--color-gray-secondary)' }}>
//                                                 {entreprise.siret}
//                                             </td>
//                                             <td style={{ fontSize: '12px' }}>
//                                                 <div>{entreprise.ville}</div>
//                                                 <div style={{ color: 'var(--color-gray-secondary)' }}>
//                                                     {entreprise.departement} ({entreprise.code_postal})
//                                                 </div>
//                                             </td>
//                                             <td>
//                                                 {entreprise.note !== null && entreprise.note !== undefined ? (
//                                                     <div className="scraping-rating">
//                                                         <span className="scraping-rating-stars">
//                                                             {'★'.repeat(Math.round(entreprise.note))}
//                                                         </span>
//                                                         <span>{entreprise.note}</span>
//                                                         <span className="scraping-rating-count">
//                                                             ({entreprise.nombre_avis})
//                                                         </span>
//                                                     </div>
//                                                 ) : (
//                                                     <span className="scraping-no-rating" style={{
//                                                         fontSize: '11px',
//                                                         color: 'var(--color-gray-secondary)'
//                                                     }}>
//                                                         Pas d'avis
//                                                     </span>
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </section>
//             </div>
//         </div>
//     );
// };

// export default ScrapingPage;