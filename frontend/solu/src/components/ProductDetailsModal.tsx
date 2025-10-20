

import React, { useState, useEffect} from 'react';
import '../styles/ProductDetailsModal.css';
import type { Produit } from './BibiothequeDashboard';
import type { ProductOption } from './OptionTableRow';
import OptionTableRow from './OptionTableRow';
import DocumentPreviewModal from './DocumentPreviewModal';

interface ProductDetailsModalProps {
    produit: Produit;
    onClose: () => void;
    isOwned?: boolean;
}

interface ProductDetails {
    id: string;
    name: string;
    description: string;
    supplierReference: string;
    purchasePrice: number;
    supplierDiscount: number;
    currentPrice: number;
    unit: string;
    brand: string;
    tvaRate: string;
    artisanDiscount: number;
    options: ProductOption[];
    documents: ProductDocument[];
}

interface ProductDocument {
    id: string;
    name: string;
    description?: string;
    type: string;
    url: string;
    size: string;
}

interface ApiOption {
    id: number;
    product_id: number;
    name: string;
    description: string | null;
    image: string | null;
    price_impact: string;
    is_percentage: number;
    is_required: number;
    is_active: number;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
    produit,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<'details' | 'options' | 'documentation'>('details');
    const [margin, setMargin] = useState<number>(0);
    const [selectedOptions] = useState<Set<string>>(new Set());
    const [showPreview, setShowPreview] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<ProductDocument | null>(null);
    const [loading, setLoading] = useState(true);
    
 const baseUrlTest = "https://laravel-api.solutravo-compta.fr/storage/ProductDocumentations";
    const artisanDiscounts = [5.5,8, 10,20];

    const [productDetails, setProductDetails] = useState<ProductDetails>({
        id: produit.id,
        name: produit.name,
        description: produit.description || '',
        supplierReference: '',
        purchasePrice: produit.price || 0,
        supplierDiscount: 0,
        currentPrice: produit.price || 0,
        unit: 'pièce',
        brand: produit.brand || '',
        tvaRate: '20%',
        artisanDiscount: 0,
        options: [],
        documents: []
    });

    const unitOptions = [
        "Sélectionner une unité", "piece", "m2", "ml", "m3", "m", "l", "kg",
        "kW", "cm", "mm", "dm2", "mm2", "m2.K/W"
    ];

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);

                const publicPrice = parseFloat(produit.price?.toString() || '0');
                const discount = parseFloat((produit as any).generalDiscount?.toString() || '0');
                const purchasePrice = publicPrice * (1 - discount / 100);

                const options = (produit as any).options
                    ? transformApiOptions((produit as any).options)
                    : [];

                const documents = (produit as any).documentations
                    ? transformApiDocumentations((produit as any).documentations)
                    : [];

                setProductDetails(prev => ({
                    ...prev,
                    supplierReference: (produit as any).supplierReference || 'N/A',
                    purchasePrice: publicPrice,
                    currentPrice: purchasePrice,
                    supplierDiscount: discount,
                    unit: (produit as any).unit || 'pièce',
                    tvaRate: (produit as any).tvaRate || '20',
                    options: options,
                    documents: documents
                }));

                setMargin(20);
            } catch (err) {
                console.error("Erreur détails produit:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [produit]);

    const transformApiOptions = (apiOptions: ApiOption[]): ProductOption[] => {
        return apiOptions.map(opt => {
            const priceImpact = parseFloat(opt.price_impact);
            const basePrice = productDetails.currentPrice;

            const PA = opt.is_percentage
                ? basePrice * (1 + priceImpact / 100)
                : basePrice + priceImpact;

            const marge = 20;
            const PV = PA * (1 + marge / 100);

            return {
                id: opt.id.toString(),
                name: opt.name,
                description: opt.description || 'Aucune description',
                PA: PA,
                Marge: marge,
                PV: PV
            };
        });
    };

    const transformApiDocumentations = (apiDocs: any[]): ProductDocument[] => {
        return apiDocs.map(doc => {
            const fileUrl = `${baseUrlTest}/${doc.file}`;
            const sizeMatch = doc.summary.match(/Taille:\s*(\d+\s*\w+)/i);
            const size = sizeMatch ? sizeMatch[1] : 'Taille inconnue';
            const fileExtension = doc.file.split('.').pop()?.toUpperCase() || 'PDF';

            return {
                id: doc.id.toString(),
                name: doc.name,
                description: doc.summary,
                type: fileExtension,
                url: fileUrl,
                size: size
            };
        });
    };

    const handleUpdateOption = (optionId: string, updates: Partial<ProductOption>) => {
        setProductDetails(prev => ({
            ...prev,
            options: prev.options.map(opt =>
                opt.id === optionId ? { ...opt, ...updates } : opt
            )
        }));
    };

    const handleArtisanDiscountChange = (discount: number) => {
        setProductDetails(prev => ({
            ...prev,
            artisanDiscount: discount
        }));
    };

    const handleOptionToggle = (optionId: string) => {
        selectedOptions.has(optionId)
            ? selectedOptions.delete(optionId)
            : selectedOptions.add(optionId);
    };

    const calculateSellingPrice = (marginPercent: number): number => {
        return productDetails.currentPrice * (1 + marginPercent / 100);
    };

    const calculateProfit = (sellingPrice: number): number => {
        return sellingPrice - productDetails.currentPrice;
    };

    const downloadDocument = (doc: ProductDocument) => {
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePreviewDocument = (doc: ProductDocument) => {
        setSelectedDocument(doc);
        setShowPreview(true);
    };

    const sellingPrice = calculateSellingPrice(margin);
    const profit = calculateProfit(sellingPrice);

    if (loading) {
        return (
            <div className="product-details-overlay" onClick={onClose}>
                <div className="product-details-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Chargement des détails...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-details-overlay" onClick={onClose}>
            <div className="product-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="product-details-header">
                    <div className="header-left">
                        <button className="button_product" onClick={onClose}>←</button>
                        <h2>{productDetails.name}</h2>
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="product-details-tabs">
                    <button
                        className={`tab-button1 ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        🔩 Détails
                    </button>
                    <button
                        className={`tab-button1 ${activeTab === 'options' ? 'active' : ''}`}
                        onClick={() => setActiveTab('options')}
                    >
                        ⚙️ Options
                    </button>
                    <button
                        className={`tab-button1 ${activeTab === 'documentation' ? 'active' : ''}`}
                        onClick={() => setActiveTab('documentation')}
                    >
                        📄 Documentation
                    </button>
                </div>

                <div className="product-details-content">
                    {activeTab === 'details' && (
                        <div className="details-tab">
                            <div className="product-info-grid">
                                <div className="info-field">
                                    <label>Nom du produit</label>
                                    <input
                                        type='text'
                                        className="field-value"
                                        value={productDetails.name}
                                        onChange={(e) => setProductDetails(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>

                                <div className="info-field">
                                    <label>Référence fournisseur</label>
                                    <input
                                        type='text'
                                        className="field-value"
                                        value={productDetails.supplierReference}
                                        readOnly
                                    />
                                </div>

                                <div className="info-field">
                                    <label>Description</label>
                                    <textarea
                                        className="field-value description-text"
                                        value={productDetails.description}
                                        onChange={(e) => setProductDetails(prev => ({ ...prev, description: e.target.value }))}
                                         rows={5}
                                    />
                                </div>

                                <div className="info-field">
                                    <label>Marque</label>
                                    <input
                                        type='text'
                                        className="field-value"
                                        value={productDetails.brand}
                                        onChange={(e) => setProductDetails(prev => ({ ...prev, brand: e.target.value }))}
                                    />
                                </div>

                                <div className="info-field">
                                    <label>TVA</label>
                                    <div className="discount-grid">
                                        {artisanDiscounts.map((discount) => (
                                            <button
                                                key={discount}
                                                className={`discount-chip ${productDetails.artisanDiscount === discount ? 'active' : ''}`}
                                                onClick={() => handleArtisanDiscountChange(discount)}
                                            >
                                                {discount}%
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="info-field">
                                    <label>Unité</label>
                                    <select
                                        className="field-value unit-select"
                                        value={productDetails.unit}
                                        onChange={(e) => setProductDetails(prev => ({ ...prev, unit: e.target.value }))}
                                    >
                                        {unitOptions.map((unit, index) => (
                                            <option
                                                key={index}
                                                value={unit}
                                                disabled={unit === "Sélectionner une unité"}
                                            >
                                                {unit}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pricing-tab">
                                <div className="selling-price-section">
                                    <h4>Définir votre prix de vente</h4>
                                    <div className="pricing-inputs">
                                        <div className="info-field">
                                            <label>Prix d'achat HT (€)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="field-value"
                                                value={productDetails.currentPrice.toFixed(2)}
                                                readOnly
                                            />
                                        </div>
                                        <div className="info-field">
                                            <label>Marge (%)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="field-value"
                                                value={margin}
                                                onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="margin-info">
                                        <p>
                                            <strong>Prix vente HT :</strong> {sellingPrice.toFixed(2)} €
                                        </p>
                                    </div>

                                    <div className="margin-info">
                                        <p>
                                            <strong className='nameproductDetails'>Marge produit :</strong> {profit.toFixed(2)} €
                                        </p>
                                    </div>
                                </div>
                                <button className="save-pricing-btn">
                                    Mettre à jour mon produit
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'options' && (
                        <div className="options-tab">
                            {productDetails.options.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">⚙️</div>
                                    <p>Aucune option disponible pour ce produit</p>
                                </div>
                            ) : (
                                <div className="options-table-container">
                                    <table className="options-table">
                                        <thead>
                                            <tr>
                                                <th>NOM</th>
                                                <th>DESCRIPTION</th>
                                                <th>PA (€)</th>
                                                <th>MARGE (%)</th>
                                                <th>PV (€)</th>
                                                <th>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productDetails.options.map((option) => (
                                                <OptionTableRow
                                                    key={option.id}
                                                    option={option}
                                                    selectedOptions={selectedOptions}
                                                    onToggle={handleOptionToggle}
                                                    onUpdateOption={handleUpdateOption}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documentation' && (
                        <div className="documentation-tab">
                            <div className="documentation-header">
                                <h4>Documentation technique</h4>
                                <p>Consultez ou téléchargez la documentation technique pour ce produit.</p>
                            </div>

                            {productDetails.documents.length === 0 ? (
                                <div className="no-document">
                                    <div className="no-doc-icon">📄</div>
                                    <p>Aucune documentation disponible pour ce produit</p>
                                </div>
                            ) : (
                                <div className="documents-list">
                                    {productDetails.documents.map((doc) => (
                                        <div key={doc.id} className="document-card">
                                            <div className="document-icon">📄</div>
                                            <div className="document-info">
                                                <h5>{doc.name}</h5>
                                                {doc.description && (
                                                    <p className="document-description">
                                                        {doc.description}
                                                    </p>
                                                )}
                                                <p className="document-meta">
                                                    {doc.type} • {doc.size}
                                                </p>
                                            </div>
                                            <div className="document-actions">
                                                <button
                                                    className="preview-btn1"
                                                    onClick={() => handlePreviewDocument(doc)}
                                                    title="Prévisualiser le document"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    className="download-btn"
                                                    onClick={() => downloadDocument(doc)}
                                                >
                                                    ⬇️ Télécharger
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showPreview && selectedDocument && (
                <DocumentPreviewModal
                    documentUrl={selectedDocument.url}
                    documentName={selectedDocument.name}
                    onClose={() => {
                        setShowPreview(false);
                        setSelectedDocument(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProductDetailsModal;