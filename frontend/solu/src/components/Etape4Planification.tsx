// src/components/campagne/Etape4Planification.tsx

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
        //VALIDATION : Si différé, date et heure obligatoires
        if (data.planification.type === 'differe') {
            if (!data.planification.date || data.planification.date === 'now') {
                setErreur('La date est obligatoire pour un envoi différé');
                return;
            }
            if (!data.planification.heure || data.planification.heure === 'now') {
                setErreur("L'heure est obligatoire pour un envoi différé");
                return;
            }

            //VALIDATION : Date dans le futur
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