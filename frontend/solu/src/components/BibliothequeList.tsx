import React from 'react';

import '../styles/BibliothequeList.css';
import type { Bibliotheque } from './BibiothequeDashboard';

interface BibliothequeListProps {
  bibliotheques: Bibliotheque[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddBibliotheque: () => void;
  onBibliothequeClick: (bibliotheque: Bibliotheque) => void;
}

const BibliothequesList: React.FC<BibliothequeListProps> = ({
  bibliotheques,
  searchTerm,
  onSearchChange,
  onAddBibliotheque,
  onBibliothequeClick
}) => {
  return (
    <div className="bibliotheques-container">
      <div className="bibliotheques-header">
        <h2 className="section-title">Ma Bibliothèque</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Recherche"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input-main"
            />
            <span className="search-icon-main">🔍</span>
          </div>
          <button className="add-button" onClick={onAddBibliotheque}>
            Ajouter une Bibliothèque
          </button>
        </div>
      </div>

      <div className="bibliotheques-grid">
        {bibliotheques.map((bibliotheque) => (
          <div 
            key={bibliotheque.id} 
            className="bibliotheque-card"
            onClick={() => onBibliothequeClick(bibliotheque)}
          >
            <div className="card-icon">
              <span className="icon-placeholder">{bibliotheque.logo || '📚'}</span>
            </div>
            <div className="card-content">
              <h3 className="card-title">{bibliotheque.name}</h3>
              <span className="card-badge">Bibliothèques {bibliotheque.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BibliothequesList;