import { useState } from 'react';
import '../styles/NotificationsView.css';
import PreSocietesTab from './PresocietesTab';
import SocietesTab from './SocietesTab';
import DepartementsTab from './DepartementsTab';

const NotificationsView = () => {
  const [activeSubTab, setActiveSubTab] = useState<'presocietes' | 'societes' | 'departements'>('presocietes');

  return (
    <div className="notifications-view_notifications">
      <div className="subtabs_notifications">
        <button
          className={`subtab-btn_notifications ${activeSubTab === 'presocietes' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('presocietes')}
        >
          Pré-sociétés
        </button>
        <button
          className={`subtab-btn_notifications ${activeSubTab === 'societes' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('societes')}
        >
          Sociétés
        </button>
        <button
          className={`subtab-btn_notifications ${activeSubTab === 'departements' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('departements')}
        >
          Départements
        </button>
      </div>

      <div className="subtab-content_notifications">
        {activeSubTab === 'presocietes' && <PreSocietesTab />}
        {activeSubTab === 'societes' && <SocietesTab />}
        {activeSubTab === 'departements' && <DepartementsTab />}
      </div>
    </div>
  );
};

export default NotificationsView;
