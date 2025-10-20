

// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import '../styles/BibliothequesDasboard.css';
// import Sidebar from './sideBarBibio';
// import Header from './HeaderBibiotheque';
// import BibliothequesList from './BibliothequeList';
// import AddBibliothequeModal from './AddBibliothequeModal';
// import BibliothequeNavigationModal from './BibiothequeNavigationModal';

// export interface Bibliotheque {
//     id: string;
//     name: string;
//     hasAccess: boolean;
//     logo?: string;
//     image?: string;
//     created_at?: string;
//     library_categories?: LibraryCategory[];
// }

// export interface LibraryCategory {
//     id: string;
//     name: string;
//     image?: string;
//     library_id: string;
//     created_at: string;
//     updated_at: string;
//     sub_categories?: SubCategory[]; // Maintenant typé
// }

// export interface SubCategory {
//     id: string;
//     name: string;
//     image?: string;
//     category_id: string;
//     created_at: string;
//     updated_at: string;
//     sub_categories2?: SubCategory2[]; // Sous-sous-catégories
// }

// export interface SubCategory2 {
//     id: string;
//     name: string;
//     image?: string;
//     sub_category_id: string;
//     created_at: string;
//     updated_at: string;
//     products?: Produit[]; // Produits
// }
// export interface Produit {
//     id: string;
//     name: string;
//     image: string;
//     price?: number;
//     description?: string;
//     brand?: string;
//     // Propriétés étendues pour les détails complets
//     supplierReference?: string;
//     tvaRate?: string;
//     unit?: string;
//     generalDiscount?: number;
//     options?: any[];
//     documentations?: any[];
//     // Ajouter les propriétés manquantes de l'API
//     supplier_reference?: string;
//     public_price?: string;
//     general_discount?: string;
// }

// export interface ApiOption {
//     id: number;
//     product_id: number;
//     name: string;
//     description: string | null;
//     image: string | null;
//     price_impact: string;
//     is_percentage: number;
//     is_required: number;
//     is_active: number;
// }

// export interface ApiDocumentation {
//     id: number;
//     product_id: number;
//     name: string;
//     summary: string;
//     file: string;
// }

// // export interface Produit {
// //     id: string;
// //     name: string;
// //     image: string;
// //     price?: number;
// //     description?: string;
// //     brand?: string;
// // }

// interface PaginationInfo {
//     current_page: number;
//     last_page: number;
//     per_page: number;
//     total: number;
//     links: Array<{
//         url: string | null;
//         label: string;
//         active: boolean;
//     }>;
// }


// const BibliothequesDashboard: React.FC = () => {
//     const [showAddModal, setShowAddModal] = useState(false);
//     const [showNavigationModal, setShowNavigationModal] = useState(false);
//     const [selectedBibliotheque, setSelectedBibliotheque] = useState<Bibliotheque | null>(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [userBibliotheques, setUserBibliotheques] = useState<Bibliotheque[]>([]);
//     const [allBibliotheques, setAllBibliotheques] = useState<Bibliotheque[]>([]); 
//     const [loading, setLoading] = useState(true);
//     const [loadingAllLibraries, setLoadingAllLibraries] = useState(false);
//     const [pagination, setPagination] = useState<PaginationInfo | null>(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//     const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


//     const baseUrlTest = "https://laravel-api.solutravo-compta.fr/api";

//     // Transforme les données API en format Bibliotheque
//     const transformApiDataToBibliotheque = (apiData: any[]): Bibliotheque[] => {
//         return apiData.map(lib => ({
//             id: lib.id.toString(),
//             name: lib.name,
//             hasAccess: true,
//             logo: lib.image || '🏪',
//             image: lib.image,
//             created_at: lib.created_at,
//             library_categories: lib.library_categories
//         }));
//     };

//     // Fonction pour récupérer les bibliothèques validées (celles auxquelles on a souscrit)
//     const fetchDataBibliotheques = useCallback(async (page: number = 1, search: string = '') => {
//         try {
//             setLoading(true);

//             const params = new URLSearchParams({
//                 societe_id: '36',
//                 per_page: '10',
//                 page: page.toString()
//             });

//             if (search && search.length >= 3) {
//                 params.append('search', search);
//             }

//             const res = await fetch(`${baseUrlTest}/get-validated-libraries?${params}`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Accept": "application/json",
//                 },
//                 body: JSON.stringify({
//                     societe_id: 36
//                 })
//             });

//             const data = await res.json();
//             console.log("Données bibliotheques validées:", data);

//             if (data.libraries && data.libraries.data) {
//                 const transformedData = transformApiDataToBibliotheque(data.libraries.data);
//                 setUserBibliotheques(transformedData);

//                 setPagination({
//                     current_page: data.libraries.current_page,
//                     last_page: data.libraries.last_page,
//                     per_page: parseInt(data.libraries.per_page),
//                     total: data.libraries.total,
//                     links: data.libraries.links
//                 });
//             }

//         } catch (err) {
//             console.error("Erreur API get-validated-libraries:", err);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // NOUVELLE FONCTION: Récupérer toutes les bibliothèques disponibles avec recherche
// const fetchAllBibliotheques = useCallback(async (search: string = '') => {
//     try {
//         setLoadingAllLibraries(true);
        
//         const res = await fetch(`${baseUrlTest}/get-libraries`, {
//             method: "POST", 
//             headers: {
//                 "Content-Type": "application/json", // AJOUT: Content-Type requis pour POST
//                 "Accept": "application/json",
//             },
//             body: JSON.stringify({
//                 search: search // AJOUT: paramètre de recherche
//             })
//         });

//         const data = await res.json();
//         console.log("Toutes les bibliothèques:", data);

//         if (data.libraries && data.libraries.data) {
//             // Transformer les données et marquer hasAccess: false par défaut
//             const allLibraries = data.libraries.data.map((lib: any) => {
//                 // Construire l'URL complète de l'image
//                 const baseUrl = "https://laravel-api.solutravo-compta.fr/storage/LibraryImages";
//                 const imageUrl = lib.image 
//                     ? `${baseUrl}/${lib.image}`
//                     : undefined;
                
//                 return {
//                     id: lib.id.toString(),
//                     name: lib.name,
//                     hasAccess: false, // Par défaut, pas d'accès
//                     logo: imageUrl || '🏪', 
//                     image: imageUrl, 
//                     created_at: lib.created_at,
//                     library_categories: lib.library_categories
//                 };
//             });
            
//             setAllBibliotheques(allLibraries);
//         }

//     } catch (err) {
//         console.error("Erreur API get-libraries:", err);
//     } finally {
//         setLoadingAllLibraries(false);
//     }
// }, []);
//     // Fonction pour filtrer les bibliothèques disponibles (exclure celles déjà souscrites)
//     const getAvailableBibliotheques = useCallback((): Bibliotheque[] => {
//         if (userBibliotheques.length === 0) return allBibliotheques;
        
//         const userLibraryIds = userBibliotheques.map(lib => lib.id);
//         return allBibliotheques.filter(lib => !userLibraryIds.includes(lib.id));
//     }, [allBibliotheques, userBibliotheques]);

//     // Effet pour charger les bibliothèques validées au démarrage
//     useEffect(() => {
//         fetchDataBibliotheques(1);
//     }, [fetchDataBibliotheques]);

//     // Charger toutes les bibliothèques quand on ouvre la modal
//     useEffect(() => {
//         if (showAddModal) {
//             fetchAllBibliotheques();
//         }
//     }, [showAddModal, fetchAllBibliotheques]);

//     // Gestion de la recherche avec debounce
//     const handleSearchChange = (term: string) => {
//         setSearchTerm(term);
        
//         if (searchTimeoutRef.current) {
//             clearTimeout(searchTimeoutRef.current);
//         }
        
//         if (term.length === 0) {
//             fetchDataBibliotheques(1, '');
//             return;
//         }

//         if (term.length < 3) {
//             setDebouncedSearchTerm('');
//             setCurrentPage(1);
//             return;
//         }
        
//         searchTimeoutRef.current = setTimeout(() => {
//             setDebouncedSearchTerm(term);
//             setCurrentPage(1);
//             fetchDataBibliotheques(1, term);
//         }, 500);
//     };

//     // Nettoyage du timeout
//     useEffect(() => {
//         return () => {
//             if (searchTimeoutRef.current) {
//                 clearTimeout(searchTimeoutRef.current);
//             }
//         };
//     }, []);

//     // Gestion du changement de page
//     const handlePageChange = (page: number) => {
//         setCurrentPage(page);
//         fetchDataBibliotheques(page, debouncedSearchTerm);
//     };

//     const handleAddBibliotheque = () => {
//         setShowAddModal(true);
//     };

//     const handleSelectBibliotheque = (bibliotheque: Bibliotheque) => {
//         if (bibliotheque.hasAccess) {
//             setSelectedBibliotheque(bibliotheque);
//             setShowNavigationModal(true);
//         } else {
//             // NOUVEAU: Message de confirmation amélioré
//             alert(`Merci d'avoir souscrit à ${bibliotheque.name}. Vous serez notifié de la réponse.`);
//             // Ici vous pourriez appeler une API pour envoyer la demande de souscription
//             // await fetch(`${baseUrlTest}/subscribe-library`, { method: 'POST', body: { library_id: bibliotheque.id } });
//         }
//         setShowAddModal(false);
//     };

//     const handleBibliothequeClick = (bibliotheque: Bibliotheque) => {
//         setSelectedBibliotheque(bibliotheque);
//         setShowNavigationModal(true);
//     };

//     // Gestion du loading
//     if (loading && userBibliotheques.length === 0) {
//         return (
//             <div className="dashboard">
//                 <Sidebar />
//                 <div className="main-content2">
//                     <Header />
//                     <div className="content-area">
//                         <div className="loading_dasboard">
//                             <div className="loading-spinner"></div>
//                             <p>Chargement des bibliothèques...</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="dashboard">
//             <Sidebar />
//             <div className="main-content2">
//                 <Header />
//                 <div className="content-area">
//                     <BibliothequesList
//                         bibliotheques={userBibliotheques}
//                         searchTerm={searchTerm}
//                         onAddBibliotheque={handleAddBibliotheque}
//                         onSearchChange={handleSearchChange}
//                         onBibliothequeClick={handleBibliothequeClick}
//                         pagination={pagination}
//                         currentPage={currentPage}
//                         onPageChange={handlePageChange}
//                         loading={loading}
//                     />
//                 </div>
//             </div>

//             {showAddModal && (
//     <AddBibliothequeModal
//         bibliotheques={getAvailableBibliotheques()}
//         loading={loadingAllLibraries}
//         onClose={() => setShowAddModal(false)}
//         onSelect={handleSelectBibliotheque}
//         onSearch={fetchAllBibliotheques} // PASSER la fonction de recherche
//     />
// )}

//             {showNavigationModal && selectedBibliotheque && (
//                 <BibliothequeNavigationModal
//                     bibliotheque={selectedBibliotheque}
//                     onClose={() => {
//                         setShowNavigationModal(false);
//                         setSelectedBibliotheque(null);
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

// export default BibliothequesDashboard;




import React, { useEffect, useState, useCallback, useRef } from 'react';
import '../styles/BibliothequesDasboard.css';
import Sidebar from './sideBarBibio';
import Header from './HeaderBibiotheque';
import BibliothequesList from './BibliothequeList';
import AddBibliothequeModal from './AddBibliothequeModal';
import BibliothequeNavigationModal from './BibiothequeNavigationModal';
import { useSearchParams } from "react-router-dom";

export interface Bibliotheque {
    id: string;
    name: string;
    hasAccess: boolean;
    logo?: string;
    image?: string;
    created_at?: string;
    library_categories?: LibraryCategory[];
}

export interface LibraryCategory {
    id: string;
    name: string;
    image?: string;
    library_id: string;
    created_at: string;
    updated_at: string;
    sub_categories?: SubCategory[];
}

export interface SubCategory {
    id: string;
    name: string;
    image?: string;
    category_id: string;
    created_at: string;
    updated_at: string;
    sub_categories2?: SubCategory2[];
}

export interface SubCategory2 {
    id: string;
    name: string;
    image?: string;
    sub_category_id: string;
    created_at: string;
    updated_at: string;
    products?: Produit[];
}

export interface Produit {
    id: string;
    name: string;
    image: string;
    price?: number;
    description?: string;
    brand?: string;
    supplierReference?: string;
    tvaRate?: string;
    unit?: string;
    generalDiscount?: number;
    options?: ApiOption[];
    documentations?: ApiDocumentation[];
    supplier_reference?: string;
    public_price?: string;
    general_discount?: string;
}

export interface ApiOption {
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

export interface ApiDocumentation {
    id: number;
    product_id: number;
    name: string;
    summary: string;
    file: string;
}

interface PaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

const BibliothequesDashboard: React.FC = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showNavigationModal, setShowNavigationModal] = useState(false);
    const [selectedBibliotheque, setSelectedBibliotheque] = useState<Bibliotheque | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userBibliotheques, setUserBibliotheques] = useState<Bibliotheque[]>([]);
    const [allBibliotheques, setAllBibliotheques] = useState<Bibliotheque[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAllLibraries, setLoadingAllLibraries] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
     const [searchParams] = useSearchParams();
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const baseUrlTest = "https://laravel-api.solutravo-compta.fr/api";
     const societe_id = searchParams.get("societe_id");

    const transformApiDataToBibliotheque = (apiData: any[]): Bibliotheque[] => {
        return apiData.map(lib => ({
            id: lib.id.toString(),
            name: lib.name,
            hasAccess: true,
            logo: lib.image || '🏪',
            image: lib.image,
            created_at: lib.created_at,
            library_categories: lib.library_categories
        }));
    };

    const fetchDataBibliotheques = useCallback(async (page: number = 1, search: string = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                societe_id: '36',
                per_page: '10',
                page: page.toString()
            });

            if (search && search.length >= 3) {
                params.append('search', search);
            }

            const res = await fetch(`${baseUrlTest}/get-validated-libraries?${params}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ societe_id: societe_id || 36 })
            });

            const data = await res.json();

            if (data.libraries && data.libraries.data) {
                const transformedData = transformApiDataToBibliotheque(data.libraries.data);
                setUserBibliotheques(transformedData);

                setPagination({
                    current_page: data.libraries.current_page,
                    last_page: data.libraries.last_page,
                    per_page: parseInt(data.libraries.per_page),
                    total: data.libraries.total,
                    links: data.libraries.links
                });
            }
        } catch (err) {
            console.error("Erreur API get-validated-libraries:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAllBibliotheques = useCallback(async (search: string = '') => {
        try {
            setLoadingAllLibraries(true);
            const res = await fetch(`${baseUrlTest}/get-libraries`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ search: search })
            });

            const data = await res.json();

            if (data.libraries && data.libraries.data) {
                const allLibraries = data.libraries.data.map((lib: any) => {
                    const baseUrl = "https://laravel-api.solutravo-compta.fr/storage/LibraryImages";
                    const imageUrl = lib.image ? `${baseUrl}/${lib.image}` : undefined;

                    return {
                        id: lib.id.toString(),
                        name: lib.name,
                        hasAccess: false,
                        logo: imageUrl || '🏪',
                        image: imageUrl,
                        created_at: lib.created_at,
                        library_categories: lib.library_categories
                    };
                });

                setAllBibliotheques(allLibraries);
            }
        } catch (err) {
            console.error("Erreur API get-libraries:", err);
        } finally {
            setLoadingAllLibraries(false);
        }
    }, []);

    const getAvailableBibliotheques = useCallback((): Bibliotheque[] => {
        if (userBibliotheques.length === 0) return allBibliotheques;
        const userLibraryIds = userBibliotheques.map(lib => lib.id);
        return allBibliotheques.filter(lib => !userLibraryIds.includes(lib.id));
    }, [allBibliotheques, userBibliotheques]);

    useEffect(() => {
        fetchDataBibliotheques(1);
    }, [fetchDataBibliotheques]);

    useEffect(() => {
        if (showAddModal) {
            fetchAllBibliotheques();
        }
    }, [showAddModal, fetchAllBibliotheques]);

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (term.length === 0) {
            fetchDataBibliotheques(1, '');
            return;
        }

        if (term.length < 3) {
            setDebouncedSearchTerm('');
            setCurrentPage(1);
            return;
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchTerm(term);
            setCurrentPage(1);
            fetchDataBibliotheques(1, term);
        }, 500);
    };

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchDataBibliotheques(page, debouncedSearchTerm);
    };

    const handleAddBibliotheque = () => {
        setShowAddModal(true);
    };

    const handleSelectBibliotheque = (bibliotheque: Bibliotheque) => {
        if (bibliotheque.hasAccess) {
            setSelectedBibliotheque(bibliotheque);
            setShowNavigationModal(true);
        } else {
            alert(`Merci d'avoir souscrit à ${bibliotheque.name}. Vous serez notifié de la réponse.`);
        }
        setShowAddModal(false);
    };

    const handleBibliothequeClick = (bibliotheque: Bibliotheque) => {
        setSelectedBibliotheque(bibliotheque);
        setShowNavigationModal(true);
    };

    if (loading && userBibliotheques.length === 0) {
        return (
            <div className="dashboard">
                <Sidebar />
                <div className="main-content2">
                    <Header />
                    <div className="content-area">
                        <div className="loading_dasboard">
                            <div className="loading-spinner"></div>
                            <p>Chargement des bibliothèques...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* <Sidebar /> */}
            <div className="main-content2">
                {/* <Header /> */}
                <div className="content-area">
                    <BibliothequesList
                        bibliotheques={userBibliotheques}
                        searchTerm={searchTerm}
                        onAddBibliotheque={handleAddBibliotheque}
                        onSearchChange={handleSearchChange}
                        onBibliothequeClick={handleBibliothequeClick}
                        pagination={pagination}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        loading={loading}
                    />
                </div>
            </div>

            {showAddModal && (
                <AddBibliothequeModal
                    bibliotheques={getAvailableBibliotheques()}
                    loading={loadingAllLibraries}
                    onClose={() => setShowAddModal(false)}
                    onSelect={handleSelectBibliotheque}
                    onSearch={fetchAllBibliotheques}
                />
            )}

            {showNavigationModal && selectedBibliotheque && (
                <BibliothequeNavigationModal
                    bibliotheque={selectedBibliotheque}
                    onClose={() => {
                        setShowNavigationModal(false);
                        setSelectedBibliotheque(null);
                    }}
                />
            )}
        </div>
    );
};

export default BibliothequesDashboard;