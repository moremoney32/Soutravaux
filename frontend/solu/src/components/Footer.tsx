import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-background">
        <div className="container">
          <div className="footer-content">
            <div className="footer-main">
              <div className="footer-brand">
                <div className="footer-logo">
                  <img src="/solutravo.png" alt="Solutravo" className="footer-logo-img" />
                </div>
                <h3 className="footer-title">Leader BTP France</h3>
                <p className="footer-description">
                  Révolutionnez votre activité BTP avec la solution digitale 
                  la plus avancée du marché français. Conçue par des professionnels, 
                  pour des professionnels.
                </p>
                <div className="footer-stats">
                  <div className="stat-item">
                    <span className="stat-number">50K+</span>
                    <span className="stat-label">Professionnels</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">1M+</span>
                    <span className="stat-label">Chantiers gérés</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">98%</span>
                    <span className="stat-label">Satisfaction</span>
                  </div>
                </div>
              </div>

              <div className="footer-links">
                <div className="link-column">
                  <h4>Solutions</h4>
                  <ul>
                    <li><a href="#gestion">Gestion de chantiers</a></li>
                    <li><a href="#devis">Devis & Factures</a></li>
                    <li><a href="#planning">Planning intelligent</a></li>
                    <li><a href="#materiaux">Gestion matériaux</a></li>
                  </ul>
                </div>
                <div className="link-column">
                  <h4>Entreprise</h4>
                  <ul>
                    <li><a href="#about">À propos</a></li>
                    <li><a href="#careers">Carrières</a></li>
                    <li><a href="#partners">Partenaires</a></li>
                    <li><a href="#press">Presse</a></li>
                  </ul>
                </div>
                <div className="link-column">
                  <h4>Support</h4>
                  <ul>
                    <li><a href="#help">Centre d'aide</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><a href="#formation">Formation</a></li>
                    <li><a href="#api">Documentation API</a></li>
                  </ul>
                </div>
                <div className="link-column">
                  <h4>Légal</h4>
                  <ul>
                    <li><a href="#privacy">Confidentialité</a></li>
                    <li><a href="#terms">CGU</a></li>
                    <li><a href="#security">Sécurité</a></li>
                    <li><a href="#compliance">Conformité</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="footer-certifications">
                <div className="cert-item">
                  <span className="cert-icon">🔒</span>
                  <span>ISO 27001</span>
                </div>
                <div className="cert-item">
                  <span className="cert-icon">🇫🇷</span>
                  <span>Hébergé en France</span>
                </div>
                <div className="cert-item">
                  <span className="cert-icon">⚡</span>
                  <span>99.9% Uptime</span>
                </div>
                <div className="cert-item">
                  <span className="cert-icon">🏆</span>
                  <span>Prix Innovation BTP 2024</span>
                </div>
              </div>
              
              <div className="footer-copyright">
                <p>&copy; 2024 Solutravo. Tous droits réservés. Leader français de la digitalisation BTP.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;