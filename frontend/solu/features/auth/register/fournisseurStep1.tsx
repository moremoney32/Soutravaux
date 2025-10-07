import React from 'react';
import type { FournisseurData } from './FournisseurRegistration';
interface Step1SectorProps {
  data: FournisseurData;
  onUpdate: (data: Partial<FournisseurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const sectors = [
  { id: 'isolation', name: 'Isolation', icon: '🏠', description: 'Matériaux et solutions d\'isolation' },
  { id: 'chauffage', name: 'Chauffage', icon: '🔥', description: 'Systèmes de chauffage et climatisation' },
  { id: 'negoce', name: 'Négoce/Distributeur', icon: '🏗️', description: 'Distribution de matériaux BTP' },
  { id: 'menuiseries', name: 'Menuiseries', icon: '🚪', description: 'Portes, fenêtres et menuiseries' },
  { id: 'quincaillerie', name: 'Quincaillerie', icon: '🔧', description: 'Outillage et quincaillerie pro' },
  { id: 'autres', name: 'Autres', icon: '📦', description: 'Autre secteur d\'activité' }
];

const Step1Sector: React.FC<Step1SectorProps> = ({ data, onUpdate, onNext,onPrev }) => {
  const handleSectorSelect = (sectorId: string) => {
    onUpdate({ sector: sectorId });
    if (sectorId !== 'autres') {
      onUpdate({ customSector: '' });
    }
  };

  const handleCustomSectorChange = (value: string) => {
    onUpdate({ customSector: value });
  };

  const handleContinue = () => {
    if (data.sector && (data.sector !== 'autres' || data.customSector?.trim())) {
      onNext();
    }
  };

  const isValid = data.sector && (data.sector !== 'autres' || data.customSector?.trim());

  return (
    <div className="step-container1">
      <div className="step-header">
        <h2>Votre secteur d'activité</h2>
        <p className="step-description">
          Sélectionnez votre domaine d'expertise pour nous permettre de vous orienter 
          vers le bon conseiller Solutravo
        </p>
      </div>
      <div className="sectors-grid">
        {sectors.map((sector, index) => (
          <div
            key={sector.id}
            className={`sector-card ${data.sector === sector.id ? 'selected' : ''}`}
            onClick={() => handleSectorSelect(sector.id)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="sector-icon">{sector.icon}</div>
            <h3 className="sector-name">{sector.name}</h3>
            <p className="sector-description">{sector.description}</p>
         {/* <div className="sector-overlay">
              <div className="check-icon">✓</div>
            </div>  */}
          </div>
        ))}
      </div>

      {data.sector === 'autres' && (
        <div className="custom-sector-input">
          <label htmlFor="customSector">Précisez votre secteur d'activité :</label>
          <input
            type="text"
            id="customSector"
            value={data.customSector || ''}
            onChange={(e) => handleCustomSectorChange(e.target.value)}
            placeholder="Décrivez votre activité..."
            className="custom-input"
          />
        </div>
      )}

      <div className="step-actions">
        {/* Bouton Retour */}
        {onPrev && (
          <button
            className="btn-back"
            onClick={onPrev}
          >
             Retour
          </button>
        )}
        
        {/* Bouton Continuer */}
        <button
          className="btn-continue"
          onClick={handleContinue}
          disabled={!isValid}
        >
          Continuer
        </button>
      </div>
    </div>
  );
};

export default Step1Sector;



