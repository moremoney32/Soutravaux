
import React, { useState, useEffect } from 'react';

interface ConfirmationPopupProps {
  bibliothequeName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  bibliothequeName,
  onCancel
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleConfirm = () => {
    setShowSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Styles avec animations CSS
  const animationStyles = `
    @keyframes slideInUp {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes slideOutDown {
      0% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes scaleInBounce {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.95);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;

  return (
    <>
      <style>{animationStyles}</style>
      <div 
        style={{
          ...styles.overlay,
          animation: isClosing ? 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={showSuccess ? handleClose : undefined}
      >
        <div 
          style={{
            ...styles.popup,
            animation: isClosing ? 'slideOutDown 0.3s cubic-bezier(0.4, 0, 1, 1)' : 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {!showSuccess ? (
            <>
              <div style={styles.header}>
                <h3 style={styles.title}>Demande d'accès</h3>
              </div>
              
              <div style={styles.body}>
                <div style={styles.iconContainer}>
                  <span style={styles.icon}>📚</span>
                </div>
                <p style={styles.message}>
                  Voulez-vous demander l'accès à la bibliothèque
                  <strong style={styles.libraryName}> {bibliothequeName}</strong> ?
                </p>
              </div>
              
              <div style={styles.footer}>
                <button 
                  style={{...styles.button, ...styles.cancelButton}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.backgroundColor = '#e8e8e8';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={handleClose}
                >
                  Annuler
                </button>
                <button 
                  style={{...styles.button, ...styles.confirmButton}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.backgroundColor = '#d0611f';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = '#E77131';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={handleConfirm}
                >
                  Valider
                </button>
              </div>
            </>
          ) : (
            <div style={styles.successContainer}>
              <div style={{
                ...styles.successIconContainer,
                animation: 'scaleInBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}>
                <span style={styles.successIcon}>✓</span>
              </div>
              <h3 style={styles.successTitle}>Demande envoyée avec succès !</h3>
              <p style={styles.successMessage}>
                Vous recevrez une notification lorsque ce fournisseur aura accepté votre demande.
              </p>
              <button 
                style={{...styles.button, ...styles.closeButton}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.backgroundColor = '#d0611f';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = '#E77131';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={handleClose}
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    maxWidth: '380px',
    width: '90%',
  },
  header: {
    padding: '18px 20px 12px',
    borderBottom: '1px solid #e0e0e0',
    justifyContent:"center",
    display:"flex"
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#505050',
    fontFamily: "'Montserrat', sans-serif",
  },
  body: {
    padding: '24px 20px',
    textAlign: 'center' as const,
  },
  iconContainer: {
    marginBottom: '16px',
  },
  icon: {
    fontSize: '2.5rem',
  },
  message: {
    fontSize: '0.95rem',
    color: '#505050',
    margin: 0,
    lineHeight: 1.5,
    fontFamily: "'Montserrat', sans-serif",
  },
  libraryName: {
    color: '#E77131',
    fontWeight: 700,
  },
  footer: {
    padding: '12px 20px 20px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Montserrat', sans-serif",
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#505050',
  },
  confirmButton: {
    backgroundColor: '#E77131',
    color: 'white',
  },
  successContainer: {
    padding: '36px 20px',
    textAlign: 'center' as const,
  },
  successIconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  successIcon: {
    fontSize: '2.2rem',
    color: 'white',
    fontWeight: 'bold',
  },
  successTitle: {
    margin: '0 0 12px',
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#505050',
    fontFamily: "'Montserrat', sans-serif",
  },
  successMessage: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0 0 24px',
    lineHeight: 1.5,
    fontFamily: "'Montserrat', sans-serif",
  },
  closeButton: {
    maxWidth: '160px',
    margin: '0 auto',
    backgroundColor: '#E77131',
    color: 'white',
  },
};

export default ConfirmationPopup;

