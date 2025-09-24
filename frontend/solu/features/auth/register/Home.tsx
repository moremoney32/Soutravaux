
import "./register.css";
import artisan from "../../../src/assets/icons/artisan.svg";
import fournisseur from "../../../src/assets/icons/fournisseur.svg";
import annonceur from "../../../src/assets/icons/annonceur.svg";
import solutravo from "../../../src/assets/images/solutravo.png";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";

function Home() {
  const navigate = useNavigate();

  // Variants pour les deux côtés
  const sideVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Variants pour les éléments en cascade
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.4 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="register_container">
      {/* Partie gauche */}
      <AnimatePresence>
        <motion.div
          className="composant_statique_left"
          variants={sideVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="sous_contenair_mail"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Logo + phrase */}
            <motion.div className="info_logo" variants={itemVariants}>
              <img src={solutravo} alt="solutravaux" className="solutravaux" />
              <p className="info_logo_p">
                Votre univers connecté 100% bâtiment
              </p>
            </motion.div>

            {/* Liste des rôles */}
            <motion.div className="information_solutravaux" variants={containerVariants}>
              <motion.div className="role_user" variants={itemVariants}>
                <div className="sous_role_user">
                  <img src={artisan} alt="artisan" />
                  <span className="sous_role_user_span">Artisans</span>
                </div>
                <span>
                  Pilotez et développez votre activité en toute simplicité tout
                  en profitant d’avantages toute l’année.
                </span>
              </motion.div>

              <motion.div className="role_user" variants={itemVariants}>
                <div className="sous_role_user">
                  <img src={fournisseur} alt="fournisseur" />
                  <span className="sous_role_user_span">Fournisseurs</span>
                </div>
                <span>
                  Rejoignez l’environnement Solutravo et permettez aux artisans
                  d’intégrer vos produits à leurs devis en un clic !
                </span>
              </motion.div>

              <motion.div className="role_user" variants={itemVariants}>
                <div className="sous_role_user">
                  <img src={annonceur} alt="annonceur" />
                  <span className="sous_role_user_span">Annonceurs</span>
                </div>
                <span>
                  Présentez vos produits et services en avant-première aux
                  artisans Solutravo !
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Partie droite */}
      <AnimatePresence>
        <motion.div
          className="composant_dynamique_right"
          variants={sideVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Le bouton suit le logo avec 0.2s de retard */}
          <motion.button
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={() => navigate("/register")}
          >
            Démarrer
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Home;
