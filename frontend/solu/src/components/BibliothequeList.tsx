
import React from 'react';
import '../styles/BibliothequeList.css';
import type { Bibliotheque } from './BibiothequeDashboard';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faAngleLeft, faAngleRight, faSearch } from "@fortawesome/free-solid-svg-icons";

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

interface BibliothequeListProps {
    bibliotheques: Bibliotheque[];
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onAddBibliotheque: () => void;
    onBibliothequeClick: (bibliotheque: Bibliotheque) => void;
    pagination: PaginationInfo | null;
    currentPage: number;
    onPageChange: (page: number) => void;
    loading: boolean;
}

const BibliothequesList: React.FC<BibliothequeListProps> = ({
    bibliotheques,
    searchTerm,
    onSearchChange,
    onAddBibliotheque,
    onBibliothequeClick,
    pagination,
    currentPage,
    onPageChange,
    loading
}) => {
    // Fonction pour générer les numéros de page avec ellipsis
    const getPageNumbers = () => {
        if (!pagination) return [];

        const totalPages = pagination.last_page;
        const current = currentPage;
        const delta = 2; // Nombre de pages à afficher de chaque côté
        const range: (number | string)[] = [];

        // Toujours afficher la première page
        range.push(1);

        // Calculer le range autour de la page courante
        const start = Math.max(2, current - delta);
        const end = Math.min(totalPages - 1, current + delta);

        // Ajouter ellipsis après la première page si nécessaire
        if (start > 2) {
            range.push('...');
        }

        // Ajouter les pages autour de la page courante
        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        // Ajouter ellipsis avant la dernière page si nécessaire
        if (end < totalPages - 1) {
            range.push('...');
        }

        // Toujours afficher la dernière page si il y a plus d'une page
        if (totalPages > 1) {
            range.push(totalPages);
        }

        return range;
    };

    const renderLibraryImage = (bibliotheque: Bibliotheque) => {
        if (bibliotheque.image) {
            // Extraire uniquement le nom de fichier et construire avec le bon domaine
            const filename = bibliotheque.image.split('/').pop();
            const imageUrl = `https://laravel-api.solutravo-compta.fr/storage/ProductImages/${filename}`;

            return (
                <img
                    src={imageUrl}
                    alt={bibliotheque.name}
                    className="library-image"
                    onError={(e) => {
                        // Remplacer par l'icône si l'image échoue
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                            const fallback = document.createElement('span');
                            fallback.className = 'icon-placeholder';
                            fallback.textContent = '📚';
                            parent.appendChild(fallback);
                        }
                    }}
                    onLoad={() => {
                        console.log(`Image chargée: ${imageUrl}`);
                    }}
                />
            );
        }

        // Pas d'image, utiliser l'icône
        return <span className="icon-placeholder">📚</span>;
    };

    return (
        <div className="bibliotheques-container">
            <div className="bibliotheques-header">
                <h2 className="section-title">Ma Bibliothèque</h2>
                <div className="header-actions">
                    <div className="search-box">
                         <FontAwesomeIcon
                            icon={faSearch}
                            className="search-icon-main"
                        />
                        <input
                            type="text"
                            placeholder="Rechercher une bibliotheque..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="search-input-main"
                        />
                    </div>
                    <button className="add-button" onClick={onAddBibliotheque}>
                       <FontAwesomeIcon
                            icon={faAdd}
                            // className="search-icon-main"
                        />  Ajouter une Bibliothèque
                    </button>
                </div>
            </div>

            {loading && bibliotheques.length > 0 && (
                <div className="loading-overlay1">
                    <div className="loading-spinner-small1"></div>
                </div>
            )}

            <div className={`bibliotheques-grid ${loading ? 'loading1' : ''}`}>
                {bibliotheques.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <p>{searchTerm ? 'Aucun résultat pour votre recherche.' : ''}</p>
                    </div>
                ) : (
                    bibliotheques.map((bibliotheque) => (
                        <div
                            key={bibliotheque.id}
                            className="bibliotheque-card"
                            onClick={() => onBibliothequeClick(bibliotheque)}
                        >
                            <div className="card-icon">
                                {renderLibraryImage(bibliotheque)}
                            </div>
                            <div className="card-content">
                                <h3 className="card-title">{bibliotheque.name}</h3>
                                <span className="card-badge">Bibliothèques {bibliotheque.library_categories?.length || 0}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
             {pagination && pagination.last_page > 0 && (
                <>
                    <div className="pagination">
                         <div className='color_transparent'>1</div> 
                        {/* <div className="pagination-info">
                            Page {pagination.current_page} sur {pagination.last_page} •
                            {pagination.total} résultat{pagination.total > 1 ? 's' : ''}
                        </div>  */}
                        <div className='parent_button'>
                            <FontAwesomeIcon
                            icon={faAngleLeft}
                             className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                        />
                            <div className="pagination-numbers">
                                {getPageNumbers().map((page, index) =>
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                            onClick={() => onPageChange(page as number)}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>
                             <FontAwesomeIcon
                            icon={faAngleRight}
                             className={`pagination-btn ${currentPage === pagination.last_page ? 'disabled' : ''}`}
                                onClick={() => currentPage < pagination.last_page && onPageChange(currentPage + 1)}
                        />


                        </div>


                    </div>

                </>
            )} 
        </div>
    );
};

export default BibliothequesList;