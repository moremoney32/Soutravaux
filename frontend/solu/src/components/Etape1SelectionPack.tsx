// // src/components/achat-sms/Etape1SelectionPack.tsx

// import { useState, useEffect } from 'react';
// import type { AchatSMSData, SMSPack } from '../types/campagne.types';
// import { getSMSPacks } from '../services/achatsServices';

// interface Etape1SelectionPackProps {
//   data: AchatSMSData;
//   onUpdate: (data: Partial<AchatSMSData>) => void;
//   onSuivant: () => void;
// }

// const Etape1SelectionPack = ({ data, onUpdate, onSuivant }: Etape1SelectionPackProps) => {
//   const [packs, setPacks] = useState<SMSPack[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchPacks = async () => {
//       try {
//         setIsLoading(true);
//         const packsData = await getSMSPacks();
//         // Trier par quantité croissante
//         const sortedPacks = packsData.sort((a, b) => a.sms_quantity - b.sms_quantity);
//         setPacks(sortedPacks);
//         setError(null);
//       } catch (err) {
//         console.error('Erreur lors du chargement des packs:', err);
//         setError('Impossible de charger les packs SMS. Veuillez réessayer.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchPacks();
//   }, []);

//   const handleSelectPack = (pack: SMSPack) => {
//     onUpdate({ selectedPack: pack });
//   };

//   const handleSuivant = () => {
//     if (!data.selectedPack) {
//       alert('Veuillez sélectionner un pack avant de continuer.');
//       return;
//     }
//     onSuivant();
//   };

//   if (isLoading) {
//     return (
//       <div className="etape-selection-pack">
//         <div className="loading-container">
//           <i className="fa-solid fa-spinner fa-spin"></i>
//           <p>Chargement des packs SMS...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="etape-selection-pack">
//         <div className="error-container">
//           <i className="fa-solid fa-exclamation-triangle"></i>
//           <p>{error}</p>
//           <button className="btn-primary" onClick={() => window.location.reload()}>
//             Réessayer
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="etape-selection-pack">
//       <div className="content-selection-pack">
//         <div className="left-section-pack">
//           <h3 className="section-title-pack">Sélectionnez votre pack</h3>

//           <div className="packs-grid">
//             {packs.map((pack) => (
//               <div
//                 key={pack.id}
//                 className={`pack-card ${
//                   data.selectedPack?.id === pack.id ? 'pack-card-selected' : ''
//                 }`}
//                 onClick={() => handleSelectPack(pack)}
//               >
//                 <div className="pack-card-header">
//                   <div className="pack-quantity">{pack.sms_quantity.toLocaleString('fr-FR')}</div>
//                   <div className="pack-label">SMS</div>
//                 </div>

//                 <div className="pack-card-body">
//                   <div className="pack-price-unit">
//                     {parseFloat(pack.unit_price).toFixed(3)} € <span>par SMS</span>
//                   </div>
//                   <div className="pack-price-total">
//                     {parseFloat(pack.total_price_ht).toFixed(2)} € <span>HT</span>
//                   </div>
//                 </div>

//                 {data.selectedPack?.id === pack.id && (
//                   <div className="pack-card-check">
//                     <i className="fa-solid fa-check-circle"></i>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="right-section-pack">
//           <div className="recap-card">
//             <h4 className="recap-title">Récapitulatif</h4>

//             {data.selectedPack ? (
//               <>
//                 <div className="recap-row">
//                   <span className="recap-label">Quantité de SMS</span>
//                   <span className="recap-value">
//                     {data.selectedPack.sms_quantity.toLocaleString('fr-FR')}
//                   </span>
//                 </div>

//                 <div className="recap-row">
//                   <span className="recap-label">Prix unitaire</span>
//                   <span className="recap-value">
//                     {parseFloat(data.selectedPack.unit_price).toFixed(3)} €
//                   </span>
//                 </div>

//                 <div className="recap-divider"></div>

//                 <div className="recap-row recap-total">
//                   <span className="recap-label">Prix total (TVA excl.)</span>
//                   <span className="recap-value">
//                     {parseFloat(data.selectedPack.total_price_ht).toFixed(2)} €
//                   </span>
//                 </div>

//                 <div className="recap-info">
//                   <i className="fa-solid fa-info-circle"></i>
//                   <p>
//                     Conformément à nos conditions générales de vente, les crédits sont valables
//                     un an à partir de la date d'achat.
//                   </p>
//                 </div>
//               </>
//             ) : (
//               <div className="recap-empty">
//                 <i className="fa-solid fa-box-open"></i>
//                 <p>Sélectionnez un pack pour voir le récapitulatif</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="actions-selection-pack">
//         <button
//           className="btn-primary"
//           onClick={handleSuivant}
//           disabled={!data.selectedPack}
//         >
//           Suivant
//           <i className="fa-solid fa-arrow-right"></i>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Etape1SelectionPack;


import { useState, useEffect, useRef } from 'react';
import type { AchatSMSData, SMSPack } from '../types/campagne.types';
import { getSMSPacks } from '../services/achatsServices';

interface Etape1SelectionPackProps {
  data: AchatSMSData;
  onUpdate: (data: Partial<AchatSMSData>) => void;
  onSuivant: () => void;
}

const Etape1SelectionPack = ({ data, onUpdate, onSuivant }: Etape1SelectionPackProps) => {
  const [packs, setPacks] = useState<SMSPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Référence pour le scroll automatique
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        setIsLoading(true);
        const packsData = await getSMSPacks();
        const sortedPacks = packsData.sort((a, b) => a.sms_quantity - b.sms_quantity);
        setPacks(sortedPacks);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des packs:', err);
        setError('Impossible de charger les packs SMS. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPacks();
  }, []);

  const handleSelectPack = (pack: SMSPack) => {
    onUpdate({ selectedPack: pack });
    
    // Scroll automatique sur mobile après sélection
    if (window.innerWidth <= 768 && actionsRef.current) {
      setTimeout(() => {
        actionsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
    }
  };

  const handleSuivant = () => {
    if (!data.selectedPack) {
      alert('Veuillez sélectionner un pack avant de continuer.');
      return;
    }
    onSuivant();
  };

  if (isLoading) {
    return (
      <div className="etape-selection-pack">
        <div className="loading-container">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Chargement des packs SMS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="etape-selection-pack">
        <div className="error-container">
          <i className="fa-solid fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="etape-selection-pack">
      <div className="content-selection-pack">
        <div className="left-section-pack">
          <h3 className="section-title-pack">Sélectionnez votre pack</h3>

          <div className="packs-grid">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className={`pack-card ${
                  data.selectedPack?.id === pack.id ? 'pack-card-selected' : ''
                }`}
                onClick={() => handleSelectPack(pack)}
              >
                <div className="pack-card-header">
                  <div className="pack-quantity">{pack.sms_quantity.toLocaleString('fr-FR')}</div>
                  <div className="pack-label">SMS</div>
                </div>

                <div className="pack-card-body">
                  <div className="pack-price-unit">
                    {parseFloat(pack.unit_price).toFixed(3)} € <span>par SMS</span>
                  </div>
                  <div className="pack-price-total">
                    {parseFloat(pack.total_price_ht).toFixed(2)} € <span>HT</span>
                  </div>
                </div>

                {data.selectedPack?.id === pack.id && (
                  <div className="pack-card-check">
                    <i className="fa-solid fa-check-circle"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="right-section-pack">
          <div className="recap-card">
            <h4 className="recap-title">Récapitulatif</h4>

            {data.selectedPack ? (
              <>
                <div className="recap-row">
                  <span className="recap-label">Quantité de SMS</span>
                  <span className="recap-value">
                    {data.selectedPack.sms_quantity.toLocaleString('fr-FR')}
                  </span>
                </div>

                <div className="recap-row">
                  <span className="recap-label">Prix unitaire</span>
                  <span className="recap-value">
                    {parseFloat(data.selectedPack.unit_price).toFixed(3)} €
                  </span>
                </div>

                <div className="recap-divider"></div>

                <div className="recap-row recap-total">
                  <span className="recap-label">Prix total (TVA excl.)</span>
                  <span className="recap-value">
                    {parseFloat(data.selectedPack.total_price_ht).toFixed(2)} €
                  </span>
                </div>

                <div className="recap-info">
                  <i className="fa-solid fa-info-circle"></i>
                  <p>
                    Conformément à nos conditions générales de vente, les crédits sont valables
                    un an à partir de la date d'achat.
                  </p>
                </div>
              </>
            ) : (
              <div className="recap-empty">
                <i className="fa-solid fa-box-open"></i>
                <p>Sélectionnez un pack pour voir le récapitulatif</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ajout de la référence sur le conteneur des actions */}
      <div className="actions-selection-pack" ref={actionsRef}>
        <button
          className="btn-primary"
          onClick={handleSuivant}
          disabled={!data.selectedPack}
        >
          Suivant
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Etape1SelectionPack;