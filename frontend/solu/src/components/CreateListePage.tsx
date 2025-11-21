
// import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// import CreateListeStepper from './CreateListeStepper';
// import CreateListeEtape1 from './CreateListeEtape1';
// import CreateListeEtape2 from './CreateListeEtape2';
// import CreateListeEtape3 from './CreateListeEtape3';
// import CreateListeEtape4 from './CreateListeEtape4';
// import '../styles/create-liste.css';
// import type { CreateListeData } from '../types/create-liste.types';
// import SidebarCampagne from './SidebarCampagne';
// import HeaderCampagne from './HeaderCampagne';
// import { motion, AnimatePresence } from 'framer-motion';

// const CreateListePage = () => {
//     // const navigate = useNavigate();
//     const [etapeActuelle, setEtapeActuelle] = useState<number>(1);
//     const [direction, setDirection] = useState<'next' | 'prev'>('next');
//     const [listeData, setListeData] = useState<CreateListeData>({
//         nom: "",
//         pays: 'FR',
//         numeros: [],
//         numerosValides: 0,
//         numerosInvalides: [],
//         contactsParPays: [],
//     });
//     const [isLoading, setIsLoading] = useState(false);

//     const handleSuivant = () => {
//         if (etapeActuelle < 4) {
//             setDirection('next');
//             setEtapeActuelle(etapeActuelle + 1);
//         }
//     };

//     const handlePrecedent = () => {
//         if (etapeActuelle > 1) {
//             setDirection('prev');
//             setEtapeActuelle(etapeActuelle - 1);
//         }
//     };

//     const handleUpdateData = (data: Partial<CreateListeData>) => {
//         setListeData({ ...listeData, ...data });
//     };

//     const handleCreerListe = async () => {
//         // Validation finale
//         if (listeData.numerosValides === 0) {
//             alert('Veuillez ajouter au moins un numéro de téléphone valide');
//             return;
//         }

//         if (!listeData.nom.trim()) {
//             alert('Le nom de la liste est obligatoire');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             const payload = {
//                 membre_id: 32, // ID en dur comme demandé
//                 contacts: listeData.numeros // Seulement les numéros valides
//             };

//             console.log('Envoi à l\'API:', payload);

//             const response = await fetch('https://backendstaging.solutravo-compta.fr/api/contacts/bulk', {
//                 method: 'POST',
//                 headers: {
//                     'accept': 'application/json',
//                     'Content-Type': 'application/json',
//                     'X-CSRF-TOKEN': '' // À remplir si nécessaire
//                 },
//                 body: JSON.stringify(payload)
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
//             }

//             const result = await response.json();
//             console.log('Réponse API:', result);

//             // Succès - afficher l'alerte et réinitialiser
//             alert('Liste créée avec succès !');

//             // Réinitialiser tous les champs
//             setListeData({
//                 nom: "",
//                 pays: 'FR',
//                 numeros: [],
//                 numerosValides: 0,
//                 numerosInvalides: [],
//                 contactsParPays: [],
//             });

//             // Revenir à l'étape 1
//             setEtapeActuelle(1);

//         } catch (error: any) {
//             console.error('Erreur création liste:', error);
//             alert(`Erreur lors de la création: ${error.message}`);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const renderEtape = () => {
//         switch (etapeActuelle) {
//             case 1:
//                 return (
//                     <CreateListeEtape1
//                         data={listeData}
//                         onUpdate={handleUpdateData}
//                         onSuivant={handleSuivant}
//                     />
//                 );
//             case 2:
//                 return (
//                     <CreateListeEtape2
//                         data={listeData}
//                         onUpdate={handleUpdateData}
//                         onSuivant={handleSuivant}
//                         onPrecedent={handlePrecedent}
//                     />
//                 );
//             case 3:
//                 return (
//                     <CreateListeEtape3
//                         data={listeData}
//                         onUpdate={handleUpdateData}
//                         onSuivant={handleSuivant}
//                         onPrecedent={handlePrecedent}
//                     />
//                 );
//             case 4:
//                 return (
//                     <CreateListeEtape4
//                         data={listeData}
//                         onPrecedent={handlePrecedent}
//                         onCreer={handleCreerListe}
//                         isLoading={isLoading}
//                     />
//                 );
//             default:
//                 return null;
//         }
//     };

//     // Variants pour les animations
//     const variants = {
//         enter: (direction: 'next' | 'prev') => ({
//             x: direction === 'next' ? 30 : -30,
//             opacity: 0,
//         }),
//         center: {
//             x: 0,
//             opacity: 1,
//         },
//         exit: (direction: 'next' | 'prev') => ({
//             x: direction === 'next' ? -30 : 30,
//             opacity: 0,
//         }),
//     };

//     return (
//         <div className="page-campagne">
//             <SidebarCampagne />

//             <div className="main-content-campagne">
//                 <HeaderCampagne />

//                 <div className="container-campagne">
//                     <h2 className="title-campagne">Ajouter une liste de contacts</h2>

//                     <CreateListeStepper etapeActuelle={etapeActuelle} numerosCount={listeData.numerosValides} />

//                     <div className="content-wrapper-campagne">
//                         <AnimatePresence mode="wait" custom={direction}>
//                             <motion.div
//                                 key={etapeActuelle}
//                                 custom={direction}
//                                 variants={variants}
//                                 initial="enter"
//                                 animate="center"
//                                 exit="exit"
//                                 transition={{
//                                     x: { type: 'spring', stiffness: 300, damping: 30 },
//                                     opacity: { duration: 0.3 },
//                                 }}
//                             >
//                                 {renderEtape()}
//                             </motion.div>
//                         </AnimatePresence>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreateListePage;



// import { useState } from 'react';
// import CreateListeStepper from './CreateListeStepper';
// import CreateListeEtape1 from './CreateListeEtape1';
// import CreateListeEtape2 from './CreateListeEtape2';
// import CreateListeEtape3 from './CreateListeEtape3';
// import CreateListeEtape4 from './CreateListeEtape4';
// import '../styles/create-liste.css';
// import type { CreateListeData } from '../types/create-liste.types';
// import SidebarCampagne from './SidebarCampagne';
// import HeaderCampagne from './HeaderCampagne';
// import { motion, AnimatePresence } from 'framer-motion';

// const CreateListePage = () => {
//     const [etapeActuelle, setEtapeActuelle] = useState<number>(1);
//     const [direction, setDirection] = useState<'next' | 'prev'>('next');
//     const [listeData, setListeData] = useState<CreateListeData>({
//         nom: "",
//         pays: 'FR',
//         numeros: [],
//         numerosValides: 0,
//         numerosInvalides: [],
//         contactsParPays: [],
//     });
//     const [isLoading, setIsLoading] = useState(false);

//     const handleSuivant = () => {
//         if (etapeActuelle < 4) {
//             setDirection('next');
//             setEtapeActuelle(etapeActuelle + 1);
//         }
//     };

//     const handlePrecedent = () => {
//         if (etapeActuelle > 1) {
//             setDirection('prev');
//             setEtapeActuelle(etapeActuelle - 1);
//         }
//     };

//     const handleUpdateData = (data: Partial<CreateListeData>) => {
//         setListeData({ ...listeData, ...data });
//     };

//     const handleCreerListe = async () => {
//         // Validation finale
//         if (listeData.numerosValides === 0) {
//             alert('Veuillez ajouter au moins un numéro de téléphone valide');
//             return;
//         }

//         if (!listeData.nom.trim()) {
//             alert('Le nom de la liste est obligatoire');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             // Format du payload selon le nouvel endpoint
//             const payload = {
//                 name: listeData.nom,
//                 description: `Liste créée le ${new Date().toLocaleDateString()}`,
//                 membre_id: 32, // ID en dur
//                 contacts: listeData.numeros.map(numero => ({
//                     name: "", // Nom par défaut
//                     phone_number: numero,
//                     email: "" // Email vide par défaut
//                 }))
//             };

//             console.log('Envoi à l\'API:', payload);

//             const response = await fetch('https://backendstaging.solutravo-compta.fr/api/add/lists', {
//                 method: 'POST',
//                 headers: {
//                     'accept': 'application/json',
//                     'Content-Type': 'application/json',
//                     'X-CSRF-TOKEN': '' // À remplir si nécessaire
//                 },
//                 body: JSON.stringify(payload)
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
//             }

//             const result = await response.json();
//             console.log('Réponse API:', result);

//             // Succès - afficher l'alerte et réinitialiser
//             alert('Liste créée avec succès !');

//             // Réinitialiser tous les champs
//             setListeData({
//                 nom: "",
//                 pays: 'FR',
//                 numeros: [],
//                 numerosValides: 0,
//                 numerosInvalides: [],
//                 contactsParPays: [],
//             });

//             // Revenir à l'étape 1
//             setEtapeActuelle(1);

//         } catch (error: any) {
//             console.error('Erreur création liste:', error);
//             alert(`Erreur lors de la création: ${error.message}`);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const renderEtape = () => {
//         switch (etapeActuelle) {
//             case 1:
//                 return (
//                     <CreateListeEtape1
//                         data={listeData}
//                         onUpdate={handleUpdateData}
//                         onSuivant={handleSuivant}
//                     />
//                 );
//             case 2:
//                 return (
//                     <CreateListeEtape2
//                         data={listeData}
//                         onUpdate={handleUpdateData}
//                         onSuivant={handleSuivant}
//                         onPrecedent={handlePrecedent}
//                     />
//                 );
//             case 3:
//                 return (
//                     <CreateListeEtape3
//                         data={listeData}
//                         onUpdate={handleUpdateData}
//                         onSuivant={handleSuivant}
//                         onPrecedent={handlePrecedent}
//                     />
//                 );
//             case 4:
//                 return (
//                     <CreateListeEtape4
//                         data={listeData}
//                         onPrecedent={handlePrecedent}
//                         onCreer={handleCreerListe}
//                         isLoading={isLoading}
//                     />
//                 );
//             default:
//                 return null;
//         }
//     };

//     // Variants pour les animations
//     const variants = {
//         enter: (direction: 'next' | 'prev') => ({
//             x: direction === 'next' ? 30 : -30,
//             opacity: 0,
//         }),
//         center: {
//             x: 0,
//             opacity: 1,
//         },
//         exit: (direction: 'next' | 'prev') => ({
//             x: direction === 'next' ? -30 : 30,
//             opacity: 0,
//         }),
//     };

//     return (
//         <div className="page-campagne">
//             <SidebarCampagne />

//             <div className="main-content-campagne">
//                 <HeaderCampagne />

//                 <div className="container-campagne">
//                     <h2 className="title-campagne">Ajouter une liste de contacts</h2>

//                     <CreateListeStepper etapeActuelle={etapeActuelle} numerosCount={listeData.numerosValides} />

//                     <div className="content-wrapper-campagne">
//                         <AnimatePresence mode="wait" custom={direction}>
//                             <motion.div
//                                 key={etapeActuelle}
//                                 custom={direction}
//                                 variants={variants}
//                                 initial="enter"
//                                 animate="center"
//                                 exit="exit"
//                                 transition={{
//                                     x: { type: 'spring', stiffness: 300, damping: 30 },
//                                     opacity: { duration: 0.3 },
//                                 }}
//                             >
//                                 {renderEtape()}
//                             </motion.div>
//                         </AnimatePresence>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreateListePage;


import { useState } from 'react';
import CreateListeStepper from './CreateListeStepper';
import CreateListeEtape1 from './CreateListeEtape1';
import CreateListeEtape2 from './CreateListeEtape2';
import CreateListeEtape3 from './CreateListeEtape3';
import CreateListeEtape4 from './CreateListeEtape4';
import '../styles/create-liste.css';
import type { CreateListeData} from '../types/create-liste.types';
// import SidebarCampagne from './SidebarCampagne';
import HeaderCampagne from './HeaderCampagne';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CreateListePage = () => {
    const navigate = useNavigate()
    const [etapeActuelle, setEtapeActuelle] = useState<number>(1);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');
    const [listeData, setListeData] = useState<CreateListeData>({
        nom: "",
        pays: 'FR',
        contacts: [], // ← Maintenant c'est des objets Contact
        contactsValides: 0,
        contactsInvalides: [],
        contactsParPays: [],
    });
    let membreId = localStorage.getItem("membreId")
  let userId = Number(membreId)
    const [isLoading, setIsLoading] = useState(false);

    const handleSuivant = () => {
        if (etapeActuelle < 4) {
            setDirection('next');
            setEtapeActuelle(etapeActuelle + 1);
        }
    };

    const handlePrecedent = () => {
        if (etapeActuelle > 1) {
            setDirection('prev');
            setEtapeActuelle(etapeActuelle - 1);
        }
    };

    const handleUpdateData = (data: Partial<CreateListeData>) => {
        setListeData({ ...listeData, ...data });
    };

    const handleCreerListe = async () => {
        // Validation finale
        if (listeData.contactsValides === 0) {
            alert('Veuillez ajouter au moins un numéro de téléphone valide');
            return;
        }

        if (!listeData.nom.trim()) {
            alert('Le nom de la liste est obligatoire');
            return;
        }

        setIsLoading(true);

        try {
            // Format du payload selon le nouvel endpoint
            const payload = {
                name: listeData.nom,
                // description est optionnel, on peut l'enlever
                membre_id: 32,
                contacts: listeData.contacts // ← Déjà au bon format !
            };

            console.log('Envoi à l\'API:', payload);

            const response = await fetch('https://backendstaging.solutravo-compta.fr/api/add/lists', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': ''
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Réponse API:', result);

            alert('Liste créée avec succès !');

            // Réinitialiser
            setListeData({
                nom: "",
                pays: 'FR',
                contacts: [],
                contactsValides: 0,
                contactsInvalides: [],
                contactsParPays: [],
            });

            setEtapeActuelle(1);

        } catch (error: any) {
            console.error('Erreur création liste:', error);
            alert(`Erreur lors de la création: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderEtape = () => {
        switch (etapeActuelle) {
            case 1:
                return (
                    <CreateListeEtape1
                        data={listeData}
                        onUpdate={handleUpdateData}
                        onSuivant={handleSuivant}
                    />
                );
            case 2:
                return (
                    <CreateListeEtape2
                        data={listeData}
                        onUpdate={handleUpdateData}
                        onSuivant={handleSuivant}
                        onPrecedent={handlePrecedent}
                    />
                );
            case 3:
                return (
                    <CreateListeEtape3
                        data={listeData}
                        onUpdate={handleUpdateData}
                        onSuivant={handleSuivant}
                        onPrecedent={handlePrecedent}
                    />
                );
            case 4:
                return (
                    <CreateListeEtape4
                        data={listeData}
                        onPrecedent={handlePrecedent}
                        onCreer={handleCreerListe}
                        isLoading={isLoading}
                    />
                );
            default:
                return null;
        }
    };

    // Variants pour les animations
    const variants = {
        enter: (direction: 'next' | 'prev') => ({
            x: direction === 'next' ? 30 : -30,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: 'next' | 'prev') => ({
            x: direction === 'next' ? -30 : 30,
            opacity: 0,
        }),
    };

    return (
        <div className="page-campagne">
            {/* <SidebarCampagne /> */}
            <div className="main-content-campagne">
                <HeaderCampagne />
                <div className="container-campagne">
                    <div className='header-filtres'>
                        <h2 className="title-campagne">Ajouter une liste de contacts</h2>
                    <button className="btn-primary" onClick={() => navigate(`/campagne/${userId}`)}>
              Retour aux campagnes
            </button>
                        
                    </div>
                    
                    <CreateListeStepper etapeActuelle={etapeActuelle} numerosCount={listeData.contactsValides} />
                    <div className="content-wrapper-campagne">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={etapeActuelle}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: 'spring', stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.3 },
                                }}
                            >
                                {renderEtape()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateListePage;