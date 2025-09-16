

import { useEffect, useState } from "react";
import "./register.css";

// Import des images
import step1 from "../../../src/assets/images/step1.png";
import step2 from "../../../src/assets/images/step2.png";
import step3 from "../../../src/assets/images/step3.png";
import logo from "../../../src/assets/images/logo.png";

function Register() {
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

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

      {/* Partie droite = inscription */}
      {/* <div className="composant_dynamique">
        <h2>Inscription</h2>
      </div> */}
      <div className="composant_dynamique">
  {/* Titre /logo*/}
  <div className="register_header">
    <img src={logo} alt="Logo" />
    <h2 className="register_title">Inscription</h2>
  </div>
  {/* <h2 className="register_title">Inscription</h2> */}
  <span className="register_subtitle">Veuillez suivre chaque étape.</span>

  {/* Progress bar */}
  <div className="progress_container">
    <div className="step active">Vous êtes ?</div>
    <div className="step">Données entreprise</div>
    <div className="step">Vérification OTP</div>
    <div className="step">Terminé</div>
  </div>

  {/* Question */}
  <h3 className="register_question">Vous êtes ?</h3>

  {/* Choix de rôle */}
  <div className="roles_container">
    <div className="role_card active">Artisan</div>
    <div className="role_card">Annonceur</div>
    <div className="role_card">Fournisseur</div>
    <div className="role_card">Particulier</div>
  </div>

  {/* Bouton */}
  <button className="register_btn">Continuer</button>
</div>
    </div>
  );
}

export default Register;
