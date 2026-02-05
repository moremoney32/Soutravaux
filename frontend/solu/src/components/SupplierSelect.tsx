


import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { Supplier } from '../data/mockDataPrice';

interface SupplierSelectProps {
  suppliers: Supplier[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onSelectAll: () => void;
}

export const SupplierSelect = ({
  suppliers,
  selectedIds,
  onSelectionChange,
  onSelectAll,
}: SupplierSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ CORRECTION : Recherche uniquement par nom
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="supplier-select-wrapper" ref={dropdownRef}>
      <button
        className="supplier-select-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="supplier-select-label">
          {selectedIds.length === 0
            ? 'Sélectionnez des fournisseurs'
            : `${selectedIds.length} fournisseur${selectedIds.length > 1 ? 's' : ''} sélectionné${selectedIds.length > 1 ? 's' : ''}`}
        </span>
        <ChevronDown size={18} className={`supplier-select-icon ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="supplier-select-dropdown">
          <div className="supplier-select-search">
            <input
              type="text"
              placeholder="Rechercher un fournisseur..."
              className="supplier-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="supplier-select-all">
            <input
              type="checkbox"
              id="select-all-suppliers"
              checked={selectedIds.length === suppliers.length && suppliers.length > 0}
              onChange={onSelectAll}
            />
            <label htmlFor="select-all-suppliers">
              Tout sélectionner ({suppliers.length})
            </label>
          </div>

          <div className="supplier-select-options">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="supplier-select-option"
                onClick={() => handleToggle(supplier.id)}
              >
                <input
                  type="checkbox"
                  id={`supplier-${supplier.id}`}
                  checked={selectedIds.includes(supplier.id)}
                  onChange={() => {}}
                />
                <label htmlFor={`supplier-${supplier.id}`}>
                  {/* ✅ AFFICHAGE SIMPLIFIÉ */}
                  <div className="supplier-select-option-name">{supplier.name}</div>
                  {/* ❌ Email supprimé car n'existe pas */}
                </label>
              </div>
            ))}
            {filteredSuppliers.length === 0 && (
              <div className="supplier-select-empty">Aucun fournisseur trouvé</div>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="supplier-select-selected">
              <div className="supplier-select-selected-label">
                Sélectionnés ({selectedIds.length}):
              </div>
              <div className="supplier-select-selected-items">
                {suppliers
                  .filter((s) => selectedIds.includes(s.id))
                  .map((supplier) => (
                    <div key={supplier.id} className="supplier-select-selected-item">
                      <span>{supplier.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(supplier.id);
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
