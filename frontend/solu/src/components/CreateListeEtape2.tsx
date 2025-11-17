// src/components/create-liste/CreateListeEtape2.tsx

import { useState } from 'react';
import type { CreateListeData } from '../types/create-liste.types';

interface CreateListeEtape2Props {
    data: CreateListeData;
    onUpdate: (data: Partial<CreateListeData>) => void;
    onSuivant: () => void;
    onPrecedent: () => void;
}

const CreateListeEtape2 = ({ data, onUpdate, onSuivant, onPrecedent }: CreateListeEtape2Props) => {
    const [activeMode, setActiveMode] = useState<'import' | 'manuel'>('import');
    const [textareaValue, setTextareaValue] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Traiter le fichier
            console.log('Fichier uploadé:', file.name);
        }
    };

    const handleTextareaChange = (value: string) => {
        setTextareaValue(value);
        const numeros = value.split(/[\n,;]/).filter(n => n.trim());
        const valides = numeros.filter(n => /^\+?\d{10,}$/.test(n.trim()));
        onUpdate({
            numeros: valides,
            numerosValides: valides.length,
        });
    };

    return (
        <div className="etape-campagne etape-with-sidebar-campagne">
            <div className="etape-main-campagne">
                <h3 className="etape-title-campagne">Numéros de téléphone</h3>

                {/* WARNING BOX */}
                <div className="warning-box-liste-campagne">
                    <i className="fa-solid fa-circle-info warning-icon-liste-campagne"></i>
                    <div className="warning-text-liste-campagne">
                        <strong>Attention :</strong> si votre liste comporte des numéros ne provenant pas de la France le message n'ira pas..Si vous vous trompez de numéro, vos SMS
                        risquent d'être envoyés au mauvais destinataire.
                    </div>
                </div>

                {/* TABS */}
                <div className="tabs-liste-campagne">
                    <button
                        className={`tab-liste-campagne ${activeMode === 'import' ? 'active-campagne' : ''}`}
                        onClick={() => setActiveMode('import')}
                    >
                        Importer un fichier
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
                            />
                            <label htmlFor="file-upload-liste" className="file-upload-label-campagne">
                                <i className="fa-solid fa-cloud-arrow-up file-upload-icon-campagne"></i>
                                <span>Sélectionnez un fichier ou déposez-le ici...</span>
                            </label>
                            <button
                                className="btn-secondary"
                                onClick={() => document.getElementById('file-upload-liste')?.click()}
                            >
                                Parcourir
                            </button>
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
                            placeholder="+237693332789&#10;+237693332756&#10;..."
                        ></textarea>
                    </div>
                )}

                <div className="compteur-numeros-campagne">
                    {data.numerosValides} numéro{data.numerosValides > 1 ? 's' : ''} de téléphone
                </div>

                <div className="actions-campagne">
                    <button className="btn-secondary check_button" onClick={onPrecedent}>
                        <i className="fa-solid fa-chevron-left"></i>
                        Précédent
                    </button>
                    <button className="btn-primary check_button" onClick={onSuivant}>
                        Suivant
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            {/* SIDEBAR PAYS */}
            {/* <div className="etape-sidebar-campagne">
                <h4 className="sidebar-title-campagne">Indiquez le pays principal des numéros de téléphone</h4>
                <p className="sidebar-text-campagne">
                    Idéalement, vous fournissez les numéros de téléphone dans un format international. Dans le
                    cas où les numéros de téléphone ne sont pas dans un format international, nous utiliserons
                    le pays ci-dessous pour essayer de les formater correctement.
                </p>

                <select className="select-campagne select-pays-campagne">
                    <option value="FR">🇫🇷 France</option>
                    <option value="CM">🇨🇲 Cameroun</option>
                    <option value="BE">🇧🇪 Belgique</option>
                    <option value="CH">🇨🇭 Suisse</option>
                </select>
            </div> */}
        </div>
    );
};

export default CreateListeEtape2;