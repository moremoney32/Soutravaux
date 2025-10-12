
import React from 'react';
import "../styles/HeaderBibliotheques.css"

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="breadcrumb">
          <span className="breadcrumb-icon">📚</span>
          <span className="breadcrumb-text">Catalogues / Bibliothèques</span>
        </div>
      </div>
      
      <div className="header-right">
        {/* <div className="search-container">
          <input 
            type="text" 
            placeholder="Search here..." 
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div> */}
        
        <div className="notifications">
          <span className="notification-icon">🔔</span>
          <span className="notification-badge">1</span>
        </div>
        
        <div className="user-profile">
          <span className="user-text">Ma Société</span>
          <span className="user-subtext">Connecté</span>
          <div className="user-avatar">DM</div>
        </div>
      </div>
    </header>
  );
};

export default Header;