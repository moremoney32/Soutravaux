

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeaderCampagne from './HeaderCampagne';
// import SidebarCampagne from './SidebarCampagne';
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
// import {useNavigate } from 'react-router-dom';


const CampagnePage = () => {
  // const navigate = useNavigate()
  let membreId = localStorage.getItem("membreId")
  let userId = Number(membreId)
  console.log(userId)
  
  const [etapeActuelle, setEtapeActuelle] = useState<number>(1);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  
  // PAR DÉFAUT : MODE LISTE (showFiltres = true)
  const [showFiltres, setShowFiltres] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
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

  const formaterPayloadPourAPI = (data: CampagneData) => {
    const maintenant = new Date();
    
    const payload: any = {
      name: data.nom,
      message: data.message,
      links: data.links || [],
      sender: data.expediteur,
      societe_id: userId,
      sent_at: data.planification.type === 'differe' ? 'later' : 'now',
    };

    if (data.contactType === 'manuelle') {
      payload.contacts = data.contacts;
      payload.list_contact_id = null;
    } else if (data.contactType === 'enregistres') {
      payload.list_contact_id = data.list_contact_id;
      payload.contacts = null;
    }

    if (data.planification.type === 'differe') {
      const datePlanifiee = new Date(`${data.planification.date}T${data.planification.heure}`);
      
      if (datePlanifiee <= maintenant) {
        throw new Error("La date de planification doit être dans le futur");
      }
      
      payload.scheduled_at = datePlanifiee.toISOString().slice(0, 16);
    } else {
      const dateDansLeFutur = new Date(maintenant.getTime() + 60000);
      payload.scheduled_at = dateDansLeFutur.toISOString().slice(0, 16);
    }

    return payload;
  };

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
    try {
      const payloadAPI = formaterPayloadPourAPI(campagneData);
      console.log('Payload pour l\'API:', payloadAPI);
      setIsLoading(true);
      
      fetch('https://backendstaging.solutravo-compta.fr/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(payloadAPI)
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(JSON.stringify(err)) });
        }
        return response.json();
      })
      .then(data => {
        console.log('Succès:', data);
        alert('Campagne créée avec succès !');
        
        // Retour à la liste des campagnes
        setShowFiltres(true);
        // setEtapeActuelle(1);
       
        
        // Réinitialiser les données
        setCampagneData({
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
            heure: new Date().toTimeString().slice(0, 5)
          }
        });
      //   setTimeout(() => {
      //   navigate(`/campagne/${userId}`);
      // }, 500);
      setTimeout(() => {
        window.location.href = `/campagne/${userId}`;
      }, 500);
      })
      .catch(error => {
        console.error('Erreur API:', error);
        try {
          const errorData = JSON.parse(error.message);
          alert(`Erreur: ${errorData.message || 'Une erreur est survenue'}`);
        } catch {
          alert(`Erreur: ${error.message}`);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
      
    } catch (error: any) {
      console.error('Erreur de validation:', error);
      alert(error.message);
    }
  };

  // Passer en mode création
  const handleShowCreate = () => {
    setShowFiltres(false);
    setEtapeActuelle(1);
  };

  // Retour à la liste
  const handleShowFiltres = () => {
    setShowFiltres(true);
  };

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
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-campagne">
      {/* <SidebarCampagne /> */}
      
      <div className="main-content-campagne">
        <HeaderCampagne />
        
        <div className="container-campagne">
          <AnimatePresence mode="wait">
            {showFiltres ? (
              // MODE LISTE/FILTRES (PAR DÉFAUT)
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
                <div className="header-create-campagne">
                  <h5 className="title-campagne">Créer une campagne</h5>
                  <button 
                    className="btn-filtrer-campagnes"
                    onClick={handleShowFiltres}
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                    Retour à mes campagnes
                  </button>
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