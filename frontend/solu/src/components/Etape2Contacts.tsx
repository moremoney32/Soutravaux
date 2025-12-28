

// import { useState, useRef, useEffect } from 'react';
// import type { CampagneData, ContactList } from '../types/campagne.types';
// import { useNavigate } from 'react-router-dom';

// interface Etape2ContactsProps {
//     data: CampagneData;
//     onUpdate: (data: Partial<CampagneData>) => void;
//     onSuivant: () => void;
//     onPrecedent: () => void;
// }

// const Etape2Contacts = ({ data, onUpdate, onSuivant, onPrecedent }: Etape2ContactsProps) => {
//     const [activeTab, setActiveTab] = useState<'manuelle' | 'enregistres' | 'nouvelle'>('manuelle');
//     const [textareaValue, setTextareaValue] = useState('');
//     const [expediteurType, setExpediteurType] = useState<'personnalise' | 'partage'>('personnalise');
//     const [expediteurNom, setExpediteurNom] = useState(data.expediteur || '');
//     const [erreur, setErreur] = useState('');
//     const navigate = useNavigate();
//      let membreIds = localStorage.getItem("membreId")
//  let membreId = Number(membreIds)
//   let userId = Number(membreId)
//   //let societeIds = localStorage.getItem("membreId"); // Ajouter societeId au localStorage
//     //let societeId = Number(societeIds);

//     // États pour contacts enregistrés
//     const [showDropdown, setShowDropdown] = useState(false);
//     const [selectedLists, setSelectedLists] = useState<ContactList[]>([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [contactLists, setContactLists] = useState<ContactList[]>([]);
//     const [isLoadingLists, setIsLoadingLists] = useState(false);
//     const dropdownRef = useRef<HTMLDivElement>(null);

//     //const API_BASE_URL = 'https://backendstaging.solutravo-compta.fr/api';
//     const API_BASE_URLs = 'http://localhost:3000/api'
// const getContactLists = async (membreId: number): Promise<ContactList[]> => {
//   try {
//     const response = await fetch(`${API_BASE_URLs}/contact-lists/societe/${membreId}`, {
//       method: 'GET',
//       headers: {
//         'accept': 'application/json',
//         'X-CSRF-TOKEN': '', // À remplacer par le vrai token si nécessaire
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Erreur HTTP: ${response.status}`);
//     }

//     const data: ContactList[] = await response.json();
//     console.log(data)
//     return data;
//   } catch (error) {
//     console.error('Erreur lors de la récupération des listes de contacts:', error);
//     throw error;
//   }
// };

//     //Charger les listes de contacts depuis l'API
//     useEffect(() => {
//         const loadContactLists = async () => {
//             setIsLoadingLists(true);
//             try {
//                 const membreId = userId; 
//                 const lists = await getContactLists(membreId);
//                 setContactLists(lists);
//             } catch (error) {
//                 console.error('Erreur chargement listes:', error);
//                 setErreur('Impossible de charger les listes de contacts');
//             } finally {
//                 setIsLoadingLists(false);
//             }
//         };

//         if (activeTab === 'enregistres') {
//             loadContactLists();
//         }
//     }, [activeTab]);

//     const handleSuivant = () => {
//         // VALIDATION selon l'onglet actif
//         if (activeTab === 'manuelle') {
//             if (data.contactsValides === 0) {
//                 setErreur('Vous devez ajouter au moins un numéro de téléphone valide');
//                 return;
//             }
            
//             // Pour contact manuel : list_contact_id = null
//             onUpdate({
//                 contactType: 'manuelle',
//                 list_contact_id: null,
//                 // contacts est déjà mis à jour dans handleTextareaChange
//             });
            
//         } else if (activeTab === 'enregistres') {
//             if (selectedLists.length === 0) {
//                 setErreur('Vous devez sélectionner au moins une liste de contacts');
//                 return;
//             }
            
//             //Pour listes enregistrées : extraire les IDs des listes
//             const listIds = selectedLists.map(list => list.id);
            
//             //Extraire TOUS les numéros pour les statistiques
//             const allPhoneNumbers = selectedLists.flatMap(list => 
//                 list.contacts.map(contact => contact.phone_number)
//             );
            
//             // Calculer le nombre total de contacts
//             const totalContacts = selectedLists.reduce((sum, list) => sum + list.contacts_count, 0);
            
//             onUpdate({
//                 contactType: 'enregistres',
//                 list_contact_id: listIds, // IDs des listes pour l'API
//                 contacts: allPhoneNumbers, // Numéros pour les stats
//                 contactsValides: totalContacts,
//             });
//         }

//         // VALIDATION : Expéditeur obligatoire
//         if (!expediteurNom.trim()) {
//             setErreur("L'expéditeur personnalisé est obligatoire");
//             return;
//         }

//         setErreur('');
//         onSuivant();
//     };

//     // VALIDATION NUMÉROS FRANÇAIS
//     const validateNumeroFrancais = (numero: string): boolean => {
//         const cleaned = numero.replace(/\s/g, '');
//         const intlRegex = /^\+33[1-9]\d{8}$/;
//         const nationalRegex = /^0[1-9]\d{8}$/;
//         return intlRegex.test(cleaned) || nationalRegex.test(cleaned);
//     };

//     // Filtrer les listes selon la recherche
//     const filteredLists = contactLists.filter(
//         list => list.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     // Vérifier si une liste est sélectionnée
//     const isListSelected = (listId: string) => {
//         return selectedLists.some(l => l.id === listId);
//     };

//     // Calculer le total de contacts
//     const totalContacts = selectedLists.reduce((sum, list) => sum + list.contacts_count, 0);

//     // Fermer dropdown si clic dehors
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setShowDropdown(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     // GESTION TEXTAREA - Contacts manuels
//     const handleTextareaChange = (value: string) => {
//         setTextareaValue(value);
//         const contacts = value.split(/[\n,;]/).filter(c => c.trim()).map(c => c.trim());
//         const valides = contacts.filter(c => validateNumeroFrancais(c));
        
//         onUpdate({
//             contacts: contacts,
//             contactsValides: valides.length,
//             list_contact_id: null, // Pas de liste pour contact manuel
//         });
//     };

//     // GESTION EXPÉDITEUR
//     const handleExpediteurChange = (nom: string) => {
//         setExpediteurNom(nom);
//         onUpdate({ expediteur: nom });
//     };

//     // Toggle sélection d'une liste
//     const handleToggleList = (list: ContactList) => {
//         if (isListSelected(list.id)) {
//             setSelectedLists(selectedLists.filter(l => l.id !== list.id));
//         } else {
//             setSelectedLists([...selectedLists, list]);
//         }
//     };

//     // Supprimer une liste sélectionnée
//     const handleRemoveList = (listId: string) => {
//         setSelectedLists(selectedLists.filter(l => l.id !== listId));
//     };

//     // AFFICHAGE NUMÉROS AVEC VALIDATION
//     const renderNumeroWithValidation = () => {
//         if (!textareaValue) return null;
//         const contacts = textareaValue.split(/[\n,;]/).filter(c => c.trim()).map(c => c.trim());
//         if (contacts.length === 0) return null;

//         return (
//             <div className="numeros-validation-display-campagne">
//                 {contacts.map((numero, index) => {
//                     const isValid = validateNumeroFrancais(numero);
//                     return (
//                         <div
//                             key={index}
//                             className={`numero-item-validation-campagne ${isValid ? 'valid-campagne' : 'invalid-campagne'}`}
//                         >
//                             <span>{numero}</span>
//                             {!isValid && <i className="fa-solid fa-circle-exclamation"></i>}
//                             {isValid && <i className="fa-solid fa-check"></i>}
//                         </div>
//                     );
//                 })}
//             </div>
//         );
//     };

//     return (
//         <div className="etape-campagne etape-with-sidebar-campagne">
//             <div className="etape-main-campagne">
//                 <h5 className="etape-title-campagne">Sélectionner les contacts de la campagne</h5>

//                 <div className="tabs-campagne">
//                     <button
//                         className={`tab-campagne ${activeTab === 'manuelle' ? 'active-campagne' : ''}`}
//                         onClick={() => setActiveTab('manuelle')}
//                     >
//                         Liste manuelle
//                     </button>
//                     <button
//                         className={`tab-campagne ${activeTab === 'enregistres' ? 'active-campagne' : ''}`}
//                         onClick={() => setActiveTab('enregistres')}
//                     >
//                         Contacts enregistrés
//                     </button>
//                     <button
//                         className={`tab-campagne ${activeTab === 'nouvelle' ? 'active-campagne' : ''}`}
//                         onClick={() => setActiveTab('nouvelle')}
//                     >
//                         Nouvelle liste de contact
//                     </button>
//                 </div>

//                 {/* ONGLET LISTE MANUELLE */}
//                 {activeTab === 'manuelle' && (
//                     <div className="tab-content-campagne">
//                         <p className="help-text-campagne">
//                             Saisissez les numéros de téléphone français en les séparant par une virgule, un point-virgule ou un saut de ligne.
//                             <br />
//                             <strong>Formats acceptés :</strong> 0612345678 ou +33612345678
//                         </p>

//                         <textarea
//                             className="textarea-contacts-campagne"
//                             rows={10}
//                             value={textareaValue}
//                             onChange={(e) => handleTextareaChange(e.target.value)}
//                             placeholder="+33612345678&#10;0698765432&#10;..."
//                         ></textarea>

//                         {renderNumeroWithValidation()}

//                         <div className="validation-info-campagne">
//                             <i className="fa-solid fa-check-circle"></i>
//                             <span>
//                                 {data.contactsValides} numéro{data.contactsValides > 1 ? 's' : ''} valide{data.contactsValides > 1 ? 's' : ''} sur {data.contacts.length}
//                                 {data.contactsValides < data.contacts.length && data.contacts.length > 0 && (
//                                     <span className="warning-validation-campagne">
//                                         {' '}(Les numéros invalides sont affichés en rouge)
//                                     </span>
//                                 )}
//                             </span>
//                         </div>
//                     </div>
//                 )}

//                 {/* ONGLET CONTACTS ENREGISTRÉS */}
//                 {activeTab === 'enregistres' && (
//                     <div className="tab-content-campagne">
//                         <div className="contacts-selector-wrapper-campagne" ref={dropdownRef}>
//                             <div
//                                 className="contacts-input-box-campagne"
//                                 onClick={() => setShowDropdown(true)}
//                             >
//                                 <div className="contacts-tags-wrapper-campagne">
//                                     {selectedLists.map(list => (
//                                         <span key={list.id} className="contact-tag-campagne">
//                                             {list.name} ({list.contacts_count})
//                                             <button
//                                                 type="button"
//                                                 className="contact-tag-close-campagne"
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleRemoveList(list.id);
//                                                 }}
//                                             >
//                                                 ×
//                                             </button>
//                                         </span>
//                                     ))}

//                                     <input
//                                         type="text"
//                                         className="contacts-search-campagne"
//                                         placeholder={selectedLists.length === 0 ? "Rechercher une liste..." : ""}
//                                         value={searchTerm}
//                                         onChange={(e) => setSearchTerm(e.target.value)}
//                                         onFocus={() => setShowDropdown(true)}
//                                     />
//                                 </div>

//                                 <button
//                                     type="button"
//                                     className="contacts-arrow-campagne"
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         setShowDropdown(!showDropdown);
//                                     }}
//                                 >
//                                     <i className={`fa-solid fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
//                                 </button>
//                             </div>

//                             {showDropdown && (
//                                 <div className="contacts-dropdown-campagne">
//                                     {isLoadingLists ? (
//                                         <div className="contacts-loading-campagne">
//                                             <i className="fa-solid fa-spinner fa-spin"></i>
//                                             Chargement des listes...
//                                         </div>
//                                     ) : filteredLists.length > 0 ? (
//                                         filteredLists.map(list => (
//                                             <div
//                                                 key={list.id}
//                                                 className={`contacts-item-campagne ${isListSelected(list.id) ? 'selected-campagne' : ''}`}
//                                                 onClick={() => handleToggleList(list)}
//                                             >
//                                                 <span className="contacts-item-text-campagne">
//                                                     {list.name} ({list.contacts_count})
//                                                 </span>
//                                                 {isListSelected(list.id) && (
//                                                     <i className="fa-solid fa-check contacts-check-campagne"></i>
//                                                 )}
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <div className="contacts-empty-campagne">
//                                             Aucune liste de contacts trouvée
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         {selectedLists.length > 0 && (
//                             <div className="validation-info-campagne" style={{ marginTop: '12px' }}>
//                                 <i className="fa-solid fa-check-circle"></i>
//                                 <span>{totalContacts} contact{totalContacts > 1 ? 's' : ''} sélectionné{totalContacts > 1 ? 's' : ''}</span>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* ONGLET NOUVELLE LISTE */}
//                  {activeTab === 'nouvelle' && (
//                     <div className="tab-content-campagne">
//                         <p className="nouvelle-liste-text-campagne">
//                             Pour pouvoir réutiliser les contacts plus tard, vous pouvez{' '}
//                             <a
//                                 href="#"
//                                 className="nouvelle-liste-link-campagne"
//                                 onClick={(e) => {
//                                     e.preventDefault();
//                                     navigate('/create-liste');
//                                 }}
//                             >
//                                 créer une nouvelle liste de contacts
//                             </a>
//                         </p>
//                     </div>
//                 )}
//                 <div className="actions-campagne">
//                     {erreur && (
//                         <div className="error-banner-campagne">
//                             <i className="fa-solid fa-circle-exclamation"></i>
//                             {erreur}
//                         </div>
//                     )}
//                     <button className="btn-secondary check_button" onClick={onPrecedent}>
//                         <i className="fa-solid fa-chevron-left"></i>
//                         Précédent
//                     </button>
//                     <button className="btn-primary check_button" onClick={handleSuivant}>
//                         Suivant
//                         <i className="fa-solid fa-chevron-right"></i>
//                     </button>
//                 </div>
//             </div>

//             {/* SIDEBAR EXPÉDITEUR */}
//             <div className="etape-sidebar-campagne">
//                 <h5 className="sidebar-title-campagne">Expéditeur</h5>
//                 <p className="sidebar-text-campagne">
//                     Choisissez le nom de l'expéditeur qui s'affichera pour vos contacts :
//                 </p>

//                 <div className="expediteur-option-campagne">
//                     <div className="radio-header-campagne">
//                         <input
//                             type="radio"
//                             id="expediteur-personnalise"
//                             name="expediteur-type"
//                             checked={expediteurType === 'personnalise'}
//                             onChange={() => setExpediteurType('personnalise')}
//                             className="radio-input-campagne"
//                         />
//                         <label htmlFor="expediteur-personnalise" className="radio-label-campagne">
//                             Expéditeur personnalisé
//                         </label>
//                     </div>

//                     <p className="expediteur-description-campagne">
//                         Un expéditeur personnalisé (alphanumérique) n'autorise pas la réception des réponses de vos contacts.
//                     </p>

//                     <p className="expediteur-caracteres-campagne">
//                         Caractères spéciaux autorisés : <strong>_-'.,</strong> et l'espace.
//                     </p>

//                     {expediteurType === 'personnalise' && (
//                         <div className="expediteur-input-wrapper-campagne">
//                             <input
//                                 type="text"
//                                 className="input-campagne input-expediteur-campagne"
//                                 placeholder="Ex: Solutravo"
//                                 value={expediteurNom}
//                                 onChange={(e) => handleExpediteurChange(e.target.value)}
//                                 maxLength={13}
//                             />
//                             <p className="caracteres-restants-campagne">
//                                 {expediteurNom.length}/11 caractères
//                             </p>
//                         </div>
//                     )}

//                     <div className="warning-box-campagne">
//                         <i className="fa-solid fa-circle-info warning-icon-campagne"></i>
//                         <p className="warning-text-campagne">
//                             Certains opérateurs bloquent les expéditeurs génériques (info, test, notif...).
//                             Pour maximiser le taux de réception de vos campagnes, utilisez un expéditeur
//                             plus spécifique (le nom de votre entreprise, par exemple).
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Etape2Contacts;

// Etape2Contacts.tsx - VERSION ADAPTÉE POUR NOUVELLE API

import { useState, useRef, useEffect } from 'react';
import type { CampagneData, ContactList } from '../types/campagne.types';
import { useNavigate } from 'react-router-dom';

interface Etape2ContactsProps {
    data: CampagneData;
    onUpdate: (data: Partial<CampagneData>) => void;
    onSuivant: () => void;
    onPrecedent: () => void;
}

const Etape2Contacts = ({ data, onUpdate, onSuivant, onPrecedent }: Etape2ContactsProps) => {
    const [activeTab, setActiveTab] = useState<'manuelle' | 'enregistres' | 'nouvelle'>('manuelle');
    const [textareaValue, setTextareaValue] = useState('');
    const [expediteurNom, setExpediteurNom] = useState(data.expediteur || '');
    const [erreur, setErreur] = useState('');
    const navigate = useNavigate();
    
    //let membreIds = localStorage.getItem("membreId");
    //let membreId = Number(membreIds);
    let societeIds = localStorage.getItem("membreId"); // Ajouter societeId au localStorage
    let societeId = Number(societeIds);

    // États pour contacts enregistrés
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedLists, setSelectedLists] = useState<ContactList[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [contactLists, setContactLists] = useState<ContactList[]>([]);
    const [isLoadingLists, setIsLoadingLists] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    //const API_BASE_URL = 'http://localhost:3000/api';
    const API_BASE_URL = 'https://staging.solutravo.zeta-app.fr/api';

    /**
     * NOUVELLE API - Récupérer les listes avec compteur
     */
    const getContactLists = async (societeId: number): Promise<ContactList[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/contact-lists/societe/${societeId}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('Listes reçues:', result);
            
            // L'API retourne { success: true, data: [...], count: X }
            return result.data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des listes de contacts:', error);
            throw error;
        }
    };

    /**
     * NOUVELLE API - Récupérer les numéros de téléphone de plusieurs listes
     */
    const getPhoneNumbersFromLists = async (listIds: string[], societeId: number): Promise<string[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/contact-lists/phone-numbers`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ listIds, societeId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('Numéros reçus:', result);
            
            // L'API retourne { success: true, data: [...], count: X }
            return result.data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des numéros:', error);
            throw error;
        }
    };

    // Charger les listes de contacts depuis l'API
    useEffect(() => {
        const loadContactLists = async () => {
            setIsLoadingLists(true);
            try {
                const lists = await getContactLists(societeId);
                setContactLists(lists);
            } catch (error) {
                console.error('Erreur chargement listes:', error);
                setErreur('Impossible de charger les listes de contacts');
            } finally {
                setIsLoadingLists(false);
            }
        };

        if (activeTab === 'enregistres') {
            loadContactLists();
        }
    }, [activeTab, societeId]);

    const handleSuivant = async () => {
        setErreur('');

        // VALIDATION selon l'onglet actif
        if (activeTab === 'manuelle') {
            if (data.contactsValides === 0) {
                setErreur('Vous devez ajouter au moins un numéro de téléphone valide');
                return;
            }
            
            // Pour contact manuel : list_contact_id = null
            onUpdate({
                contactType: 'manuelle',
                list_contact_id: null,
                // contacts est déjà mis à jour dans handleTextareaChange
            });
            
        } else if (activeTab === 'enregistres') {
            if (selectedLists.length === 0) {
                setErreur('Vous devez sélectionner au moins une liste de contacts');
                return;
            }
            
            try {
                // Extraire les IDs des listes sélectionnées
                const listIds = selectedLists.map(list => list.id);
                
                // APPEL API pour récupérer les numéros de téléphone
                const phoneNumbers = await getPhoneNumbersFromLists(listIds, societeId);
                
                if (phoneNumbers.length === 0) {
                    setErreur('Aucun contact actif trouvé dans les listes sélectionnées');
                    return;
                }
                
                // Calculer le total de contacts
                const totalContacts = phoneNumbers.length;
                console.log(totalContacts)
                
                onUpdate({
                    contactType: 'enregistres',
                    list_contact_id: listIds, // IDs des listes pour l'API campagne
                    contacts: phoneNumbers, // Numéros pour l'envoi réel
                    contactsValides: totalContacts,
                });
                
            } catch (error: any) {
                console.error('Erreur récupération contacts:', error);
                setErreur('Erreur lors de la récupération des contacts. Veuillez réessayer.');
                return;
            }
        }

        // VALIDATION : Expéditeur obligatoire
        if (!expediteurNom.trim()) {
            setErreur("L'expéditeur personnalisé est obligatoire");
            return;
        }

        onSuivant();
    };

    // VALIDATION NUMÉROS FRANÇAIS
    const validateNumeroFrancais = (numero: string): boolean => {
        const cleaned = numero.replace(/\s/g, '');
        const intlRegex = /^\+33[1-9]\d{8}$/;
        const nationalRegex = /^0[1-9]\d{8}$/;
        return intlRegex.test(cleaned) || nationalRegex.test(cleaned);
    };

    // Filtrer les listes selon la recherche
    const filteredLists = contactLists.filter(
        list => list.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Vérifier si une liste est sélectionnée
    const isListSelected = (listId: string) => {
        return selectedLists.some(l => l.id === listId);
    };

    // Calculer le total de contacts
    const totalContacts = selectedLists.reduce((sum, list) => sum + list.contacts_count, 0);

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

    // GESTION TEXTAREA - Contacts manuels
    const handleTextareaChange = (value: string) => {
        setTextareaValue(value);
        const contacts = value.split(/[\n,;]/).filter(c => c.trim()).map(c => c.trim());
        const valides = contacts.filter(c => validateNumeroFrancais(c));
        
        onUpdate({
            contacts: contacts,
            contactsValides: valides.length,
            list_contact_id: null,
        });
    };

    // GESTION EXPÉDITEUR
    const handleExpediteurChange = (nom: string) => {
        setExpediteurNom(nom);
        onUpdate({ expediteur: nom });
    };

    // Toggle sélection d'une liste
    const handleToggleList = (list: ContactList) => {
        if (isListSelected(list.id)) {
            setSelectedLists(selectedLists.filter(l => l.id !== list.id));
        } else {
            setSelectedLists([...selectedLists, list]);
        }
    };

    // Supprimer une liste sélectionnée
    const handleRemoveList = (listId: string) => {
        setSelectedLists(selectedLists.filter(l => l.id !== listId));
    };

    // AFFICHAGE NUMÉROS AVEC VALIDATION
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
                <h5 className="etape-title-campagne">Sélectionner les contacts de la campagne</h5>

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

                        {renderNumeroWithValidation()}

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
                            <div
                                className="contacts-input-box-campagne"
                                onClick={() => setShowDropdown(true)}
                            >
                                <div className="contacts-tags-wrapper-campagne">
                                    {selectedLists.map(list => (
                                        <span key={list.id} className="contact-tag-campagne">
                                            {list.name} ({list.contacts_count})
                                            <button
                                                type="button"
                                                className="contact-tag-close-campagne"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveList(list.id);
                                                }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}

                                    <input
                                        type="text"
                                        className="contacts-search-campagne"
                                        placeholder={selectedLists.length === 0 ? "Rechercher une liste..." : ""}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setShowDropdown(true)}
                                    />
                                </div>

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

                            {showDropdown && (
                                <div className="contacts-dropdown-campagne">
                                    {isLoadingLists ? (
                                        <div className="contacts-loading-campagne">
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            Chargement des listes...
                                        </div>
                                    ) : filteredLists.length > 0 ? (
                                        filteredLists.map(list => (
                                            <div
                                                key={list.id}
                                                className={`contacts-item-campagne ${isListSelected(list.id) ? 'selected-campagne' : ''}`}
                                                onClick={() => handleToggleList(list)}
                                            >
                                                <span className="contacts-item-text-campagne">
                                                    {list.name} ({list.contacts_count})
                                                </span>
                                                {isListSelected(list.id) && (
                                                    <i className="fa-solid fa-check contacts-check-campagne"></i>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="contacts-empty-campagne">
                                            {searchTerm ? 'Aucune liste trouvée pour cette recherche' : 'Aucune liste de contacts disponible'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedLists.length > 0 && (
                            <div className="validation-info-campagne" style={{ marginTop: '12px' }}>
                                <i className="fa-solid fa-check-circle"></i>
                                <span>{totalContacts} contact{totalContacts > 1 ? 's' : ''} sélectionné{totalContacts > 1 ? 's' : ''}</span>
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
                            </a>
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
                <h5 className="sidebar-title-campagne">Expéditeur</h5>
                <p className="sidebar-text-campagne">
                    Choisissez le nom de l'expéditeur qui s'affichera pour vos contacts :
                </p>

                <div className="expediteur-option-campagne">
                    <div className="radio-header-campagne">
                        <input
                            type="radio"
                            id="expediteur-personnalise"
                            name="expediteur-type"
                            checked={true}
                            readOnly
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

                    <div className="expediteur-input-wrapper-campagne">
                        <input
                            type="text"
                            className="input-campagne input-expediteur-campagne"
                            placeholder="Ex: Solutravo"
                            value={expediteurNom}
                            onChange={(e) => handleExpediteurChange(e.target.value)}
                            maxLength={11}
                        />
                        <p className="caracteres-restants-campagne">
                            {expediteurNom.length}/11 caractères
                        </p>
                    </div>

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