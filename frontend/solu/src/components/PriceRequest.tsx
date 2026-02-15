



import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CartItem } from './CartItem';
import { ShoppingCart, X, Info, Paperclip, AlertCircle, ArrowLeft } from 'lucide-react';
import '../styles/priceRequest.css';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailsPrice';
import { SupplierSelect } from './SupplierSelect';
import { getProductImageUrl } from '../helpers/BaseFileUrl';
import {
  type PriceRequestItem,
  type Product,
  type PriceRequests
} from '../data/mockDataPrice';

type RequestMode = 'by_supplier' | 'by_product' | null;
type DeliveryType = 'siege' | 'retrait' | 'nouvelle';

// const API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'https://staging.solutravo.zeta-app.fr/api';
const MAX_ATTACHMENTS = 5;

interface Relance {
  id: string;
  type: 'x_jours_avant' | '1_jour_avant';
  nb_jours?: number;
}

export const PriceRequest = () => {
  const { societeId: societeIdParam, membreId: membreIdParam } = useParams<{
    societeId: string;
    membreId: string;
  }>();
  const societeId = societeIdParam ? Number(societeIdParam) : undefined;
  const membreId = membreIdParam ? Number(membreIdParam) : undefined;

  const [mode, setMode] = useState<RequestMode>(null);
  const [libraries, setLibraries] = useState<any[]>([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [libraryProducts, setLibraryProducts] = useState<any[]>([]);
  const [loadingLibraryProducts, setLoadingLibraryProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [catalogueProducts, setCatalogueProducts] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [selectedFournisseurIds, setSelectedFournisseurIds] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<PriceRequestItem[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const cartScrollRef = useRef<HTMLDivElement>(null);
  const [reference, setReference] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'tres_urgent'>('normal');
  const [generalNote, setGeneralNote] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('retrait');
  const [newAddress, setNewAddress] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [dateLimite, setDateLimite] = useState('');
  const [relances, setRelances] = useState<Relance[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<PriceRequests[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatutFilter, setHistoryStatutFilter] = useState<'all' | 'envoyee' | 'archivee'>('all');
  const [selectedHistoryRequest, setSelectedHistoryRequest] = useState<PriceRequests | null>(null);
  const [loadingHistoryDetail, setLoadingHistoryDetail] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ── Chargement initial ────────────────────────────────────
  useEffect(() => {
    if (!societeId || !membreId) return;
    fetch(`${API_BASE_URL}/demandes-prix?societe_id=${societeId}`)
      .then(r => r.json()).then(d => { if (d?.data) setHistory(d.data); }).catch(console.error);
    fetch(`${API_BASE_URL}/demandes-prix/bibliotheques?societe_id=${societeId}`)
      .then(r => r.json()).then(d => { if (d?.data) setLibraries(d.data); }).catch(console.error);
    fetch(`${API_BASE_URL}/demandes-prix/fournisseurs`)
      .then(r => r.json())
      .then(d => {
        if (d?.data) setFournisseurs(d.data.map((f: any) => ({ id: String(f.id), name: f.name })));
      }).catch(console.error);
    fetch(`${API_BASE_URL}/demandes-prix/catalogue`)
      .then(r => r.json()).then(d => { if (d?.data) setCatalogueProducts(d.data); }).catch(console.error);
  }, [societeId, membreId]);

  useEffect(() => {
    if (!selectedLibraryId || !societeId) return;
    setLoadingCategories(true);
    setCategories([]); setSelectedCategoryIds([]); setLibraryProducts([]);
    fetch(`${API_BASE_URL}/demandes-prix/bibliotheques/${selectedLibraryId}/categories`)
      .then(r => r.json()).then(d => { if (d?.data) setCategories(d.data); }).catch(console.error)
      .finally(() => setLoadingCategories(false));
  }, [selectedLibraryId, societeId]);

  useEffect(() => {
    if (!selectedLibraryId) return;
    setLoadingLibraryProducts(true);
    const catParam = selectedCategoryIds.length === 1 ? `?category_id=${selectedCategoryIds[0]}` : '';
    fetch(`${API_BASE_URL}/demandes-prix/bibliotheques/${selectedLibraryId}/produits${catParam}`)
      .then(r => r.json()).then(d => { if (d?.data) setLibraryProducts(d.data); }).catch(console.error)
      .finally(() => setLoadingLibraryProducts(false));
  }, [selectedLibraryId, selectedCategoryIds]);

  const toProduct = (p: any): Product => ({
    id: String(p.id),
    name: p.name || p.nom || '',
    reference: p.supplier_reference || p.reference || '',
    familyId: p.famille_name || p.category_name || p.famille || '',
    supplierId: String(p.source || p.library_id || ''),
    description: p.description || '',
    unit: p.unit || p.unite || '',
    imageUrl: getProductImageUrl(p.image || p.image_path || null) || ''
  });

  const rawProducts = mode === 'by_supplier' ? libraryProducts : catalogueProducts;
  const filteredProducts = rawProducts.filter(p => {
    if (!productSearchTerm) return true;
    const t = productSearchTerm.toLowerCase();
    return (p.name || p.nom || '').toLowerCase().includes(t)
      || (p.supplier_reference || '').toLowerCase().includes(t)
      || (p.description || '').toLowerCase().includes(t);
  });

  const filteredHistory = history.filter(req => {
    const matchSearch = !historySearch || req.reference.toLowerCase().includes(historySearch.toLowerCase());
    const matchStatut = historyStatutFilter === 'all' || req.statut === historyStatutFilter;
    return matchSearch && matchStatut;
  });

  const handleAddToCart = (product: any) => {
    const mapped = toProduct(product);
    const existing = cartItems.find(i => i.product.id === mapped.id);
    if (existing) {
      setCartItems(cartItems.map(i => i.product.id === mapped.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCartItems(prev => {
        const next = [...prev, { product: mapped, quantity: 1, note: '' }];
        setTimeout(() => cartScrollRef.current?.scrollTo({ top: cartScrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
        if (prev.length === 0) setExpandedItemId(mapped.id);
        return next;
      });
    }
    setIsRightPanelOpen(true);
  };

  const handleUpdateQuantity = (id: string, qty: number) =>
    setCartItems(cartItems.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
  const handleUpdateNote = (id: string, note: string) =>
    setCartItems(cartItems.map(i => i.product.id === id ? { ...i, note } : i));

  // ✅ Confirmation avant suppression
  const handleRemoveFromCart = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir retirer ce produit ?')) {
      setCartItems(prev => {
        const next = prev.filter(i => i.product.id !== id);
        if (expandedItemId === id) setExpandedItemId(next.length > 0 ? next[0].product.id : null);
        return next;
      });
    }
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_ATTACHMENTS - attachments.length;
    setAttachments(prev => [...prev, ...files.slice(0, remaining)]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddEmail = () => {
    const trimmed = newEmail.trim();
    if (trimmed && trimmed.includes('@') && !manualEmails.includes(trimmed)) {
      setManualEmails([...manualEmails, trimmed]);
      setNewEmail('');
    }
  };

  const addRelance = (type: 'x_jours_avant' | '1_jour_avant') => {
    if (type === '1_jour_avant' && relances.some(r => r.type === '1_jour_avant')) return;
    setRelances([...relances, { id: `${Date.now()}`, type, nb_jours: type === 'x_jours_avant' ? 2 : undefined }]);
  };
  const updateRelanceJours = (id: string, nb: number) =>
    setRelances(relances.map(r => r.id === id ? { ...r, nb_jours: nb } : r));
  const removeRelance = (id: string) => setRelances(relances.filter(r => r.id !== id));

  const hasRecipient = mode === 'by_supplier'
    ? !!selectedLibraryId
    : selectedFournisseurIds.length > 0 || manualEmails.length > 0;

  const isFormValid = cartItems.length > 0
    && cartItems.every(i => i.quantity > 0)
    && reference.trim() !== ''
    && !!mode && !!societeId && !!membreId && hasRecipient;

  let submitDisabledReason = '';
  if (!mode) submitDisabledReason = 'Sélectionnez un mode';
  else if (cartItems.length === 0) submitDisabledReason = 'Ajoutez au moins un produit';
  else if (!cartItems.every(i => i.quantity > 0)) submitDisabledReason = 'Vérifiez les quantités';
  else if (reference.trim() === '') submitDisabledReason = 'La référence de la demande est requise';
  else if (!hasRecipient) submitDisabledReason = mode === 'by_supplier'
    ? 'Sélectionnez une bibliothèque ou ajoutez un email'
    : 'Sélectionnez un fournisseur ou ajoutez un email';

  const handleSubmit = async () => {
    if (!isFormValid || !societeId || !membreId || submitting) return;
    setSubmitting(true);

    const destinataires: any[] = [];
    if (mode === 'by_supplier' && selectedLibraryId) {
      destinataires.push({ library_id: Number(selectedLibraryId) });
    }
    if (mode === 'by_product') {
      destinataires.push(...selectedFournisseurIds.map(id => ({ fournisseur_id: Number(id) })));
      destinataires.push(...manualEmails.map(email => ({ email_manuel: email })));
    }

    const payload: any = {
      reference: reference.trim(),
      type_demande: mode === 'by_supplier' ? 'par_fournisseur' : 'par_produit',
      societe_id: societeId,
      membre_id: membreId,
      urgence: urgency,
      note_generale: generalNote || undefined,
      adresse_livraison_type: deliveryType,
      adresse_livraison: deliveryType === 'nouvelle' ? newAddress || undefined : undefined,
      sauvegarder_adresse: deliveryType === 'nouvelle' ? saveAddress : undefined,
      date_limite_retour: dateLimite || undefined,
      relances: relances.length > 0 ? relances.map(r => ({ type: r.type, nb_jours: r.nb_jours })) : undefined,
      lignes: cartItems.map((item, index) => ({
        product_source: item.product.supplierId === 'catalogue' ? 'catalogue' : 'library',
        product_id: Number(item.product.id),
        product_nom: item.product.name,
        product_description: item.product.description,
        product_unite: item.product.unit,
        product_image: item.product.imageUrl,
        quantite: item.quantity,
        note_ligne: item.note || undefined,
        ordre: index
      })),
      destinataires
    };

    try {
      let res: Response;
      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(payload));
        attachments.forEach(file => formData.append('pieces_jointes', file));
        res = await fetch(`${API_BASE_URL}/demandes-prix`, { method: 'POST', body: formData });
      } else {
        res = await fetch(`${API_BASE_URL}/demandes-prix`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const data = await res.json();
        const refDisplay = data.data?.reference || reference;
        setSuccessMessage(`Demande "${refDisplay}" envoyée avec succès !`);
        setShowSuccessSnackbar(true);
        setTimeout(() => setShowSuccessSnackbar(false), 5000);
        setCartItems([]); setReference(''); setGeneralNote(''); setUrgency('normal');
        setDeliveryType('siege'); setNewAddress(''); setSaveAddress(false);
        setSelectedFournisseurIds([]); setManualEmails([]);
        setIsRightPanelOpen(false); setSelectedLibraryId('');
        setSelectedCategoryIds([]); setDateLimite(''); setRelances([]);
        setAttachments([]);
        fetch(`${API_BASE_URL}/demandes-prix?societe_id=${societeId}`)
          .then(r => r.json()).then(d => { if (d?.data) setHistory(d.data); });
      } else {
        const err = await res.json();
        alert(err?.message || err?.error || 'Erreur lors de l\'envoi');
      }
    } catch (err: any) {
      alert(err?.message || 'Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModeChange = (newMode: RequestMode) => {
    setMode(newMode); setCartItems([]); setProductSearchTerm('');
    setSelectedLibraryId(''); setSelectedCategoryIds([]);
    setSelectedFournisseurIds([]); setManualEmails([]);
  };

  const handleUpdateStatutDestinataire = async (destId: number, demandeId: number, statut: string) => {
    try {
      await fetch(`${API_BASE_URL}/demandes-prix/${demandeId}/destinataires/${destId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ societe_id: societeId, statut })
      });
      const res = await fetch(`${API_BASE_URL}/demandes-prix/${demandeId}?societe_id=${societeId}`);
      const data = await res.json();
      if (data?.data) setSelectedHistoryRequest(data.data);
    } catch (err) { console.error(err); }
  };

  const handleArchiver = async (demandeId: number) => {
    try {
      await fetch(`${API_BASE_URL}/demandes-prix/${demandeId}/archiver`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ societe_id: societeId })
      });
      setSelectedHistoryRequest(null);
      fetch(`${API_BASE_URL}/demandes-prix?societe_id=${societeId}`)
        .then(r => r.json()).then(d => { if (d?.data) setHistory(d.data); });
    } catch (err) { console.error(err); }
  };

  const renderEmailManuel = () => (
    <div className="price-request-form-group">
      <label className="price-request-form-label">Ajouter un destinataire supplémentaire</label>
      <div className="price-request-email-input">
        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
          className="price-request-form-input" placeholder="email@example.com"
          onKeyDown={e => e.key === 'Enter' && handleAddEmail()} />
        <button onClick={handleAddEmail} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Ajouter</button>
      </div>
      {manualEmails.length > 0 && (
        <div className="price-request-file-list" style={{ marginTop: 6 }}>
          {manualEmails.map(email => (
            <div key={email} className="price-request-file-item">
              <span>{email}</span>
              <button onClick={() => setManualEmails(manualEmails.filter(e => e !== email))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPiecesJointes = () => (
    <div className="price-request-form-group">
      <label className="price-request-form-label">
        Pièces jointes
        <span style={{ color: '#aaa', fontWeight: 400, marginLeft: 6, fontSize: 10 }}>
          ({attachments.length}/{MAX_ATTACHMENTS})
        </span>
      </label>
      {attachments.length > 0 && (
        <div className="price-request-file-list" style={{ marginBottom: 6 }}>
          {attachments.map((file, index) => (
            <div key={index} className="price-request-file-item">
              <Paperclip size={11} color="#888" />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>
                {file.name}
              </span>
              <span style={{ color: '#bbb', fontSize: 10 }}>{(file.size / 1024).toFixed(0)}ko</span>
              <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', padding: 0 }}>
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
      {attachments.length < MAX_ATTACHMENTS && (
        <>
          <input ref={fileInputRef} type="file" multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            onChange={handleAddAttachment} style={{ display: 'none' }} id="pj-input" />
          <label htmlFor="pj-input" className="price-request-pj-btn" title="Ajouter des pièces à adresser à votre fournisseur si besoin">
            <Paperclip size={12} /> Ajouter une pièce jointe
          </label>
        </>
      )}
    </div>
  );

  return (
    <div className="price-request-container">

      <header className="price-request-header">
    {/* ✅ Titre + sous-titre UNIQUEMENT si pas en mode historique */}
    {!showHistory && (
      <div className="price-request-header-content">
        <h1 className="price-request-main-title">Fini les demandes de prix par mail !</h1>
        <div className="price-request-subtitle">
          <AlertCircle size={14} className="price-request-subtitle-icon" />
          <span>
            Grâce à Solutravo, interrogez vos fournisseurs simultanément en 30 secondes. 
            Choisissez de faire votre demande de prix, par fournisseur spécifique, ou par produit(s) en sélectionnant plusieurs fournisseurs de votre réseau.
            <strong> IMPORTANT :</strong> Vos fournisseurs reçoivent la demande individuellement, si vous interrogez plusieurs partenaires, ils n'en sont pas informés.
          </span>
        </div>
      </div>
    )}
    
    {/* ✅ Bouton retour À GAUCHE quand historique */}
    {showHistory && (
      <button className="price-request-back-btn" onClick={() => setShowHistory(false)}>
        <ArrowLeft size={16} /> Retour
      </button>
    )}
    
    {/* ✅ Bouton Historique/Nouvelle demande À DROITE toujours */}
    <div className="price-request-tabs">
      <button className={`price-request-tab ${showHistory ? 'active' : ''}`}
        onClick={() => setShowHistory(!showHistory)}>
        {showHistory ? 'Nouvelle demande' : 'Historique'}
      </button>
    </div>
  </header>

      {showHistory ? (
        <div className="price-request-panel" style={{ flex: 1 }}>
          <div className="price-request-panel-header">
            {/* ✅ Bouton retour */}
            <div className="price-request-history-filters">
              <input type="text" placeholder="Rechercher par référence..."
                className="price-request-search" style={{ marginBottom: 0, flex: 1 }}
                value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
              <select className="price-request-form-select" style={{ width: 'auto', minWidth: 140 }}
                value={historyStatutFilter} onChange={e => setHistoryStatutFilter(e.target.value as any)}>
                <option value="all">Tous les statuts</option>
                <option value="envoyee">Envoyée</option>
                <option value="archivee">Archivée</option>
              </select>
            </div>
          </div>
          <div className="price-request-panel-content">
            {filteredHistory.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 13 }}>Aucune demande trouvée</div>
            )}
            {filteredHistory.map(req => (
              <div key={req.id} className="price-request-history-item" onClick={async () => {
                setLoadingHistoryDetail(true);
                try {
                  const res = await fetch(`${API_BASE_URL}/demandes-prix/${req.id}?societe_id=${societeId}`);
                  const data = await res.json();
                  if (data?.data) setSelectedHistoryRequest(data.data);
                } catch { setSelectedHistoryRequest(null); }
                finally { setLoadingHistoryDetail(false); }
              }}>
                <div className="price-request-history-header">
                  <span className="price-request-history-reference">{req.reference}</span>
                  <span className="price-request-history-date">{new Date(req.date_creation).toLocaleDateString('fr-FR')}</span>
                </div>
                <p className="price-request-history-info">{req.nb_lignes ?? 0} produit(s) · {req.nb_destinataires ?? 0} destinataire(s)</p>
                <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                  <span className={`price-request-badge ${req.urgence === 'tres_urgent' ? 'very-urgent' : req.urgence === 'urgent' ? 'urgent' : 'normal'}`}>
                    {req.urgence === 'tres_urgent' ? 'Très urgent' : req.urgence === 'urgent' ? 'Urgent' : 'Normal'}
                  </span>
                  <span className={`price-request-badge ${req.statut === 'archivee' ? 'archived' : 'sent'}`}>
                    {req.statut === 'archivee' ? 'Archivée' : 'Envoyée'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <main className="price-request-main">
          <aside className="price-request-panel price-request-panel-left">
            <div className="price-request-left-header">
              <div className="price-request-mode-tabs">
                <button className={`price-request-mode-tab ${mode === 'by_supplier' ? 'active' : ''}`}
                  onClick={() => handleModeChange('by_supplier')}>Par fournisseur</button>
                <button className={`price-request-mode-tab ${mode === 'by_product' ? 'active' : ''}`}
                  onClick={() => handleModeChange('by_product')}>Par produit(s)</button>
              </div>
            </div>

            <div className="price-request-panel-content">
              {mode === null && (
                <div style={{ textAlign: 'center', padding: 20, color: '#aaa', fontSize: 12 }}>
                  Sélectionnez un mode ci-dessus
                </div>
              )}

              {mode === 'by_supplier' && (
                <>
                  <div className="price-request-section-title">Bibliothèques</div>
                  <input type="text" placeholder="Rechercher..." className="price-request-search"
                    value={librarySearchTerm} onChange={e => setLibrarySearchTerm(e.target.value)} />
                  <div className="price-request-checkbox-group">
                    {libraries
                      .filter(l => !librarySearchTerm || (l.name || '').toLowerCase().includes(librarySearchTerm.toLowerCase()))
                      .map(lib => (
                        <div key={lib.id} className="price-request-checkbox-item">
                          <input type="radio" id={`lib-${lib.id}`} name="library"
                            checked={selectedLibraryId === String(lib.id)}
                            onChange={() => setSelectedLibraryId(String(lib.id))} />
                          <label htmlFor={`lib-${lib.id}`}>{lib.name || `Bibliothèque ${lib.id}`}</label>
                        </div>
                      ))}
                    {libraries.length === 0 && <div style={{ fontSize: 11, color: '#bbb' }}>Chargement...</div>}
                  </div>

                  {selectedLibraryId && (
                    <>
                      <div className="price-request-section-title" style={{ marginTop: 10 }}>Familles de produits</div>
                      <input type="text" placeholder="Filtrer les familles..." className="price-request-search"
                        value={categorySearchTerm} onChange={e => setCategorySearchTerm(e.target.value)} />
                      {loadingCategories ? (
                        <div style={{ fontSize: 11, color: '#bbb' }}>Chargement...</div>
                      ) : categories.length === 0 ? (
                        <div style={{ fontSize: 11, color: '#bbb' }}>Aucune famille trouvée</div>
                      ) : (
                        <div className="price-request-checkbox-group">
                          {categories
                            .filter(c => !categorySearchTerm || (c.name || '').toLowerCase().includes(categorySearchTerm.toLowerCase()))
                            .map(cat => {
                              const id = String(cat.id);
                              return (
                                <div key={cat.id} className="price-request-checkbox-item">
                                  <input type="checkbox" id={`cat-${cat.id}`}
                                    checked={selectedCategoryIds.includes(id)}
                                    onChange={() => setSelectedCategoryIds(prev =>
                                      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                                    )} />
                                  <label htmlFor={`cat-${cat.id}`}>
                                    {cat.name || `Famille ${cat.id}`}
                                    {cat.nb_produits !== undefined &&
                                      <span style={{ color: '#bbb', marginLeft: 4, fontStyle: 'italic' }}>({cat.nb_produits})</span>}
                                  </label>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {mode === 'by_product' && (
                <div style={{ padding: '10px 0', color: '#888', fontSize: 12, lineHeight: 1.6 }}>
                  Parcourez le catalogue et la bibliothèque Solutravo.<br />
                  Sélectionnez vos fournisseurs destinataires à droite.
                </div>
              )}
            </div>
          </aside>

          {/* ── CENTRE ── */}
          <section className="price-request-panel price-request-panel-center">
            <div className="price-request-center-header">
              <input type="text" placeholder="Rechercher un produit..."
                className="price-request-search"
                value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} />
            </div>
            <div className="price-request-center-content">
              {mode === null ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', gap: 10 }}>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>Choisissez un mode pour commencer</p>
                </div>
              ) : mode === 'by_supplier' && !selectedLibraryId ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa' }}>
                  <p style={{ fontSize: 12 }}>← Sélectionnez une bibliothèque à gauche</p>
                </div>
              ) : (loadingLibraryProducts && mode === 'by_supplier') ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#bbb', fontSize: 13 }}>Chargement...</div>
              ) : (
                <div className="price-request-products-grid">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={`${product.source || product.library_id || 'cat'}-${product.id}`}
                      product={toProduct(product)}
                      onAdd={() => handleAddToCart(product)}
                      onViewDetails={setSelectedProductDetail}
                    />
                  ))}
                  {filteredProducts.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#aaa', fontSize: 13 }}>
                      Aucun produit trouvé
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ── DROITE ── */}
          <aside className={`price-request-panel price-request-panel-right ${isRightPanelOpen ? 'open' : ''}`}>
            <div className="price-request-panel-header">
              <h3 className="price-request-panel-title">Produit(s) sélectionné(s) ({cartItems.length})</h3>
              <button 
      className="price-request-panel-close-mobile"
      onClick={() => setIsRightPanelOpen(false)}
      aria-label="Fermer"
    >
      <X size={20} />
    </button>
            </div>

            <div className="price-request-right-scrollable" ref={cartScrollRef}>
              {cartItems.length === 0 ? (
                <div className="price-request-cart-empty">Aucun produit sélectionné</div>
              ) : (
                <div className="price-request-cart-items-list">
                  {cartItems.map(item => (
                    <CartItem key={item.product.id} item={item} totalItems={cartItems.length}
                      isExpanded={expandedItemId === item.product.id}
                      onToggle={() => setExpandedItemId(expandedItemId === item.product.id ? null : item.product.id)}
                      onUpdateQuantity={handleUpdateQuantity} onUpdateNote={handleUpdateNote}
                      onRemove={handleRemoveFromCart} />
                  ))}
                </div>
              )}
            </div>

            <div className="price-request-right-fixed">

              {/* ✅ Référence - placeholder amélioré */}
              <div className="price-request-form-group">
                <label className="price-request-form-label">Référence demande de prix *</label>
                <input type="text" value={reference} onChange={e => setReference(e.target.value)}
                  className="price-request-form-input" placeholder="Exemple : Chantier Martin" />
              </div>

              {/* ✅ Date limite - label corrigé */}
              <div className="price-request-form-group">
                <label className="price-request-form-label">Date limite de retour souhaitée</label>
                <input type="date" value={dateLimite} onChange={e => setDateLimite(e.target.value)}
                  className="price-request-form-input" min={new Date().toISOString().split('T')[0]} />
              </div>

              {/* Relances */}
              {dateLimite && (
                <div className="price-request-form-group">
                  <label className="price-request-form-label">Relances automatiques</label>
                  <div className="price-request-relances">
                    {relances.map(r => (
                      <div key={r.id} className="price-request-relance-item">
                        <div className="price-request-relance-row">
                          {r.type === 'x_jours_avant' && (
                            <input type="number" min="1" value={r.nb_jours ?? 2}
                              onChange={e => updateRelanceJours(r.id, Math.max(1, parseInt(e.target.value) || 1))}
                              className="price-request-relance-input" />
                          )}
                          <span className="price-request-relance-label">
                            {r.type === 'x_jours_avant' ? 'jour(s) avant la date limite' : '1 jour avant la date limite'}
                          </span>
                          <button onClick={() => removeRelance(r.id)} className="price-request-relance-remove">
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="price-request-relance-add-btns">
                      <button className="price-request-relance-add-btn" onClick={() => addRelance('x_jours_avant')}>+ X jours avant</button>
                      {!relances.some(r => r.type === '1_jour_avant') && (
                        <button className="price-request-relance-add-btn" onClick={() => addRelance('1_jour_avant')}>+ 1 jour avant</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Urgence */}
              <div className="price-request-form-group">
                <label className="price-request-form-label">Urgence</label>
                <div className="price-request-urgency-options">
                  {(['normal', 'urgent', 'tres_urgent'] as const).map(u => (
                    <label key={u} className={`price-request-urgency-option ${urgency === u ? 'active' : ''}`}>
                      <input type="radio" name="urgence" checked={urgency === u} onChange={() => setUrgency(u)} />
                      <span>{u === 'normal' ? 'Normal' : u === 'urgent' ? 'Urgent' : 'Très urgent'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ✅ Note - label corrigé */}
              <div className="price-request-form-group">
                <label className="price-request-form-label">Détail de la demande de prix</label>
                <textarea value={generalNote} onChange={e => setGeneralNote(e.target.value)}
                  className="price-request-form-textarea"
                  placeholder="Informations générales pour les fournisseurs..." />
              </div>

              {/* ✅ PJ — commun aux deux modes */}
              {renderPiecesJointes()}

              {/* ✅ Adresse livraison - label corrigé */}
              <div className="price-request-form-group">
                <label className="price-request-form-label">Livraison</label>
                <div className="price-request-delivery-options">
                  {[
                    { value: 'retrait', label: 'Retrait en point de vente', id: 'd-retrait' },
                    { value: 'siege', label: 'À mon siège', id: 'd-siege' },
                    { value: 'nouvelle', label: 'Nouvelle adresse', id: 'd-nouvelle' },
                  ].map(opt => (
                    <div key={opt.value} className="price-request-delivery-option">
                      <input type="radio" id={opt.id} name="delivery"
                        checked={deliveryType === opt.value}
                        onChange={() => setDeliveryType(opt.value as DeliveryType)} />
                      <label htmlFor={opt.id}>{opt.label}</label>
                    </div>
                  ))}
                </div>
                {deliveryType === 'nouvelle' && (
                  <div className="price-request-new-address">
                    <textarea value={newAddress} onChange={e => setNewAddress(e.target.value)}
                      className="price-request-form-textarea" placeholder="Adresse complète de livraison..." />
                    <div className="price-request-save-address">
                      <input type="checkbox" id="save-addr" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} />
                      <label htmlFor="save-addr">Enregistrer cette adresse</label>
                    </div>
                  </div>
                )}
              </div>

              {/* Fournisseurs — UNIQUEMENT mode par_produit */}
              {mode === 'by_product' && (
                <div className="price-request-form-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <label className="price-request-form-label" style={{ margin: 0 }}>Mes fournisseurs</label>
                    <span className="price-request-info-tooltip"
                      title="Seuls vos fournisseurs avec un email renseigné peuvent recevoir vos demandes. Renseignez l'email dans votre onglet Fournisseurs.">
                      <Info size={13} color="#aaa" style={{ cursor: 'help' }} />
                    </span>
                  </div>
                  <SupplierSelect
                    suppliers={fournisseurs}
                    selectedIds={selectedFournisseurIds}
                    onSelectionChange={setSelectedFournisseurIds}
                    onSelectAll={() => {
                      if (selectedFournisseurIds.length === fournisseurs.length) setSelectedFournisseurIds([]);
                      else setSelectedFournisseurIds(fournisseurs.map(f => f.id));
                    }}
                  />
                </div>
              )}

              {/* ✅ Email manuel — UNIQUEMENT mode par_produit */}
              {mode === 'by_product' && renderEmailManuel()}

              <button
                className={`price-request-submit-button ${isFormValid ? 'ready' : ''}`}
                disabled={!isFormValid || submitting}
                title={submitDisabledReason}
                onClick={handleSubmit}>
                {submitting ? 'Envoi en cours...' : 'Envoyer ma demande de prix'}
              </button>
            </div>
          </aside>
        </main>
      )}

      {/* ✅ Mobile toggle - ferme aussi en cliquant sur overlay */}
      <button className="price-request-mobile-toggle" onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}>
        <ShoppingCart size={24} />
        {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
      </button>

      {/* ✅ Click sur overlay ferme le panel mobile */}
      {isRightPanelOpen && (
        <div
          className="price-request-mobile-overlay"
          onClick={() => setIsRightPanelOpen(false)}
          style={{
            display: window.innerWidth <= 1024 ? 'block' : 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 99
          }}
        />
      )}

      {selectedProductDetail && (
        <ProductDetailModal product={selectedProductDetail} onClose={() => setSelectedProductDetail(null)} />
      )}

      {loadingHistoryDetail && (
        <div className="price-request-modal-overlay">
          <div className="price-request-modal"><div style={{ padding: 32, textAlign: 'center' }}>Chargement...</div></div>
        </div>
      )}

      {/* ✅ Modale détail - click overlay ferme */}
      {selectedHistoryRequest && !loadingHistoryDetail && (
        <div className="price-request-modal-overlay" onClick={() => setSelectedHistoryRequest(null)}>
          <div className="price-request-modal" onClick={e => e.stopPropagation()}>
            <div className="price-request-modal-header">
              <h3 className="price-request-modal-title">Détail de la demande</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {selectedHistoryRequest.statut === 'envoyee' && selectedHistoryRequest.membre_id === membreId && (
                  <button className="price-request-archive-btn" onClick={() => handleArchiver(selectedHistoryRequest.id)}>Archiver</button>
                )}
                <button className="price-request-modal-close" onClick={() => setSelectedHistoryRequest(null)}><X size={22} /></button>
              </div>
            </div>
            <div className="price-request-modal-content">
              <div className="price-request-modal-info">
                <div className="price-request-modal-label">Référence</div>
                <p className="price-request-modal-value">{selectedHistoryRequest.reference}</p>
              </div>
              <div className="price-request-modal-info">
                <div className="price-request-modal-label">Date</div>
                <p className="price-request-modal-value">{new Date(selectedHistoryRequest.date_creation).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="price-request-modal-divider" />
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="price-request-modal-info" style={{ flex: 1 }}>
                  <div className="price-request-modal-label">Statut</div>
                  <span className={`price-request-modal-status-badge ${selectedHistoryRequest.statut}`}>
                    {selectedHistoryRequest.statut === 'archivee' ? 'Archivée' : 'Envoyée'}
                  </span>
                </div>
                <div className="price-request-modal-info" style={{ flex: 1 }}>
                  <div className="price-request-modal-label">Urgence</div>
                  <span className={`price-request-modal-urgency-badge ${selectedHistoryRequest.urgence === 'tres_urgent' ? 'tres-urgent' : selectedHistoryRequest.urgence}`}>
                    {selectedHistoryRequest.urgence === 'tres_urgent' ? 'Très urgent' : selectedHistoryRequest.urgence === 'urgent' ? 'Urgent' : 'Normal'}
                  </span>
                </div>
              </div>
              <div className="price-request-modal-divider" />
              <div className="price-request-modal-info">
                <div className="price-request-modal-label">Livraison</div>
                <p className="price-request-modal-value">
                  {selectedHistoryRequest.adresse_livraison_type === 'siege' ? 'Siège social' :
                    selectedHistoryRequest.adresse_livraison_type === 'retrait' ? 'Retrait en point de vente' :
                      selectedHistoryRequest.adresse_livraison || 'Adresse non spécifiée'}
                </p>
              </div>
              {selectedHistoryRequest.note_generale && (
                <div className="price-request-modal-info">
                  <div className="price-request-modal-label">Note</div>
                  <p className="price-request-modal-value">{selectedHistoryRequest.note_generale}</p>
                </div>
              )}
              <div className="price-request-modal-divider" />
              {selectedHistoryRequest.destinataires && selectedHistoryRequest.destinataires.length > 0 && (
                <div className="price-request-modal-info">
                  <div className="price-request-modal-label">Destinataires ({selectedHistoryRequest.destinataires.length})</div>
                  <div className="price-request-modal-suppliers">
                    {selectedHistoryRequest.destinataires.map(dest => (
                      <div key={dest.id} className="price-request-modal-supplier-item">
                        <span className="price-request-modal-supplier-name">
                          {(dest as any).library_name || (dest as any).fournisseur_nom || dest.nom_manuel || dest.email_manuel || 'Destinataire'}
                        </span>
                        {selectedHistoryRequest.membre_id === membreId ? (
                          <select className="price-request-dest-statut-select"
                            value={(dest as any).statut || 'envoyee'}
                            onChange={e => handleUpdateStatutDestinataire(dest.id, selectedHistoryRequest.id, e.target.value)}>
                            <option value="envoyee">Envoyée</option>
                            <option value="traitee">Traitée</option>
                            <option value="acceptee">Acceptée</option>
                            <option value="trop_cher">Trop cher</option>
                            <option value="aucun_retour">Aucun retour</option>
                          </select>
                        ) : (
                          <span className="price-request-dest-statut-badge">{(dest as any).statut || 'envoyée'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="price-request-modal-divider" />
              {selectedHistoryRequest.lignes && selectedHistoryRequest.lignes.length > 0 && (
                <div className="price-request-modal-info">
                  <div className="price-request-modal-label">Produits ({selectedHistoryRequest.lignes.length})</div>
                  <div className="price-request-modal-products">
                    {selectedHistoryRequest.lignes.map(ligne => (
                      <div key={ligne.id} className="price-request-modal-product-item">
                        <div className="price-request-modal-product-info">
                          <h4 className="price-request-modal-product-name">{ligne.product_name || (ligne as any).product_nom}</h4>
                          {ligne.supplier_reference && (
                            <span className="price-request-modal-product-reference">Réf: {ligne.supplier_reference}</span>
                          )}
                        </div>
                        <div className="price-request-modal-product-detail">
                          <span className="price-request-modal-product-detail-label">Qté</span>
                          <span className="price-request-modal-product-detail-value">{ligne.quantite} {ligne.unit || ''}</span>
                        </div>
                        {ligne.note_ligne && (
                          <div className="price-request-modal-product-note"><strong>Note :</strong> {ligne.note_ligne}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <a href={`${API_BASE_URL}/demandes-prix/${selectedHistoryRequest.id}/pdf?societe_id=${societeId}`}
                target="_blank" rel="noopener noreferrer" className="price-request-view-pdf-btn">
                Voir la demande envoyée (PDF)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Popup success - descendue à 44px */}
      {showSuccessSnackbar && (
        <div className="price-request-success-popup">
          <div className="price-request-success-popup-icon">✓</div>
          <div className="price-request-success-popup-content">
            <h4 className="price-request-success-popup-title">Demande envoyée !</h4>
            <p className="price-request-success-popup-message">{successMessage}</p>
          </div>
          <button className="price-request-success-popup-close" onClick={() => setShowSuccessSnackbar(false)}>×</button>
        </div>
      )}
    </div>
  );
};