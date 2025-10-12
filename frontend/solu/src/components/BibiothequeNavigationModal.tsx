
import React, { useState } from 'react';

import '../styles/BibliothequeNavigationModal.css';
import type { Bibliotheque, Categorie, Famille, Produit, SousCategorie } from './BibiothequeDashboard';

interface BibliothequeNavigationModalProps {
  bibliotheque: Bibliotheque;
  onClose: () => void;
}

type NavigationStep = 'familles' | 'categories' | 'sous-categories' | 'produits';

const BibliothequeNavigationModal: React.FC<BibliothequeNavigationModalProps> = ({
  bibliotheque,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<NavigationStep>('familles');
  const [selectedFamille, setSelectedFamille] = useState<Famille | null>(null);
  const [selectedCategorie, setSelectedCategorie] = useState<Categorie | null>(null);
  const [selectedSousCategorie, setSelectedSousCategorie] = useState<SousCategorie | null>(null);

  // Données simulées avec relations
  const familles: Famille[] = [
    { id: '1', name: 'Matériaux gros œuvre', description: 'Béton, ciment, parpaings...', icon: '🏗️' },
    { id: '2', name: 'Plâtre, isolation, plafond', description: 'Isolation thermique et phonique', icon: '🏠' },
    { id: '3', name: 'Toitures', description: 'Tuiles, ardoises, charpente', icon: '🏘️' },
    { id: '4', name: 'Carrelage intérieur', description: 'Sols et murs intérieurs', icon: '🔲' },
    { id: '5', name: 'Menuiseries', description: 'Portes, fenêtres, cloisons', icon: '🚪' },
    { id: '6', name: 'Plomberie', description: 'Sanitaires, tuyauterie, robinetterie', icon: '🚿' }
  ];

  const categories: Categorie[] = [
    // Famille 1: Matériaux gros œuvre
    { id: '1', name: 'Béton et ciment', familleId: '1', description: 'Béton prêt à l\'emploi, ciment' },
    { id: '2', name: 'Parpaings et blocs', familleId: '1', description: 'Blocs béton, parpaings creux' },
    { id: '3', name: 'Fers et aciers', familleId: '1', description: 'Armatures, fers à béton' },
    { id: '4', name: 'Granulats', familleId: '1', description: 'Sable, gravier, gravillon' },
    // Famille 2: Plâtre, isolation
    { id: '5', name: 'Plâtres et enduits', familleId: '2', description: 'Plâtre de Paris, enduits' },
    { id: '6', name: 'Isolation thermique', familleId: '2', description: 'Laine de verre, polystyrène' },
    { id: '7', name: 'Cloisons sèches', familleId: '2', description: 'Plaques de plâtre, rails' },
    // Famille 3: Toitures
    { id: '8', name: 'Tuiles et ardoises', familleId: '3', description: 'Tuiles terre cuite, ardoises' },
    { id: '9', name: 'Charpente bois', familleId: '3', description: 'Poutres, chevrons, liteaux' },
    { id: '10', name: 'Étanchéité toiture', familleId: '3', description: 'Membranes, bitume' }
  ];

  const sousCategories: SousCategorie[] = [
    // Catégorie 2: Parpaings et blocs
    { id: '1', name: 'Parpaings creux', categorieId: '2', description: '15x20x50, 20x20x50' },
    { id: '2', name: 'Parpaings pleins', categorieId: '2', description: 'Blocs pleins béton' },
    { id: '3', name: 'Blocs à bancher', categorieId: '2', description: 'Pour coulage béton' },
    { id: '4', name: 'Blocs de chaînage', categorieId: '2', description: 'U et linteaux' },
    // Catégorie 6: Isolation thermique
    { id: '5', name: 'Laine de verre', categorieId: '6', description: 'Rouleaux et panneaux' },
    { id: '6', name: 'Polystyrène', categorieId: '6', description: 'PSE et XPS' },
    { id: '7', name: 'Laine de roche', categorieId: '6', description: 'Haute performance' }
  ];

  const produits: Produit[] = [
    // Sous-catégorie 1: Parpaings creux
    { id: '1', name: 'Parpaing creux 15x20x50', image: 'https://images.pexels.com/photos/162539/architecture-building-construction-work-162539.jpeg', sousCategorieId: '1', price: 2.45, brand: 'Point P' },
    { id: '2', name: 'Parpaing creux 20x20x50', image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg', sousCategorieId: '1', price: 3.20, brand: 'Point P' },
    { id: '3', name: 'Parpaing creux 15x20x50 NF', image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg', sousCategorieId: '1', price: 2.65, brand: 'Point P' },
    { id: '4', name: 'Parpaing creux 10x20x50', image: 'https://images.pexels.com/photos/162539/architecture-building-construction-work-162539.jpeg', sousCategorieId: '1', price: 1.95, brand: 'Point P' },
    { id: '5', name: 'Parpaing creux 25x20x50', image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg', sousCategorieId: '1', price: 4.10, brand: 'Point P' },
    { id: '6', name: 'Parpaing creux 30x20x50', image: 'https://images.pexels.com/photos/162539/architecture-building-construction-work-162539.jpeg', sousCategorieId: '1', price: 4.85, brand: 'Point P' },
    // Sous-catégorie 5: Laine de verre
    { id: '7', name: 'Laine de verre 100mm', image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg', sousCategorieId: '5', price: 15.90, brand: 'Isover' },
    { id: '8', name: 'Laine de verre 200mm', image: 'https://images.pexels.com/photos/162539/architecture-building-construction-work-162539.jpeg', sousCategorieId: '5', price: 28.50, brand: 'Isover' }
  ];

  const handleFamilleSelect = (famille: Famille) => {
    setSelectedFamille(famille);
    setCurrentStep('categories');
    setSelectedCategorie(null);
    setSelectedSousCategorie(null);
  };

  const handleCategorieSelect = (categorie: Categorie) => {
    setSelectedCategorie(categorie);
    setCurrentStep('sous-categories');
    setSelectedSousCategorie(null);
  };

  const handleSousCategorieSelect = (sousCategorie: SousCategorie) => {
    setSelectedSousCategorie(sousCategorie);
    setCurrentStep('produits');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'categories':
        setCurrentStep('familles');
        setSelectedFamille(null);
        break;
      case 'sous-categories':
        setCurrentStep('categories');
        setSelectedCategorie(null);
        break;
      case 'produits':
        setCurrentStep('sous-categories');
        setSelectedSousCategorie(null);
        break;
    }
  };

  const getProgressStep = () => {
    switch (currentStep) {
      case 'familles': return 1;
      case 'categories': return 2;
      case 'sous-categories': return 3;
      case 'produits': return 4;
      default: return 1;
    }
  };

  // Filtrer les données selon les sélections
  const getFilteredCategories = () => {
    return categories.filter(cat => cat.familleId === selectedFamille?.id);
  };

  const getFilteredSousCategories = () => {
    return sousCategories.filter(sousCat => sousCat.categorieId === selectedCategorie?.id);
  };

  const getFilteredProduits = () => {
    return produits.filter(produit => produit.sousCategorieId === selectedSousCategorie?.id);
  };

  return (
    <div className="navigation-modal-overlay" onClick={onClose}>
      <div className="navigation-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="navigation-header">
          <div className="header-left">
            {currentStep !== 'familles' && (
              <button className="back-button1" onClick={handleBack}>←</button>
            )}
            <h3>Ma bibliothèque : {bibliotheque.name}</h3>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="progress-bar">
          <div className="progress-step">
            <div className={`step-indicator ${getProgressStep() >= 1 ? 'active' : ''}`}>●</div>
            <span className="step-label">Famille</span>
          </div>
          <div className={`progress-line ${getProgressStep() >= 2 ? 'active' : ''}`}></div>
          <div className="progress-step">
            <div className={`step-indicator ${getProgressStep() >= 2 ? 'active' : ''}`}>●</div>
            <span className="step-label">Catégorie</span>
          </div>
          <div className={`progress-line ${getProgressStep() >= 3 ? 'active' : ''}`}></div>
          <div className="progress-step">
            <div className={`step-indicator ${getProgressStep() >= 3 ? 'active' : ''}`}>●</div>
            <span className="step-label">Sous catégorie</span>
          </div>
          <div className={`progress-line ${getProgressStep() >= 4 ? 'active' : ''}`}></div>
          <div className="progress-step">
            <div className={`step-indicator ${getProgressStep() >= 4 ? 'active' : ''}`}>●</div>
            <span className="step-label">Produits</span>
          </div>
        </div>

        <div className="navigation-body">
          {currentStep === 'familles' && (
            <div className="items-grid">
              {familles.map((famille) => (
                <div 
                  key={famille.id}
                  className="item-card famille-card"
                  onClick={() => handleFamilleSelect(famille)}
                >
                  <div className="famille-icon">{famille.icon}</div>
                  <h4>{famille.name}</h4>
                  <p>{famille.description}</p>
                </div>
              ))}
            </div>
          )}

          {currentStep === 'categories' && (
            <div className="items-grid">
              {getFilteredCategories().map((categorie) => (
                <div 
                  key={categorie.id}
                  className="item-card categorie-card"
                  onClick={() => handleCategorieSelect(categorie)}
                >
                  <h4>{categorie.name}</h4>
                  <p>{categorie.description}</p>
                </div>
              ))}
            </div>
          )}

          {currentStep === 'sous-categories' && (
            <div className="items-grid">
              {getFilteredSousCategories().map((sousCategorie) => (
                <div 
                  key={sousCategorie.id}
                  className="item-card sous-categorie-card"
                  onClick={() => handleSousCategorieSelect(sousCategorie)}
                >
                  <h4>{sousCategorie.name}</h4>
                  <p>{sousCategorie.description}</p>
                </div>
              ))}
            </div>
          )}

          {currentStep === 'produits' && (
            <div className="produits-section">
              <div className="produits-header">
                <h3>{selectedSousCategorie?.name}</h3>
                <div className="produits-actions">
                  <div className="search-produits">
                    <input type="text" placeholder="Rechercher un produit" />
                    <span className="search-icon">🔍</span>
                  </div>
                  <button className="filter-button">Trier par</button>
                </div>
              </div>
              
              <div className="produits-grid">
                {getFilteredProduits().map((produit) => (
                  <div key={produit.id} className="produit-card">
                    <div className="produit-image">
                      <img src={produit.image} alt={produit.name} />
                      <button className="favorite-button">♡</button>
                    </div>
                    <div className="produit-info">
                      <h4>{produit.name}</h4>
                      {produit.price && (
                        <div className="produit-price">{produit.price}€</div>
                      )}
                      {produit.brand && (
                        <div className="produit-brand">{produit.brand}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BibliothequeNavigationModal;