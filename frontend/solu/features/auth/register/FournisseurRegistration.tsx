

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Step1Sector from './fournisseurStep1';
import Step2ContactForm from './FournisseurContact';
import "../../../src/styles/FournisseursRegistration.css"

// Importez vos images
import nike from "../../../src/assets/icons/nike.png";
import next from "../../../src/assets/icons/next.png";
import close from "../../../src/assets/icons/close.png";

export interface FournisseurData {
    // Étape 1
    sector: string;
    customSector?: string;

    // Étape 2
    companyName: string;
    siren: string;
    siret: string;
    address: string;
    postalCode: string;
    city: string;
    contactFirstName: string;
    contactLastName: string;
    contactPhone: string;
    contactEmail: string;
    contactPosition: string;
    message?: string;
}

interface FournisseurRegistrationProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    internalStep: number;
    setInternalStep: (step: number) => void;
}

const FournisseurRegistration: React.FC<FournisseurRegistrationProps> = ({
    currentStep,
    setCurrentStep,
    internalStep,
    setInternalStep
}) => {
    const [formData, setFormData] = useState<FournisseurData>({
        sector: '',
        customSector: '',
        companyName: '',
        siren: '',
        siret: '',
        address: '',
        postalCode: '',
        city: '',
        contactFirstName: '',
        contactLastName: '',
        contactPhone: '',
        contactEmail: '',
        contactPosition: '',
        message: ''
    });

    const [direction, setDirection] = useState<"next" | "prev">("next");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [loadingComplete, setLoadingComplete] = useState(false);

    const updateFormData = (data: Partial<FournisseurData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        if (internalStep < 3) {
            setDirection("next");
            setInternalStep(internalStep + 1);
        } else {
            setDirection("next");
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (internalStep > 1) {
            setDirection("prev");
            setInternalStep(internalStep - 1);
        } else {
            setDirection("prev");
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/fournisseurs/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Demande de contact envoyée avec succès');
                // Affiche la popup au lieu de passer à l'étape suivante
                setShowSuccessPopup(true);
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
        }
    };

    const handleClosePopup = () => {
        setShowSuccessPopup(false);
        // Redirige vers l'étape 1 de register
        setCurrentStep(1);
        setInternalStep(1);
    };

    const handleCompleteProfile = () => {
        setLoadingComplete(true);
        // Ici vous pouvez ajouter une logique supplémentaire si nécessaire
        setTimeout(() => {
            setLoadingComplete(false);
            handleClosePopup();
        }, 1000);
    };

    const renderStep = () => {
        switch (internalStep) {
            case 1:
                return (
                    <Step1Sector
                        data={formData}
                        onUpdate={updateFormData}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                );
            case 2:
                return (
                    <Step2ContactForm
                        data={formData}
                        onUpdate={updateFormData}
                        onPrev={prevStep}
                        onSubmit={handleSubmit}
                        onShowSuccess={() => setShowSuccessPopup(true)} // Nouvelle prop
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="step2_container1">
            {/* Popup de succès */}
            <AnimatePresence>
                {showSuccessPopup && (
                    <>
                        {/* Masque noir semi-transparent */}
                        <motion.div
                            className="masque"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Popup */}
                        <motion.div
                            className="popup"
                            initial={{ scale: 0.7, opacity: 0, y: -50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.7, opacity: 0, y: -50 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <img src={nike} alt="Succès" />
                            <div className="popup_text">
                                <span className="popup_title">Merci {formData.contactFirstName} !</span>
                                <span className="popup_title_span">
                                    Votre formulaire a été envoyé à Solutravo. Vous serez contacté dans les plus brefs délais par notre équipe commerciale.
                                </span>
                            </div>

                            <div className="popup_buttons">
                                <div 
                                    className="popup_buttons1" 
                                    onClick={handleCompleteProfile}
                                >
                                    {loadingComplete ? (
                                        <span>En Cours ...</span>
                                    ) : (
                                        <span>Fermer</span>
                                    )}
                                    <img src={next} alt="Suivant" />
                                </div>
                            </div>

                            <img
                                src={close}
                                alt="Fermer"
                                className="close_icon"
                                onClick={handleClosePopup}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="registration-container1">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={internalStep}
                        custom={direction}
                        initial={{
                            x: direction === "next" ? 100 : -100,
                            opacity: 0
                        }}
                        animate={{
                            x: 0,
                            opacity: 1
                        }}
                        exit={{
                            x: direction === "next" ? -100 : 100,
                            opacity: 0
                        }}
                        transition={{
                            duration: 0.4,
                            ease: "easeInOut"
                        }}
                        className="step-content"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FournisseurRegistration;