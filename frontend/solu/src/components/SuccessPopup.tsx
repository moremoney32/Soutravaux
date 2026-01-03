import { useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/success-popup.css';

interface SuccessPopupProps {
  message: string;
  onClose: () => void;
  autoCloseDuration?: number; // en millisecondes
}

const SuccessPopup = ({ 
  message, 
  onClose, 
  autoCloseDuration = 4000 
}: SuccessPopupProps) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [autoCloseDuration, onClose]);

  return (
    <motion.div
      className="success-popup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="success-popup-container"
        initial={{ scale: 0.8, y: -20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 20, opacity: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icône de succès avec animation */}
        <motion.div
          className="success-icon-wrapper"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.2, 
            type: "spring", 
            stiffness: 200 
          }}
        >
          <div className="success-icon">
            <motion.svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <motion.path
                d="M 25 40 L 35 50 L 55 30"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              />
            </motion.svg>
          </div>
        </motion.div>

        {/* Message */}
        <motion.h3
          className="success-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Succès !
        </motion.h3>

        <motion.p
          className="success-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {message}
        </motion.p>

        {/* Barre de progression */}
        <motion.div
          className="success-progress-bar"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ 
            duration: autoCloseDuration / 1000, 
            ease: "linear" 
          }}
        />

        {/* Bouton fermer optionnel */}
        <button 
          className="success-close-btn"
          onClick={onClose}
          aria-label="Fermer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SuccessPopup;