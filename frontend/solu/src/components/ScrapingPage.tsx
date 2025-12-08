
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

    /***scrapingPage sans detection  */

    // ============================================
// 🎯 FONCTION : SCRAPING OPTIMISÉ ANTI-DÉTECTION
// ============================================
const scrapeOptimiseAntiDetection = async (
  villesBrutes: Ville[],
  limiteResultats: number
) => {
  
  
  // ÉTAPE 1 : TRIER LES VILLES PAR POPULATION (GRANDES D'ABORD)
//   console.log(`📊 Tri des ${villesBrutes.length} villes par population...`);
  
  const villesTriees = [...villesBrutes].sort((a, b) => 
    (b.population || 0) - (a.population || 0)
  );
  
  
  // CONFIGURATION ANTI-DÉTECTION
  const CONFIG = {
    TAILLE_LOT: 5,              // 5 villes en parallèle
    PAUSE_MINUTES: 2,           // 2 minutes de pause
    MAX_VILLES_AVANT_PAUSE_LONGUE: 15  // Pause longue tous les 15 villes
  };
  
  const tousLesResultats: EntrepriseScraped[] = [];
  let villesScrapees = 0;
  let lotsEffectues = 0;
  const startTime = Date.now();
  
  // ÉTAPE 2 : SCRAPING PAR LOTS
  for (let i = 0; i < villesTriees.length; i += CONFIG.TAILLE_LOT) {
    
    // Vérifier si limite atteinte
    if (tousLesResultats.length >= limiteResultats) {
      break;
    }
    
    const lot = villesTriees.slice(i, i + CONFIG.TAILLE_LOT);
    lotsEffectues++;  
    try {
      // SCRAPING ASYNCHRONE (PARALLÈLE) DU LOT
      const promesses = lot.map(ville => {
        const restant = limiteResultats - tousLesResultats.length;
        const nbARecuperer = Math.min(50, Math.max(10, restant));
        
        
        return scrapeGoogleMaps({
          region: filters.region,
          departement: filters.departement,
          ville: [ville.code],
          activite: filters.activite,
          nombre_resultats: nbARecuperer
        });
      });
      
      // Attendre que TOUTES les villes du lot soient scrapées
      const resultatsLot = await Promise.allSettled(promesses);
      
      // TRAITER LES RÉSULTATS
      for (let j = 0; j < resultatsLot.length; j++) {
        const result = resultatsLot[j];
        const ville = lot[j];
        
        if (result.status === 'fulfilled' && result.value?.entreprises) {
          const entreprises = result.value.entreprises;
          
          // Ajouter seulement ce qu'on a besoin
          const restant = limiteResultats - tousLesResultats.length;
          const aAjouter = entreprises.slice(0, restant);
          
          tousLesResultats.push(...aAjouter);
          villesScrapees++;
          
          // Vérifier si limite atteinte
          if (tousLesResultats.length >= limiteResultats) {
            break;
          }
          
        } else if (result.status === 'rejected') {
          console.log(`${ville.nom}: Erreur - ${result.reason}`);
        } else {
        //   console.log(`${ville.nom}: Aucun résultat`);
        }
      }
      
      // Arrêter si limite atteinte
      if (tousLesResultats.length >= limiteResultats) {
        break;
      }
      
      // PAUSE ENTRE LES LOTS (ANTI-DÉTECTION)
      if (i + CONFIG.TAILLE_LOT < villesTriees.length) {
        
        // Pause longue tous les 15 villes (3 lots)
        const villesScrapeesDansSession = (lotsEffectues * CONFIG.TAILLE_LOT);
        const pauseLongue = villesScrapeesDansSession % CONFIG.MAX_VILLES_AVANT_PAUSE_LONGUE === 0 && lotsEffectues > 0;
        
        const pauseMinutes = pauseLongue ? 4 : CONFIG.PAUSE_MINUTES;
        if (pauseLongue) {
          console.log(`   (Pause longue - ${villesScrapeesDansSession} villes scrapées)`);
        }
        
        setScrapingProgress(`⏸️ Pause anti-détection : ${pauseMinutes} min...`);
        
        // Compte à rebours
        for (let sec = pauseMinutes * 60; sec > 0; sec -= 10) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          const minutesRestantes = Math.floor(sec / 60);
          const secondesRestantes = sec % 60;
          setScrapingProgress(`⏸️ Pause : ${minutesRestantes}:${secondesRestantes.toString().padStart(2, '0')}...`);
        }
        
        setScrapingProgress('🕷️ Scraping en cours...');
      }
      
    } catch (error: any) {
      console.error(`\n   ❌ Erreur lot ${lotsEffectues}:`, error.message);
    }
  }
  
  // RÉSUMÉ FINAL
  const dureeSecondes = Math.round((Date.now() - startTime) / 1000);
  const dureeMinutes = Math.floor(dureeSecondes / 60);
  const dureeSecondesRestantes = dureeSecondes % 60;
  console.log(`Durée totale : ${dureeMinutes}m ${dureeSecondesRestantes}s`);
  
 // setProgression(100);
  return tousLesResultats;
};
    /***fin de scrapingpage sans detection  */

    // RECHERCHER
  
const handleSearch = async () => {
  // VALIDATIONS
  if (!filters.region) {
    setErrorMessage('Veuillez sélectionner une région');
    return;
  }

  if (filters.departement.length === 0) {
    setErrorMessage('Veuillez sélectionner au moins un département');
    return;
  }

  if (!filters.activite) {
    setErrorMessage('Veuillez sélectionner une activité');
    return;
  }

  if (filters.nombre_resultats < 5 || filters.nombre_resultats > 500) {
    setErrorMessage('Le nombre de résultats doit être entre 5 et 500');
    return;
  }

  // INITIALISATION
  setIsLoading(true);
  setSelectedIds(new Set());
  setErrorMessage('');
  setEntreprises([]);
  setStats(null);
  setScrapingProgress('🎯 Préparation du scraping...');

  // CAPTURER L'HEURE DE DÉBUT
  const startTime = Date.now();

  try {

    // DÉTERMINER LES VILLES À SCRAPER
    let villesToScrape: Ville[] = [];

    if (filters.ville.length > 0) {
      villesToScrape = villes.filter(v => filters.ville.includes(v.code));
      console.log(`${villesToScrape.length} villes sélectionnées par l'utilisateur\n`);
    } else {
      villesToScrape = villes;
      console.log(`${villesToScrape.length} villes disponibles dans les départements\n`);
    }

    if (villesToScrape.length === 0) {
      setErrorMessage('Aucune ville trouvée');
      setIsLoading(false);
      return;
    }

    // LANCER LE SCRAPING OPTIMISÉ
    const resultats = await scrapeOptimiseAntiDetection(
      villesToScrape,
      filters.nombre_resultats
    );

    // CALCULER LA DURÉE TOTALE
    const dureeSecondes = Math.round((Date.now() - startTime) / 1000);

    // AFFICHER LES RÉSULTATS
    setEntreprises(resultats);
    setHasSearched(true);
    setScrapingProgress('');

    // STATS AVEC DURÉE RÉELLE
    const statsFinales = {
      total_vise: filters.nombre_resultats,
      total_trouve: resultats.length,
      avec_telephone: resultats.filter(e => e.telephone && e.telephone !== 'Non disponible').length,
      avec_email: resultats.filter(e => e.email && e.email !== 'Non disponible').length,
      avec_siret: resultats.filter(e => e.siret && e.siret !== 'Non disponible').length,
      avec_gerant: resultats.filter(e => e.prenom && e.nom).length,
      duree_secondes: dureeSecondes  // DURÉE CALCULÉE
    };

    setStats(statsFinales);

    // AFFICHER LA DURÉE DANS L'ALERT
    const minutes = Math.floor(dureeSecondes / 60);
    const secondes = dureeSecondes % 60;
    const dureeFormatee = minutes > 0 
      ? `${minutes}m ${secondes}s` 
      : `${secondes}s`;

    alert(`✅ Scraping terminé en ${dureeFormatee} !\n${resultats.length} entreprises trouvées`);

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
                            {/* <input
                                type="number"
                                value={filters.nombre_resultats}
                                onChange={(e) => handleFilterChange('nombre_resultats', Number(e.target.value))}
                                min="5"
                                max="100"
                                step="5"
                                className="scraping-filter-select"
                                style={{ padding: '12px 16px' }}
                            /> */}
  <input
    type="text"
    value={filters.nombre_resultats === 0 ? "" : filters.nombre_resultats.toString()}
    onChange={(e) => {
        const value = e.target.value;
        // Permettre seulement les chiffres
        if (value === "" || /^\d+$/.test(value)) {
            const numValue = value === "" ? 0 : Number(value);
            handleFilterChange('nombre_resultats', numValue);
        }
    }}
    min="5"
    max="100"
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
                                Cela peut prendre jusqu'à 5 minutes car nous devons respecter les limites de Google.
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
