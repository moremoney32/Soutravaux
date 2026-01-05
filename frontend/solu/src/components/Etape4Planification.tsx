// // src/components/campagne/Etape4Planification.tsx

// import { useState } from "react";
// import type { CampagneData } from "../types/campagne.types";

// interface Etape4PlanificationProps {
//     data: CampagneData;
//     onUpdate: (data: Partial<CampagneData>) => void;
//     onSuivant: () => void;
//     onPrecedent: () => void;
// }

// const Etape4Planification = ({ data, onUpdate, onSuivant, onPrecedent }: Etape4PlanificationProps) => {
//     const [erreur, setErreur] = useState('');

//     const handleSuivant = () => {
//         //VALIDATION : Si différé, date et heure obligatoires
//         if (data.planification.type === 'differe') {
//             if (!data.planification.date || data.planification.date === 'now') {
//                 setErreur('La date est obligatoire pour un envoi différé');
//                 return;
//             }
//             if (!data.planification.heure || data.planification.heure === 'now') {
//                 setErreur("L'heure est obligatoire pour un envoi différé");
//                 return;
//             }

//             //VALIDATION : Date dans le futur
//             const dateSelectionnee = new Date(`${data.planification.date}T${data.planification.heure}`);
//             const maintenant = new Date();

//             if (dateSelectionnee <= maintenant) {
//                 setErreur('La date et l\'heure doivent être dans le futur');
//                 return;
//             }
//         }

//         setErreur('');
//         onSuivant();
//     };
//     const handleDateChange = (date: string) => {
//         onUpdate({
//             planification: {
//                 ...data.planification,
//                 date,
//             },
//         });
//     };

//     const handleHeureChange = (heure: string) => {
//         onUpdate({
//             planification: {
//                 ...data.planification,
//                 heure,
//             },
//         });
//     };

//     const handleTypeChange = (type: 'differe' | 'instantane') => {
//         onUpdate({
//             planification: {
//                 ...data.planification,
//                 type,
//             },
//         });
//     };

//     return (
//         <div className="etape-campagne">
//             <h3 className="etape-title-campagne">Planification</h3>

//             <p className="help-text-campagne">Choisissez la date d'envoi de votre campagne :</p>

//             <div className="radio-group-campagne">
//                 <div className="radio-option-campagne">
//                     <input
//                         type="radio"
//                         id="differe-campagne"
//                         name="type-envoi"
//                         checked={data.planification.type === 'differe'}
//                         onChange={() => handleTypeChange('differe')}
//                     />
//                     <label htmlFor="differe-campagne">Envoi différé le</label>
//                 </div>

//                 {data.planification.type === 'differe' && (
//                     <div className="date-time-picker-campagne">
//                         <input
//                             type="date"
//                             className="input-campagne input-date-campagne"
//                             value={data.planification.date}
//                             onChange={(e) => handleDateChange(e.target.value)}
//                         />
//                         <input
//                             type="time"
//                             className="input-campagne input-time-campagne"
//                             value={data.planification.heure}
//                             onChange={(e) => handleHeureChange(e.target.value)}
//                         />
//                     </div>
//                 )}
//             </div>

//             <div className="radio-group-campagne">
//                 <div className="radio-option-campagne">
//                     <input
//                         type="radio"
//                         id="instantane-campagne"
//                         name="type-envoi"
//                         checked={data.planification.type === 'instantane'}
//                         onChange={() => handleTypeChange('instantane')}
//                     />
//                     <label htmlFor="instantane-campagne">Envoi instantané</label>
//                 </div>
//             </div>

//             <div className="actions-campagne">
//                 {erreur && (
//                     <div className="error-banner-campagne">
//                         <i className="fa-solid fa-circle-exclamation"></i>
//                         {erreur}
//                     </div>
//                 )}
//                 <button className="btn-secondary check_button" onClick={onPrecedent}>
//                     <i className="fa-solid fa-chevron-left"></i>
//                     Précédent
//                 </button>
//                 <button className="btn-primary check_button" onClick={handleSuivant}>
//                     Suivant
//                     <i className="fa-solid fa-chevron-right"></i>
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Etape4Planification;



import { useState } from "react";
import type { CampagneData } from "../types/campagne.types";

interface Etape4PlanificationProps {
    data: CampagneData;
    onUpdate: (data: Partial<CampagneData>) => void;
    onSuivant: () => void;
    onPrecedent: () => void;
}

const Etape4Planification = ({ data, onUpdate, onSuivant, onPrecedent }: Etape4PlanificationProps) => {
    const [erreur, setErreur] = useState('');

    const handleSuivant = () => {
        // VALIDATION : Si différé, date et heure obligatoires
        if (data.planification.type === 'differe') {
            if (!data.planification.date || data.planification.date === 'now') {
                setErreur('La date est obligatoire pour un envoi différé');
                return;
            }
            if (!data.planification.heure || data.planification.heure === 'now') {
                setErreur("L'heure est obligatoire pour un envoi différé");
                return;
            }

            // VALIDATION : Date dans le futur
            const dateSelectionnee = new Date(`${data.planification.date}T${data.planification.heure}`);
            const maintenant = new Date();

            if (dateSelectionnee <= maintenant) {
                setErreur('La date et l\'heure doivent être dans le futur');
                return;
            }
        }

        setErreur('');
        onSuivant();
    };

    const handleDateChange = (date: string) => {
        onUpdate({
            planification: {
                ...data.planification,
                date,
            },
        });
    };

    const handleHeureChange = (heure: string) => {
        onUpdate({
            planification: {
                ...data.planification,
                heure,
            },
        });
    };

    const handleTypeChange = (type: 'differe' | 'instantane') => {
        onUpdate({
            planification: {
                ...data.planification,
                type,
            },
        });
    };

    return (
        <div className="etape-campagne">
            <div className="planification-layout">
                {/* COLONNE GAUCHE : Formulaire */}
                <div className="planification-form">
                    <h3 className="etape-title-campagne">Planification</h3>

                    <p className="help-text-campagne">Choisissez la date d'envoi de votre campagne :</p>

                    <div className="radio-group-campagne">
                        <div className="radio-option-campagne">
                            <input
                                type="radio"
                                id="differe-campagne"
                                name="type-envoi"
                                checked={data.planification.type === 'differe'}
                                onChange={() => handleTypeChange('differe')}
                            />
                            <label htmlFor="differe-campagne">Envoi différé le</label>
                        </div>

                        {data.planification.type === 'differe' && (
                            <div className="date-time-picker-campagne">
                                <input
                                    type="date"
                                    className="input-campagne input-date-campagne"
                                    value={data.planification.date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                />
                                <input
                                    type="time"
                                    className="input-campagne input-time-campagne"
                                    value={data.planification.heure}
                                    onChange={(e) => handleHeureChange(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="radio-group-campagne">
                        <div className="radio-option-campagne">
                            <input
                                type="radio"
                                id="instantane-campagne"
                                name="type-envoi"
                                checked={data.planification.type === 'instantane'}
                                onChange={() => handleTypeChange('instantane')}
                            />
                            <label htmlFor="instantane-campagne">Envoi instantané</label>
                        </div>
                    </div>
                </div>

                {/* ⬅️ NOUVELLE COLONNE DROITE : Information */}
                <div className="planification-info-panel">
                    <div className="info-panel-header">
                        <i className="fa-solid fa-circle-info"></i>
                        <h4>Information</h4>
                    </div>
                    
                    <div className="info-panel-content">
                        <p className="info-description">
                            Les campagnes à portée marketing ne peuvent être 
                            envoyées uniquement durant certaines plages horaires :
                        </p>
                        
                        <div className="info-section">
                            <p className="info-subtitle">
                                Les campagnes marketing ne peuvent pas être envoyées durant le week-end :
                            </p>
                            <div className="country-restrictions">
                                <div className="country-item">
                                    <span className="flag">🇫🇷</span>
                                    <span className="country-name">France</span>
                                    <span className="time-range">(08:00 - 22:00)</span>
                                </div>
                                {/* <div className="country-item">
                                    <span className="flag">🇧🇪</span>
                                    <span className="country-name">Belgique</span>
                                    <span className="time-range">(08:00 - 22:00)</span>
                                </div>
                                <div className="country-item">
                                    <span className="flag">🇨🇭</span>
                                    <span className="country-name">Suisse</span>
                                    <span className="time-range">(08:00 - 22:00)</span>
                                </div>
                                <div className="country-item">
                                    <span className="flag">🇱🇺</span>
                                    <span className="country-name">Luxembourg</span>
                                    <span className="time-range">(08:00 - 22:00)</span>
                                </div> */}
                            </div>
                        </div>

                        <div className="info-note">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            <p>
                                Les SMS transactionnels (alertes) ne sont pas concernés 
                                par ces restrictions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="actions-campagne">
                {erreur && (
                    <div className="error-banner-campagne">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {erreur}
                    </div>
                )}
                <button className="btn-secondary check_button" onClick={onPrecedent}>
                    <i className="fa-solid fa-chevron-left"></i>
                    Précédent
                </button>
                <button className="btn-primary check_button" onClick={handleSuivant}>
                    Suivant
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </div>
    );
};

export default Etape4Planification;