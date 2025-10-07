
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnnonceurData } from './AnnonceurRegistration';
import { fetchData } from '../../../src/helpers/fetchData';

interface Step2CompanyInfoProps {
    data: AnnonceurData
    onUpdate: (data: Partial<AnnonceurData>) => void;
    onNext: () => void;
    onPrev: () => void;
}

const howDidYouKnowOptions = [
    'Facebook/Instagram',
    'LinkedIn',
    'Bouche à oreilles',
    'Presse',
    'Google',
    'Salon professionnel',
    'Autre'
];

const legalFormOptions = [
    { value: 'AE', label: 'Auto Entrepreneur (AE)' },
    { value: 'EI', label: 'Entreprise Individuelle (EI)' },
    { value: 'EIRL', label: 'EIRL' },
    { value: 'EURL', label: 'EURL' },
    { value: 'SARL', label: 'SARL' },
    { value: 'SAS', label: 'SAS' },
    { value: 'SASU', label: 'SASU' },
    { value: 'SNC', label: 'SNC' },
    { value: 'SELARL', label: 'SELARL' }
];

const Step2CompanyInfo: React.FC<Step2CompanyInfoProps> = ({
    data,
    onUpdate,
    onNext,
    onPrev
}) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [checkSiret, setCheckSiret] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSelectingSearch, setIsSelectingSearch] = useState(true);
    const [showLegalForms, setShowLegalForms] = useState(false);
    const [selectedLegalFormLabel, setSelectedLegalFormLabel] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorPopup, setErrorPopup] = useState<string | null>(null);
    const [cp, setCp] = useState("");
        const [ville, setVille] = useState("");
        const [rue, setRue] = useState("");

    const handleInputChange = (field: keyof AnnonceurData, value: string) => {
        onUpdate({ [field]: value });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Quand on choisit une suggestion SIRET
    const handleSelectCompany = (company: any) => {
        console.log(company.cp);
        handleInputChange('companyNameAnnonceur', company.nom);
        setCheckSiret(company.siret);
         setCp(company.code);
        setVille(company.libelle);
        setRue(`${company.rue} ${company.ville}`);
        setIsSelectingSearch(false);
        handleInputChange('headquartersAnnonceur', `${company.cp} ${company.type} ${company.ville} ${company.code} ${company.libelle}`);
        setSuggestions([]);
    };

    // Quand on choisit une forme juridique
    const handleSelectLegalForm = (legalForm: { value: string, label: string }) => {
        handleInputChange('legalFormAnnonceur', legalForm.value);
        setSelectedLegalFormLabel(legalForm.label);
        setShowLegalForms(false);
    };

    // Recherche automatique SIRET
    useEffect(() => {
        if (checkSiret.length >= 3 && isSelectingSearch) {
            const timer = setTimeout(async () => {
                try {
                    const { result } = await fetchData(`entreprises?siret=${checkSiret}`, "GET", null, "");
                    setSuggestions(result || []);
                } catch (err) {
                    console.error("Erreur API entreprises:", err);
                    setSuggestions([]);
                }
            }, 400);

            return () => clearTimeout(timer);
        }

        if (checkSiret.length === 0) {
            setSuggestions([]);
        }
    }, [checkSiret, isSelectingSearch]);

    // Mettre à jour le label de la forme juridique sélectionnée
    useEffect(() => {
        if (data.legalFormAnnonceur) {
            const selected = legalFormOptions.find(option => option.value === data.legalFormAnnonceur);
            if (selected) {
                setSelectedLegalFormLabel(selected.label);
            }
        } else {
            setSelectedLegalFormLabel("");
        }
    }, [data.legalFormAnnonceur]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!data.companyNameAnnonceur?.trim()) {
            newErrors.companyNameAnnonceur = 'La raison sociale est requise';
        }

        if (!data.headquartersAnnonceur?.trim()) {
            newErrors.headquartersAnnonceur = 'L\'adresse du siège social est requise';
        }

        if (!data.legalFormAnnonceur?.trim()) {
            newErrors.legalFormAnnonceur = 'La forme juridique est requise';
        }

        if (!data.firstNameAnnonceur?.trim()) {
            newErrors.firstNameAnnonceur = 'Le prénom est requis';
        }

        if (!data.lastNameAnnonceur?.trim()) {
            newErrors.lastNameAnnonceur = 'Le nom est requis';
        }

        if (!data.phoneAnnonceur?.trim()) {
            newErrors.phoneAnnonceur = 'Le téléphone est requis';
        } else if (!/^(?:\+33|0)[1-9]\d{8}$/.test(data.phoneAnnonceur)) {
            newErrors.phoneAnnonceur = 'Numéro de téléphone français invalide';
        }

        if (!data.emailAnnonceur?.trim()) {
            newErrors.emailAnnonceur = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailAnnonceur)) {
            newErrors.emailAnnonceur = 'Format d\'email invalide';
        }

        if (!data.howDidYouKnowAnnonceur) {
            newErrors.howDidYouKnowAnnonceur = 'Veuillez sélectionner une option';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmitRegister = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
    // Informations obligatoires pour la table membres
    emailAnnonceur: data.emailAnnonceur,
    firstNameAnnonceur: data.firstNameAnnonceur,
    lastNameAnnonceur: data.lastNameAnnonceur,
    phoneAnnonceur: data.phoneAnnonceur,
    
    // Informations entreprise pour presocietes
    companyNameAnnonceur: data.companyNameAnnonceur,
    headquartersAnnonceur: data.headquartersAnnonceur,
    legalFormAnnonceur: data.legalFormAnnonceur,
    siretAnnonceur: data.siretAnnonceur,
    
    // Colonnes supplémentaires
    cp: cp,
    ville: ville,
    rue: rue,
    
    // Comment avez-vous connu
    howDidYouKnowAnnonceur: data.howDidYouKnowAnnonceur,
    
    // Autres champs (optionnels selon votre DB)
    role: 'annonceur',
    activityAnnonceur: data.activityAnnonceur,
    
};

            const result = await fetchData('registerAnnonceur', 'POST', payload);
            
            if (result.status === 201) {
                onNext();
            } else {
                throw new Error( 'Erreur lors de l\'inscription');
            }

        } catch (err: unknown) {
            console.error("Erreur inscription annonceur:", err);
            let errorMessage = "Erreur lors de l'inscription";
            
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            
            setErrorPopup(errorMessage);
            setTimeout(() => setErrorPopup(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        onSubmitRegister();
    };

    return (
        <div className="step-container">
            {/* Snackbar pour les erreurs */}
            <AnimatePresence>
                {errorPopup && (
                    <motion.div
                        className="role_error_sidebar top_right"
                        role="alert"
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: [0, -120, 0], opacity: [0, 1, 1] }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    >
                        {errorPopup}
                    </motion.div>
                )}
            </AnimatePresence>

            <h2>Informations entreprise</h2>
            <p className="step-description">
                Renseignez les informations de votre entreprise et vos coordonnées
            </p>

            <div className="form-section">
                <h3>Entreprise</h3>
                
                {/* Première ligne : SIRET et Raison sociale */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="siretAnnonceur">Numéro de SIRET</label>
                        <input 
                            type="text" 
                            placeholder="123456789" 
                            value={checkSiret}
                            className="siret_number"
                            onChange={(e) => {
                                setCheckSiret(e.target.value);
                                if (!isSelectingSearch) {
                                    setIsSelectingSearch(true);
                                }
                                handleInputChange('siretAnnonceur', e.target.value);
                            }} 
                        />
                        {suggestions.length > 0 && (
                            <div className="suggestions_list1">
                                {suggestions.map((company, idx) => (
                                    <span
                                        key={idx}
                                        className="suggestion_item1"
                                        onClick={() => handleSelectCompany(company)}
                                    >
                                        <strong>{company.nom}</strong> &nbsp;
                                        <span>({company.siren})</span>
                                        <br />
                                        <small>
                                            {company.activite} • {company.cp} {company.ville}
                                        </small>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="companyNameAnnonceur">Raison sociale *</label>
                        <input
                            type="text"
                            id="companyNameAnnonceur"
                            value={data.companyNameAnnonceur || ''}
                            onChange={(e) => handleInputChange('companyNameAnnonceur', e.target.value)}
                            placeholder="Nom de votre entreprise"
                            className={errors.companyNameAnnonceur ? 'error' : ''}
                        />
                        {errors.companyNameAnnonceur && <span className="error-message">{errors.companyNameAnnonceur}</span>}
                    </div>
                </div>

                {/* Deuxième ligne : Forme juridique et Adresse */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="legalFormAnnonceur">Forme juridique *</label>
                        <input 
                            type="text"
                            id="legalFormAnnonceur"
                            placeholder="Sélectionnez une forme juridique"
                            value={selectedLegalFormLabel}
                            readOnly
                            className={`legal-form-input ${errors.legalFormAnnonceur ? 'error' : ''}`}
                            onClick={() => setShowLegalForms(!showLegalForms)}
                        />
                        {showLegalForms && (
                            <div className="suggestions_list1 legal-form-suggestions">
                                {legalFormOptions.map((option, idx) => (
                                    <span
                                        key={idx}
                                        className="suggestion_item1"
                                        onClick={() => handleSelectLegalForm(option)}
                                    >
                                        <strong>{option.label}</strong>
                                    </span>
                                ))}
                            </div>
                        )}
                        {errors.legalFormAnnonceur && <span className="error-message">{errors.legalFormAnnonceur}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="headquartersAnnonceur">Adresse du siège social *</label>
                        <input
                            type="text"
                            id="headquartersAnnonceur"
                            value={data.headquartersAnnonceur || ''}
                            onChange={(e) => handleInputChange('headquartersAnnonceur', e.target.value)}
                            placeholder="Adresse complète du siège"
                            className={errors.headquartersAnnonceur ? 'error' : ''}
                        />
                        {errors.headquartersAnnonceur && <span className="error-message">{errors.headquartersAnnonceur}</span>}
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Informations personnelles</h3>
                
                {/* Première ligne : Prénom et Nom */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstNameAnnonceur">Prénom *</label>
                        <input
                            type="text"
                            id="firstNameAnnonceur"
                            value={data.firstNameAnnonceur || ''}
                            onChange={(e) => handleInputChange('firstNameAnnonceur', e.target.value)}
                            placeholder="Votre prénom"
                            className={errors.firstNameAnnonceur ? 'error' : ''}
                        />
                        {errors.firstNameAnnonceur && <span className="error-message">{errors.firstNameAnnonceur}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="lastNameAnnonceur">Nom *</label>
                        <input
                            type="text"
                            id="lastNameAnnonceur"
                            value={data.lastNameAnnonceur || ''}
                            onChange={(e) => handleInputChange('lastNameAnnonceur', e.target.value)}
                            placeholder="Votre nom"
                            className={errors.lastNameAnnonceur ? 'error' : ''}
                        />
                        {errors.lastNameAnnonceur && <span className="error-message">{errors.lastNameAnnonceur}</span>}
                    </div>
                </div>

                {/* Deuxième ligne : Téléphone et Email */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="phoneAnnonceur">Téléphone *</label>
                        <input
                            type="tel"
                            id="phoneAnnonceur"
                            value={data.phoneAnnonceur || ''}
                            onChange={(e) => {
                                const rawValue = e.target.value.replace(/\s/g, '');
                                handleInputChange('phoneAnnonceur', rawValue);
                            }}
                            onBlur={(e) => {
                                const value = e.target.value.replace(/\s/g, '');
                                if (value && !/^(?:\+33|0)[1-9]\d{8}$/.test(value)) {
                                    setErrors(prev => ({ 
                                        ...prev, 
                                        phoneAnnonceur: 'Numéro de téléphone français invalide' 
                                    }));
                                } else {
                                    setErrors(prev => ({ ...prev, phoneAnnonceur: '' }));
                                }
                            }}
                            placeholder="06 12 34 56 78 ou +33123456789"
                            className={errors.phoneAnnonceur ? 'error' : ''}
                        />
                        {errors.phoneAnnonceur && <span className="error-message">{errors.phoneAnnonceur}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="emailAnnonceur">Email *</label>
                        <input
                            type="email"
                            id="emailAnnonceur"
                            value={data.emailAnnonceur || ''}
                            onChange={(e) => handleInputChange('emailAnnonceur', e.target.value)}
                            placeholder="votre@email.com"
                            className={errors.emailAnnonceur ? 'error' : ''}
                        />
                        {errors.emailAnnonceur && <span className="error-message">{errors.emailAnnonceur}</span>}
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Comment avez-vous connu Solutravo ?</h3>
                <div className="radio-group">
                    {howDidYouKnowOptions.map((option) => (
                        <label key={option} className="radio-option">
                            <input
                                type="radio"
                                name="howDidYouKnowAnnonceur"
                                value={option}
                                checked={data.howDidYouKnowAnnonceur === option}
                                onChange={(e) => handleInputChange('howDidYouKnowAnnonceur', e.target.value)}
                            />
                            <span className="radio-custom"></span>
                            <span className="radio-label">{option}</span>
                        </label>
                    ))}
                </div>
                {errors.howDidYouKnowAnnonceur && <span className="error-message">{errors.howDidYouKnowAnnonceur}</span>}
            </div>

            <div className="step-actions">
                <button className="btn-back" onClick={onPrev} disabled={loading}>
                    Retour
                </button>
                <button 
                    className="btn-continue" 
                    onClick={handleContinue}
                    disabled={loading}
                >
                    {loading ? 'Inscription...' : 'Suivant'}
                </button>
            </div>
        </div>
    );
};

export default Step2CompanyInfo;


