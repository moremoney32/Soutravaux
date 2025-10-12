import React from 'react';
import '../styles/SideBarBibliotheques.css';
import solutravo from "../assets/images/solutravo.png"

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: '📊', label: 'Tableau de bord', active: false },
    { icon: '📅', label: 'Agenda', active: false },
    { icon: '👥', label: 'Clients', active: false },
    { icon: '📋', label: 'Tâches', active: false },
    { icon: '💬', label: 'Messages', active: false }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src={solutravo} alt="SOLUTRAVO" className="logo-img" />
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-label">Pilotez</div>
          {menuItems.map((item, index) => (
            <div key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;