


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FournisseurData } from './FournisseurRegistration';
import { fetchData } from '../../../src/helpers/fetchData';

interface Step2ContactFormProps {
    data: FournisseurData;
    onUpdate: (data: Partial<FournisseurData>) => void;
    onPrev: () => void;
    onShowSuccess: () => void; // Nouvelle prop
}

const Step2ContactForm: React.FC<Step2ContactFormProps> = ({ 
    data, 
    onUpdate, 
    onPrev,
    onShowSuccess // Nouvelle prop
}) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [checkSiret, setCheckSiret] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSelectingSearch, setIsSelectingSearch] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorPopup, setErrorPopup] = useState<string | null>(null);
    const [cp, setCp] = useState("");
    const [ville, setVille] = useState("");
    const [rue, setRue] = useState("");
    const [showFonctionSuggestions, setShowFonctionSuggestions] = useState(false);
    const [showAutreInput, setShowAutreInput] = useState(false);

    const fonctionOptions = [
    'Dirigeant',
    'Assistant(e) de direction', 
    'Commercial',
    'Autre'
];

    const handleInputChange = (field: keyof FournisseurData, value: string) => {
        onUpdate({ [field]: value });
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

        // Gestion de la sélection de fonction
    const handleSelectFonction = (fonction: string) => {
        if (fonction === 'Autre') {
            // Si "Autre" est sélectionné, on active le champ de précision
            setShowAutreInput(true);
            handleInputChange('contactPosition', '');
        } else {
            // Si une fonction prédéfinie est sélectionnée
            setShowAutreInput(false);
            handleInputChange('contactPosition', fonction);
        }
        setShowFonctionSuggestions(false);
    };

    // Gestion du champ "Autre"
    const handleAutreInputChange = (value: string) => {
        handleInputChange('contactPosition', value);
    };

    // Quand on choisit une suggestion SIRET
    const handleSelectCompany = (company: any) => {
        console.log(company);
        handleInputChange('companyName', company.nom);
        handleInputChange('siren', company.siren);
        handleInputChange('siret', company.siret);
        setCp(company.code);
        setVille(company.libelle);
        setRue(`${company.rue} ${company.ville}`);
        setIsSelectingSearch(false);
        handleInputChange('address', `${company.cp} ${company.type} ${company.ville} ${company.code} ${company.libelle}`);
        setCheckSiret(company.siret);
        setSuggestions([]);

         // Mettre à jour aussi les champs code postal et ville dans formData
        onUpdate({ 
            postalCode: company.code,
            city: company.libelle 
        });
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

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!data.companyName?.trim()) {
            newErrors.companyName = 'Le nom de l\'enseigne est requis';
        }
        if (!data.siren?.trim()) {
            newErrors.siren = 'Le SIREN est requis';
        } else if (!/^\d{9}$/.test(data.siren)) {
            newErrors.siren = 'Le SIREN doit contenir 9 chiffres';
        }
        if (!data.address?.trim()) {
            newErrors.address = 'L\'adresse est requise';
        }
        if (!data.postalCode?.trim()) {
            newErrors.postalCode = 'Le code postal est requis';
        } else if (!/^\d{5}$/.test(data.postalCode)) {
            newErrors.postalCode = 'Le code postal doit contenir 5 chiffres';
        }
        if (!data.city?.trim()) {
            newErrors.city = 'La ville est requise';
        }
        if (!data.contactFirstName?.trim()) {
            newErrors.contactFirstName = 'Le prénom est requis';
        }
        if (!data.contactLastName?.trim()) {
            newErrors.contactLastName = 'Le nom est requis';
        }
        if (!data.contactPhone?.trim()) {
            newErrors.contactPhone = 'Le téléphone est requis';
        } else if (!/^[0-9+\-\s()]+$/.test(data.contactPhone)) {
            newErrors.contactPhone = 'Format de téléphone invalide';
        }
        if (!data.contactEmail?.trim()) {
            newErrors.contactEmail = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
            newErrors.contactEmail = 'Format d\'email invalide';
        }
        if (!data.contactPosition?.trim()) {
            newErrors.contactPosition = 'La fonction est requise';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

     const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        
        try {
            const payload = {
                sector: data.sector,
                customSector: data.customSector,
                companyName: data.companyName,
                siren: data.siren,
                siret: data.siret,
                address: data.address,
                postalCode: data.postalCode,
                city: data.city,
                contactFirstName: data.contactFirstName,
                contactLastName: data.contactLastName,
                contactPhone: data.contactPhone,
                contactEmail: data.contactEmail,
                contactPosition: data.contactPosition,
                message: data.message,
                role: 'fournisseur',
                cp: cp,
                ville: ville,
                rue: rue
            };
            console.log(payload)

            const result = await fetchData('registerFournisseur', 'POST', payload);
            
            if (result.status === 201) {
                onShowSuccess(); // Appelle la fonction pour afficher la popup
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'envoi";
            setErrorPopup(errorMessage);
            setTimeout(() => setErrorPopup(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="step-container">
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

            <h2>Informations de contact</h2>
            <p className="step-description">
                Complétez ce formulaire afin d'être recontacté par le conseiller Solutravo de votre secteur.
            </p>

            <div className="form-section">
                <h3>Informations entreprise</h3>
                
                {/* Première ligne : SIRET et Raison sociale */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="siret">Numéro de SIRET/SIREN * </label>
                        <input 
                            type="text" 
                            placeholder="123456789" 
                            value={checkSiret}
                            className="siret_number1"
                            onChange={(e) => {
                                setCheckSiret(e.target.value);
                                if (!isSelectingSearch) {
                                    setIsSelectingSearch(true);
                                }
                                handleInputChange('siret', e.target.value);
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
                        <label htmlFor="companyName">Nom de l'enseigne *</label>
                        <input
                            type="text"
                            id="companyName"
                            value={data.companyName || ''}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            placeholder="Nom de votre entreprise"
                            className={errors.companyName ? 'error' : ''}
                        />
                        {errors.companyName && <span className="error-message">{errors.companyName}</span>}
                    </div>
                </div>

                {/* Deuxième ligne : SIREN et Adresse */}
                <div className="form-row">
                   <div className="form-group">
                        <label htmlFor="postalCode">Code postal *</label>
                        <input
                            type="text"
                            id="postalCode"
                            value={cp || ''}
                            //  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                            placeholder="75001"
                            className={errors.postalCode ? 'error' : ''}
                        />
                          {/* {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}   */}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="address">Adresse du siège social *</label>
                        <input
                            type="text"
                            id="address"
                            value={data.address || ''}
                         onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="Adresse complète"
                            className={errors.address ? 'error' : ''}
                        />
                         {errors.address && <span className="error-message">{errors.address}</span>} 
                    </div>
                </div>

                {/* Troisième ligne : Code postal et Ville */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="city">Ville *</label>
                        <input
                            type="text"
                            id="city"
                            value={ville || ''}
                        //  onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="Paris"
                            className={errors.city ? 'error' : ''}
                        />
                         {/* {errors.city && <span className="error-message">{errors.city}</span>}  */}
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Coordonnées du contact</h3>
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="contactFirstName">Prénom *</label>
                        <input
                            type="text"
                            id="contactFirstName"
                            value={data.contactFirstName || ''}
                            onChange={(e) => handleInputChange('contactFirstName', e.target.value)}
                            placeholder="Votre prénom"
                            className={errors.contactFirstName ? 'error' : ''}
                        />
                        {errors.contactFirstName && <span className="error-message">{errors.contactFirstName}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="contactLastName">Nom *</label>
                        <input
                            type="text"
                            id="contactLastName"
                            value={data.contactLastName || ''}
                            onChange={(e) => handleInputChange('contactLastName', e.target.value)}
                            placeholder="Votre nom"
                            className={errors.contactLastName ? 'error' : ''}
                        />
                        {errors.contactLastName && <span className="error-message">{errors.contactLastName}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="contactPhone">Téléphone *</label>
                        <input
                            type="tel"
                            id="contactPhone"
                            value={data.contactPhone || ''}
                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                            placeholder="06 12 34 56 78"
                            className={errors.contactPhone ? 'error' : ''}
                        />
                        {errors.contactPhone && <span className="error-message">{errors.contactPhone}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="contactEmail">Email *</label>
                        <input
                            type="email"
                            id="contactEmail"
                            value={data.contactEmail || ''}
                            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                            placeholder="votre@email.com"
                            className={errors.contactEmail ? 'error' : ''}
                        />
                        {errors.contactEmail && <span className="error-message">{errors.contactEmail}</span>}
                    </div>
                </div>

                {/* <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="contactPosition">Fonction *</label>
                        <input
                            type="text"
                            id="contactPosition"
                            value={data.contactPosition || ''}
                            onChange={(e) => handleInputChange('contactPosition', e.target.value)}
                            placeholder="Directeur commercial, Gérant..."
                            className={errors.contactPosition ? 'error' : ''}
                        />
                        {errors.contactPosition && <span className="error-message">{errors.contactPosition}</span>}
                    </div>
                </div> */}

                 {/* NOUVEAU : Sélecteur de fonction */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="contactPosition">Fonction *</label>
                        <input
                            type="text"
                            id="contactPosition"
                            value={data.contactPosition || ''}
                            placeholder="Sélectionnez votre fonction"
                            readOnly
                            className={`fonction-input ${errors.contactPosition ? 'error' : ''}`}
                            onClick={() => setShowFonctionSuggestions(!showFonctionSuggestions)}
                        />
                        {showFonctionSuggestions && (
                            <div className="suggestions_list1 fonction-suggestions">
                                {fonctionOptions.map((fonction, idx) => (
                                    <span
                                        key={idx}
                                        className="suggestion_item1"
                                        onClick={() => handleSelectFonction(fonction)}
                                    >
                                        {fonction}
                                    </span>
                                ))}
                            </div>
                        )}
                        {errors.contactPosition && <span className="error-message">{errors.contactPosition}</span>}
                    </div>
                    
                    {/* Champ "Autre" qui apparaît conditionnellement */}
                    {showAutreInput && (
                        <div className="form-group">
                            <label htmlFor="autreFonction">Précisez votre fonction *</label>
                            <input
                                type="text"
                                id="autreFonction"
                                value={data.contactPosition || ''}
                                onChange={(e) => handleAutreInputChange(e.target.value)}
                                placeholder="Ex: Responsable marketing, Chef de projet..."
                                className={errors.contactPosition ? 'error' : ''}
                            />
                        </div>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group full-width">
                        <label htmlFor="message">Message (optionnel)</label>
                        <textarea
                            id="message"
                            value={data.message || ''}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            placeholder="Décrivez brièvement vos produits/services..."
                            rows={4}
                        />
                    </div>
                </div>
            </div>

            <div className="step-actions">
                <button className="btn-back" onClick={onPrev} disabled={loading}>
                    Retour
                </button>
                <button 
                    className="btn-continue" 
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Envoi...' : 'Envoyer la demande'}
                </button>
            </div>
        </div>
    );
};

export default Step2ContactForm;