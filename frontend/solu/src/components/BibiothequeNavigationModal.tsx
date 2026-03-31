
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import '../styles/BibliothequeNavigationModal.css';
import type { Bibliotheque, LibraryCategory, SubCategory, SubCategory2, Produit } from './BibiothequeDashboard';
import ProductDetailsModal from './ProductDetailsModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface BibliothequeNavigationModalProps {
    bibliotheque: Bibliotheque;
    onClose: () => void;
}

type NavigationStep = 'familles' | 'categories' | 'sous-categories' | 'produits';
type ItemType = 'famille' | 'categorie' | 'sous-categorie' | 'produit';

interface ProductsApiResponse {
    status: number;
    products: {
        data: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

interface GlobalSearchResult {
    type: ItemType;
    item: LibraryCategory | SubCategory | SubCategory2 | Produit;
    path: string;
    productCount?: number;
}

const BibliothequeNavigationModal: React.FC<BibliothequeNavigationModalProps> = ({
    bibliotheque,
    onClose
}) => {
    const [currentStep, setCurrentStep] = useState<NavigationStep>('familles');
    const [selectedFamille, setSelectedFamille] = useState<LibraryCategory | null>(null);
    const [selectedCategorie, setSelectedCategorie] = useState<SubCategory | null>(null);
    const [selectedSousCategorie, setSelectedSousCategorie] = useState<SubCategory2 | null>(null);
    const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
    const [showProductDetails, setShowProductDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [produits, setProduits] = useState<Produit[]>([]);
    const [loadingProduits, setLoadingProduits] = useState(false);
    const [allProduits, setAllProduits] = useState<Produit[]>([]);

    const baseUrlTest = "https://laravel-api.solutravo-compta.fr/api";
    const familles: LibraryCategory[] = bibliotheque.library_categories || [];

    // Compter les produits dans une branche
    const countProducts = useCallback((item: LibraryCategory | SubCategory | SubCategory2): number => {
        let count = 0;

        if ('sub_categories' in item) {
            item.sub_categories?.forEach(cat => {
                cat.sub_categories2?.forEach(sousCat => {
                    count += sousCat.products?.length || 0;
                });
            });
        } else if ('sub_categories2' in item) {
            item.sub_categories2?.forEach(sousCat => {
                count += sousCat.products?.length || 0;
            });
        } else if ('products' in item) {
            count = item.products?.length || 0;
        }

        return count;
    }, []);

    // RECHERCHE GLOBALE COMPLÈTE - Cherche PARTOUT
    const performGlobalSearch = useCallback((term: string): GlobalSearchResult[] => {
        if (!term.trim()) return [];

        const searchLower = term.toLowerCase().trim();
        const results: GlobalSearchResult[] = [];

        // 1Recherche dans FAMILLES
        familles.forEach(famille => {
            if (famille.name.toLowerCase().includes(searchLower)) {
                results.push({
                    type: 'famille',
                    item: famille,
                    path: famille.name,
                    productCount: countProducts(famille)
                });
            }

            // 2️⃣ Recherche dans CATÉGORIES
            famille.sub_categories?.forEach(categorie => {
                if (categorie.name.toLowerCase().includes(searchLower)) {
                    results.push({
                        type: 'categorie',
                        item: categorie,
                        path: `${famille.name} > ${categorie.name}`,
                        productCount: countProducts(categorie)
                    });
                }

                // 3️⃣ Recherche dans SOUS-CATÉGORIES
                categorie.sub_categories2?.forEach(sousCategorie => {
                    if (sousCategorie.name.toLowerCase().includes(searchLower)) {
                        results.push({
                            type: 'sous-categorie',
                            item: sousCategorie,
                            path: `${famille.name} > ${categorie.name} > ${sousCategorie.name}`,
                            productCount: countProducts(sousCategorie)
                        });
                    }
                });
            });
        });

        // 4️⃣ Recherche dans PRODUITS (cache local)
        allProduits.forEach(produit => {
            if (produit.name.toLowerCase().includes(searchLower) ||
                produit.description?.toLowerCase().includes(searchLower)) {
                results.push({
                    type: 'produit',
                    item: produit,
                    path: `Produit: ${produit.name}`
                });
            }
        });

        return results;
    }, [familles, allProduits, countProducts]);

    // Charger tous les produits au démarrage
    useEffect(() => {
        const loadAllProducts = async () => {
            const allProds: Produit[] = [];

            for (const famille of familles) {
                for (const categorie of famille.sub_categories || []) {
                    for (const sousCategorie of categorie.sub_categories2 || []) {
                        try {
                            const res = await fetch(`${baseUrlTest}/products/${sousCategorie.id}`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Accept": "application/json",
                                },
                                body: JSON.stringify({ per_page: 100 })
                            });

                            const data: ProductsApiResponse = await res.json();

                            if (data.products?.data) {
                                const transformed = data.products.data.map((prod: any) => ({
                                    id: prod.id?.toString() || '',
                                    name: prod.name || '',
                                    image: prod.image
                                        ? `${baseUrlTest.replace('/api', '')}/storage/ProductImages/${prod.image}`
                                        : 'https://images.pexels.com/photos/162539/architecture-building-construction-work-162539.jpeg',
                                    price: parseFloat(prod.public_price) || 0,
                                    description: prod.description || '',
                                    brand: 'Marque générique',
                                    supplierReference: prod.supplier_reference,
                                    tvaRate: prod.tva_rate,
                                    unit: prod.unit,
                                    generalDiscount: parseFloat(prod.general_discount) || 0,
                                    options: prod.options || [],
                                    documentations: prod.documentations || []
                                }));

                                allProds.push(...transformed);
                            }
                        } catch (err) {
                            console.error(`Erreur chargement produits ${sousCategorie.id}:`, err);
                        }
                    }
                }
            }

            setAllProduits(allProds);
            console.log(` ${allProds.length} produits chargés pour recherche globale`);
        };

        loadAllProducts();
    }, [familles, baseUrlTest]);

    // Fonction pour récupérer les produits d'une sous-catégorie
    const fetchProduits = useCallback(async (subCategory2Id: string) => {
        try {
            setLoadingProduits(true);

            const res = await fetch(`${baseUrlTest}/products/${subCategory2Id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ per_page: 100 })
            });

            const data: ProductsApiResponse = await res.json();

            if (data.products?.data) {
                const transformedProducts: Produit[] = data.products.data.map((prod: any) => ({
                    id: prod.id?.toString() || '',
                    name: prod.name || 'Produit sans nom',
                    image: prod.image
                        ? `${baseUrlTest.replace('/api', '')}/storage/ProductImages/${prod.image}`
                        : 'https://images.pexels.com/photos/162539/architecture-building-construction-work-162539.jpeg',
                    price: parseFloat(prod.public_price) || 0,
                    description: prod.description || '',
                    brand: 'Marque générique',
                    supplierReference: prod.supplier_reference,
                    tvaRate: prod.tva_rate,
                    unit: prod.unit,
                    generalDiscount: parseFloat(prod.general_discount) || 0,
                    options: prod.options || [],
                    documentations: prod.documentations || []
                }));

                setProduits(transformedProducts);
            } else {
                setProduits([]);
            }
        } catch (err) {
            console.error(" Erreur API products:", err);
            setProduits([]);
        } finally {
            setLoadingProduits(false);
        }
    }, [baseUrlTest]);

    //  MODE RECHERCHE GLOBALE ou NAVIGATION NORMALE
    const displayMode = useMemo(() => {
        if (!searchTerm.trim()) {
            return { mode: 'navigation' as const, data: [] };
        }

        const globalResults = performGlobalSearch(searchTerm);
        return { mode: 'search' as const, data: globalResults };
    }, [searchTerm, performGlobalSearch]);

    // Données pour mode NAVIGATION (sans recherche)
    const navigationData = useMemo(() => {
        switch (currentStep) {
            case 'familles': return familles;
            case 'categories': return selectedFamille?.sub_categories || [];
            case 'sous-categories': return selectedCategorie?.sub_categories2 || [];
            case 'produits': return produits;
            default: return [];
        }
    }, [currentStep, familles, selectedFamille, selectedCategorie, produits]);

    useEffect(() => {
        if (currentStep === 'produits' && selectedSousCategorie) {
            fetchProduits(selectedSousCategorie.id);
        }
    }, [currentStep, selectedSousCategorie, fetchProduits]);

    const getEmptyMessage = (): string => {
        if (loadingProduits) return 'Chargement des produits...';
        if (searchTerm.trim()) return `Aucun élément trouvé pour "${searchTerm}"`;

        switch (currentStep) {
            case 'familles': return 'Aucune famille disponible';
            case 'categories': return 'Aucune catégorie disponible';
            case 'sous-categories': return 'Aucune sous-catégorie disponible';
            case 'produits': return 'Aucun produit disponible';
            default: return 'Aucun élément disponible';
        }
    };

    const renderProductImage = (produit: Produit) => {
        const filename = produit.image?.split('/').pop();
        const imageUrl = filename
            ? `https://staging.solutravo.zeta-app.fr/public/uploads/catalogue/image/${filename}`
            : null;
        return (
            <img
                src={imageUrl || ''}
                alt={produit.name}
                onClick={() => handleProduitSelect(produit)}
                style={{ cursor: 'pointer' }}
                onError={(e) => {
                    console.error('❌ Produit image cassée:', imageUrl);
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
            />
        );
    };

    const handleFamilleSelect = (famille: LibraryCategory) => {
        setSelectedFamille(famille);
        setCurrentStep('categories');
        setSelectedCategorie(null);
        setSelectedSousCategorie(null);
        setSearchTerm('');
    };

    const handleCategorieSelect = (categorie: SubCategory) => {
        setSelectedCategorie(categorie);
        setCurrentStep('sous-categories');
        setSelectedSousCategorie(null);
        setSearchTerm('');
    };

    const handleSousCategorieSelect = (sousCategorie: SubCategory2) => {
        setSelectedSousCategorie(sousCategorie);
        setCurrentStep('produits');
        setSearchTerm('');
    };

    const handleProduitSelect = (produit: Produit) => {
        setSelectedProduit(produit);
        setShowProductDetails(true);
    };

    const handleBack = () => {
        switch (currentStep) {
            case 'categories':
                setCurrentStep('familles');
                setSelectedFamille(null);
                setSearchTerm('');
                break;
            case 'sous-categories':
                setCurrentStep('categories');
                setSelectedCategorie(null);
                setSearchTerm('');
                break;
            case 'produits':
                setCurrentStep('sous-categories');
                setSelectedSousCategorie(null);
                setProduits([]);
                setSearchTerm('');
                break;
        }
    };

    const getProgressStep = () => {
        switch (currentStep) {
            case 'familles': return 1;
            case 'categories': return 2;
            case 'sous-categories': return 3;
            case 'produits': return 4;
            default: return 1;
        }
    };

    // Gestion du type de badge pour les résultats de recherche
    const getTypeBadge = (type: ItemType): string => {
        switch (type) {
            case 'famille': return 'Famille';
            case 'categorie': return 'Catégorie';
            case 'sous-categorie': return 'Sous-catégorie';
            case 'produit': return 'Produit';
        }
    };

    return (
        <div className="navigation-modal-overlay" onClick={onClose}>
            <div className="navigation-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="navigation-header">
                    <div className="header-left">
                        {currentStep !== 'familles' && !searchTerm && (
                            <button className="button_nav" onClick={handleBack}>←</button>
                        )}
                        <h3>Ma bibliothèque : {bibliotheque.name}</h3>
                    </div>
                    <div className="search-box">
                        <FontAwesomeIcon icon={faSearch} className="search-icon-main" />
                        <input
                            type="text"
                            placeholder="Rechercher partout (familles, catégories, produits...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-main"
                        />
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                {!searchTerm && (
                    <div className="progress-bar">
                        <div className="progress-step">
                            <div className={`step-indicator ${getProgressStep() >= 1 ? 'active' : ''}`}>●</div>
                            <span className="step-label">Famille</span>
                        </div>
                        <div className={`progress-line ${getProgressStep() >= 2 ? 'active' : ''}`}></div>
                        <div className="progress-step">
                            <div className={`step-indicator ${getProgressStep() >= 2 ? 'active' : ''}`}>●</div>
                            <span className="step-label">Catégorie</span>
                        </div>
                        <div className={`progress-line ${getProgressStep() >= 3 ? 'active' : ''}`}></div>
                        <div className="progress-step">
                            <div className={`step-indicator ${getProgressStep() >= 3 ? 'active' : ''}`}>●</div>
                            <span className="step-label">Sous catégorie</span>
                        </div>
                        <div className={`progress-line ${getProgressStep() >= 4 ? 'active' : ''}`}></div>
                        <div className="progress-step">
                            <div className={`step-indicator ${getProgressStep() >= 4 ? 'active' : ''}`}>●</div>
                            <span className="step-label">Produits</span>
                        </div>
                    </div>
                )}

                <div className="navigation-body">
                    {/* MODE RECHERCHE GLOBALE */}
                    {displayMode.mode === 'search' && (
                        <div className="search-results-grid">
                            {displayMode.data.length === 0 ? (
                                <div className="empty-state">
                                    {/* <div className="empty-icon">🔍</div> */}
                                    <p>{getEmptyMessage()}</p>
                                </div>
                            ) : (
                                displayMode.data.map((result, index) => (
                                    <div
                                        key={`${result.type}-${index}`}
                                        className={`item-card search-result-card ${result.type}-card`}
                                        onClick={() => {
                                            if (result.type === 'produit') {
                                                handleProduitSelect(result.item as Produit);
                                            } else if (result.type === 'famille') {
                                                handleFamilleSelect(result.item as LibraryCategory);
                                            } else if (result.type === 'categorie') {
                                                handleCategorieSelect(result.item as SubCategory);
                                            } else if (result.type === 'sous-categorie') {
                                                handleSousCategorieSelect(result.item as SubCategory2);
                                            }
                                        }}
                                    >
                                        <div className="search-result-header">
                                            <span className="type-badge">{getTypeBadge(result.type)}</span>
                                            {result.productCount !== undefined && (
                                                <span className="product-count-badge">{result.productCount} produit(s)</span>
                                            )}
                                        </div>
                                        <h4>{result.item.name}</h4>
                                        <p className="search-result-path">{result.path}</p>
                                        {result.type === 'produit' && (result.item as Produit).price && (
                                            <div className="produit-price">{(result.item as Produit).price?.toFixed(2)}€</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* MODE NAVIGATION NORMALE */}
                    {displayMode.mode === 'navigation' && (
                        <>
                            {currentStep === 'familles' && (
                                <div className="items-grid">
                                    {navigationData.length === 0 ? (
                                        <div className="empty-state">
                                            {/* <div className="empty-icon">📦</div> */}
                                            <p>{getEmptyMessage()}</p>
                                        </div>
                                    ) : (
                                        (navigationData as LibraryCategory[]).map((famille) => (
                                            <div
                                                key={famille.id}
                                                className="item-card famille-card"
                                                onClick={() => handleFamilleSelect(famille)}
                                            >
                                                <h4>{famille.name}</h4>
                                                <p>{countProducts(famille)} produit(s)</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {currentStep === 'categories' && (
                                <div className="items-grid">
                                    {navigationData.length === 0 ? (
                                        <div className="empty-state">
                                            {/* <div className="empty-icon">📦</div> */}
                                            <p>{getEmptyMessage()}</p>
                                        </div>
                                    ) : (
                                        (navigationData as SubCategory[]).map((categorie) => (
                                            <div
                                                key={categorie.id}
                                                className="item-card categorie-card"
                                                onClick={() => handleCategorieSelect(categorie)}
                                            >
                                                <h4>{categorie.name}</h4>
                                                <p>{countProducts(categorie)} produit(s)</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {currentStep === 'sous-categories' && (
                                <div className="items-grid">
                                    {navigationData.length === 0 ? (
                                        <div className="empty-state">
                                            {/* <div className="empty-icon"></div> */}
                                            <p>{getEmptyMessage()}</p>
                                        </div>
                                    ) : (
                                        (navigationData as SubCategory2[]).map((sousCategorie) => (
                                            <div
                                                key={sousCategorie.id}
                                                className="item-card sous-categorie-card"
                                                onClick={() => handleSousCategorieSelect(sousCategorie)}
                                            >
                                                <h4>{sousCategorie.name}</h4>
                                                <p>{countProducts(sousCategorie)} produit(s)</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {currentStep === 'produits' && (
                                <div className="produits-section">
                                    <div className="produits-header">
                                        <h3>{selectedSousCategorie?.name || 'Produits'}</h3>
                                    </div>

                                    {loadingProduits ? (
                                        <div className="loading-state">
                                            <div className="loading-spinner"></div>
                                            <p>Chargement des produits...</p>
                                        </div>
                                    ) : (
                                        <div className="produits-grid">
                                            {navigationData.length === 0 ? (
                                                <div className="empty-state">
                                                    {/* <div className="empty-icon">📦</div> */}
                                                    <p>{getEmptyMessage()}</p>
                                                </div>
                                            ) : (
                                                (navigationData as Produit[]).map((produit) => (
                                                    <div key={produit.id} className="produit-card">
                                                        <div className="produit-image">
                                                            {renderProductImage(produit)}
                                                        </div>
                                                        <div className="produit-info">
                                                            <h4>{produit.name}</h4>
                                                            {/* {produit.price && (
                                                                <div className="produit-price">{produit.price.toFixed(2)}€</div>
                                                            )} */}
                                                            {produit.brand && (
                                                                <div className="produit-brand">{produit.brand}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {showProductDetails && selectedProduit && (
                <ProductDetailsModal
                    produit={selectedProduit}
                    onClose={() => {
                        setShowProductDetails(false);
                        setSelectedProduit(null);
                    }}
                />
            )}
        </div>
    );
};

export default BibliothequeNavigationModal;