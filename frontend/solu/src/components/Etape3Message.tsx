

import { useState, useEffect } from 'react';
import '../styles/modals-campagne.css';
import type { CampagneData } from '../types/campagne.types';
import ModalInsererLien from './ModalInsererLien';
import ModalInsererFichier from './ModalInsererFichier';


const API_BASE_URL = 'https://backendstaging.solutravo-compta.fr/api';

export interface MessageTemplate {
  id: string; 
  name: string;
  message: string;
}

const getMessageTemplates = async (membreId: number): Promise<MessageTemplate[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/modele_sms/${membreId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-CSRF-TOKEN': '', 
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data: MessageTemplate[] = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles de messages:', error);
    throw error;
  }
};


//  const getMessageTemplateById = async (
//   membreId: number, 
//   templateId: string
// ): Promise<MessageTemplate | undefined> => {
//   try {
//     const templates = await getMessageTemplates(membreId);
//     return templates.find(t => t.id === templateId);
//   } catch (error) {
//     console.error('Erreur lors de la récupération du modèle:', error);
//     throw error;
//   }
// };

interface Etape3MessageProps {
    data: CampagneData;
    onUpdate: (data: Partial<CampagneData>) => void;
    onSuivant: () => void;
    onPrecedent: () => void;
}

const Etape3Message = ({ data, onUpdate, onSuivant, onPrecedent }: Etape3MessageProps) => {
    const [showEmoji, setShowEmoji] = useState(false);
    const [showModalLien, setShowModalLien] = useState(false);
    const [showModalFichier, setShowModalFichier] = useState(false);
    const [message, setMessage] = useState(data.message);
    const [liens, setLiens] = useState<string[]>([]);
    const [fichiers, setFichiers] = useState<string[]>([]);
    const [erreur, setErreur] = useState("");

    // États pour les modèles de messages
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null); // string au lieu de number
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    let membreId = localStorage.getItem("membreId")
  let userId = Number(membreId)

    // Charger les modèles au montage du composant
    useEffect(() => {
        const loadTemplates = async () => {
            setIsLoadingTemplates(true);
            try {
                const membreId = userId; 
                const data = await getMessageTemplates(membreId);
                setTemplates(data);
                console.log('Modèles chargés:', data);
            } catch (error) {
                console.error(' Erreur chargement modèles:', error);
                setErreur('Impossible de charger les modèles de messages');
            } finally {
                setIsLoadingTemplates(false);
            }
        };

        loadTemplates();
    }, []);

    const handleSuivant = () => {
        if (!message.trim()) {
            setErreur('Le message est obligatoire');
            return;
        }

        onUpdate({ 
            liens: liens,
            fichiers: fichiers 
        });
        
        setErreur('');
        onSuivant();
    };

    const handleMessageChange = (value: string) => {
        setMessage(value);
        const length = value.length;
        const smsCount = Math.ceil(length / 160) || 1;
        onUpdate({
            message: value,
            messageLength: length,
            smsCount
        });
    };

    const insertEmoji = (emoji: string) => {
        const newMessage = message + emoji;
        handleMessageChange(newMessage);
        setShowEmoji(false);
    };

    // Appliquer un modèle de message
    const handleAppliquerModele = () => {
        if (!selectedTemplateId) {
            alert('Veuillez sélectionner un modèle');
            return;
        }

        const template = templates.find(t => t.id === selectedTemplateId);
        if (template) {
            console.log('Modèle appliqué:', template);
            
            // Remplacer le message par celui du modèle
            handleMessageChange(template.message);
            
            // Détecter automatiquement les liens dans le modèle
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const liensDetectes = template.message.match(urlRegex) || [];
            setLiens(liensDetectes);
            
            console.log('🔗 Liens détectés:', liensDetectes);
        }
    };

    const handleInsertLien = (lienSaisi: string) => {
        const newMessage = message + (message ? ' ' : '') + lienSaisi + ' ';
        handleMessageChange(newMessage);
        setLiens([...liens, lienSaisi]);
        setShowModalLien(false);
    };

    const handleInsertFichier = (fileName: string) => {
        setFichiers([...fichiers, fileName]);
        setShowModalFichier(false);
    };

    const handleRemoveLien = (index: number) => {
        const lienASupprimer = liens[index];
        setLiens(liens.filter((_, i) => i !== index));
        
        const regex = new RegExp(lienASupprimer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const newMessage = message.replace(regex, '').replace(/\s+/g, ' ').trim();
        handleMessageChange(newMessage);
    };

    const handleRemoveFichier = (index: number) => {
        setFichiers(fichiers.filter((_, i) => i !== index));
    };

    const detecterUrls = (texte: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return texte.split(urlRegex);
    };

    const formaterMessageApercu = (texte: string) => {
        const parties = detecterUrls(texte);
        
        return parties.map((partie, index) => {
            if (partie.match(/https?:\/\/[^\s]+/)) {
                return (
                    <a 
                        key={index}
                        href={partie} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="preview-link-campagne"
                    >
                        {partie}
                    </a>
                );
            }
            return partie;
        });
    };

    return (
        <div className="etape-campagne">
            <h3 className="etape-title-campagne">Message</h3>

            {/* SÉLECTEUR DE MODÈLE */}
            <div className="form-group-campagne">
                <label>Modèle de message</label>
                <div className="model-selector-campagne">
                    <select 
                        className="select-campagne"
                        value={selectedTemplateId || ''}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        disabled={isLoadingTemplates}
                    >
                        <option value="">
                            {isLoadingTemplates 
                                ? 'Chargement des modèles...' 
                                : templates.length === 0
                                    ? 'Aucun modèle disponible'
                                    : 'Choisissez un modèle de message'
                            }
                        </option>
                        {templates.map(template => (
                            <option key={template.id} value={template.id}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                    <button 
                        className="btn-primary btn-small-campagne"
                        onClick={handleAppliquerModele}
                        disabled={!selectedTemplateId || isLoadingTemplates}
                    >
                        Appliquer
                    </button>
                </div>
            </div>

            <div className="message-toolbar-campagne">
                <button
                    className="btn-tertiary btn-icon-campagne"
                    onClick={() => setShowModalLien(true)}
                >
                    <i className="fa-solid fa-link"></i>
                    Insérer un lien
                </button>
                <button
                    className="btn-emoji-campagne"
                    onClick={() => setShowEmoji(!showEmoji)}
                >
                    😀
                </button>
                {showEmoji && (
                    <div className="emoji-picker-campagne">
                        {['😀', '😃', '😄', '😁', '😊', '🎉', '✅', '', '🔥', '💡'].map(emoji => (
                            <span
                                key={emoji}
                                className="emoji-option-campagne"
                                onClick={() => insertEmoji(emoji)}
                            >
                                {emoji}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {(liens.length > 0 || fichiers.length > 0) && (
                <div className="inserts-display-campagne">
                    {liens.map((lien, index) => (
                        <div key={`lien-${index}`} className="insert-item-campagne insert-lien-campagne">
                            <i className="fa-solid fa-link"></i>
                            <a href={lien} target="_blank" rel="noopener noreferrer" className="insert-link-text-campagne">
                                {lien}
                            </a>
                            <button
                                type="button"
                                className="insert-remove-campagne"
                                onClick={() => handleRemoveLien(index)}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {fichiers.map((fichier, index) => (
                        <div key={`fichier-${index}`} className="insert-item-campagne insert-fichier-campagne">
                            <i className="fa-solid fa-paperclip"></i>
                            <span className="insert-file-text-campagne">{fichier}</span>
                            <button
                                type="button"
                                className="insert-remove-campagne"
                                onClick={() => handleRemoveFichier(index)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="form-group-campagne">
                <textarea
                    className="textarea-message-campagne"
                    rows={6}
                    value={message}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    placeholder="Rédigez votre message ici ou choisissez un modèle..."
                ></textarea>
                <div className="message-counter-campagne">
                    <i className="fa-solid fa-check-circle"></i>
                    <span>{data.messageLength} / 160 caractères ({data.smsCount} SMS)</span>
                </div>
            </div>

            <div className="message-preview-campagne">
                <h5>Aperçu</h5>
                <div className="preview-box-campagne">
                    {message ? (
                        <div className="preview-text-campagne">
                            {formaterMessageApercu(message)}
                        </div>
                    ) : (
                        <p className="preview-placeholder-campagne">Votre message apparaîtra ici...</p>
                    )}
                </div>
            </div>

            {/* <button className="btn-tertiary btn-save-model-campagne">
                <i className="fa-solid fa-save"></i>
                Sauvegarder comme modèle
            </button> */}

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

            {showModalLien && (
                <ModalInsererLien
                    onClose={() => setShowModalLien(false)}
                    onInsert={handleInsertLien}
                />
            )}

            {showModalFichier && (
                <ModalInsererFichier
                    onClose={() => setShowModalFichier(false)}
                    onInsert={handleInsertFichier}
                />
            )}
        </div>
    );
};

export default Etape3Message;