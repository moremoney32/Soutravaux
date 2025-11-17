// src/components/create-liste/CreateListeStepper.tsx

interface CreateListeStepperProps {
  etapeActuelle: number;
  numerosCount?: number;
}

const CreateListeStepper = ({ etapeActuelle, numerosCount = 0 }: CreateListeStepperProps) => {
  const etapes = [
    { numero: 1, titre: 'Nom', soustitre: `Liste de contact ${new Date().toLocaleDateString()}` },
    { numero: 2, titre: 'Numéros de téléphone', soustitre: `${numerosCount} numéro${numerosCount > 1 ? 's' : ''} de téléphone` },
    { numero: 3, titre: 'Valider', soustitre: '' },
    { numero: 4, titre: 'Résumé', soustitre: '' },
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
              {etape.soustitre && (
                <div className="step-subtitle-campagne">{etape.soustitre}</div>
              )}
            </div>
            {index < etapes.length - 1 && (
              <i className="fa-solid fa-chevron-right step-arrow-campagne"></i>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreateListeStepper;