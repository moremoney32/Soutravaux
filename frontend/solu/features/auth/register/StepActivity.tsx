import React from 'react';
import type { AnnonceurData } from './AnnonceurRegistration';
// import { AnnonceurData } from './AnnonceurRegistration';

interface Step1ActivityProps {
  data: AnnonceurData
  onUpdate: (data: Partial<AnnonceurData>) => void;
  onNext: () => void;
   onPrev: () => void;
}

const activities = [
  'Distributeur de matériaux',
  'Equipement de chantier',
  'Formation',
  'Fournitures de bureau',
  'Marketing / Communication',
  'Quincaillerie',
  'Secrétariat',
  'Service aux entreprises',
  'Services informatiques',
  'Autre'
];

const Step1Activity: React.FC<Step1ActivityProps> = ({ data, onUpdate, onNext,onPrev}) => {
  const handleActivitySelect = (activity: string) => {
    onUpdate({ activity });
  };

  const handleContinue = () => {
    if (data.activity) {
      onNext();
    }
  };

  return (
    <div className="step-container">
      <h2>Votre activité</h2>
      <p className="step-description">
        Sélectionnez votre secteur d'activité parmi la liste suivante
      </p>

      <div className="activity-grid">
        {activities.map((activity) => (
          <div
            key={activity}
            className={`activity-card ${data.activity === activity ? 'selected' : ''}`}
            onClick={() => handleActivitySelect(activity)}
          >
            <div className="activity-icon">
              {getActivityIcon(activity)}
            </div>
            <span className="activity-name">{activity}</span>
          </div>
        ))}
      </div>

      <div className="step-actions">
        <button
          className="btn-back"
            onClick={onPrev}
          disabled={!data.activity}
        >
          Retour
        </button>
        <button
          className="btn-continue"
          onClick={handleContinue}
          disabled={!data.activity}
        >
          Continuer
        </button>
      </div>
    </div>
  );
};

const getActivityIcon = (activity: string): string => {
  const icons: { [key: string]: string } = {
    'Distributeur de matériaux': '🏗️',
    'Equipement de chantier': '🚧',
    'Formation': '📚',
    'Fournitures de bureau': '📋',
    'Marketing / Communication': '📢',
    'Quincaillerie': '🔧',
    'Secrétariat': '📝',
    'Service aux entreprises': '🏢',
    'Services informatiques': '💻',
    'Autre': '📦'
  };
  return icons[activity] || '📦';
};

export default Step1Activity;