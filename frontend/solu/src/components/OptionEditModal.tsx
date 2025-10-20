import React, { useState } from "react";
import "../styles/ProductDetailsModal.css"; // Réutilisation des styles existants
import type { ProductOption } from "./OptionTableRow";

interface OptionEditModalProps {
    option: ProductOption;
    onSave: (updates: Partial<ProductOption>) => void;
    onClose: () => void;
}

const OptionEditModal: React.FC<OptionEditModalProps> = ({
    option,
    onSave,
    onClose,
}) => {
    const [name, setName] = useState(option.name);
    const [description, setDescription] = useState(option.description);
    const [marge, setMarge] = useState(option.Marge);

    // Calcul automatique du prix de vente
    const calculatePV = (margin: number): number => {
        return option.PA * (1 + margin / 100);
    };

    const prixVente = calculatePV(marge);
    const benefice = prixVente - option.PA;

    const handleSubmit = () => {
        onSave({
            name,
            description,
            Marge: marge,
            PV: prixVente,
        });
    };

    return (
        <div className="product-details-overlay" onClick={onClose}>
            <div
                className="product-details-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '600px' }}
            >
                {/* Header */}
                <div className="product-details-header">
                    <div className="header-left">
                        <button className="button_product" onClick={onClose}>←</button>
                        <h2>Éditer l'option</h2>
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                {/* Content */}
                <div className="product-details-content" style={{ padding: '24px' }}>
                    <div className="details-tab">
                        <div className="product-info-grid">
                            {/* Nom - ÉDITABLE */}
                            <div className="info-field">
                                <label>Nom de l'option</label>
                                <input
                                    type="text"
                                    className="field-value"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            {/* Description - ÉDITABLE */}
                            <div className="info-field">
                                <label>Description</label>
                                <textarea
                                    className="field-value description-text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Prix d'achat - NON ÉDITABLE */}
                            <div className="info-field">
                                <label>Prix d'achat HT (€)</label>
                                <input
                                    type="number"
                                    className="field-value"
                                    value={option.PA.toFixed(2)}
                                    readOnly
                                />
                            </div>

                            {/* Marge - ÉDITABLE */}
                            <div className="info-field">
                                <label>Marge (%)</label>
                                <input
                                    type="number"
                                    className="field-value"
                                    value={marge}
                                    onChange={(e) => setMarge(parseFloat(e.target.value) || 0)}
                                    step="0.1"
                                />
                            </div>
                        </div>

                        {/* Zone d'information (comme dans ProductDetailsModal) */}
                        {/* <div className="pricing-tab" style={{ marginTop: '20px' }}> */}
                            <div className="margin-info">
                                <p>
                                    <strong>Prix vente HT :</strong>  {prixVente.toFixed(2)} €
                                </p>
                            </div>

                            <div className="margin-info1">
                                <p>
                                    <strong className='nameproductDetails'>Marge produit :</strong>{benefice.toFixed(2)} €
                                </p>
                            </div>

                            {/* Bouton Enregistrer */}
                            <button
                                className="save-pricing-btn"
                                onClick={handleSubmit}
                                style={{ marginTop: '16px', width: '100%' }}
                            >
                                Enregistrer
                            </button>
                        {/* </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptionEditModal;