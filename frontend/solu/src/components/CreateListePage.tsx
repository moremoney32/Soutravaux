
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateListeStepper from './CreateListeStepper';
import CreateListeEtape1 from './CreateListeEtape1';
import CreateListeEtape2 from './CreateListeEtape2';
import CreateListeEtape3 from './CreateListeEtape3';
import CreateListeEtape4 from './CreateListeEtape4';
import '../styles/create-liste.css';
import type { CreateListeData } from '../types/create-liste.types';
import SidebarCampagne from './SidebarCampagne';
import HeaderCampagne from './HeaderCampagne';
import { motion, AnimatePresence } from 'framer-motion';


const CreateListePage = () => {
    const navigate = useNavigate();
    const [etapeActuelle, setEtapeActuelle] = useState<number>(1);
     const [direction, setDirection] = useState<'next' | 'prev'>('next');
    const [listeData, setListeData] = useState<CreateListeData>({
        nom: `Liste de contact ${new Date().toLocaleDateString()}`,
        pays: 'FR',
        numeros: [],
        numerosValides: 0,
        numerosInvalides: [],
        contactsParPays: [],
    });

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
    //    const handleSuivant = () => {
    //     if (etapeActuelle < 5) {
    //         setDirection('next');
    //         setEtapeActuelle(etapeActuelle + 1);
    //     }
    // };

    // const handlePrecedent = () => {
    //     if (etapeActuelle > 1) {
    //         setDirection('prev');
    //         setEtapeActuelle(etapeActuelle - 1);
    //     }
    // };

    const handleUpdateData = (data: Partial<CreateListeData>) => {
        setListeData({ ...listeData, ...data });
    };

    const handleCreerListe = () => {
        console.log('Création de la liste:', listeData);
        // Sauvegarder la liste
        // Puis retourner à la page campagne
        navigate('/campagnes/create');
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
            <SidebarCampagne />

            <div className="main-content-campagne">
                <HeaderCampagne />

                <div className="container-campagne">
                    {/* <div className="breadcrumb-campagne">
                        <i className="fa-solid fa-house"></i>
                        <span>Envoyer des SMS</span>
                        <i className="fa-solid fa-chevron-right"></i>
                        <a href="#" className="breadcrumb-link-campagne">Listes de contacts</a>
                        <i className="fa-solid fa-chevron-right"></i>
                        <span className="active-campagne">Ajouter une liste de contacts</span>
                    </div> */}

                    <h2 className="title-campagne">Ajouter une liste de contacts</h2>

                    <CreateListeStepper etapeActuelle={etapeActuelle} numerosCount={listeData.numerosValides} />

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
                        {/* {renderEtape()} */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateListePage;