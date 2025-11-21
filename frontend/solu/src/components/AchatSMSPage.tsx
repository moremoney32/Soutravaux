

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import StepperAchatSMS from './StepperAchatSMS';
// import Etape1SelectionPack from './Etape1SelectionPack';
// import Etape2Confirmation from './Etape2Confirmation';
// import '../styles/achat-sms.css';
// import type { AchatSMSData } from '../types/campagne.types';
// import { getUserCredits } from '../services/achatsServices';
// import SidebarCampagne from './SidebarCampagne';
// import HeaderCampagne from './HeaderCampagne';
// import { useMembreId } from '../hooks/useMembreId';

// const AchatSMSPage = () => {
//   const navigate = useNavigate();
//   const [etapeActuelle, setEtapeActuelle] = useState<number>(1);
//   const [direction, setDirection] = useState<'next' | 'prev'>('next');
//   const [isLoadingUserData, setIsLoadingUserData] = useState(true);

//  const MEMBRE_ID = useMembreId();

//   // Données d'achat avec des données mockées par défaut
//   const [achatData, setAchatData] = useState<AchatSMSData>({
//     selectedPack: null,
//     billingData: {
//       email: '',
//       entreprise: '',
//       prenom: '',
//       nom: '',
//       telephone: '',
//       adresse: '',
//       complement: '',
//       ville: '',
//       codePostal: '',
//       pays: '',
//       numeroTVA: '',
//     },
//   });

//   // Récupérer les données de l'utilisateur au chargement
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         setIsLoadingUserData(true);
//         const data = await getUserCredits(MEMBRE_ID);

//         // Mettre à jour les données de facturation avec les vraies données
//         setAchatData(prev => ({
//           ...prev,
//           billingData: {
//             email: data.societe.email,
//             entreprise: data.societe.nom,
//             prenom: data.membre_prenom,
//             nom: data.membre_nom,
//             telephone: data.membre_phone || '',
//             adresse: '', // Pas disponible dans l'API
//             complement: '',
//             ville: data.societe.ville,
//             codePostal: data.societe.code_postal,
//             pays: data.societe.pays,
//             numeroTVA: data.societe.tva,
//           },
//         }));
//       } catch (error) {
//         console.error('Erreur lors du chargement des données utilisateur:', error);
//         // Garder les données mockées en cas d'erreur
//       } finally {
//         setIsLoadingUserData(false);
//       }
//     };

//     fetchUserData();
//   }, []);

//   const handleSuivant = () => {
//     if (etapeActuelle < 2) {
//       setDirection('next');
//       setEtapeActuelle(etapeActuelle + 1);
//     }
//   };

//   const handlePrecedent = () => {
//     if (etapeActuelle > 1) {
//       setDirection('prev');
//       setEtapeActuelle(etapeActuelle - 1);
//     }
//   };

//   const handleUpdateData = (data: Partial<AchatSMSData>) => {
//     setAchatData({ ...achatData, ...data });
//   };

//   const handleRetourCampagnes = () => {
//     navigate('/campagne');
//   };

//   const variants = {
//     enter: (direction: 'next' | 'prev') => ({
//       x: direction === 'next' ? 30 : -30,
//       opacity: 0,
//     }),
//     center: {
//       x: 0,
//       opacity: 1,
//     },
//     exit: (direction: 'next' | 'prev') => ({
//       x: direction === 'next' ? -30 : 30,
//       opacity: 0,
//     }),
//   };

//   const renderEtape = () => {
//     if (isLoadingUserData) {
//       return (
//         <div className="loading-container">
//           <i className="fa-solid fa-spinner fa-spin"></i>
//           <p>Chargement des informations...</p>
//         </div>
//       );
//     }

//     switch (etapeActuelle) {
//       case 1:
//         return (
//           <Etape1SelectionPack
//             data={achatData}
//             onUpdate={handleUpdateData}
//             onSuivant={handleSuivant}
//           />
//         );
//       case 2:
//         return <Etape2Confirmation data={achatData} onPrecedent={handlePrecedent} membreId={MEMBRE_ID}/>;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="page-achat-sms">
//       <SidebarCampagne />

//       <div className="main-content-achat-sms">
//         <HeaderCampagne />

//         <div className="container-achat-sms">
//           <div className="header-achat-sms">
//             <h2 className="title-achat-sms">Acheter des SMS</h2>
//             <button className="btn-retour-campagnes" onClick={handleRetourCampagnes}>
//               <i className="fa-solid fa-arrow-left"></i>
//               Retour aux campagnes
//             </button>
//           </div>

//           <StepperAchatSMS etapeActuelle={etapeActuelle} />

//           <div className="content-wrapper-achat-sms">
//             <AnimatePresence mode="wait" custom={direction}>
//               <motion.div
//                 key={etapeActuelle}
//                 custom={direction}
//                 variants={variants}
//                 initial="enter"
//                 animate="center"
//                 exit="exit"
//                 transition={{
//                   x: { type: 'spring', stiffness: 300, damping: 30 },
//                   opacity: { duration: 0.3 },
//                 }}
//               >
//                 {renderEtape()}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AchatSMSPage;

// src/components/achat-sms/AchatSMSPage.tsx - AVEC ID DYNAMIQUE

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StepperAchatSMS from './StepperAchatSMS';
import Etape1SelectionPack from './Etape1SelectionPack';
import Etape2Confirmation from './Etape2Confirmation';

import '../styles/achat-sms.css';
import { useMembreId } from '../hooks/useMembreId';
import type { AchatSMSData } from '../types/campagne.types';
import { getUserCredits } from '../services/achatsServices';
// import SidebarCampagne from './SidebarCampagne';
import HeaderCampagne from './HeaderCampagne';

const AchatSMSPage = () => {
  const navigate = useNavigate();
  const membreId = useMembreId(); // ID DYNAMIQUE depuis l'URL
  
  const [etapeActuelle, setEtapeActuelle] = useState<number>(1);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // Données d'achat avec des données mockées par défaut
  const [achatData, setAchatData] = useState<AchatSMSData>({
    selectedPack: null,
    billingData: {
      email: '',
      entreprise: '',
      prenom: '',
      nom: '',
      telephone: '',
      adresse: '',
      complement: '',
      ville: '',
      codePostal: '',
      pays: '',
      numeroTVA: '',
    },
  });

  // Récupérer les données de l'utilisateur au chargement
  useEffect(() => {
    if (!membreId) {
      console.error('❌ Aucun membre_id disponible');
      setIsLoadingUserData(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoadingUserData(true);
        const data = await getUserCredits(membreId);

        // Mettre à jour les données de facturation avec les vraies données
        setAchatData(prev => ({
          ...prev,
          billingData: {
            email: data.societe.email,
            entreprise: data.societe.nom,
            prenom: data.membre_prenom,
            nom: data.membre_nom,
            telephone: data.membre_phone || '',
            adresse: '', // Pas disponible dans l'API
            complement: '',
            ville: data.societe.ville,
            codePostal: data.societe.code_postal,
            pays: data.societe.pays,
            numeroTVA: data.societe.tva,
          },
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [membreId]);

  const handleSuivant = () => {
    if (etapeActuelle < 2) {
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

  const handleUpdateData = (data: Partial<AchatSMSData>) => {
    setAchatData({ ...achatData, ...data });
  };

  const handleRetourCampagnes = () => {
    if (membreId) {
      navigate(`/campagne/${membreId}`);
    } else {
      navigate('/campagne/32'); // Fallback
    }
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
    if (isLoadingUserData) {
      return (
        <div className="loading-container">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Chargement des informations...</p>
        </div>
      );
    }

    switch (etapeActuelle) {
      case 1:
        return (
          <Etape1SelectionPack
            data={achatData}
            onUpdate={handleUpdateData}
            onSuivant={handleSuivant}
          />
        );
      case 2:
        return (
          <Etape2Confirmation 
            data={achatData} 
            onPrecedent={handlePrecedent}
            membreId={membreId || 32} // Passer le membre_id à la confirmation
          />
        );
      default:
        return null;
    }
  };

  // Si pas de membre_id, afficher une erreur
  if (!membreId) {
    return (
      <div className="page-achat-sms">
        <div className="error-container">
          <i className="fa-solid fa-exclamation-triangle"></i>
          <h3>Erreur : ID membre manquant</h3>
          <p>Impossible de charger cette page sans un ID de membre valide.</p>
          <button className="btn-primary" onClick={() => navigate('/campagne/32')}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-achat-sms">
      {/* <SidebarCampagne /> */}

      <div className="main-content-achat-sms">
        <HeaderCampagne />

        <div className="container-achat-sms">
          <div className="header-achat-sms">
            <h2 className="title-achat-sms">Acheter des SMS</h2>
            <button className="btn-retour-campagnes" onClick={handleRetourCampagnes}>
              <i className="fa-solid fa-arrow-left"></i>
              Retour aux campagnes
            </button>
          </div>

          <StepperAchatSMS etapeActuelle={etapeActuelle} />

          <div className="content-wrapper-achat-sms">
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
        </div>
      </div>
    </div>
  );
};

export default AchatSMSPage;