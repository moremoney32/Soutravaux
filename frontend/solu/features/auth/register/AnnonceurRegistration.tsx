import React, { useState } from 'react';
import "../../../src/styles/AnnomceurRegistration.css"
import Step1Activity from './StepActivity';
import Step2CompanyInfo from './StepCompagnyInfos';
import Step3Validation from './Step3Validation';

export interface AnnonceurData {
    // Étape 1
    activity: string;

    // Étape 2
    companyName: string;
    headquarters: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    howDidYouKnow: string;

    // Étape 3
    verificationCode: string;
}

const AnnonceurRegistration: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<AnnonceurData>({
        activity: '',
        companyName: '',
        headquarters: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        howDidYouKnow: '',
        verificationCode: ''
    });

    const updateFormData = (data: Partial<AnnonceurData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
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
                        onComplete={() => console.log('Inscription terminée!')}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="step2_container1">
            <div className="registration-container">
                {/* Contenu dynamique */}
                <div className="step-content">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default AnnonceurRegistration;