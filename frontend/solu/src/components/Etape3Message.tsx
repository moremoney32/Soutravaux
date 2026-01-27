


// import { useState, useEffect } from 'react';
// import '../styles/modals-campagne.css';
// import type { CampagneData } from '../types/campagne.types';
// import ModalInsererLien from './ModalInsererLien';
// import ModalInsererFichier from './ModalInsererFichier';


// const API_BASE_URL = 'https://integration-api.solutravo-app.fr/api';

// export interface MessageTemplate {
//   id: string; 
//   name: string;
//   message: string;
// }

// const getMessageTemplates = async (membreId: number): Promise<MessageTemplate[]> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/modele_sms/${membreId}`, {
//       method: 'GET',
//       headers: {
//         'accept': 'application/json',
//         'X-CSRF-TOKEN': '', 
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Erreur HTTP: ${response.status}`);
//     }

//     const data: MessageTemplate[] = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Erreur lors de la récupération des modèles de messages:', error);
//     throw error;
//   }
// };

// interface Etape3MessageProps {
//     data: CampagneData;
//     onUpdate: (data: Partial<CampagneData>) => void;
//     onSuivant: () => void;
//     onPrecedent: () => void;
// }

// const Etape3Message = ({ data, onUpdate, onSuivant, onPrecedent }: Etape3MessageProps) => {
//     const [showEmoji, setShowEmoji] = useState(false);
//     const [showModalLien, setShowModalLien] = useState(false);
//     const [showModalFichier, setShowModalFichier] = useState(false);
//     const [stopMention, setStopMention] = useState<string | null>(null);
//     const [message, setMessage] = useState(data.message);
//     const [liens, setLiens] = useState<string[]>(data.links || []); //dInitialiser depuis data.links
//     const [fichiers, setFichiers] = useState<string[]>(data.fichiers || []);
//     const [erreur, setErreur] = useState("");

//     // États pour les modèles de messages
//     const [templates, setTemplates] = useState<MessageTemplate[]>([]);
//     const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
//     const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
//     let membreId = localStorage.getItem("membreId")
//     let userId = Number(membreId)

//     // Charger les modèles au montage du composant
//     useEffect(() => {
//         const loadTemplates = async () => {
//             setIsLoadingTemplates(true);
//             try {
//                 const membreId = userId; 
//                 const data = await getMessageTemplates(membreId);
//                 setTemplates(data);
//                 console.log('Modèles chargés:', data);
//             } catch (error) {
//                 console.error('Erreur chargement modèles:', error);
//                 setErreur('Impossible de charger les modèles de messages');
//             } finally {
//                 setIsLoadingTemplates(false);
//             }
//         };

//         loadTemplates();
//     }, []);
//     // ⬅️ NOUVELLE FONCTION SIMPLIFIÉE : Insérer STOP directement
//     const handleInsertStopDirect = () => {
//         const stopText = 'STOP'; 
        
//         // Ajouter STOP à la fin du message
//         const newMessage = message + (message ? ' ' : '') + stopText;
//         handleMessageChange(newMessage);
        
//         // Sauvegarder la mention STOP
//         setStopMention(stopText);
        
//         // ⬅️ CHANGER LE PUSHTYPE À "marketing"
//         onUpdate({ 
//             pushtype: 'marketing',
//             marketingPurpose: true
//         });
//     };

//     // ⬅️ FONCTION : Supprimer STOP
//     const handleRemoveStop = () => {
//         if (stopMention) {
//             // Supprimer la mention STOP du message
//             const newMessage = message.replace(stopMention, '').trim();
//             handleMessageChange(newMessage);
            
//             // Réinitialiser
//             setStopMention(null);
            
//             // ⬅️ REMETTRE LE PUSHTYPE À "alert"
//             onUpdate({ 
//                 pushtype: 'alert',
//                 marketingPurpose: false
//             });
//         }
//     };

//     const handleSuivant = () => {
//         if (!message.trim()) {
//             setErreur('Le message est obligatoire');
//             return;
//         }

//         //dEnvoyer links au lieu de liens
//         onUpdate({ 
//             links: liens,  //dIMPORTANT : links pas liens
//             fichiers: fichiers 
//         });
        
//         setErreur('');
//         onSuivant();
//     };

//     const handleMessageChange = (value: string) => {
//         setMessage(value);
//         const length = value.length;
//         const smsCount = Math.ceil(length / 160) || 1;
//         onUpdate({
//             message: value,
//             messageLength: length,
//             smsCount
//         });
//     };

//     const insertEmoji = (emoji: string) => {
//         const newMessage = message + emoji;
//         handleMessageChange(newMessage);
//         setShowEmoji(false);
//     };

    
//     const remplacerLiensParPlaceholder = (texte: string) => {
//   const urlRegex = /(https?:\/\/[^\s]+)/g;
//   const liensDetectes = texte.match(urlRegex) || [];
  
//   //  Remplacer CHAQUE lien par <-short->
//   let messageModifie = texte;
//   liensDetectes.forEach(lien => {
//     messageModifie = messageModifie.replace(lien, '<-short->');
//   });
  
//   return { messageModifie, liensDetectes };
// };

//     const handleAppliquerModele = () => {
//   const template = templates.find(t => t.id === selectedTemplateId);
  
//   if (template) {
//     //  Détecter et remplacer les liens par <-short->
//     const { messageModifie, liensDetectes } = remplacerLiensParPlaceholder(template.message);
    
//     // Mettre à jour le textarea avec les placeholders
//     handleMessageChange(messageModifie);
    
//     // Sauvegarder les vrais liens
//     setLiens(liensDetectes);
//   }
// };


//     //dNOUVELLE FONCTION : Insérer un lien avec placeholder
//     const handleInsertLien = (lienSaisi: string) => {
//         // Ajouter le placeholder dans le message
//         const placeholder = '<-short->';
//         const newMessage = message + (message ? ' ' : '') + placeholder + ' ';
//         handleMessageChange(newMessage);
        
//         // Sauvegarder le vrai lien dans l'array
//         setLiens([...liens, lienSaisi]);
        
//         setShowModalLien(false);
//     };

//     const handleInsertFichier = (fileName: string) => {
//         setFichiers([...fichiers, fileName]);
//         setShowModalFichier(false);
//     };

//     // MODIFIER : Supprimer le placeholder ET le lien
//     const handleRemoveLien = (index: number) => {
//         // Supprimer le lien de l'array
//         setLiens(liens.filter((_, i) => i !== index));
        
//         // Supprimer UN placeholder du message
//         const newMessage = message.replace('<-short->', '').trim();
//         handleMessageChange(newMessage);
//     };

//     const handleRemoveFichier = (index: number) => {
//         setFichiers(fichiers.filter((_, i) => i !== index));
//     };

//     // NOUVELLE FONCTION : Remplacer les placeholders par les vrais liens pour l'aperçu
//     const formaterMessageApercu = (texte: string) => {
//         let messageAvecLiens = texte;
        
//         // Remplacer chaque <-short-> par le vrai lien correspondant
//         liens.forEach((lien) => {
//             messageAvecLiens = messageAvecLiens.replace('<-short->', lien);
//         });
        
//         // Détecter les URLs et les rendre cliquables
//         const urlRegex = /(https?:\/\/[^\s]+)/g;
//         const parties = messageAvecLiens.split(urlRegex);
        
//         return parties.map((partie, index) => {
//             if (partie.match(urlRegex)) {
//                 return (
//                     <a 
//                         key={index}
//                         href={partie} 
//                         target="_blank" 
//                         rel="noopener noreferrer"
//                         className="preview-link-campagne"
//                     >
//                         {partie}
//                     </a>
//                 );
//             }
//             return partie;
//         });
//     };

//     return (
//         <div className="etape-campagne">
//             <h3 className="etape-title-campagne">Message</h3>

//             {/* SÉLECTEUR DE MODÈLE */}
//             <div className="form-group-campagne">
//                 <label>Modèle de message</label>
//                 <div className="model-selector-campagne">
//                     <select 
//                         className="select-campagne"
//                         value={selectedTemplateId || ''}
//                         onChange={(e) => setSelectedTemplateId(e.target.value)}
//                         disabled={isLoadingTemplates}
//                     >
//                         <option value="">
//                             {isLoadingTemplates 
//                                 ? 'Chargement des modèles...' 
//                                 : templates.length === 0
//                                     ? 'Aucun modèle disponible'
//                                     : 'Choisissez un modèle de message'
//                             }
//                         </option>
//                         {templates.map(template => (
//                             <option key={template.id} value={template.id}>
//                                 {template.name}
//                             </option>
//                         ))}
//                     </select>
//                     <button 
//                         className="btn-primary btn-small-campagne"
//                         onClick={handleAppliquerModele}
//                         disabled={!selectedTemplateId || isLoadingTemplates}
//                     >
//                         Appliquer
//                     </button>
//                 </div>
//             </div>

//             <div className="message-toolbar-campagne">
//                 <button
//                     className="btn-tertiary btn-icon-campagne"
//                     onClick={() => setShowModalLien(true)}
//                 >
//                     <i className="fa-solid fa-link"></i>
//                     Insérer un lien
//                 </button>
//                 <button
//                     className="btn-tertiary btn-icon-campagne"
//                     onClick={handleInsertStopDirect}
//                     disabled={!!stopMention}
//                     style={{
//                         opacity: stopMention ? 0.5 : 1,
//                         cursor: stopMention ? 'not-allowed' : 'pointer'
//                     }}
//                 >
//                     <i className="fa-solid fa-ban"></i>
//                     Insérer la mention STOP
//                 </button>
//                 <button
//                     className="btn-emoji-campagne"
//                     onClick={() => setShowEmoji(!showEmoji)}
//                 >
//                     😀
//                 </button>
//                 {showEmoji && (
//                     <div className="emoji-picker-campagne">
//                         {['😀', '😃', '😄', '😁', '😊', '🎉', '✅', '❤️', '🔥', '💡'].map(emoji => (
//                             <span
//                                 key={emoji}
//                                 className="emoji-option-campagne"
//                                 onClick={() => insertEmoji(emoji)}
//                             >
//                                 {emoji}
//                             </span>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/*dAFFICHAGE DES VRAIS LIENS (pas les placeholders) */}
//             {(liens.length > 0 || fichiers.length > 0) && (
//                 <div className="inserts-display-campagne">
//                     {liens.map((lien, index) => (
//                         <div key={`lien-${index}`} className="insert-item-campagne insert-lien-campagne">
//                             <i className="fa-solid fa-link"></i>
//                             <a href={lien} target="_blank" rel="noopener noreferrer" className="insert-link-text-campagne">
//                                 {lien}
//                             </a>
//                             <button
//                                 type="button"
//                                 className="insert-remove-campagne"
//                                 onClick={() => handleRemoveLien(index)}
//                             >
//                                 ×
//                             </button>
//                         </div>
//                     ))}
//                     {/* ⬅️ AFFICHAGE STOP */}
//                     {stopMention && (
//                         <div className="insert-item-campagne insert-stop-campagne" style={{
//                             background: '#FFF3CD',
//                             border: '1px solid #FFC107',
//                             color: '#856404'
//                         }}>
//                             <i className="fa-solid fa-ban"></i>
//                             <span className="insert-stop-text-campagne">{stopMention}</span>
//                             <button
//                                 type="button"
//                                 className="insert-remove-campagne"
//                                 onClick={handleRemoveStop}
//                             >
//                                 ×
//                             </button>
//                         </div>
//                     )}

//                     {fichiers.map((fichier, index) => (
//                         <div key={`fichier-${index}`} className="insert-item-campagne insert-fichier-campagne">
//                             <i className="fa-solid fa-paperclip"></i>
//                             <span className="insert-file-text-campagne">{fichier}</span>
//                             <button
//                                 type="button"
//                                 className="insert-remove-campagne"
//                                 onClick={() => handleRemoveFichier(index)}
//                             >
//                                 ×
//                             </button>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/*dTEXTAREA : Affiche le message avec <-short-> */}
//             <div className="form-group-campagne">
//                 <label>
//                     Message 
//                     {liens.length > 0 && (
//                         <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
//                             (Les liens sont remplacés par &lt;-short-&gt; pour économiser les caractères)
//                         </span>
//                     )}
//                 </label>
//                 <textarea
//                     className="textarea-message-campagne"
//                     rows={6}
//                     value={message}
//                     onChange={(e) => handleMessageChange(e.target.value)}
//                     placeholder="Rédigez votre message ici ou choisissez un modèle..."
//                 ></textarea>
//                 <div className="message-counter-campagne">
//                     <i className="fa-solid fa-check-circle"></i>
//                     <span>{data.messageLength} / 160 caractères ({data.smsCount} SMS)</span>
//                 </div>
//             </div>

//             {/*dAPERÇU : Affiche les VRAIS liens */}
//             <div className="message-preview-campagne">
//                 <h5>Aperçu (avec les vrais liens)</h5>
//                 <div className="preview-box-campagne">
//                     {message ? (
//                         <div className="preview-text-campagne">
//                             {formaterMessageApercu(message)}
//                         </div>
//                     ) : (
//                         <p className="preview-placeholder-campagne">Votre message apparaîtra ici...</p>
//                     )}
//                 </div>
//             </div>

//             <div className="actions-campagne">
//                 {erreur && (
//                     <div className="error-banner-campagne">
//                         <i className="fa-solid fa-circle-exclamation"></i>
//                         {erreur}
//                     </div>
//                 )}
//                 <button className="btn-secondary check_button" onClick={onPrecedent}>
//                     <i className="fa-solid fa-chevron-left"></i>
//                     Précédent
//                 </button>
//                 <button className="btn-primary check_button" onClick={handleSuivant}>
//                     Suivant
//                     <i className="fa-solid fa-chevron-right"></i>
//                 </button>
//             </div>
//            {/* ⬅️ SUPPRIMER LE MODAL STOP */}
            
//            {showModalLien && (
//                 <ModalInsererLien
//                     onClose={() => setShowModalLien(false)}
//                     onInsert={handleInsertLien}
//                 />
//             )}

//             {showModalLien && (
//                 <ModalInsererLien
//                     onClose={() => setShowModalLien(false)}
//                     onInsert={handleInsertLien}
//                 />
//             )}

//             {showModalFichier && (
//                 <ModalInsererFichier
//                     onClose={() => setShowModalFichier(false)}
//                     onInsert={handleInsertFichier}
//                 />
//             )}
//         </div>
//     );
// };

// export default Etape3Message;



import { useState, useEffect } from 'react';
import '../styles/modals-campagne.css';
import type { CampagneData } from '../types/campagne.types';
import ModalInsererLien from './ModalInsererLien';
import ModalInsererFichier from './ModalInsererFichier';

const API_BASE_URL = 'https://integration-api.solutravo-app.fr/api';

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
    const [stopMention, setStopMention] = useState<string | null>(null);
    const [message, setMessage] = useState(data.message);
    const [liens, setLiens] = useState<string[]>(data.links || []);
    const [fichiers, setFichiers] = useState<string[]>(data.fichiers || []);
    const [erreur, setErreur] = useState("");

    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    let membreId = localStorage.getItem("membreId")
    let userId = Number(membreId)

    useEffect(() => {
        const loadTemplates = async () => {
            setIsLoadingTemplates(true);
            try {
                const membreId = userId; 
                const data = await getMessageTemplates(membreId);
                setTemplates(data);
                console.log('Modèles chargés:', data);
            } catch (error) {
                console.error('Erreur chargement modèles:', error);
                setErreur('Impossible de charger les modèles de messages');
            } finally {
                setIsLoadingTemplates(false);
            }
        };

        loadTemplates();
    }, []);

    // ⬅️ EFFET : Si marketingPurpose devient false, supprimer le STOP
    useEffect(() => {
        if (!data.marketingPurpose && stopMention) {
            handleRemoveStop();
        }
    }, [data.marketingPurpose]);

    const handleInsertStopDirect = () => {
        const stopText = 'STOP';
        
        const newMessage = message + (message ? ' ' : '') + stopText;
        handleMessageChange(newMessage);
        
        setStopMention(stopText);
        
        onUpdate({ 
            pushtype: 'marketing',
            marketingPurpose: true
        });
    };

    const handleRemoveStop = () => {
        if (stopMention) {
            const newMessage = message.replace(stopMention, '').trim();
            handleMessageChange(newMessage);
            
            setStopMention(null);
            
            onUpdate({ 
                pushtype: 'alert',
                marketingPurpose: false
            });
        }
    };

    const handleSuivant = () => {
        if (!message.trim()) {
            setErreur('Le message est obligatoire');
            return;
        }

        // ⬅️ VALIDATION : Si campagne marketing SANS STOP
        if (data.marketingPurpose && !stopMention) {
            setErreur('La mention STOP est obligatoire pour les campagnes marketing');
            return;
        }

        onUpdate({ 
            links: liens,
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

    const remplacerLiensParPlaceholder = (texte: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const liensDetectes = texte.match(urlRegex) || [];
        
        let messageModifie = texte;
        liensDetectes.forEach(lien => {
            messageModifie = messageModifie.replace(lien, '<-short->');
        });
        
        return { messageModifie, liensDetectes };
    };

    const handleAppliquerModele = () => {
        const template = templates.find(t => t.id === selectedTemplateId);
        
        if (template) {
            const { messageModifie, liensDetectes } = remplacerLiensParPlaceholder(template.message);
            handleMessageChange(messageModifie);
            setLiens(liensDetectes);
        }
    };

    const handleInsertLien = (lienSaisi: string) => {
        const placeholder = '<-short->';
        const newMessage = message + (message ? ' ' : '') + placeholder + ' ';
        handleMessageChange(newMessage);
        setLiens([...liens, lienSaisi]);
        setShowModalLien(false);
    };

    const handleInsertFichier = (fileName: string) => {
        setFichiers([...fichiers, fileName]);
        setShowModalFichier(false);
    };

    const handleRemoveLien = (index: number) => {
        setLiens(liens.filter((_, i) => i !== index));
        const newMessage = message.replace('<-short->', '').trim();
        handleMessageChange(newMessage);
    };

    const handleRemoveFichier = (index: number) => {
        setFichiers(fichiers.filter((_, i) => i !== index));
    };

    const formaterMessageApercu = (texte: string) => {
        let messageAvecLiens = texte;
        
        liens.forEach((lien) => {
            messageAvecLiens = messageAvecLiens.replace('<-short->', lien);
        });
        
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parties = messageAvecLiens.split(urlRegex);
        
        return parties.map((partie, index) => {
            if (partie.match(urlRegex)) {
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

            {/* ⬅️ AVERTISSEMENT SI MARKETING SANS STOP */}
            {data.marketingPurpose && !stopMention && (
                <div className="warning-banner-marketing">
                    <i className="fa-solid fa-exclamation-triangle"></i>
                    <span>
                        Cette campagne est à but marketing. La mention STOP est <strong>obligatoire</strong>.
                    </span>
                </div>
            )}

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
                
                {/* ⬅️ BOUTON STOP : VISIBLE UNIQUEMENT SI marketingPurpose = true */}
                {data.marketingPurpose && (
                    <button
                        className="btn-tertiary btn-icon-campagne btn-stop-marketing"
                        onClick={handleInsertStopDirect}
                        disabled={!!stopMention}
                        style={{
                            opacity: stopMention ? 0.5 : 1,
                            cursor: stopMention ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <i className="fa-solid fa-ban"></i>
                        Insérer la mention STOP
                    </button>
                )}

                <button
                    className="btn-emoji-campagne"
                    onClick={() => setShowEmoji(!showEmoji)}
                >
                    😀
                </button>
                
                {showEmoji && (
                    <div className="emoji-picker-campagne">
                        {['😀', '😃', '😄', '😁', '😊', '🎉', '✅', '❤️', '🔥', '💡'].map(emoji => (
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

            {(liens.length > 0 || fichiers.length > 0 || stopMention) && (
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

                    {stopMention && (
                        <div className="insert-item-campagne insert-stop-campagne" style={{
                            background: '#FFF3CD',
                            border: '1px solid #FFC107',
                            color: '#856404'
                        }}>
                            <i className="fa-solid fa-ban"></i>
                            <span className="insert-stop-text-campagne">{stopMention}</span>
                            <button
                                type="button"
                                className="insert-remove-campagne"
                                onClick={handleRemoveStop}
                            >
                                ×
                            </button>
                        </div>
                    )}

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
                <label>
                    Message 
                    {liens.length > 0 && (
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                            (Les liens sont remplacés par &lt;-short-&gt; pour économiser les caractères)
                        </span>
                    )}
                </label>
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
                <h5>Aperçu (avec les vrais liens)</h5>
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