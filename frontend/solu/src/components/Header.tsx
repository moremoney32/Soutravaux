import React from 'react';
import type { Subscription } from '../types/subscription';
import  solutravo  from "../assets/images/solutravo.png"
import '../styles/Header.css';

interface HeaderProps {
  isAdminMode: boolean;
  onToggleAdmin: () => void;
  currentSubscription: Subscription | null;
  userType: string | null;
}

const Header: React.FC<HeaderProps> = ({ isAdminMode, onToggleAdmin, currentSubscription, userType }) => {
    console.log("Current Subscription in Header:", currentSubscription);
    console.log(userType)
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <img src={solutravo} alt="Solutravo" className="logo-icon" />
            </div>
            <span className="tagline">Leader BTP France</span>
          </div>
          
          <nav className="navigation">
            {currentSubscription && (
              <div className="subscription-status">
                <span className="status-badge">
                  Abonné • {currentSubscription.name}
                </span>
              </div>
            )}
            
         {/* <button 
              className={`admin-toggle ${isAdminMode ? 'active' : ''}`}
              onClick={onToggleAdmin}
            >
              <span className="toggle-icon">⚙️</span>
              {isAdminMode ? 'Mode Utilisateur' : 'Mode Admin'}
            </button>  */}
            {/* Bouton admin visible uniquement si userType = admin */}
             {userType === "admin" && (
              <button 
                className={`admin-toggle ${isAdminMode ? "active" : ""}`}
                onClick={onToggleAdmin}
              >
                <span className="toggle-icon">⚙️</span>
                {isAdminMode ? "Mode Utilisateur" : "Mode Admin"}
              </button>
            )} 
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;