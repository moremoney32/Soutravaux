import { useState } from 'react';
import { mockDepartements } from '../data/mockData';
import '../styles/DepartementsTab.css';
import type { Departement } from '../types';
import NotificationForm from './NotificationForm';

const DepartementsTab = () => {
  const [departements] = useState<Departement[]>(mockDepartements);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = () => {
    if (selectedIds.size === departements.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(departements.map(d => d.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSendNotification = (titre: string, emoji: string, description: string) => {
    const selectedDepartements = departements.filter(d => selectedIds.has(d.id));
    const totalSocietes = selectedDepartements.reduce((sum, d) => sum + d.nombreSocietes, 0);

    console.log('Notification envoyée aux départements:', {
      titre,
      emoji,
      description,
      departements: Array.from(selectedIds),
      totalSocietes
    });

    setSelectedIds(new Set());
    alert(`Notification envoyée avec succès à ${totalSocietes} sociétés dans ${selectedDepartements.length} département(s)!`);
  };

  return (
    <div className="departements-container_notifications">
      <div className="departements-list_notifications">
        <div className="list-header_notifications">
          <h4>Départements</h4>
          <button className="btn-secondary" onClick={handleSelectAll}>
            {selectedIds.size === departements.length ? 'Désélectionner tout' : 'Sélectionner tout'}
          </button>
        </div>

        <div className="departements-grid_notifications">
          {departements.map(departement => {
            const isSelected = selectedIds.has(departement.id);

            return (
              <div
                key={departement.id}
                className={`departement-card_notifications ${isSelected ? 'selected' : ''}`}
              >
                <div className="card-header_notifications">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelect(departement.id)}
                    className="departement-checkbox_notifications"
                  />
                  <h5>{departement.numero} - {departement.nom}</h5>
                </div>
                <div className="card-body_notifications">
                  <p className="societes-count_notifications">
                    {departement.nombreSocietes} société{departement.nombreSocietes > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NotificationForm
        onSend={handleSendNotification}
        selectedCount={selectedIds.size}
      />
    </div>
  );
};

export default DepartementsTab;
