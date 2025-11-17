// src/components/campagne/CampagnesListFiltres.tsx

import { useState } from 'react';
import '../styles/filtres-campagne.css';

interface CampagnesListFiltresProps {
  onCreateCampagne: () => void;
}

const CampagnesListFiltres = ({ onCreateCampagne }: CampagnesListFiltresProps) => {
  const [filters, setFilters] = useState({
    telephone: '',
    smsMin: '',
    smsMax: '',
    message: '',
    periode: '',
    supprimees: false,
  });

  const handleFilterChange = (field: string, value: string | boolean) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleFilter = () => {
    console.log('Filtrer avec:', filters);
  };

  const handleResetFilters = () => {
    setFilters({
      telephone: '',
      smsMin: '',
      smsMax: '',
      message: '',
      periode: '',
      supprimees: false,
    });
  };

  return (
    <div className="wrapper-filtres">
      {/* HEADER AVEC BREADCRUMB ET BOUTONS */}
      <div className="header-filtres">
        {/* <div className="breadcrumb-filtres">
          <i className="fa-solid fa-house"></i>
          <span>Envoyer des SMS</span>
          <i className="fa-solid fa-chevron-right"></i>
          <span className="active-filtres">Mes campagnes</span>
        </div> */}
             <h2 className="title-filtres">Mes Campagnes</h2>

        <div className="actions-filtres">
          {/* <button className="btn-sms-rapide-filtres">
            <i className="fa-solid fa-paper-plane"></i>
            SMS rapide
          </button> */}
          <button className="btn-create-filtres" onClick={onCreateCampagne}>
            <i className="fa-solid fa-comment"></i>
            Créer une campagne
          </button>
        </div>
      </div>

      {/* <h2 className="title-filtres">Mes Campagnes</h2> */}

      {/* SECTION FILTRES */}
      <div className="section-filtres">
        <h3 className="subtitle-filtres">Filtres</h3>

        <div className="grid-filtres">
          {/* Numéro de téléphone */}
          <div className="group-filtres">
            <label className="label-filtres">Numéro de téléphone</label>
            <input
              type="text"
              className="input-filtres"
              placeholder="Numéro de téléphone"
              value={filters.telephone}
              onChange={(e) => handleFilterChange('telephone', e.target.value)}
            />
          </div>

          {/* Nombre SMS min */}
          <div className="group-filtres">
            <label className="label-filtres">Nombre SMS min/campagne</label>
            <input
              type="text"
              className="input-filtres"
              placeholder="Nombre SMS min/campagne"
              value={filters.smsMin}
              onChange={(e) => handleFilterChange('smsMin', e.target.value)}
            />
          </div>

          {/* Nombre SMS max */}
          <div className="group-filtres">
            <label className="label-filtres">Nombre SMS max/campagne</label>
            <input
              type="text"
              className="input-filtres"
              placeholder="Nombre SMS max/campagne"
              value={filters.smsMax}
              onChange={(e) => handleFilterChange('smsMax', e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="group-filtres">
            <label className="label-filtres">Message</label>
            <input
              type="text"
              className="input-filtres"
              placeholder="Message"
              value={filters.message}
              onChange={(e) => handleFilterChange('message', e.target.value)}
            />
          </div>

          {/* Période */}
          <div className="group-filtres">
            <label className="label-filtres">Période</label>
            <div className="periode-wrapper-filtres">
              <input
                type="text"
                className="input-filtres"
                placeholder=" - "
                value={filters.periode}
                onChange={(e) => handleFilterChange('periode', e.target.value)}
              />
              <i className="fa-solid fa-calendar icon-periode-filtres"></i>
            </div>
          </div>

          {/* Campagnes supprimées */}
          <div className="group-filtres group-toggle-filtres">
            <label className="label-filtres">Voir les campagnes supprimées uniquement</label>
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

        {/* BOUTONS FILTRES */}
        <div className="buttons-filtres">
          <button className="btn-primary check_button" onClick={handleFilter}>
            Filtrer
          </button>
          <button className="btn-tertiary" onClick={handleResetFilters}>
            Effacer les filtres
          </button>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="section-table-filtres">
        <table className="table-filtres">
          <thead>
            <tr>
              <th>NOM</th>
              <th>
                ENVOYÉE À
                <i className="fa-solid fa-sort"></i>
              </th>
              <th>
                MESSAGE
                <i className="fa-solid fa-sort"></i>
              </th>
              <th>
                SMS
                <i className="fa-solid fa-sort"></i>
              </th>
              <th>
                STATISTIQUES
                <i className="fa-solid fa-sort"></i>
              </th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="empty-filtres">
                Aucune entrée correspondante n'a été trouvée
              </td>
            </tr>
          </tbody>
        </table>

        <div className="footer-table-filtres">
          <span>0 entrées</span>
        </div>
      </div>
    </div>
  );
};

export default CampagnesListFiltres;