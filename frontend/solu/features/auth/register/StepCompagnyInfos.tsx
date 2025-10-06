import React, { useState } from 'react';
import type { AnnonceurData } from './AnnonceurRegistration';
// import { AnnonceurData } from './AnnonceurRegistration';

interface Step2CompanyInfoProps {
  data: AnnonceurData
  onUpdate: (data: Partial<AnnonceurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const howDidYouKnowOptions = [
  'Facebook/Instagram',
  'LinkedIn',
  'Bouche à oreilles',
  'Presse',
  'Google',
  'Salon professionnel',
  'Autre'
];

const Step2CompanyInfo: React.FC<Step2CompanyInfoProps> = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev 
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: keyof AnnonceurData, value: string) => {
    onUpdate({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!data.companyName.trim()) {
      newErrors.companyName = 'La raison sociale est requise';
    }

    if (!data.headquarters.trim()) {
      newErrors.headquarters = 'L\'adresse du siège social est requise';
    }

    if (!data.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!data.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    } else if (!/^[0-9+\-\s()]+$/.test(data.phone)) {
      newErrors.phone = 'Format de téléphone invalide';
    }

    if (!data.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!data.howDidYouKnow) {
      newErrors.howDidYouKnow = 'Veuillez sélectionner une option';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="step-container">
      <h2>Informations entreprise</h2>
      <p className="step-description">
        Renseignez les informations de votre entreprise et vos coordonnées
      </p>

      <div className="form-section">
        <h3>Entreprise</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="companyName">Raison sociale *</label>
            <input
              type="text"
              id="companyName"
              value={data.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Nom de votre entreprise"
              className={errors.companyName ? 'error' : ''}
            />
            {errors.companyName && <span className="error-message">{errors.companyName}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="headquarters">Adresse du siège social *</label>
            <input
              type="text"
              id="headquarters"
              value={data.headquarters}
              onChange={(e) => handleInputChange('headquarters', e.target.value)}
              placeholder="Adresse complète du siège"
              className={errors.headquarters ? 'error' : ''}
            />
            {errors.headquarters && <span className="error-message">{errors.headquarters}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Informations personnelles</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">Prénom *</label>
            <input
              type="text"
              id="firstName"
              value={data.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Votre prénom"
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Nom *</label>
            <input
              type="text"
              id="lastName"
              value={data.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Votre nom"
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Téléphone *</label>
            <input
              type="tel"
              id="phone"
              value={data.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="06 12 34 56 78"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="votre@email.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Comment avez-vous connu Solutravo ?</h3>
        <div className="radio-group">
          {howDidYouKnowOptions.map((option) => (
            <label key={option} className="radio-option">
              <input
                type="radio"
                name="howDidYouKnow"
                value={option}
                checked={data.howDidYouKnow === option}
                onChange={(e) => handleInputChange('howDidYouKnow', e.target.value)}
              />
              <span className="radio-custom"></span>
              <span className="radio-label">{option}</span>
            </label>
          ))}
        </div>
        {errors.howDidYouKnow && <span className="error-message">{errors.howDidYouKnow}</span>}
      </div>

      <div className="step-actions">
        <button className="btn-back" onClick={onPrev}>
          Retour
        </button>
        <button className="btn-continue" onClick={handleContinue}>
          Suivant
        </button>
      </div>
    </div>
  );
};

export default Step2CompanyInfo;