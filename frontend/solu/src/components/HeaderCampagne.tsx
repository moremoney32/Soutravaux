

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
      console.error('Aucun membre_id disponible');
      setIsLoading(false);
      return;
    }

    const fetchCredits = async () => {
      try {
        setIsLoading(true);
        const data = await getUserCredits(membreId);
        
        setCredits(data.credits);
        setUserName(data.nom);
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
      console.error('Impossible de naviguer sans membre_id');
    }
  };

  return (
    <header className="header-campagne">
      <div className="header-left-campagne">
        <h5 className="header-title-campagne">Campagnes</h5>
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
            <span className="sms-count-campagne">{credits}</span>
          )}
          <span className="sms-label-campagne">SMS restants</span>
        </div>

        <div className="user-menu-campagne">
          <div className="user-info-campagne">
            <span className="user-name-campagne">{userName}</span>
             <span className="user-id-campagne">Compte : {userId}</span> 
          </div>
          {/* <i className="fa-solid fa-chevron-down"></i> */}
        </div>
      </div>
    </header>
  );
};

export default HeaderCampagne;