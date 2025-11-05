import { useState } from 'react';
import { mockSocietes } from '../data/mockData';
import NotificationForm from './NotificationForm';
import '../styles/SocietesTab.css';
import type { Societe } from '../types';

const SocietesTab = () => {
  const [societes, setSocietes] = useState<Societe[]>(mockSocietes);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = () => {
    if (selectedIds.size === societes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(societes.map(s => s.id)));
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
    console.log('Notification envoyée aux sociétés:', { titre, emoji, description, destinataires: Array.from(selectedIds) });

    const updatedSocietes = societes.filter(s => !selectedIds.has(s.id));
    setSocietes(updatedSocietes);
    setSelectedIds(new Set());
    alert('Notification envoyée avec succès! Les sociétés ont été retirées de la liste.');
  };

  return (
    <div className="societes-container_notifications">
      <div className="societes-list_notifications">
        <div className="list-header_notifications">
          <h4>Sociétés</h4>
          <button className="btn-secondary" onClick={handleSelectAll}>
            {selectedIds.size === societes.length ? 'Désélectionner tout' : 'Sélectionner tout'}
          </button>
        </div>

        <div className="societes-grid_notifications">
          {societes.map(societe => {
            const isSelected = selectedIds.has(societe.id);

            return (
              <div
                key={societe.id}
                className={`societe-card_notifications ${isSelected ? 'selected_notifications' : ''}`}
              >
                <div className="card-header_notifications">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelect(societe.id)}
                    className="societe-checkbox_notifications"
                  />
                  <h5>{societe.nom}</h5>
                </div>
                <div className="card-body_notifications">
                  <p className="email_notifications">{societe.email}</p>
                  {/* <p className="artisans_notifications">{societe.artisans} artisan{societe.artisans > 1 ? 's' : ''}</p> */}
                </div>
              </div>
            );
          })}
        </div>

        {societes.length === 0 && (
          <div className="empty-state_notifications">
            <p>Aucune société disponible</p>
          </div>
        )}
      </div>

      <NotificationForm
        onSend={handleSendNotification}
        selectedCount={selectedIds.size}
      />
    </div>
  );
};

export default SocietesTab;
