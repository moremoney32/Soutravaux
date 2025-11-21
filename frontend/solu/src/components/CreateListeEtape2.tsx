
import { useState } from 'react';
import type { CreateListeData} from '../types/create-liste.types';
import { extractContactsFromFile } from './extractContactsFromFile';


interface CreateListeEtape2Props {
    data: CreateListeData;
    onUpdate: (data: Partial<CreateListeData>) => void;
    onSuivant: () => void;
    onPrecedent: () => void;
}

const CreateListeEtape2 = ({ data, onUpdate, onSuivant, onPrecedent }: CreateListeEtape2Props) => {
    const [activeMode, setActiveMode] = useState<'import' | 'manuel'>('import');
    const [textareaValue, setTextareaValue] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('FR');
    const [erreur, setErreur] = useState('');
    const [isLoading, setIsLoading] = useState(false);
   

    // VALIDATION INTERNATIONALE PAR PAYS
    const validateNumeroInternational = (numero: string): boolean => {
        const cleaned = numero.replace(/\s/g, '');

        switch (selectedCountry) {
            case 'FR':
                return /^(\+33[1-9]\d{8}|0[1-9]\d{8})$/.test(cleaned);
            case 'CM':
                return /^(\+237[6-8]\d{7}|[6-8]\d{7})$/.test(cleaned);
            case 'BE':
                return /^(\+32[1-9]\d{7,8}|0[1-9]\d{7,8})$/.test(cleaned);
            case 'CH':
                return /^(\+41[1-9]\d{8}|0[1-9]\d{8})$/.test(cleaned);
            default:
                return /^\+?[1-9]\d{7,14}$/.test(cleaned);
        }
    };

    // GESTION UPLOAD DE FICHIER AVEC EXTRACTION COMPLÈTE
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedExtensions = ['.csv', '.txt', '.xlsx'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            alert('Format de fichier non supporté. Utilisez CSV, TXT ou XLSX.');
            return;
        }

        setIsLoading(true);

        try {
            const extractedContacts = await extractContactsFromFile(file, validateNumeroInternational);
            
            if (extractedContacts.length === 0) {
                alert('Aucun contact trouvé dans le fichier.');
                return;
            }

            // Séparer les contacts valides et invalides
            const contactsValides = extractedContacts
                .filter(contact => contact.isValid)
                .map(contact => ({
                    name: contact.name,
                    phone_number: contact.phone_number,
                    email: contact.email
                }));

            const contactsInvalides = extractedContacts
                .filter(contact => !contact.isValid)
                .map(contact => ({
                    numero: contact.phone_number,
                    motif: getMotifInvalidite(contact.phone_number),
                    name: contact.name,
                    email: contact.email
                }));

            // Mettre à jour les données
            onUpdate({
                contacts: contactsValides,
                contactsValides: contactsValides.length,
                contactsInvalides: contactsInvalides
            });

            // Préparer l'affichage dans le textarea (uniquement les numéros pour la visualisation)
            const numerosPourAffichage = extractedContacts.map(c => c.phone_number).join('\n');
            setTextareaValue(numerosPourAffichage);
            
            // Basculer automatiquement vers l'onglet manuel pour voir le résultat
            setActiveMode('manuel');
            
            alert(`${contactsValides.length} contacts valides et ${contactsInvalides.length} invalides extraits du fichier`);
            
        } catch (error: any) {
            console.error('Erreur extraction:', error);
            alert(`Erreur lors de l'import: ${error.message}`);
        } finally {
            setIsLoading(false);
            e.target.value = '';
        }
    };

    // GESTION SAISIE MANUELLE
    const handleTextareaChange = (value: string) => {
        setTextareaValue(value);
        const numeros = value.split(/[\n,;]/).filter(n => n.trim()).map(n => n.trim());
        
        // Pour la saisie manuelle, on crée des contacts basiques
        const contactsValides = numeros
            .filter(validateNumeroInternational)
            .map(numero => ({
                name: "", // Nom vide pour saisie manuelle
                phone_number: numero,
                email: "" // Email vide pour saisie manuelle
            }));

        const contactsInvalides = numeros
            .filter(n => !validateNumeroInternational(n))
            .map(numero => ({
                numero: numero,
                motif: getMotifInvalidite(numero)
            }));

        onUpdate({
            contacts: contactsValides,
            contactsValides: contactsValides.length,
            contactsInvalides: contactsInvalides
        });
        
        if (contactsValides.length > 0) {
            setErreur('');
        }
    };

    const getMotifInvalidite = (numero: string): string => {
        const cleaned = numero.replace(/\s/g, '');
        
        if (cleaned.length < 10) {
            return 'Numéro trop court';
        } else if (cleaned.length > 15) {
            return 'Numéro trop long';
        } else if (!/^[\d+]/.test(cleaned)) {
            return 'Caractères non autorisés';
        } else if (!/^(\+33|0|\+237|\+32|\+41)/.test(cleaned)) {
            return 'Indicatif pays incorrect';
        } else {
            return 'Format invalide';
        }
    };

    const handleSuivantAvecValidation = () => {
        if (data.contactsValides === 0) {
            setErreur('Vous devez ajouter au moins un numéro de téléphone valide');
            return;
        }
        setErreur('');
        onSuivant();
    };

    // AFFICHAGE VISUEL DES NUMÉROS AVEC VALIDATION
    const renderNumeroWithValidation = () => {
        if (!textareaValue) return null;
        const numeros = textareaValue.split(/[\n,;]/).filter(n => n.trim()).map(n => n.trim());
        if (numeros.length === 0) return null;

        return (
            <div className="numeros-validation-display-campagne">
                {numeros.map((numero, index) => {
                    const isValid = validateNumeroInternational(numero);
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
                <h3 className="etape-title-campagne">Numéros de téléphone</h3>

                <div className="warning-box-liste-campagne">
                    <i className="fa-solid fa-circle-info warning-icon-liste-campagne"></i>
                    <div className="warning-text-liste-campagne">
                        <strong>Formats supportés :</strong> CSV, TXT, XLSX
                        <br />
                        <strong>Fonctionnalité :</strong> Les fichiers CSV/Excel avec colonnes "Nom", "Téléphone", "Email" seront entièrement importés.
                    </div>
                    
                </div>

                {/* TABS */}
                <div className="tabs-liste-campagne">
                    <button
                        className={`tab-liste-campagne ${activeMode === 'import' ? 'active-campagne' : ''}`}
                        onClick={() => setActiveMode('import')}
                    >
                        {isLoading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Import en cours...
                            </>
                        ) : (
                            'Importer un fichier'
                        )}
                    </button>
                    <button
                        className={`tab-liste-campagne ${activeMode === 'manuel' ? 'active-campagne' : ''}`}
                        onClick={() => setActiveMode('manuel')}
                    >
                        Entrée manuelle
                    </button>
                </div>

                {/* IMPORT MODE */}
                {activeMode === 'import' && (
                    <div className="tab-content-campagne">
                        <div className="file-upload-zone-campagne">
                            <input
                                type="file"
                                id="file-upload-liste"
                                className="file-input-hidden-campagne"
                                accept=".csv,.txt,.xlsx"
                                onChange={handleFileUpload}
                                disabled={isLoading}
                            />
                            <label htmlFor="file-upload-liste" className="file-upload-label-campagne">
                                <i className="fa-solid fa-cloud-arrow-up file-upload-icon-campagne"></i>
                                <span>
                                    {isLoading ? 'Traitement en cours...' : 'Sélectionnez un fichier CSV, TXT ou XLSX'}
                                </span>
                            </label>
                            <button
                                className="btn-secondary"
                                onClick={() => document.getElementById('file-upload-liste')?.click()}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Chargement...' : 'Parcourir'}
                            </button>
                        </div>
                        
                        <div className="import-instructions-campagne">
                            <h4>Structure recommandée pour les fichiers :</h4>
                            <ul>
                                <li><strong>CSV/Excel :</strong> Colonnes "Nom", "Téléphone", "Email" (reconnues automatiquement)</li>
                                <li><strong>TXT :</strong> Un numéro par ligne (noms et emails vides)</li>
                                <li>Les numéros valides apparaîtront en vert, les invalides en rouge</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* MANUAL MODE */}
                {activeMode === 'manuel' && (
                    <div className="tab-content-campagne">
                        <textarea
                            className="textarea-contacts-campagne"
                            rows={10}
                            value={textareaValue}
                            onChange={(e) => handleTextareaChange(e.target.value)}
                            placeholder={
                                selectedCountry === 'FR' ? "+33612345678\n0698765432\n..." :
                                selectedCountry === 'CM' ? "+237612345678\n678901234\n..." :
                                "+33123456789\n..."
                            }
                        ></textarea>

                        {renderNumeroWithValidation()}

                        <div className="validation-info-campagne">
                            <i className="fa-solid fa-check-circle"></i>
                            <span>
                                {data.contactsValides} contact{data.contactsValides > 1 ? 's' : ''} valide{data.contactsValides > 1 ? 's' : ''} sur {data.contacts.length + (data.contactsInvalides?.length || 0)}
                                {data.contactsValides < (data.contacts.length + (data.contactsInvalides?.length || 0)) && (
                                    <span className="warning-validation-campagne">
                                        {' '}(Les numéros invalides sont affichés en rouge)
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                )}

                <div className="compteur-numeros-campagne">
                    {data.contactsValides} contact{data.contactsValides > 1 ? 's' : ''} valide{data.contactsValides > 1 ? 's' : ''}
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
                    <button className="btn-primary check_button" onClick={handleSuivantAvecValidation}>
                        Suivant
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateListeEtape2;