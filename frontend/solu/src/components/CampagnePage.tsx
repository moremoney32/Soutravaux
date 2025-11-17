
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeaderCampagne from './HeaderCampagne';
import SidebarCampagne from './SidebarCampagne';
import StepperCampagne from './StepperCampagne';
import Etape1Nom from './Etape1Nom';
import Etape2Contacts from './Etape2Contacts';
import Etape3Message from './Etape3Message';
import Etape4Planification from './Etape4Planification';
import Etape5Resume from './Etape5Resume';
import CampagnesListFiltres from './CampagnesListFiltres';
import '../styles/campagne.css';
import '../styles/filtres-campagne.css';
import type { CampagneData } from '../types/campagne.types';

const CampagnePage = () => {
  const [etapeActuelle, setEtapeActuelle] = useState<number>(1);
   const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [showFiltres, setShowFiltres] = useState<boolean>(false);
  const [campagneData, setCampagneData] = useState<CampagneData>({
    nom: "",
    marketingPurpose: false,
    contacts: [],
    contactsValides: 0,
    expediteur: '',
    message: '',
    messageLength: 0,
    smsCount: 0,
    planification: {
      type: 'differe',
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toTimeString().slice(0, 5),
    },
  });

  const handleSuivant = () => {
        if (etapeActuelle < 5) {
            setDirection('next');
            setEtapeActuelle(etapeActuelle + 1);
        }
    };

    const handlePrecedent = () => {
        if (etapeActuelle > 1) {
            setDirection('prev');
            setEtapeActuelle(etapeActuelle - 1);
        }
    };

  const handleUpdateData = (data: Partial<CampagneData>) => {
    setCampagneData({ ...campagneData, ...data });
  };

  const handleCreerCampagne = () => {
    console.log('Création de la campagne:', campagneData);
    alert('Campagne créée avec succès !');
    setEtapeActuelle(1);
    setShowFiltres(false);
  };

  const handleShowFiltres = () => {
    setShowFiltres(true);
  };

  const handleShowCreate = () => {
    setShowFiltres(false);
    setEtapeActuelle(1)
  };

   // Variants pour les animations
    const variants = {
        enter: (direction: 'next' | 'prev') => ({
            x: direction === 'next' ? 30 : -30,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: 'next' | 'prev') => ({
            x: direction === 'next' ? -30 : 30,
            opacity: 0,
        }),
    };

  const renderEtape = () => {
    switch (etapeActuelle) {
      case 1:
        return (
          <Etape1Nom
            data={campagneData}
            onUpdate={handleUpdateData}
            onSuivant={handleSuivant}
          />
        );
      case 2:
        return (
          <Etape2Contacts
            data={campagneData}
            onUpdate={handleUpdateData}
            onSuivant={handleSuivant}
            onPrecedent={handlePrecedent}
          />
        );
      case 3:
        return (
          <Etape3Message
            data={campagneData}
            onUpdate={handleUpdateData}
            onSuivant={handleSuivant}
            onPrecedent={handlePrecedent}
          />
        );
      case 4:
        return (
          <Etape4Planification
            data={campagneData}
            onUpdate={handleUpdateData}
            onSuivant={handleSuivant}
            onPrecedent={handlePrecedent}
          />
        );
      case 5:
        return (
          <Etape5Resume
            data={campagneData}
            onPrecedent={handlePrecedent}
            onCreer={handleCreerCampagne}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-campagne">
      <SidebarCampagne />
      
      <div className="main-content-campagne">
        <HeaderCampagne />
        
        <div className="container-campagne">
          <AnimatePresence mode="wait">
            {showFiltres ? (
              // MODE FILTRES
              <motion.div
                key="filtres-mode"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CampagnesListFiltres onCreateCampagne={handleShowCreate} />
              </motion.div>
            ) : (
              // MODE CRÉATION
              <motion.div
                key="create-mode"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* HEADER AVEC TITRE + BOUTON FILTRER */}
                <div className="header-create-campagne">
                  <h2 className="title-campagne">Créer une campagne</h2>
                  {etapeActuelle === 1 && (
                    <button 
                      className="btn-filtrer-campagnes"
                      onClick={handleShowFiltres}
                    >
                      <i className="fa-solid fa-filter"></i>
                      Filtrer mes campagnes
                    </button>
                  )}
                </div>
                
                <StepperCampagne etapeActuelle={etapeActuelle} />
                
                <div className="content-wrapper-campagne">
                    <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={etapeActuelle}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: 'spring', stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.3 },
                                }}
                            >
                                {renderEtape()}
                            </motion.div>
                        </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CampagnePage;