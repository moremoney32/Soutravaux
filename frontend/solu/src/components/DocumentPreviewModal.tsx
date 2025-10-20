import React, { useState } from 'react';
import '../styles/ProductDetailsModal.css';
import '../styles/DocumentPreviewModal.css';

interface DocumentPreviewModalProps {
    documentUrl: string;
    documentName: string;
    onClose: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    documentUrl,
    documentName,
    onClose
}) => {
    const [loadError, setLoadError] = useState(false);

    const handleOpenInNewTab = () => {
        window.open(documentUrl, '_blank');
    };

    return (
        <div className="product-details-overlay" onClick={onClose}>
            <div 
                className="product-details-modal preview-modal" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="product-details-header">
                    <div className="header-left">
                        <button className="button_product" onClick={onClose}>←</button>
                        <h2>Prévisualisation : {documentName}</h2>
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="preview-content">
                    {!loadError ? (
                        <iframe
                            src={documentUrl}
                            className="pdf-preview-iframe"
                            title={documentName}
                            onError={() => setLoadError(true)}
                        />
                    ) : (
                        <div className="preview-error">
                            <div className="error-icon">⚠️</div>
                            <h3>Impossible de prévisualiser ce document</h3>
                            <p>Le document ne peut pas être affiché directement dans le navigateur.</p>
                            <button className="open-external-btn" onClick={handleOpenInNewTab}>
                                Ouvrir dans un nouvel onglet
                            </button>
                        </div>
                    )}
                </div>

                <div className="preview-footer">
                    {/* <button className="btn-secondary" onClick={onClose}>
                        Fermer
                    </button> */}
                    {/* <button className="download-btn" onClick={handleOpenInNewTab}>
                        Ouvrir dans un nouvel onglet
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewModal;