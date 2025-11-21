// // import { useNavigate } from 'react-router-dom';
// // const HeaderCampagne = () => {
// //   const navigate = useNavigate();
// //    const handleAcheterSMS = () => {
// //     navigate('/achat-sms');
// //   };
// //   return (
// //     <header className="header-campagne">
// //       <div className="header-left-campagne">
// //         <h1 className="header-title-campagne">Campagnes</h1>
// //       </div>

// //       <div className="header-right-campagne">
// //         <button className="btn-acheter-sms-campagne" onClick={handleAcheterSMS}>
// //           Acheter des SMS
// //         </button>

// //         <div className="sms-restants-campagne">
// //           <span className="sms-count-campagne">0</span>
// //           <span className="sms-label-campagne">SMS restants</span>
// //         </div>

// //         <div className="user-menu-campagne">
// //           <div className="user-info-campagne">
// //             <span className="user-name-campagne">Alexis Marcel</span>
// //             <span className="user-id-campagne">ID du compte : 51914</span>
// //           </div>
// //           <i className="fa-solid fa-chevron-down"></i>
// //         </div>
// //       </div>
// //     </header>
// //   );
// // };

// // export default HeaderCampagne;


// // src/components/campagne/HeaderCampagne.tsx

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getUserCredits } from '../services/achatsServices';
// import { useMembreId } from '../hooks/useMembreId';

// const HeaderCampagne = () => {
//   const navigate = useNavigate();
//   const [credits, setCredits] = useState<number>(0);
//   const [userName, setUserName] = useState<string>('');
//   const [userId, setUserId] = useState<string>('');
//   const [isLoading, setIsLoading] = useState(true);

//   const MEMBRE_ID = useMembreId(); // ID en dur comme demandé

//   useEffect(() => {
//     const fetchCredits = async () => {
//       try {
//         setIsLoading(true);
//         const data = await getUserCredits(MEMBRE_ID);
        
//         setCredits(data.credits);
//         setUserName(`${data.membre_prenom} ${data.membre_nom}`);
//         setUserId(MEMBRE_ID.toString());
//       } catch (error) {
//         console.error('Erreur lors du chargement des crédits:', error);
//         // En cas d'erreur, on garde les valeurs par défaut
//         setCredits(0);
//         setUserName('Utilisateur');
//         setUserId(MEMBRE_ID.toString());
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCredits();
//   }, []);

//   const handleAcheterSMS = () => {
//     navigate('/achat-sms');
//   };

//   return (
//     <header className="header-campagne">
//       <div className="header-left-campagne">
//         <h1 className="header-title-campagne">Campagnes</h1>
//       </div>

//       <div className="header-right-campagne">
//         <button className="btn-acheter-sms-campagne" onClick={handleAcheterSMS}>
//           Acheter des SMS
//         </button>

//         <div className="sms-restants-campagne">
//           {isLoading ? (
//             <span className="sms-count-campagne">
//               <i className="fa-solid fa-spinner fa-spin"></i>
//             </span>
//           ) : (
//             <span className="sms-count-campagne">{credits.toLocaleString('fr-FR')}</span>
//           )}
//           <span className="sms-label-campagne">SMS restants</span>
//         </div>

//         <div className="user-menu-campagne">
//           <div className="user-info-campagne">
//             <span className="user-name-campagne">{userName}</span>
//             <span className="user-id-campagne">ID du compte : {userId}</span>
//           </div>
//           <i className="fa-solid fa-chevron-down"></i>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default HeaderCampagne;


// src/components/campagne/HeaderCampagne.tsx - AVEC ID DYNAMIQUE

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCredits } from '../services/achatsServices';

const HeaderCampagne = () => {
  const navigate = useNavigate();
let membreIds = localStorage.getItem("membreId")
 let membreId = Number(membreIds)
  
  const [credits, setCredits] = useState<number>(0);
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!membreId) {
      console.error('❌ Aucun membre_id disponible');
      setIsLoading(false);
      return;
    }

    const fetchCredits = async () => {
      try {
        setIsLoading(true);
        const data = await getUserCredits(membreId);
        
        setCredits(data.credits);
        setUserName(`${data.membre_prenom} ${data.membre_nom}`);
        setUserId(membreId.toString());
      } catch (error) {
        console.error('Erreur lors du chargement des crédits:', error);
        setCredits(0);
        setUserName('Utilisateur');
        setUserId(membreId.toString());
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
  }, [membreId]);

  const handleAcheterSMS = () => {
    if (membreId) {
      navigate(`/campagne/${membreId}/achat-sms`);
    } else {
      console.error('❌ Impossible de naviguer sans membre_id');
    }
  };

  return (
    <header className="header-campagne">
      <div className="header-left-campagne">
        <h1 className="header-title-campagne">Campagnes</h1>
      </div>

      <div className="header-right-campagne">
        <button className="btn-acheter-sms-campagne" onClick={handleAcheterSMS}>
          Acheter des SMS
        </button>

        <div className="sms-restants-campagne">
          {isLoading ? (
            <span className="sms-count-campagne">
              <i className="fa-solid fa-spinner fa-spin"></i>
            </span>
          ) : (
            <span className="sms-count-campagne">{credits.toLocaleString('fr-FR')}</span>
          )}
          <span className="sms-label-campagne">SMS restants</span>
        </div>

        <div className="user-menu-campagne">
          <div className="user-info-campagne">
            <span className="user-name-campagne">{userName}</span>
            <span className="user-id-campagne">ID du compte : {userId}</span>
          </div>
          <i className="fa-solid fa-chevron-down"></i>
        </div>
      </div>
    </header>
  );
};

export default HeaderCampagne;