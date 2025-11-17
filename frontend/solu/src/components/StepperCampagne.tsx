// src/components/campagne/StepperCampagne.tsx

interface StepperCampagneProps {
  etapeActuelle: number;
}

const StepperCampagne = ({ etapeActuelle }: StepperCampagneProps) => {
  const etapes = [
    { numero: 1, titre: 'Nom', soustitre: `Campagne ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0,5)}` },
    { numero: 2, titre: 'Contacts', soustitre: '0 numéros de téléphone valides' },
    { numero: 3, titre: 'Message', soustitre: 'Rédigez votre message' },
    { numero: 4, titre: 'Planification', soustitre: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0,5)}` },
    { numero: 5, titre: 'Résumé', soustitre: 'Vérifiez votre campagne' },
  ];

  return (
    <div className="stepper-campagne">
      {etapes.map((etape, index) => (
        <div key={etape.numero} className="step-wrapper-campagne">
          <div 
            className={`step-campagne ${
              etape.numero === etapeActuelle ? 'active-campagne' : ''
            } ${etape.numero < etapeActuelle ? 'completed-campagne' : ''}`}
          >
            <div className="step-number-campagne">{etape.numero}</div>
            <div className="step-content-campagne">
              <div className="step-title-campagne">{etape.titre}</div>
              <div className="step-subtitle-campagne">{etape.soustitre}</div>
            </div>
            {index < etapes.length - 1 && (
              <i className="fa-solid fa-chevron-right step-arrow-campagne"></i>
            )}
          </div>
        </div>
      ))}

      {/* <div className="step-resume-campagne">
        <div className="step-number-campagne">6</div>
        <div className="step-content-campagne">
          <div className="step-title-campagne">Résumé de l'envoi</div>
        </div>
      </div> */}
    </div>
  );
};

export default StepperCampagne;