// src/components/CustomSelect.tsx

import React, { useState, useRef, useEffect } from 'react';
import '../styles/customSelect.css';

interface Option {
  code: string;
  nom: string;
  population?: number;
}

interface CustomSelectProps {
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  showSelectAll?: boolean;
  icon?: string;
  showPopulation?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner',
  multiple = false,
  disabled = false,
  loading = false,
  showSelectAll = false,
  icon = 'fas fa-chevron-down',
  showPopulation = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus sur l'input de recherche quand on ouvre
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filtrer les options selon la recherche
  const filteredOptions = options.filter(option =>
    option.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer la sélection
  const handleSelect = (optionCode: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionCode)
        ? currentValues.filter(v => v !== optionCode)
        : [...currentValues, optionCode];
      onChange(newValues);
    } else {
      onChange(optionCode);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Sélectionner tout
  const handleSelectAll = () => {
    if (Array.isArray(value) && value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.code));
    }
  };

  // Obtenir le texte affiché
  const getDisplayText = () => {
    if (loading) return 'Chargement...';
    
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find(opt => opt.code === value[0]);
        return option?.nom || placeholder;
      }
      return `${value.length} sélectionné(s)`;
    }

    if (!multiple && value) {
      const option = options.find(opt => opt.code === value);
      return option?.nom || placeholder;
    }

    return placeholder;
  };

  // Vérifier si une option est sélectionnée
  const isSelected = (optionCode: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionCode);
    }
    return value === optionCode;
  };

  return (
    <div className={`custom-select ${disabled ? 'custom-select-disabled' : ''}`} ref={dropdownRef}>
      {/* Input principal */}
      <div
        className={`custom-select-trigger ${isOpen ? 'custom-select-trigger-open' : ''}`}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
      >
        <span className="custom-select-value">{getDisplayText()}</span>
        <i className={`${icon} custom-select-icon ${isOpen ? 'custom-select-icon-open' : ''}`}></i>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && !loading && (
        <div className="custom-select-dropdown">
          {/* Barre de recherche */}
          <div className="custom-select-search">
            <i className="fas fa-search custom-select-search-icon"></i>
            <input
              ref={searchInputRef}
              type="text"
              className="custom-select-search-input"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Checkbox "Tout sélectionner" */}
          {showSelectAll && multiple && (
            <div className="custom-select-all" onClick={handleSelectAll}>
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.length === options.length && options.length > 0}
                onChange={() => {}}
                className="custom-select-checkbox"
              />
              <span>Tout sélectionner ({options.length})</span>
            </div>
          )}

          {/* Liste des options */}
          <div className="custom-select-options">
            {filteredOptions.length === 0 ? (
              <div className="custom-select-no-results">Aucun résultat</div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.code}
                  className={`custom-select-option ${isSelected(option.code) ? 'custom-select-option-selected' : ''}`}
                  onClick={() => handleSelect(option.code)}
                >
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={isSelected(option.code)}
                      onChange={() => {}}
                      className="custom-select-checkbox"
                    />
                  )}
                  <div className="custom-select-option-content">
                    <span className="custom-select-option-name">{option.nom}</span>
                    {showPopulation && option.population && (
                      <span className="custom-select-option-info">
                        {(option.population / 1000).toFixed(0)}k hab
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;