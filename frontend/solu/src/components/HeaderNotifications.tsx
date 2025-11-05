import { Bell } from 'lucide-react';
import '../styles/HeaderNotifications.css';
import  solutravo  from "../assets/images/solutravo.png"

const HeaderNotifications = () => {
  return (
    <header className="header_notifications">
      {/* <div className="header-logo_notifications">
        <span className="logo-text_notifications">Solutravo</span>
      </div> */}
      <div className="logo-section">
            <div className="logo">
              <img src={solutravo} alt="Solutravo" className="logo-icon" />
            </div>
            {/* <span className="tagline">Leader BTP France</span> */}
          </div>
      <div className="header-actions_notifications">
        <button className="notification-bell_notifications">
          <Bell size={20} />
          <span className="notification-badge_notifications">3</span>
        </button>
      </div>
    </header>
  );
};

export default HeaderNotifications;
