import { useState, useEffect } from 'react';
import { mockPreSocietes } from '../data/mockData';
import NotificationForm from './NotificationForm';
import '../styles/PreSocietesTab.css';
import type { PreSociete } from '../types';

const PreSocietesTab = () => {
  const [preSocietes, setPreSocietes] = useState<PreSociete[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const filtered = mockPreSocietes.filter(ps => {
      const hoursSinceCreation = (Date.now() - ps.dateCreation.getTime()) / (1000 * 60 * 60);
      return hoursSinceCreation >= 24;
    });

    const sorted = filtered.sort((a, b) => {
      if (a.notificationEnvoyee !== b.notificationEnvoyee) {
        return a.notificationEnvoyee ? 1 : -1;
      }
      return b.dateCreation.getTime() - a.dateCreation.getTime();
    });

    setPreSocietes(sorted);
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.size === preSocietes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(preSocietes.map(ps => ps.id)));
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
    console.log('Notification envoyée:', { titre, emoji, description, destinataires: Array.from(selectedIds) });

    const updatedPreSocietes = preSocietes.map(ps => {
      if (selectedIds.has(ps.id)) {
        return { ...ps, notificationEnvoyee: true };
      }
      return ps;
    });

    const sorted = updatedPreSocietes.sort((a, b) => {
      if (a.notificationEnvoyee !== b.notificationEnvoyee) {
        return a.notificationEnvoyee ? 1 : -1;
      }
      return b.dateCreation.getTime() - a.dateCreation.getTime();
    });

    setPreSocietes(sorted);
    setSelectedIds(new Set());
    alert('Notification envoyée avec succès!');
  };

  return (
    <div className="presocietes-container_notifications">
      <div className="presocietes-list_notifications">
        <div className="list-header_notifications">
          <h4>Pré-sociétés (+ de 24h)</h4>
          <button className="btn-secondary" onClick={handleSelectAll}>
            {selectedIds.size === preSocietes.length ? 'Désélectionner tout' : 'Sélectionner tout'}
          </button>
        </div>

        <div className="presocietes-grid_notifications">
          {preSocietes.map(preSociete => {
            const isNew = !preSociete.notificationEnvoyee;
            const isSelected = selectedIds.has(preSociete.id);

            return (
              <div
                key={preSociete.id}
                className={`presociete-card_notifications ${isNew ? 'new' : 'notified'} ${isSelected ? 'selected' : ''}`}
              >
                <div className="card-header_notifications">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelect(preSociete.id)}
                    className="presociete-checkbox_notifications"
                  />
                  <h5>{preSociete.nom}</h5>
                </div>
                <div className="card-body_notifications">
                  <p className="email_notifications">{preSociete.email}</p>
                  <p className="date_notifications">
                    Créé le {preSociete.dateCreation.toLocaleDateString('fr-FR')}
                  </p>
                  {preSociete.notificationEnvoyee && (
                    <span className="badge-notified_notifications">Notifié</span>
                  )}
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

export default PreSocietesTab;
