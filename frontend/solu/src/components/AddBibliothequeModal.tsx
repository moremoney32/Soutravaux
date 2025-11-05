

import React, { useState, useCallback, useRef } from 'react';
import '../styles/AddBibliothequeModal.css';
import type { Bibliotheque } from './BibiothequeDashboard';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import ConfirmationPopup from './ConfirmationPopup';

interface AddBibliothequeModalProps {
    bibliotheques: Bibliotheque[];
    loading?: boolean;
    onClose: () => void;
    onSelect: (bibliotheque: Bibliotheque) => void;
    onSearch: (searchTerm: string) => void;
}

const AddBibliothequeModal: React.FC<AddBibliothequeModalProps> = ({
    bibliotheques,
    loading = false,
    onClose,
    onSelect,
    onSearch
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedLibrary, setSelectedLibrary] = useState<Bibliotheque | null>(null);

    // ✅ CORRECTION : Accepter la bibliothèque en paramètre
    const handleLibraryClick = (bibliotheque: Bibliotheque) => {
        setSelectedLibrary(bibliotheque);
        setShowConfirmation(true);
    };

    const handleSearchChange = useCallback((term: string) => {
        setSearchTerm(term);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (term.length === 0) {
            setLocalLoading(true);
            onSearch('');
            return;
        }

        if (term.length < 3) {
            return;
        }

        searchTimeoutRef.current = setTimeout(() => {
            setLocalLoading(true);
            onSearch(term);
        }, 500);
    }, [onSearch]);

    React.useEffect(() => {
        if (!loading) {
            setLocalLoading(false);
        }
    }, [loading]);

    React.useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const renderLibraryImage = (bibliotheque: Bibliotheque) => {
        if (bibliotheque.image && typeof bibliotheque.image === 'string' && bibliotheque.image.startsWith('http')) {
            return (
                <img
                    src={bibliotheque.image}
                    alt={bibliotheque.name}
                    className="library-image-modal"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                            const fallback = document.createElement('span');
                            fallback.textContent = '📚';
                            parent.appendChild(fallback);
                        }
                    }}
                />
            );
        }

        return <span>{bibliotheque.logo || '📚'}</span>;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Ajouter une Bibliothèque</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <p className="modal-description">
                        Sélectionnez une bibliothèque pour demander l'accès
                    </p>

                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Rechercher une bibliothèque..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="search-input-main"
                        />
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="search-icon-main"
                        />
                    </div>

                    {(loading || localLoading) ? (
                        <div className="loading-modal">
                            <div className="loading-spinner-small"></div>
                            <p>Chargement des bibliothèques...</p>
                        </div>
                    ) : (
                        <div className="bibliotheques-list">
                            {bibliotheques.length === 0 ? (
                                <div className="empty-state-modal">
                                    <div className="empty-icon-modal">📚</div>
                                    <p>
                                        {searchTerm
                                            ? `Aucune bibliothèque trouvée pour "${searchTerm}"`
                                            : 'Aucune bibliothèque disponible'
                                        }
                                    </p>
                                </div>
                            ) : (
                                bibliotheques.map((bibliotheque) => (
                                    <div
                                        key={bibliotheque.id}
                                        className="bibliotheque-item"
                                        onClick={() => handleLibraryClick(bibliotheque)}
                                    >
                                        <div className="item-icon">
                                            {renderLibraryImage(bibliotheque)}
                                        </div>
                                        <div className="item-content">
                                            <h4>{bibliotheque.name}</h4>
                                            <span className={`item-status ${bibliotheque.hasAccess ? 'has-access' : 'no-access'}`}>
                                                {bibliotheque.hasAccess ? 'Accès accordé' : 'Demander l\'accès'}
                                            </span>
                                        </div>
                                        <div className="item-arrow">→</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showConfirmation && selectedLibrary && (
                <ConfirmationPopup
                    bibliothequeName={selectedLibrary.name}
                    onConfirm={() => {
                        onSelect(selectedLibrary);
                        setShowConfirmation(false);
                        setSelectedLibrary(null);
                    }}
                    onCancel={() => {
                        setShowConfirmation(false);
                        setSelectedLibrary(null);
                    }}
                />
            )}
        </div>
    );
};

export default AddBibliothequeModal;