import { useState } from 'react';
import  solutravo  from "../assets/images/solutravo.png"

import { CartItem } from './CartItem';
import { ShoppingCart, X} from 'lucide-react';
import '../styles/PriceRequest.css';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailsPrice';
import { SupplierSelect } from './SupplierSelect';
// import { mockPriceRequests, mockProductFamilies, mockProducts, mockSuppliers, type PriceRequest, type PriceRequestItem, type Product } from '../data/mockDataPrice';
import { 
  mockPriceRequests, 
  mockProductFamilies, 
  mockProducts, 
  mockSuppliers, 
  type PriceRequestItem, 
  type Product,
  type PriceRequests
} from '../data/mockDataPrice';

type RequestMode = 'by_supplier' | 'by_product' | null;

export const PriceRequest = () => {
  const [mode, setMode] = useState<RequestMode>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<PriceRequestItem[]>([]);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [reference, setReference] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'very_urgent'>('normal');
  const [deliveryType, setDeliveryType] = useState<'headquarters' | 'new'>('headquarters');
  const [newAddress, setNewAddress] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history] = useState<PriceRequests[]>(mockPriceRequests);
  const [selectedHistoryRequest, setSelectedHistoryRequest] = useState<PriceRequests | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  console.log('Selected Products:', selectedProducts);

  const filteredProducts = mockProducts.filter((product) => {
    // Mode Fournisseur
    if (mode === 'by_supplier') {
      // Le filtre s'applique SEULEMENT si une famille est sélectionnée
      if (selectedFamilies.length > 0) {
        // Filtre par fournisseur ET famille
        if (selectedSupplier && product.supplierId !== selectedSupplier) return false;
        if (!selectedFamilies.includes(product.familyId)) return false;
      }
      // Sinon: TOUS les produits (peu importe le fournisseur sélectionné)
    }
    
    // Mode Produit: filtre optionnel par famille
    if (mode === 'by_product') {
      if (selectedFamilies.length > 0 && !selectedFamilies.includes(product.familyId)) return false;
    }
    
    // Filtre par recherche
    if (searchTerm) {
      return (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const handleAddToCart = (product: Product) => {
    const existing = cartItems.find((item) => item.product.id === product.id);
    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, { product, quantity: 1, note: '' }]);
    }
    setIsRightPanelOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems(
      cartItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleUpdateNote = (productId: string, note: string) => {
    setCartItems(cartItems.map((item) => (item.product.id === productId ? { ...item, note } : item)));
  };

  const handleUpdateGeneralNote = (productId: string, generalNote: string) => {
    setCartItems(cartItems.map((item) => (item.product.id === productId ? { ...item, generalNote } : item)));
  };

  const handleUpdateUrgency = (productId: string, urgency: 'normal' | 'urgent' | 'very_urgent') => {
    setCartItems(cartItems.map((item) => (item.product.id === productId ? { ...item, urgency } : item)));
  };

  const handleUpdateReference = (productId: string, reference: string) => {
    setCartItems(cartItems.map((item) => (item.product.id === productId ? { ...item, reference } : item)));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.product.id !== productId));
  };

  const handleRemoveEmail = (email: string) => {
    setManualEmails(manualEmails.filter((e) => e !== email));
  };

  const handleAddEmail = () => {
    if (newEmail && newEmail.includes('@') && !manualEmails.includes(newEmail)) {
      setManualEmails([...manualEmails, newEmail]);
      setNewEmail('');
    }
  };

  const handleSelectAllSuppliers = () => {
    if (selectedSuppliers.length === mockSuppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(mockSuppliers.map((s) => s.id));
    }
  };

  const handleSubmit = async () => {
    if (!mode) return; // Prevent submit if no mode selected
    
    const newRequest: PriceRequests = {
      id: `req${Date.now()}`,
      reference,
      type: mode as 'by_supplier' | 'by_product',
      items: cartItems,
      generalNote,
      urgency,
      deliveryAddress: deliveryType === 'headquarters' ? 'A mon siège' : newAddress,
      attachments,
      suppliers:
        mode === 'by_supplier'
          ? mockSuppliers.filter((s) => s.id === selectedSupplier)
          : mockSuppliers.filter((s) => selectedSuppliers.includes(s.id)),
      createdAt: new Date(),
      status: 'sent',
    };

    console.log('Envoi de la demande de prix:', newRequest);
    alert('Demande de prix envoyée avec succès!');

    setCartItems([]);
    setReference('');
    setGeneralNote('');
    setUrgency('normal');
    setDeliveryType('headquarters');
    setNewAddress('');
    setAttachments([]);
    setSelectedSuppliers([]);
    setManualEmails([]);
    setIsRightPanelOpen(false);
  };

  const isFormValid =
    reference.trim() !== '' &&
    cartItems.length > 0 &&
    (mode === 'by_supplier' ? selectedSupplier !== '' : selectedSuppliers.length > 0) &&
    (deliveryType === 'headquarters' || newAddress.trim() !== '');

  return (
    <div className="price-request-container">
      <header className="price-request-header">
        <div className="price-request-logo">
             <div className="logo">
              <img src={solutravo} alt="Solutravo" className="logo-icon" />
            </div>
          {/* <span className="price-request-logo-text">SOLU</span>
          <span className="price-request-logo-highlight">TRAVO</span> */}
        </div>
        <div className="price-request-tabs">
          <button
            className={`price-request-tab ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            Historique
          </button>
        </div>
      </header>

      {showHistory ? (
        <div className="price-request-panel" style={{ flex: 1 }}>
          <div className="price-request-panel-header">
            <h3 className="price-request-panel-title">Historique des demandes</h3>
          </div>
          <div className="price-request-panel-content">
            {history.map((request) => (
              <div 
                key={request.id} 
                className="price-request-history-item"
                onClick={() => setSelectedHistoryRequest(request)}
              >
                <div className="price-request-history-header">
                  <span className="price-request-history-reference">{request.reference}</span>
                  <span className="price-request-history-date">
                    {request.createdAt.toLocaleDateString('fr-FR')} à{' '}
                    {request.createdAt.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="price-request-history-info">
                  {request.items.length} produit(s) - {request.suppliers.length} fournisseur(s)
                </p>
                <p className="price-request-history-info">Livraison: {request.deliveryAddress}</p>
                <span
                  className={`price-request-badge ${request.urgency === 'urgent' ? 'urgent' : request.urgency === 'very_urgent' ? 'very-urgent' : 'normal'}`}
                >
                  {request.urgency === 'urgent'
                    ? 'Urgent'
                    : request.urgency === 'very_urgent'
                      ? 'Très urgent'
                      : 'Normal'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <main className="price-request-main">
          <aside className="price-request-panel price-request-panel-left">
            <div className="price-request-left-header">
              <div className="price-request-mode-tabs">
                <button
                  className={`price-request-mode-tab ${mode === 'by_supplier' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('by_supplier');
                    setSelectedSupplier('');
                    setSelectedFamilies([]);
                    setCartItems([]);
                  }}
                >
                  Par fournisseur
                </button>
                <button
                  className={`price-request-mode-tab ${mode === 'by_product' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('by_product');
                    setSelectedProducts([]);
                    setCartItems([]);
                  }}
                >
                  Par produit(s)
                </button>
              </div>
            </div>

            <div className="price-request-panel-header">
              <h3 className="price-request-panel-title">
                {mode === 'by_supplier' ? 'Fournisseur' : mode === 'by_product' ? 'Produit(s)' : ''}
              </h3>
              {mode !== null && (
                <input
                  type="text"
                  placeholder={mode === 'by_supplier' ? 'Rechercher un fournisseur...' : 'Rechercher un produit...'}
                  className="price-request-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              )}
            </div>
            <div className="price-request-panel-content">
              {mode === null ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d', fontSize: '12px' }}>
                  Sélectionnez un mode ci-dessus
                </div>
              ) : mode === 'by_supplier' ? (
                <>
                  <div className="price-request-section-title">Liste</div>
                  <div className="price-request-checkbox-group">
                    {mockSuppliers.map((supplier) => (
                      <div key={supplier.id} className="price-request-checkbox-item">
                        <input
                          type="checkbox"
                          id={`supplier-${supplier.id}`}
                          checked={selectedSupplier === supplier.id}
                          onChange={() =>
                            setSelectedSupplier(selectedSupplier === supplier.id ? '' : supplier.id)
                          }
                        />
                        <label htmlFor={`supplier-${supplier.id}`}>{supplier.name}</label>
                      </div>
                    ))}
                  </div>

                  {selectedSupplier && (
                    <>
                      <div className="price-request-section-title">Les Familles de produits</div>
                      <input
                        type="text"
                        placeholder="Rechercher un produit"
                        className="price-request-search"
                      />
                      <div className="price-request-checkbox-group">
                        {mockProductFamilies.map((family) => (
                          <div key={family.id} className="price-request-checkbox-item">
                            <input
                              type="checkbox"
                              id={`family-${family.id}`}
                              checked={selectedFamilies.includes(family.id)}
                              onChange={() => {
                                if (selectedFamilies.includes(family.id)) {
                                  setSelectedFamilies(selectedFamilies.filter((id) => id !== family.id));
                                } else {
                                  setSelectedFamilies([...selectedFamilies, family.id]);
                                }
                              }}
                            />
                            <label htmlFor={`family-${family.id}`}>{family.name}</label>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="price-request-section-title">Groupes</div>
                  <div className="price-request-checkbox-group">
                    {mockProductFamilies.map((family) => (
                      <div key={family.id} className="price-request-checkbox-item">
                        <input
                          type="checkbox"
                          id={`family-prod-${family.id}`}
                          checked={selectedFamilies.includes(family.id)}
                          onChange={() => {
                            if (selectedFamilies.includes(family.id)) {
                              setSelectedFamilies(selectedFamilies.filter((id) => id !== family.id));
                            } else {
                              setSelectedFamilies([...selectedFamilies, family.id]);
                            }
                          }}
                        />
                        <label htmlFor={`family-prod-${family.id}`}>{family.name}</label>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </aside>

          <section className="price-request-panel price-request-panel-center">
            <div className="price-request-center-header">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="price-request-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="price-request-center-content">
              {mode === null ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6c757d', fontSize: '16px', flexDirection: 'column', gap: '16px' }}>
                  <p>Choisissez un mode pour commencer</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Cliquez sur "Par fournisseur" ou "Par produit(s)" en haut à gauche</p>
                </div>
              ) : (
                <div className="price-request-products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={handleAddToCart}
                    onViewDetails={setSelectedProductDetail}
                  />
                ))}
                {filteredProducts.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6c757d', fontSize: '14px' }}>
                    {mode === 'by_supplier'
                      ? 'Sélectionnez un fournisseur pour voir les produits'
                      : 'Aucun produit trouvé'}
                  </div>
                )}
              </div>
              )}
            </div>
          </section>

          <aside
            className={`price-request-panel price-request-panel-right ${isRightPanelOpen ? 'open' : ''}`}
          >
            <div className="price-request-panel-header">
              <h3 className="price-request-panel-title">
                Produit(s) sélectionné(s) ({cartItems.length})
              </h3>
            </div>
            <div className="price-request-right-scrollable">
              {cartItems.length === 0 ? (
                <div className="price-request-cart-empty">Aucun produit sélectionné</div>
              ) : (
                <div className="price-request-cart-items-list">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.product.id}
                      item={item}
                      totalItems={cartItems.length}
                      onUpdateQuantity={handleUpdateQuantity}
                      onUpdateNote={handleUpdateNote}
                      onUpdateGeneralNote={handleUpdateGeneralNote}
                      onUpdateUrgency={handleUpdateUrgency}
                      onUpdateReference={handleUpdateReference}
                      onRemove={handleRemoveFromCart}
                    />
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="price-request-right-fixed">
                <div className="price-request-form-group">
                  <label className="price-request-form-label">Adresse de livraison</label>
                  <div className="price-request-delivery-options">
                    <div className="price-request-delivery-option">
                      <input
                        type="radio"
                        id="delivery-hq"
                        name="delivery"
                        checked={deliveryType === 'headquarters'}
                        onChange={() => setDeliveryType('headquarters')}
                      />
                      <label htmlFor="delivery-hq">A mon siège</label>
                    </div>
                    <div className="price-request-delivery-option">
                      <input
                        type="radio"
                        id="delivery-new"
                        name="delivery"
                        checked={deliveryType === 'new'}
                        onChange={() => setDeliveryType('new')}
                      />
                      <label htmlFor="delivery-new">Nouvelle adresse</label>
                    </div>
                  </div>
                  {deliveryType === 'new' && (
                    <div className="price-request-new-address">
                      <textarea
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="price-request-form-textarea"
                        placeholder="Adresse complète de livraison..."
                      />
                      <div className="price-request-save-address">
                        <input
                          type="checkbox"
                          id="save-address"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                        />
                        <label htmlFor="save-address">Enregistrer cette adresse</label>
                      </div>
                    </div>
                  )}
                </div>

                {mode === 'by_product' && (
                  <>
                    <div className="price-request-form-group">
                      <label className="price-request-form-label">
                        Mes fournisseurs de matériaux
                      </label>
                      <SupplierSelect
                        suppliers={mockSuppliers}
                        selectedIds={selectedSuppliers}
                        onSelectionChange={setSelectedSuppliers}
                        onSelectAll={handleSelectAllSuppliers}
                      />
                    </div>

                    <div className="price-request-form-group">
                      <label className="price-request-form-label">Envoyer par mail</label>
                      <p style={{ fontSize: '12px', color: '#6c757d', margin: '0 0 8px 0' }}>
                        Ajoutez le mail de votre contact
                      </p>
                      <div className="price-request-email-input">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="price-request-form-input"
                          placeholder="email@example.com"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                        />
                        <button
                          onClick={handleAddEmail}
                          className="btn-primary"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          Ajouter
                        </button>
                      </div>
                      {manualEmails.length > 0 && (
                        <div className="price-request-file-list">
                          {manualEmails.map((email) => (
                            <div key={email} className="price-request-file-item">
                              <span>{email}</span>
                              <button
                                onClick={() => handleRemoveEmail(email)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#dc3545',
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <button
                  className={`price-request-submit-button ${isFormValid ? 'ready' : ''}`}
                  disabled={!isFormValid}
                  onClick={handleSubmit}
                >
                  Envoyer ma demande de prix
                </button>
              </div>
            )}
          </aside>
        </main>
      )}

      <button
        className="price-request-mobile-toggle"
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
      >
        <ShoppingCart size={24} />
        {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
      </button>

      {selectedProductDetail && (
        <ProductDetailModal product={selectedProductDetail} onClose={() => setSelectedProductDetail(null)} />
      )}

      {selectedHistoryRequest && (
        <div className="price-request-modal-overlay" onClick={() => setSelectedHistoryRequest(null)}>
          <div className="price-request-modal" onClick={(e) => e.stopPropagation()}>
            <div className="price-request-modal-header">
              <h3 className="price-request-modal-title">Détail de la demande</h3>
              <button 
                className="price-request-modal-close" 
                onClick={() => setSelectedHistoryRequest(null)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="price-request-modal-content">
              <div className="price-request-modal-info">
                <div className="price-request-modal-label">Référence</div>
                <p className="price-request-modal-value">{selectedHistoryRequest.reference}</p>
              </div>

              <div className="price-request-modal-info">
                <div className="price-request-modal-label">Date</div>
                <p className="price-request-modal-value">
                  {selectedHistoryRequest.createdAt.toLocaleDateString('fr-FR')} à{' '}
                  {selectedHistoryRequest.createdAt.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="price-request-modal-info">
                <div className="price-request-modal-label">Statut</div>
                <p className="price-request-modal-value" style={{ textTransform: 'capitalize' }}>
                  {selectedHistoryRequest.status}
                </p>
              </div>

              <div className="price-request-modal-info">
                <div className="price-request-modal-label">Urgence</div>
                <p className="price-request-modal-value">
                  {selectedHistoryRequest.urgency === 'urgent'
                    ? 'Urgent'
                    : selectedHistoryRequest.urgency === 'very_urgent'
                      ? 'Très urgent'
                      : 'Normal'}
                </p>
              </div>

              <div className="price-request-modal-info">
                <div className="price-request-modal-label">Adresse de livraison</div>
                <p className="price-request-modal-value">{selectedHistoryRequest.deliveryAddress}</p>
              </div>

              <div className="price-request-modal-info">
                <div className="price-request-modal-label">Produits ({selectedHistoryRequest.items.length})</div>
                <div className="price-request-modal-products">
                  {selectedHistoryRequest.items.map((item) => (
                    <div key={item.product.id} className="price-request-modal-product-item">
                      <span>{item.product.name} (x{item.quantity})</span>
                      <span className="price-request-modal-product-reference">{item.product.reference}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="price-request-modal-info">
                <div className="price-request-modal-label">Fournisseurs ({selectedHistoryRequest.suppliers.length})</div>
                <div className="price-request-modal-suppliers">
                  {selectedHistoryRequest.suppliers.map((supplier) => (
                    <div key={supplier.id} className="price-request-modal-supplier-item">
                      {supplier.name}
                    </div>
                  ))}
                </div>
              </div>

              {selectedHistoryRequest.generalNote && (
                <div className="price-request-modal-info">
                  <div className="price-request-modal-label">Note générale</div>
                  <p className="price-request-modal-value">{selectedHistoryRequest.generalNote}</p>
                </div>
              )}

              {selectedHistoryRequest.attachments.length > 0 && (
                <div className="price-request-modal-info">
                  <div className="price-request-modal-label">Pièces jointes ({selectedHistoryRequest.attachments.length})</div>
                  <div className="price-request-modal-attachments">
                    {selectedHistoryRequest.attachments.map((file, index) => (
                      <div key={index} className="price-request-modal-attachment-item">
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
