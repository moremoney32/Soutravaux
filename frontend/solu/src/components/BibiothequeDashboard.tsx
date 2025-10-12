import React, { useState } from 'react';

import '../styles/BibliothequesDasboard.css';
import Sidebar from './sideBarBibio';
import Header from './HeaderBibiotheque';
import BibliothequesList from './BibliothequeList';
import AddBibliothequeModal from './AddBibliothequeModal';
import BibliothequeNavigationModal from './BibiothequeNavigationModal';

export interface Bibliotheque {
  id: string;
  name: string;
  count: number;
  hasAccess: boolean;
  logo?: string;
}

export interface Famille {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Categorie {
  id: string;
  name: string;
  familleId: string;
  description?: string;
}

export interface SousCategorie {
  id: string;
  name: string;
  categorieId: string;
  description?: string;
}

export interface Produit {
  id: string;
  name: string;
  image: string;
  sousCategorieId: string;
  price?: number;
  description?: string;
  brand?: string;
}

const BibliothequesDashboard: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [selectedBibliotheque, setSelectedBibliotheque] = useState<Bibliotheque | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Données simulées
  const userBibliotheques: Bibliotheque[] = [
    { id: '1', name: 'Point P', count: 1, hasAccess: true, logo: '🏪' }
  ];

  const availableBibliotheques: Bibliotheque[] = [
    { id: '2', name: 'Leroy Merlin', count: 0, hasAccess: false, logo: '🏬' },
    { id: '3', name: 'Castorama', count: 0, hasAccess: false, logo: '🏭' },
    { id: '4', name: 'Brico Dépôt', count: 0, hasAccess: false, logo: '🏢' },
    { id: '5', name: 'Weldom', count: 0, hasAccess: false, logo: '🏪' }
  ];

  const handleAddBibliotheque = () => {
    setShowAddModal(true);
  };

  const handleSelectBibliotheque = (bibliotheque: Bibliotheque) => {
    if (bibliotheque.hasAccess) {
      setSelectedBibliotheque(bibliotheque);
      setShowNavigationModal(true);
    } else {
      // Envoyer notification au fournisseur
      alert(`Demande d'accès envoyée à ${bibliotheque.name}. Vous recevrez une notification une fois approuvée.`);
    }
    setShowAddModal(false);
  };

  const handleBibliothequeClick = (bibliotheque: Bibliotheque) => {
    setSelectedBibliotheque(bibliotheque);
    setShowNavigationModal(true);
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <BibliothequesList
            bibliotheques={userBibliotheques}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddBibliotheque={handleAddBibliotheque}
            onBibliothequeClick={handleBibliothequeClick}
          />
        </div>
      </div>

      {showAddModal && (
        <AddBibliothequeModal
          bibliotheques={availableBibliotheques}
          onClose={() => setShowAddModal(false)}
          onSelect={handleSelectBibliotheque}
        />
      )}

      {showNavigationModal && selectedBibliotheque && (
        <BibliothequeNavigationModal
          bibliotheque={selectedBibliotheque}
          onClose={() => {
            setShowNavigationModal(false);
            setSelectedBibliotheque(null);
          }}
        />
      )}
    </div>
  );
};

export default BibliothequesDashboard;