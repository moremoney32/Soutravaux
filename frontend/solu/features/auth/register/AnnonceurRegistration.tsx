import React, { useEffect, useState } from 'react';
import "../../../src/styles/AnnomceurRegistration.css"
import Step1Activity from './StepActivity';
import Step2CompanyInfo from './StepCompagnyInfos';
import Step3Validation from './Step3Validation';
import { motion, AnimatePresence } from 'framer-motion';

export interface AnnonceurData {
   activityAnnonceur: string;

    // Étape 2
    companyNameAnnonceur: string;
    headquartersAnnonceur: string;
    firstNameAnnonceur: string;
    lastNameAnnonceur: string;
    phoneAnnonceur: string;
    emailAnnonceur: string;
    howDidYouKnowAnnonceur: string;
    siretAnnonceur: string;
    legalFormAnnonceur:any


    // Étape 3
    verificationCodeAnnonceur: string;
}
interface AnnonceurRegistrationProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
     internalStep: number;                    // ← Nouveau
    setInternalStep: (step: number) => void; 
}

// const AnnonceurRegistration: React.FC = () => {

const AnnonceurRegistration: React.FC<AnnonceurRegistrationProps> = ({ 
    currentStep, 
    setCurrentStep,
    internalStep,        
    setInternalStep      
}) => {

    
    const [formData, setFormData] = useState<AnnonceurData>({
    activityAnnonceur: '',
    companyNameAnnonceur: '',
    headquartersAnnonceur: '',
    firstNameAnnonceur: '',
    lastNameAnnonceur: '',
    phoneAnnonceur: '',
    emailAnnonceur: '',
    howDidYouKnowAnnonceur: '',
    verificationCodeAnnonceur: '',
    siretAnnonceur:"",
    legalFormAnnonceur:""
});
      useEffect(() => {
        console.log('formData updated:', formData);
    }, [formData]); // ← Seulement quand formData change

    // Ou pour debugger une seule fois au montage
    useEffect(() => {
        console.log('AnnonceurRegistration mounted');
    }, []);

     const [direction, setDirection] = useState("next");
     // Réinitialiser les sous-étapes quand on arrive sur l'annonceur
    useEffect(() => {
        if (currentStep === 2) {
            setInternalStep(1); // Utilise setInternalStep de Register
        }
    }, [currentStep, setInternalStep]);

    const updateFormData = (data: Partial<AnnonceurData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => {
          setDirection("next");
        if (internalStep < 3) {
            setInternalStep(internalStep + 1); // Utilise setInternalStep de Register
        } else {
            setCurrentStep(3);
        }
    };

    const prevStep = () => {
        if (internalStep > 1) {
            setInternalStep(internalStep - 1); // Utilise setInternalStep de Register
        } else {
            setCurrentStep(1);
        }
    };

    const renderStep = () => {
        switch (internalStep) {
            case 1:
                return (
                    <Step1Activity
                        data={formData}
                        onUpdate={updateFormData}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                );
            case 2:
                return (
                    <Step2CompanyInfo
                        data={formData}
                        onUpdate={updateFormData}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                );
            case 3:
                return (
                    <Step3Validation
                        data={formData}
                        onUpdate={updateFormData}
                        onPrev={prevStep}
                        // onComplete={() => {
                        //     console.log('Inscription annonceur terminée!');
                        //     setCurrentStep(3); // Passer à la validation Register
                        // }}
                    />
                );
            default:
                return null;
        }
    };

    // Ne rendre que si Register est à l'étape 2
    if (currentStep !== 2) return null;


     return (
        <div className="step2_container1">
            <div className="registration-container">
                {/* Ajoutez AnimatePresence pour les transitions internes */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={internalStep} // ← Utilisez internalStep comme clé
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

export default AnnonceurRegistration;