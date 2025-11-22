// src/components/achat-sms/Etape2Confirmation.tsx

import { useState } from 'react';
import type { AchatSMSData } from '../types/campagne.types';
import { createCheckoutSession } from '../services/achatsServices';

interface Etape2ConfirmationProps {
    data: AchatSMSData;
    onPrecedent: () => void;
    membreId: number;
}

const Etape2Confirmation = ({ data, onPrecedent, membreId }: Etape2ConfirmationProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmer = async () => {
        if (!data.selectedPack) {
            alert('Aucun pack sélectionné.');
            return;
        }
        console.log(data.selectedPack)

        try {
            setIsLoading(true);

            const payload = {
                pack_id: data.selectedPack.id,
                membre_id: membreId,
            };

            const response = await createCheckoutSession(payload);
            console.log(response)

            // Redirection vers Stripe
            if (response.checkout_url) {
                window.location.href = response.checkout_url;
            } else {
                throw new Error('URL de redirection Stripe non reçue');
            }
        } catch (error: any) {
            console.error('Erreur lors de la création de la session Stripe:', error);
            alert(`Erreur: ${error.message || 'Une erreur est survenue'}`);
            setIsLoading(false);
        }
    };

    if (!data.selectedPack) {
        return (
            <div className="etape-confirmation">
                <div className="error-container">
                    <i className="fa-solid fa-exclamation-triangle"></i>
                    <p>Aucun pack sélectionné. Veuillez retourner à l'étape précédente.</p>
                    <button className="btn-secondary" onClick={onPrecedent}>
                        <i className="fa-solid fa-arrow-left"></i>
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="etape-confirmation">
            <div className="content-confirmation">
                <div className="left-section-confirmation">
                    <h3 className="section-title-confirmation">Compte</h3>

                    <div className="info-group">
                        <label className="info-label">E-mail</label>
                        <div className="info-value">{data.billingData.email}</div>
                    </div>

                    <h3 className="section-title-confirmation section-spacing">
                        Données de facturation
                    </h3>

                    <div className="billing-grid">
                        <div className="info-group">
                            <label className="info-label">Entreprise</label>
                            <div className="info-value">{data.billingData.entreprise}</div>
                        </div>

                        <div className="info-group">
                            <label className="info-label">Prénom</label>
                            <div className="info-value">{data.billingData.prenom}</div>
                        </div>

                        <div className="info-group">
                            <label className="info-label">Nom</label>
                            <div className="info-value">{data.billingData.nom}</div>
                        </div>

                        <div className="info-group">
                            <label className="info-label">Numéro de téléphone</label>
                            <div className="info-value">{data.billingData.telephone}</div>
                        </div>

                        <div className="info-group">
                            <label className="info-label">Adresse</label>
                            <div className="info-value">{data.billingData.adresse}</div>
                        </div>

                        {data.billingData.complement && (
                            <div className="info-group">
                                <label className="info-label">Complément d'adresse</label>
                                <div className="info-value">{data.billingData.complement}</div>
                            </div>
                        )}

                        <div className="info-group">
                            <label className="info-label">Ville</label>
                            <div className="info-value">{data.billingData.ville}</div>
                        </div>

                        <div className="info-group">
                            <label className="info-label">Code postal</label>
                            <div className="info-value">{data.billingData.codePostal}</div>
                        </div>

                        <div className="info-group">
                            <label className="info-label">Pays</label>
                            <div className="info-value">{data.billingData.pays}</div>
                        </div>

                         {data.billingData.numeroTVA && (
              <div className="info-group">
                <label className="info-label">Numéro de TVA</label>
                <div className="info-value">{data.billingData.numeroTVA}</div>
              </div>
            )} 
                    </div>

                    {/* <div className="confirmation-notice">
                        <p>
                            En cochant cette case, vous acceptez les{' '}
                            <a href="#" className="link-primary">
                                Conditions générales de vente
                            </a>
                            . Vous reconnaissez également que les SMS concernant les thématiques de prêts
                            salaires, énergie, CBD, CPF (liste non exhaustive) sont interdits. Automatiquement
                            bloqués, vous n'aurez aucun remboursement.
                        </p>
                    </div> */}
                </div>

                <div className="right-section-confirmation">
                    <div className="recap-card">
                        <h4 className="recap-title">Récapitulatif</h4>

                        <div className="recap-row">
                            <span className="recap-label">Quantité de SMS</span>
                            <span className="recap-value">
                                {data.selectedPack.sms_quantity.toLocaleString('fr-FR')}
                            </span>
                        </div>

                        <div className="recap-row">
                            <span className="recap-label">Prix unitaire</span>
                            <span className="recap-value">
                                {parseFloat(data.selectedPack.unit_price).toFixed(3)} €
                            </span>
                        </div>

                        <div className="recap-divider"></div>

                        <div className="recap-row recap-total">
                            <span className="recap-label">Prix total (TVA excl.)</span>
                            <span className="recap-value">
                                {parseFloat(data.selectedPack.total_price_ht).toFixed(2)} €
                            </span>
                        </div>

                        <div className="recap-info">
                            <i className="fa-solid fa-info-circle"></i>
                            <p>
                                Conformément à nos conditions générales de vente, les crédits sont valables un
                                an à partir de la date d'achat.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="actions-confirmation">
                <button className="btn-secondary" onClick={onPrecedent} disabled={isLoading}>
                    <i className="fa-solid fa-arrow-left"></i>
                    Précédent
                </button>

                <button className="btn-primary" onClick={handleConfirmer} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Redirection vers Stripe...
                        </>
                    ) : (
                        <>
                            Confirmer
                            <i className="fa-solid fa-arrow-right"></i>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Etape2Confirmation;