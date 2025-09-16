

import { useEffect, useState } from "react";
import "./register.css";
import { motion, AnimatePresence } from "framer-motion";

// Import des images
import step1 from "../../../src/assets/images/step1.png";
import step2 from "../../../src/assets/images/step2.png";
import step3 from "../../../src/assets/images/step3.png";
import logo from "../../../src/assets/images/logo.png";
import eyesOpen from "../../../src/assets/icons/eyesOpen.png";
import eyesLock from "../../../src/assets/icons/eyesLock.png";
import nike from "../../../src/assets/icons/nike.png";
import next from "../../../src/assets/icons/next.png";
import close from "../../../src/assets/icons/close.png";
import { div } from "framer-motion/client";

function Register() {
    const roles = ["Artisan", "Annonceur", "Fournisseur", "Particulier"];
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [companyStatus, setCompanyStatus] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>("Je suis seul");
    const [direction, setDirection] = useState<"next" | "prev">("next");
    const [showPassword, setShowPassword] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [eyes, setEyes] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);
    const [fade, setFade] = useState(true);
    const slides = [
        {
            image: step1,
            title: "Gérez en toute simplicité",
            subtitle: [
                "Clients, projets, documents, tâches...",
                "Retrouvez tout ce dont vous avez besoin sur une seule plateforme intuitive.",
            ],
        },
        {
            image: step2,
            title: "Votre bureau dans la poche",
            subtitle: [
                "Une application web conçue pour vous suivre sur vos chantiers",
                "et dans tous vos déplacements.",
            ],
        },
        {
            image: step3,
            title: "Collaborez avec votre réseau",
            subtitle: [
                "Professionnels, partenaires, fournisseurs...",
                "Solutravo facilite la communication et la coordination de vos projets.",
            ],
        },
    ];
    const sizes = [
        "Je suis seul",
        "2 à 5 Personnes",
        "6 à 10 Personnes",
        "Plus de 10 personnes",
    ];


    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            setFade(false);

            // Après 500ms (temps du fade-out), on change le slide
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % slides.length);
                setFade(true); // Fade in
            }, 500);
        }, 4000);

        return () => clearInterval(interval);
    }, [slides.length]);


    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <h3 className="register_question">Vous êtes ?</h3>
                        <div className="roles_container">
                            {roles.map((role) => (
                                <div
                                    key={role}
                                    className={`role_card ${selectedRole === role ? "active" : ""}`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    {role}
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 2:
                return (
                    <div className="step2_container">
                        {/* Question principale */}
                        <h3 className="register_question1">Où en est votre entreprise ?</h3>

                        {/* Choix entreprise existante ou nouvelle */}
                        <div className="choice_container">
                            <button className={`choice_btn ${companyStatus === "existante" ? "active" : ""}`}
                                onClick={() => setCompanyStatus("existante")}>Elle est existante</button>
                            <button className={`choice_btn ${companyStatus === "nouvelle" ? "active" : ""}`}
                                onClick={() => setCompanyStatus("nouvelle")}>Je crée mon entreprise</button>
                        </div>

                        {/* Taille de l’entreprise */}
                        <h3 className="register_question1">Quelle taille fait votre entreprise ?</h3>
                        <div className="size_container">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    className={`size_btn ${selectedSize === size ? "active" : ""}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>

                        {/* Inputs texte */}
                        <div className="form_group_column">
                            <div className="sous_form_group">
                                <label htmlFor="nom_entreprise">Nom de l'entreprise</label>
                                <input type="text" placeholder="Exp:Solutravo" />
                            </div>

                            {companyStatus === "existante" && (
                                <div className="sous_form_group">
                                    <label htmlFor="siren">Numéro de SIREN</label>
                                    <input type="text" placeholder="Exp:GTAMLOUEBFJ4524" />
                                </div>
                            )}
                        </div>

                        {/* Forme juridique */}
                        <span className="register_question1">Forme juridique</span>
                        <div className="radio_group">
                            <label><input type="radio" name="forme" /> SASU</label>
                            <label><input type="radio" name="forme" /> EIRL</label>
                            <label><input type="radio" name="forme" /> EURL</label>
                            <label><input type="radio" name="forme" /> Je ne sais pas</label>
                        </div>

                        {/* Nom et adresse */}
                        <div className="form_group">
                            <input type="text" placeholder="Nom et prénom" />
                            <input type="text" placeholder="Adresse du siège social" />
                        </div>

                        {/* Téléphone et email */}
                        <div className="form_group">
                            <input type="text" placeholder="Numéro de téléphone" />
                            <input type="email" placeholder="Adresse Email" />
                        </div>
                        {/*  */}
                    </div>
                );

            case 3:
                return (
                    <>
                        <div className="step3_container">
                            <h3 className="register_question">Vérifiez votre boite mail et entrez le code.</h3>

                            {/* Champs OTP (4 inputs séparés) */}
                            <div className="otp_inputs">
                                {[0, 1, 2, 3].map((i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        maxLength={1}
                                        className="otp_input"
                                    />
                                ))}
                            </div>

                            {/* Timer */}
                            <div className="otp_footer">
                                <span className="resend">Renvoyer le code ?</span>
                                <span className="timer">00:59</span>
                            </div>
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <h3 className="register_question">Définissez maintenant votre mot de passe</h3>
                        <div className="form_group_password">
                            <div className="sous_form_group_password">
                                <label htmlFor="password">Mot de passe</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="********"
                                />
                                <img
                                    src={showPassword ? eyesOpen : eyesLock}
                                    alt="toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="eye_icon"
                                />
                            </div>
                            <div className="sous_form_group_password">
                                <label htmlFor="confirm_password">Confirmer le mot de passe</label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirm_password"
                                    placeholder="********"
                                />
                                <img
                                    src={showConfirmPassword ? eyesOpen : eyesLock}
                                    alt="toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="eye_icon"
                                />
                            </div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };


    return (
        <div className="register_container">
            {/* Partie gauche = Slider */}
            <div className="composant_statique">
                <div className={`slide_content ${fade ? "fade-in" : "fade-out"}`}>
                    <div className="image_section">
                        <img src={slides[currentIndex].image} alt="illustration" />
                    </div>

                    <div className="text_section">
                        <h1 className="text_section_title">{slides[currentIndex].title}</h1>
                        <div className="text_section_subtitle">
                            {slides[currentIndex].subtitle.map((line, idx) => (
                                <span key={idx}>{line}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Petits points indicateurs */}
                <div className="dots_container">
                    {slides.map((_, idx) => (
                        <span
                            key={idx}
                            className={`dot ${currentIndex === idx ? "active" : ""}`}
                        ></span>
                    ))}
                </div>
            </div>
            <AnimatePresence>
                {showPopup && (
                    <>
                        {/* Masque noir semi-transparent */}
                        <motion.div
                            className="masque"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Popup */}
                        <motion.div
                            className="popup"
                            initial={{ scale: 0.7, opacity: 0, y: -50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.7, opacity: 0, y: -50 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <img src={nike} alt="" />
                            <div className="popup_text">
                                <span className="popup_title">Félicitations !</span>
                                <span className="popup_title_span">
                                    Merci pour votre inscription. Vous avez maintenant accès au panel.
                                    N’oubliez pas de compléter votre profil dans le dashboard pour débloquer toutes vos options.
                                </span>
                            </div>

                            <div className="popup_buttons">
                                <div className="popup_buttons1">
                                    <span>Compléter mon profil</span>
                                    <img src={next} alt="" />
                                </div>
                                <div className="popup_buttons2">
                                    <span className="popup_buttons_span">Pas maintenant</span>
                                </div>
                            </div>

                            <img
                                src={close}
                                alt="Fermer"
                                className="close_icon"
                                onClick={() => setShowPopup(false)}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <div className="composant_dynamique">
                {/* Titre /logo*/}
                <div className="register_header">
                    <img src={logo} alt="Logo" />
                    <h2 className="register_title">Inscription</h2>
                </div>
                <span className="register_subtitle">Veuillez suivre chaque étape.</span>

                {/* Étapes */}
                <div className="progress_container">
                    <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
                        Vous êtes ?
                    </div>
                    <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
                        Données entreprise
                    </div>
                    <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
                        Vérification OTP
                    </div>
                    <div className={`step ${currentStep >= 4 ? "active" : ""}`}>
                        Terminé
                    </div>
                </div>

                {/* AnimatePresence pour transition douce */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        initial={{ x: direction === "next" ? 100 : -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction === "next" ? -100 : 100, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>

                {/* Boutons navigation */}
                <div className={`buttons_container ${currentStep === 1 ? "single" : "finish"
                    }`}>
                    {currentStep > 1 && (
                        <button onClick={() => {
                            setDirection("prev");
                            setCurrentStep((s) => s - 1);
                        }}
                            className="register_btn1">Retour</button>
                    )}
                    {currentStep < 4 ? (
                        <button
                            className="register_btn"
                            onClick={() => {
                                setDirection("next");
                                setCurrentStep((s) => s + 1);
                            }}
                        >
                            Continuer
                        </button>
                    ) : (
                        <button
                            className="register_btn"
                            onClick={() => {
                                setShowPopup(true)
                                console.log("Inscription terminée !");
                            }}
                        >
                            Terminer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Register;
