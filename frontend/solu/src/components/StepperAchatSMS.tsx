// src/components/achat-sms/StepperAchatSMS.tsx

interface StepperAchatSMSProps {
  etapeActuelle: number;
}

const StepperAchatSMS = ({ etapeActuelle }: StepperAchatSMSProps) => {
  const etapes = [
    { numero: 1, titre: 'Produit', soustitre: 'Sélectionnez votre pack' },
    { numero: 2, titre: 'Confirmation', soustitre: 'Vérifiez votre commande' },
  ];

  return (
    <div className="stepper-achat-sms">
      {etapes.map((etape, index) => (
        <div key={etape.numero} className="step-wrapper-achat-sms">
          <div 
            className={`step-achat-sms ${
              etape.numero === etapeActuelle ? 'active-achat-sms' : ''
            } ${etape.numero < etapeActuelle ? 'completed-achat-sms' : ''}`}
          >
            <div className="step-number-achat-sms">{etape.numero}</div>
            <div className="step-content-achat-sms">
              <div className="step-title-achat-sms">{etape.titre}</div>
              <div className="step-subtitle-achat-sms">{etape.soustitre}</div>
            </div>
            {index < etapes.length - 1 && (
              <i className="fa-solid fa-chevron-right step-arrow-achat-sms"></i>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepperAchatSMS;