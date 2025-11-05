import { Bell, BarChart3, MessageSquare } from 'lucide-react';
import '../styles/SideBarNotification.css';

interface SidebarNotificationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SideBarNotification = ({ activeTab, onTabChange }: SidebarNotificationProps) => {
  return (
    <aside className="sidebar_notifications">
      <nav className="sidebar-nav_notifications">
        <button
          className={`sidebar-item_notifications ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => onTabChange('notifications')}
        >
          <Bell size={20} />
          <span>Notifications</span>
        </button>
        <button
          className={`sidebar-item_notifications ${activeTab === 'statistiques' ? 'active' : ''}`}
          onClick={() => onTabChange('statistiques')}
        >
          <BarChart3 size={20} />
          <span>Statistiques</span>
        </button>
        <button
          className={`sidebar-item_notifications ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => onTabChange('messages')}
        >
          <MessageSquare size={20} />
          <span>Messages</span>
        </button>
      </nav>
    </aside>
  );
};

export default SideBarNotification;
