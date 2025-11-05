import { useState } from 'react';
import '../styles/DasboardNotifications.css';
import HeaderNotifications from './HeaderNotifications';
import SideBarNotification from './SideBarNotification';
import NotificationsView from './NotificationsView';

function DasboardNotifications() {
  const [activeTab, setActiveTab] = useState<string>('notifications');

  return (
    <div className="dashboard_notifications">
      <HeaderNotifications />
      <SideBarNotification activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="dashboard-content_notifications">
        <main className="main-content_notifications">
          {activeTab === 'notifications' && <NotificationsView/>}
          {activeTab === 'statistiques' && (
            <div className="placeholder-view_notifications">
              <div className="placeholder-content_notifications">
                <h3>Statistiques</h3>
                <p>Cette section affichera les statistiques des abonnements.</p>
              </div>
            </div>
          )}
          {activeTab === 'messages' && (
            <div className="placeholder-view_notifications">
              <div className="placeholder-content_notifications">
                <h3>Messages</h3>
                <p>Cette section affichera les messages reçus entre l'admin et les utilisateurs.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DasboardNotifications;
