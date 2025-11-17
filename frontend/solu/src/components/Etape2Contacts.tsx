
import { useState, useRef, useEffect } from 'react';
import type { CampagneData } from '../types/campagne.types';
import { useNavigate } from 'react-router-dom';

interface ContactGroup {
    id: number;
    name: string;
    count: number;
}

interface Etape2ContactsProps {
    data: CampagneData;
    onUpdate: (data: Partial<CampagneData>) => void;
    onSuivant: () => void;
    onPrecedent: () => void;
}

const Etape2Contacts = ({ data, onUpdate, onSuivant, onPrecedent }: Etape2ContactsProps) => {
    const [activeTab, setActiveTab] = useState<'manuelle' | 'enregistres' | 'nouvelle'>('manuelle');
    const [textareaValue, setTextareaValue] = useState('');
    const [expediteurType, setExpediteurType] = useState<'personnalise' | 'partage'>('personnalise');
    const [expediteurNom, setExpediteurNom] = useState(data.expediteur || '');
    const [erreur, setErreur] = useState('');
    const navigate = useNavigate();

    // États pour contacts enregistrés
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState<ContactGroup[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSuivant = () => {
        //  VALIDATION : Au moins 1 contact valide
        if (data.contactsValides === 0) {
            setErreur('Vous devez ajouter au moins un numéro de téléphone valide');
            return;
        }

        //  VALIDATION : Expéditeur obligatoire
        if (!expediteurNom.trim()) {
            setErreur("L'expéditeur personnalisé est obligatoire");
            return;
        }
        onUpdate({
            contactType: activeTab === 'manuelle' ? 'manuelle' : 'enregistres'
        });
        setErreur('');
        onSuivant();
    };


    // Liste des contacts AVEC count
    const contactGroups: ContactGroup[] = [
        { id: 1, name: 'Installateurs Bornes', count: 33 },
        { id: 2, name: 'Prospects Théo', count: 102 },
        { id: 3, name: 'Users Solutravo', count: 215 },
        { id: 4, name: 'Borne de recharge', count: 89 },
        { id: 5, name: 'Agent Immobilier 68', count: 45 },
        { id: 6, name: 'Agent Immobilier 88', count: 25 },
        { id: 7, name: 'Agent Immobilier 67', count: 25 },
        { id: 8, name: 'Agent Immobilier 57', count: 29 },
        { id: 9, name: 'Agent Immobilier 35', count: 19 },
        { id: 10, name: 'Agent Immobilier 08', count: 5 },
        { id: 11, name: 'Agent Immobilier 29', count: 14 },
        { id: 12, name: 'Agent Immobilier 56', count: 24 },
        { id: 13, name: 'Agent Immobilier 55', count: 9 },
        { id: 14, name: 'Agent Immobilier 54', count: 34 },
        { id: 15, name: 'Agent Immobilier 52', count: 3 },
        { id: 16, name: 'Agent Immobilier 51', count: 33 },
        { id: 17, name: 'Agent Immobilier 10', count: 12 },
    ];

    // VALIDATION NUMÉROS FRANÇAIS
    const validateNumeroFrancais = (numero: string): boolean => {
        // Retirer les espaces
        const cleaned = numero.replace(/\s/g, '');

        // Format international : +33612345678 (commence par +33 suivi de 9 chiffres)
        const intlRegex = /^\+33[1-9]\d{8}$/;

        // Format national : 0612345678 (commence par 0 suivi de 9 chiffres)
        const nationalRegex = /^0[1-9]\d{8}$/;

        return intlRegex.test(cleaned) || nationalRegex.test(cleaned);
    };

    // Filtrer les contacts selon la recherche
    const filteredGroups = contactGroups.filter(
        group => group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Vérifier si un groupe est sélectionné
    const isGroupSelected = (groupId: number) => {
        return selectedGroups.some(g => g.id === groupId);
    };

    // Calculer le total de contacts
    const totalContacts = selectedGroups.reduce((sum, group) => sum + group.count, 0);

    // Fermer dropdown si clic dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // GESTION TEXTAREA AVEC VALIDATION FRANÇAISE
    const handleTextareaChange = (value: string) => {
        setTextareaValue(value);

        // Séparer les numéros par virgule, point-virgule ou saut de ligne
        const contacts = value.split(/[\n,;]/).filter(c => c.trim()).map(c => c.trim());

        // Valider avec regex française
        const valides = contacts.filter(c => validateNumeroFrancais(c));

        // Envoyer TOUS les contacts (valides + invalides) + nombre de valides
        onUpdate({
            contacts: contacts,
            contactsValides: valides.length
        });
    };

    // GESTION EXPÉDITEUR DYNAMIQUE
    const handleExpediteurChange = (nom: string) => {
        setExpediteurNom(nom);
        onUpdate({ expediteur: nom }); // Mise à jour immédiate
    };

    const handleToggleGroup = (group: ContactGroup) => {
        if (isGroupSelected(group.id)) {
            setSelectedGroups(selectedGroups.filter(g => g.id !== group.id));
        } else {
            setSelectedGroups([...selectedGroups, group]);
        }
    };

    const handleRemoveGroup = (groupId: number) => {
        setSelectedGroups(selectedGroups.filter(g => g.id !== groupId));
    };

    // AFFICHAGE VISUEL DES NUMÉROS AVEC COULEURS
    const renderNumeroWithValidation = () => {
        if (!textareaValue) return null;

        const contacts = textareaValue.split(/[\n,;]/).filter(c => c.trim()).map(c => c.trim());

        if (contacts.length === 0) return null;

        return (
            <div className="numeros-validation-display-campagne">
                {contacts.map((numero, index) => {
                    const isValid = validateNumeroFrancais(numero);
                    return (
                        <div
                            key={index}
                            className={`numero-item-validation-campagne ${isValid ? 'valid-campagne' : 'invalid-campagne'}`}
                        >
                            <span>{numero}</span>
                            {!isValid && <i className="fa-solid fa-circle-exclamation"></i>}
                            {isValid && <i className="fa-solid fa-check"></i>}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="etape-campagne etape-with-sidebar-campagne">
            <div className="etape-main-campagne">
                <h3 className="etape-title-campagne">Sélectionner les contacts de la campagne</h3>

                <div className="tabs-campagne">
                    <button
                        className={`tab-campagne ${activeTab === 'manuelle' ? 'active-campagne' : ''}`}
                        onClick={() => setActiveTab('manuelle')}
                    >
                        Liste manuelle
                    </button>
                    <button
                        className={`tab-campagne ${activeTab === 'enregistres' ? 'active-campagne' : ''}`}
                        onClick={() => setActiveTab('enregistres')}
                    >
                        Contacts enregistrés
                    </button>
                    <button
                        className={`tab-campagne ${activeTab === 'nouvelle' ? 'active-campagne' : ''}`}
                        onClick={() => setActiveTab('nouvelle')}
                    >
                        Nouvelle liste de contact
                    </button>
                </div>

                {/* ONGLET LISTE MANUELLE */}
                {activeTab === 'manuelle' && (
                    <div className="tab-content-campagne">
                        <p className="help-text-campagne">
                            Saisissez les numéros de téléphone français en les séparant par une virgule, un point-virgule ou un saut de ligne.
                            <br />
                            <strong>Formats acceptés :</strong> 0612345678 ou +33612345678
                        </p>

                        <textarea
                            className="textarea-contacts-campagne"
                            rows={10}
                            value={textareaValue}
                            onChange={(e) => handleTextareaChange(e.target.value)}
                            placeholder="+33612345678&#10;0698765432&#10;..."
                        ></textarea>

                        {/* AFFICHAGE DES NUMÉROS AVEC VALIDATION */}
                        {renderNumeroWithValidation()}

                        {/* COMPTEUR X/Y */}
                        <div className="validation-info-campagne">
                            <i className="fa-solid fa-check-circle"></i>
                            <span>
                                {data.contactsValides} numéro{data.contactsValides > 1 ? 's' : ''} valide{data.contactsValides > 1 ? 's' : ''} sur {data.contacts.length}
                                {data.contactsValides < data.contacts.length && data.contacts.length > 0 && (
                                    <span className="warning-validation-campagne">
                                        {' '}(Les numéros invalides sont affichés en rouge)
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                )}

                {/* ONGLET CONTACTS ENREGISTRÉS */}
                {activeTab === 'enregistres' && (
                    <div className="tab-content-campagne">
                        <div className="contacts-selector-wrapper-campagne" ref={dropdownRef}>
                            {/* INPUT AVEC TAGS */}
                            <div
                                className="contacts-input-box-campagne"
                                onClick={() => setShowDropdown(true)}
                            >
                                {/* Tags sélectionnés */}
                                <div className="contacts-tags-wrapper-campagne">
                                    {selectedGroups.map(group => (
                                        <span key={group.id} className="contact-tag-campagne">
                                            {group.name} ({group.count})
                                            <button
                                                type="button"
                                                className="contact-tag-close-campagne"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveGroup(group.id);
                                                }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}

                                    {/* Input de recherche */}
                                    <input
                                        type="text"
                                        className="contacts-search-campagne"
                                        placeholder={selectedGroups.length === 0 ? "" : ""}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setShowDropdown(true)}
                                    />
                                </div>

                                {/* Flèche dropdown */}
                                <button
                                    type="button"
                                    className="contacts-arrow-campagne"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDropdown(!showDropdown);
                                    }}
                                >
                                    <i className={`fa-solid fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
                                </button>
                            </div>

                            {/* DROPDOWN LISTE */}
                            {showDropdown && (
                                <div className="contacts-dropdown-campagne">
                                    {filteredGroups.map(group => (
                                        <div
                                            key={group.id}
                                            className={`contacts-item-campagne ${isGroupSelected(group.id) ? 'selected-campagne' : ''}`}
                                            onClick={() => handleToggleGroup(group)}
                                        >
                                            <span className="contacts-item-text-campagne">
                                                {group.name} ({group.count})
                                            </span>
                                            {isGroupSelected(group.id) && (
                                                <i className="fa-solid fa-check contacts-check-campagne"></i>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Compteur total */}
                        {selectedGroups.length > 0 && (
                            <div className="validation-info-campagne" style={{ marginTop: '12px' }}>
                                <i className="fa-solid fa-check-circle"></i>
                                <span>{totalContacts} numéros de téléphone valides parmi les {totalContacts}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* ONGLET NOUVELLE LISTE */}
                {activeTab === 'nouvelle' && (
                    <div className="tab-content-campagne">
                        <p className="nouvelle-liste-text-campagne">
                            Pour pouvoir réutiliser les contacts plus tard, vous pouvez{' '}
                            <a
                                href="#"
                                className="nouvelle-liste-link-campagne"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/create-liste');
                                }}
                            >
                                créer une nouvelle liste de contacts
                            </a>.
                        </p>
                    </div>
                )}

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

            {/* SIDEBAR EXPÉDITEUR */}
            <div className="etape-sidebar-campagne">
                <h4 className="sidebar-title-campagne">Expéditeur</h4>
                <p className="sidebar-text-campagne">
                    Choisissez le nom de l'expéditeur qui s'affichera pour vos contacts :
                </p>

                <div className="expediteur-option-campagne">
                    <div className="radio-header-campagne">
                        <input
                            type="radio"
                            id="expediteur-personnalise"
                            name="expediteur-type"
                            checked={expediteurType === 'personnalise'}
                            onChange={() => setExpediteurType('personnalise')}
                            className="radio-input-campagne"
                        />
                        <label htmlFor="expediteur-personnalise" className="radio-label-campagne">
                            Expéditeur personnalisé
                        </label>
                    </div>

                    <p className="expediteur-description-campagne">
                        Un expéditeur personnalisé (alphanumérique) n'autorise pas la réception des réponses de vos contacts.
                    </p>

                    <p className="expediteur-caracteres-campagne">
                        Caractères spéciaux autorisés : <strong>_-'.,</strong> et l'espace.
                    </p>

                    {/* EXPÉDITEUR DYNAMIQUE */}
                    {expediteurType === 'personnalise' && (
                        <div className="expediteur-input-wrapper-campagne">
                            <input
                                type="text"
                                className="input-campagne input-expediteur-campagne"
                                placeholder="Ex: Solutravo"
                                value={expediteurNom}
                                onChange={(e) => handleExpediteurChange(e.target.value)}
                                maxLength={13}
                            />
                            <p className="caracteres-restants-campagne">
                                {expediteurNom.length}/11 caractères
                            </p>
                        </div>
                    )}

                    <div className="warning-box-campagne">
                        <i className="fa-solid fa-circle-info warning-icon-campagne"></i>
                        <p className="warning-text-campagne">
                            Certains opérateurs bloquent les expéditeurs génériques (info, test, notif...).
                            Pour maximiser le taux de réception de vos campagnes, utilisez un expéditeur
                            plus spécifique (le nom de votre entreprise, par exemple).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Etape2Contacts;

