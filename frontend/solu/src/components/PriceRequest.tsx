// import { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { fetchData } from '../helpers/fetchData';
// import  solutravo  from "../assets/images/solutravo.png"

// import { CartItem } from './CartItem';
// import { ShoppingCart, X} from 'lucide-react';
// import '../styles/priceRequest.css';
// import { ProductCard } from './ProductCard';
// import { ProductDetailModal } from './ProductDetailsPrice';
// import { SupplierSelect } from './SupplierSelect';
// // import { mockPriceRequests, mockProductFamilies, mockProducts, mockSuppliers, type PriceRequest, type PriceRequestItem, type Product } from '../data/mockDataPrice';
// import {  
//   type PriceRequestItem, 
//   type Product,
//   type PriceRequests
// } from '../data/mockDataPrice';

// type RequestMode = 'by_supplier' | 'by_product' | null;

// export const PriceRequest = () => {
//   const [mode, setMode] = useState<RequestMode>(null);
//   const [selectedSupplier, setSelectedSupplier] = useState<string>('');
//   const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
//   const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
//   const [cartItems, setCartItems] = useState<PriceRequestItem[]>([]);
//   const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
//   const [reference, setReference] = useState('');
//   const [generalNote, setGeneralNote] = useState('');
//   const cartScrollRef = useRef<HTMLDivElement>(null);
//   // IMPORTANT: align with backend type ('tres_urgent')
//   const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'tres_urgent'>('normal');

//   // Data from API
//   const [suppliers, setSuppliers] = useState<any[]>([]);
//   const [products, setProducts] = useState<any[]>([]);
//   const [families, setFamilies] = useState<string[]>([]);

//   const params = useParams();
//   const societeId = params.societeId ? Number(params.societeId) : undefined;
//   const membreId = params.membreId ? Number(params.membreId) : undefined;
//   const [deliveryType, setDeliveryType] = useState<'headquarters' | 'new'>('headquarters');
//   const [newAddress, setNewAddress] = useState('');
//   const [saveAddress, setSaveAddress] = useState(false);

//   const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
//   const [manualEmails, setManualEmails] = useState<string[]>([]);
//   const [newEmail, setNewEmail] = useState('');
//   const [showHistory, setShowHistory] = useState(false);
//   const [history, setHistory] = useState<PriceRequests[]>([]);
//   const [selectedHistoryRequest, setSelectedHistoryRequest] = useState<PriceRequests | null>(null);
//   const [loadingHistoryDetail, setLoadingHistoryDetail] = useState(false);
//     // Charger l'historique des demandes de prix depuis le backend
//     useEffect(() => {
//       if (!societeId) return;
//       fetchData<{ success: boolean; data: PriceRequests[] }>(`demandes-prix?societe_id=${societeId}`)
//         .then(res => {
//           if (res.result?.data) setHistory(res.result.data);
//         });
//     }, [societeId]);
//   const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
//   // Expanded cart item id (only one open at a time)
//   const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
//   // Separate search terms for suppliers, products and families to scope searches per mode
//   const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
//   const [productSearchTerm, setProductSearchTerm] = useState('');
//   // When a supplier is selected, search/filter its product families
//   const [familySearchTerm, setFamilySearchTerm] = useState('');
//   console.log('Selected Products:', selectedProducts);

//   // Filter products coming from API
//   const filteredProducts = products.filter((product) => {
//     // Mode Fournisseur: si des familles sélectionnées, appliquer filtre famille; sinon montrer tous
//     if (mode === 'by_supplier') {
//       if (selectedFamilies.length > 0) {
//         if (selectedSupplier && String(product.library_id) !== selectedSupplier) return false;
//         if (!selectedFamilies.includes(product.famille_name)) return false;
//       }
//     }

//     // Mode Produit: filtrer par famille si nécessaire
//     if (mode === 'by_product') {
//       if (selectedFamilies.length > 0 && !selectedFamilies.includes(product.famille_name)) return false;
//     }

//     // Filtre par recherche (nom / référence fournisseur)
//     if (productSearchTerm) {
//       return (
//         product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
//         (product.supplier_reference || '').toLowerCase().includes(productSearchTerm.toLowerCase())
//       );
//     }

//     return true;
//   });

// const handleAddToCart = (product: any) => {
//     const mappedProduct: Product = {
//       id: String(product.id),
//       name: product.name,
//       reference: product.supplier_reference || '',
//       familyId: product.famille_name || '',
//       supplierId: String(product.library_id || ''),
//       description: product.description || '',
//       unit: product.unit || '',
//       imageUrl: product.image || ''
//     };

//     const existing = cartItems.find((item) => item.product.id === mappedProduct.id);
//     if (existing) {
//       setCartItems(
//         cartItems.map((item) =>
//           item.product.id === mappedProduct.id ? { ...item, quantity: item.quantity + 1 } : item
//         )
//       );
//     } else {
//       setCartItems((prev) => {
//         const next = [...prev, { product: mappedProduct, quantity: 1, note: '' }];
        
//         //Scroll automatique vers le bas après ajout
//         setTimeout(() => {
//           if (cartScrollRef.current) {
//             cartScrollRef.current.scrollTo({
//               top: cartScrollRef.current.scrollHeight,
//               behavior: 'smooth'
//             });
//           }
//         }, 100);
        
//         // Si premier produit, l'étendre par défaut
//         if (prev.length === 0) setExpandedItemId(mappedProduct.id);
        
//         return next;
//       });
//     }
//     setIsRightPanelOpen(true);
//   };
//   const handleUpdateQuantity = (productId: string, quantity: number) => {
//     setCartItems(
//       cartItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
//     );
//   };

//   const handleUpdateNote = (productId: string, note: string) => {
//     setCartItems(cartItems.map((item) => (item.product.id === productId ? { ...item, note } : item)));
//   };


//   const handleUpdateReference = (productId: string, reference: string) => {
//     setCartItems(cartItems.map((item) => (item.product.id === productId ? { ...item, reference } : item)));
//   };

//   const handleRemoveFromCart = (productId: string) => {
//     setCartItems((prev) => {
//       const next = prev.filter((item) => item.product.id !== productId);
//       // If removed item was expanded, open first remaining item (or none)
//       if (expandedItemId === productId) {
//         setExpandedItemId(next.length > 0 ? next[0].product.id : null);
//       }
//       return next;
//     });
//   };

//   const handleRemoveEmail = (email: string) => {
//     setManualEmails(manualEmails.filter((e) => e !== email));
//   };

//   const handleAddEmail = () => {
//     if (newEmail && newEmail.includes('@') && !manualEmails.includes(newEmail)) {
//       setManualEmails([...manualEmails, newEmail]);
//       setNewEmail('');
//     }
//   };

//   const handleSelectAllSuppliers = () => {
//     if (selectedSuppliers.length === suppliers.length) {
//       setSelectedSuppliers([]);
//     } else {
//       setSelectedSuppliers(suppliers.map((s) => String(s.id)));
//     }
//   };

//   // Charger fournisseurs + produits depuis l'API
//   useEffect(() => {
//     const fetchDataAsync = async () => {
//       if (!societeId) return;

//       try {
//         // Fournisseurs (une seule fois)
//         const supRes = await fetchData<any>(`demandes-prix/fournisseurs?societe_id=${societeId}`);
//         if (supRes.result && Array.isArray(supRes.result.data)) {
//           const mapped = supRes.result.data.map((r: any) => ({ id: String(r.id), name: r.name, image: r.image }));
//           setSuppliers(mapped);
//         }

//         // Produits (peut être filtré par library_id si un fournisseur est sélectionné)
//         const libQuery = selectedSupplier ? `&library_id=${selectedSupplier}` : '';
//         const prodRes = await fetchData<any>(`demandes-prix/produits?societe_id=${societeId}${libQuery}`);
//         if (prodRes.result && Array.isArray(prodRes.result.data)) {
//           setProducts(prodRes.result.data);

//           // Extraire familles uniques
//           const fams = Array.from(new Set(prodRes.result.data.map((p: any) => p.famille_name || ''))) as string[];
//           setFamilies(fams.filter((f) => f));
//         }
//       } catch (err: any) {
//         console.error('Erreur lors du chargement des fournisseurs/produits:', err.message || err);
//       }
//     };

//     fetchDataAsync();
//   }, [societeId, selectedSupplier]);

//   const handleSubmit = async () => {
//     if (!mode || societeId === undefined || membreId === undefined) return;

//     // Defensive: valider avant envoi
//     if (!isFormValid) {
//       alert(submitDisabledReason || 'Formulaire invalide, vérifiez les champs');
//       return;
//     }

//     // Construire payload conforme à CreateDemandePrixInput
//     // Note: backend attend une "reference" globale; on compose une référence lisible à partir des références produits
//     const composedReference = cartItems.map((i) => (i.reference || i.product.reference || '').toString().trim()).filter(Boolean).join(' | ');

//     const payload: any = {
//       reference: composedReference || reference || '',
//       type_demande: mode === 'by_supplier' ? 'par_fournisseur' : 'par_produit',
//       note_generale: generalNote || undefined,
//       urgence: urgency || 'normal',
//       adresse_livraison_type: deliveryType === 'headquarters' ? 'siege' : 'nouvelle',
//       adresse_livraison: deliveryType === 'new' ? newAddress || undefined : undefined,
//       societe_id: societeId,
//       membre_id: membreId,
//       lignes: cartItems.map((item, index) => ({
//         product_id: Number(item.product.id),
//         quantite: item.quantity,
//         // Inclure la référence produit dans note_ligne pour la persistance côté backend
//         note_ligne: `${(item.reference || item.product.reference || '').toString().trim()}${item.note ? ' — ' + item.note : ''}` || undefined,
//         ordre: index
//       })),
//       destinataires: [] as any[],
//     };

//     // Ajouter destinataires sélectionnés (libraries)
//     if (mode === 'by_supplier') {
//       if (selectedSupplier) payload.destinataires.push({ library_id: Number(selectedSupplier) });
//     } else {
//       payload.destinataires.push(...selectedSuppliers.map((id) => ({ library_id: Number(id) })));
//     }

//     // Ajouter emails manuels
//     payload.destinataires.push(...manualEmails.map((email) => ({ email_manuel: email })));

//     try {
//       const res = await fetchData<any>('demandes-prix', 'POST', payload);
//       if (res.status >= 200 && res.status < 300) {
//         alert('Demande de prix créée et envoyée avec succès');
//         setCartItems([]);
//         setReference('');
//         setGeneralNote('');
//         setUrgency('normal');
//         setDeliveryType('headquarters');
//         setNewAddress('');
//         setSelectedSuppliers([]);
//         setManualEmails([]);
//         setIsRightPanelOpen(false);
//       }
//     } catch (err: any) {
//       console.error('Erreur création demande:', err);
//       // Afficher message détaillé si disponible
//       const message = err?.message || (err?.result && err.result.message) || 'Erreur lors de l\'envoi de la demande, réessayer.';
//       alert(message);
//     }
//   };

//   // Validation: le bouton est actif si chaque produit a une référence et une quantité valides
//   const itemsHaveValidQuantity = cartItems.length > 0 && cartItems.every((i) => typeof i.quantity === 'number' && i.quantity > 0);
//   const itemsHaveValidReference = cartItems.length > 0 && cartItems.every((i) => ((i.reference || i.product.reference) || '').toString().trim() !== '');

//   // Destinataires requis selon le mode
//   const hasRecipientForMode = (() => {
//     if (mode === 'by_supplier') {
//       return !!selectedSupplier || manualEmails.length > 0; // supplier selected or manual email
//     }
//     if (mode === 'by_product') {
//       return selectedSuppliers.length > 0 || manualEmails.length > 0;
//     }
//     return false;
//   })();

//   const isFormValid = cartItems.length > 0 && itemsHaveValidQuantity && itemsHaveValidReference && societeId !== undefined && membreId !== undefined && hasRecipientForMode;

//   // Message d'aide pour tooltip
//   let submitDisabledReason = '';
//   if (cartItems.length === 0) {
//     submitDisabledReason = 'Ajoutez au moins un produit à la demande';
//   } else if (!itemsHaveValidQuantity) {
//     submitDisabledReason = 'Vérifiez les quantités des produits (>= 1)';
//   } else if (!itemsHaveValidReference) {
//     submitDisabledReason = 'Référence produit requise pour chaque ligne';
//   } else if (!hasRecipientForMode) {
//     submitDisabledReason = mode === 'by_supplier' ? 'Veuillez sélectionner un fournisseur ou ajouter un email destinataire' : 'Veuillez sélectionner au moins un fournisseur ou ajouter un email destinataire';
//   } else if (societeId === undefined || membreId === undefined) {
//     submitDisabledReason = 'Paramètres d\'environnement manquants (societe/membre)';
//   }

//   return (
//     <div className="price-request-container">
//       <header className="price-request-header">
//         <div className="price-request-logo">
//              <div className="logo">
//               <img src={solutravo} alt="Solutravo" className="logo-icon" />
//             </div>
//           {/* <span className="price-request-logo-text">SOLU</span>
//           <span className="price-request-logo-highlight">TRAVO</span> */}
//         </div>
//         <div className="price-request-tabs">
//           <button
//             className={`price-request-tab ${showHistory ? 'active' : ''}`}
//             onClick={() => setShowHistory(!showHistory)}
//           >
//             Historique
//           </button>
//         </div>
//       </header>

//       {showHistory ? (
//         <div className="price-request-panel" style={{ flex: 1 }}>
//           <div className="price-request-panel-header">
//             <h3 className="price-request-panel-title">Historique des demandes</h3>
//           </div>
//           <div className="price-request-panel-content">
          

// {history.map((request) => (
//   <div 
//     key={request.id} 
//     className="price-request-history-item"
//     onClick={async () => {
//       setLoadingHistoryDetail(true);
//       try {
//         const res = await fetchData<{ success: boolean; data: PriceRequests }>(`demandes-prix/${request.id}?societe_id=${societeId}`);
//         if (res.result?.data) setSelectedHistoryRequest(res.result.data);
//       } catch (e) {
//         setSelectedHistoryRequest(null);
//       } finally {
//         setLoadingHistoryDetail(false);
//       }
//     }}
//   >
//     <div className="price-request-history-header">
//       <span className="price-request-history-reference">{request.reference}</span>
//       <span className="price-request-history-date">
//         {(() => {
//           const rawDate = request.date_creation || request.createdAt || request.created_at;
//           if (!rawDate) return 'Date inconnue';
//           const dateObj = typeof rawDate === 'string' ? new Date(rawDate) : rawDate;
//           if (isNaN(dateObj.getTime())) return 'Date invalide';
//           return `${dateObj.toLocaleDateString('fr-FR')} à ${dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
//         })()}
//       </span>
//     </div>
    
//     {/* ✅ CORRECTION : Utiliser nb_lignes et nb_destinataires */}
//     <p className="price-request-history-info">
//       {request.nb_lignes || (request.lignes ? request.lignes.length : 0)} produit(s) - {request.nb_destinataires || (request.destinataires ? request.destinataires.length : 0)} fournisseur(s)
//     </p>
    
//     {/* ✅ CORRECTION : Adresse de livraison */}
//     <p className="price-request-history-info">
//       Livraison: {request.adresse_livraison || (request.adresse_livraison_type === 'siege' ? 'Siège social' : 'Nouvelle adresse')}
//     </p>
    
//     {/* ✅ CORRECTION : Urgence */}
//     <span
//       className={`price-request-badge ${
//         request.urgence === 'urgent' ? 'urgent' : 
//         request.urgence === 'tres_urgent' ? 'very-urgent' : 
//         'normal'
//       }`}
//     >
//       {request.urgence === 'urgent' ? 'Urgent' : 
//        request.urgence === 'tres_urgent' ? 'Très urgent' : 
//        'Normal'}
//     </span>
//   </div>
// ))}
//           </div>
//         </div>
//       ) : (
//         <main className="price-request-main">
//           <aside className="price-request-panel price-request-panel-left">
//             <div className="price-request-left-header">
//               <div className="price-request-mode-tabs">
//                 <button
//                   className={`price-request-mode-tab ${mode === 'by_supplier' ? 'active' : ''}`}
//                   onClick={() => {
//                     setMode('by_supplier');
//                     setSelectedSupplier('');
//                     setSelectedFamilies([]);
//                     setCartItems([]);
//                     setProductSearchTerm('');
//                     setFamilySearchTerm('');
//                   }}
//                 >
//                   Par fournisseur
//                 </button>
//                 <button
//                   className={`price-request-mode-tab ${mode === 'by_product' ? 'active' : ''}`}
//                   onClick={() => {
//                     setMode('by_product');
//                     setSelectedProducts([]);
//                     setCartItems([]);
//                     setProductSearchTerm('');
//                     setFamilySearchTerm('');
//                   }}
//                 >
//                   Par produit(s)
//                 </button>
//               </div>
//             </div>

//             <div className="price-request-panel-header">
//               <h3 className="price-request-panel-title">
//                 {mode === 'by_supplier' ? 'Fournisseur' : mode === 'by_product' ? '' : ''}
//               </h3>
//               {mode === 'by_supplier' && (
//                 <input
//                   type="text"
//                   placeholder={'Rechercher un fournisseur...'}
//                   className="price-request-search"
//                   value={supplierSearchTerm}
//                   onChange={(e) => setSupplierSearchTerm(e.target.value)}
//                 />
//               )}
//             </div>
//             <div className="price-request-panel-content">
//               {mode === null ? (
//                 <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d', fontSize: '12px' }}>
//                   Sélectionnez un mode ci-dessus
//                 </div>
//               ) : mode === 'by_supplier' ? (
//                 <>
//                   <div className="price-request-section-title">Liste</div>
//                   <div className="price-request-checkbox-group">
//                     {suppliers
//                       .filter((s) => !supplierSearchTerm || s.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()))
//                       .map((supplier) => (
//                         <div key={supplier.id} className="price-request-checkbox-item">
//                           <input
//                             type="checkbox"
//                             id={`supplier-${supplier.id}`}
//                             checked={selectedSupplier === String(supplier.id)}
//                             onChange={() =>
//                               setSelectedSupplier(selectedSupplier === String(supplier.id) ? '' : String(supplier.id))
//                             }
//                           />
//                           <label htmlFor={`supplier-${supplier.id}`}>{supplier.name}</label>
//                         </div>
//                       ))}
//                   </div>

//                   {/** Familles calculées dynamiquement depuis les produits pour le fournisseur sélectionné **/}
//                   {selectedSupplier && (
//                     <>
//                       <div className="price-request-section-title">Les Familles de produits</div>
//                       <input
//                         type="text"
//                         placeholder="Rechercher une famille de produit"
//                         className="price-request-search"
//                         value={familySearchTerm}
//                         onChange={(e) => setFamilySearchTerm(e.target.value)}
//                       />
//                       <div className="price-request-checkbox-group">
//                         {Array.from(
//                           new Set(
//                             products
//                               .filter((p) => String(p.library_id) === String(selectedSupplier))
//                               .map((p) => p.famille_name || '')
//                           )
//                         )
//                           .filter((f) => f)
//                           .filter((family) => !familySearchTerm || family.toLowerCase().includes(familySearchTerm.toLowerCase()))
//                           .map((family) => (
//                             <div key={family} className="price-request-checkbox-item">
//                               <input
//                                 type="checkbox"
//                                 id={`family-${family}`}
//                                 checked={selectedFamilies.includes(family)}
//                                 onChange={() => {
//                                   if (selectedFamilies.includes(family)) {
//                                     setSelectedFamilies(selectedFamilies.filter((id) => id !== family));
//                                   } else {
//                                     setSelectedFamilies([...selectedFamilies, family]);
//                                   }
//                                 }}
//                               />
//                               <label htmlFor={`family-${family}`}>{family}</label>
//                             </div>
//                           ))}
//                       </div>
//                     </>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   <div className="price-request-section-title">Groupes</div>
//                   <input
//                     type="text"
//                     placeholder="Rechercher une famille de produit"
//                     className="price-request-search"
//                     value={familySearchTerm}
//                     onChange={(e) => setFamilySearchTerm(e.target.value)}
//                   />
//                   <div className="price-request-checkbox-group">
//                     {families
//                       .filter((f) => !familySearchTerm || f.toLowerCase().includes(familySearchTerm.toLowerCase()))
//                       .map((family) => (
//                         <div key={family} className="price-request-checkbox-item">
//                           <input
//                             type="checkbox"
//                             id={`family-prod-${family}`}
//                             checked={selectedFamilies.includes(family)}
//                             onChange={() => {
//                               if (selectedFamilies.includes(family)) {
//                                 setSelectedFamilies(selectedFamilies.filter((id) => id !== family));
//                               } else {
//                                 setSelectedFamilies([...selectedFamilies, family]);
//                               }
//                             }}
//                           />
//                           <label htmlFor={`family-prod-${family}`}>{family}</label>
//                         </div>
//                       ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           </aside>

//           <section className="price-request-panel price-request-panel-center">
//             <div className="price-request-center-header">
//               <input
//                 type="text"
//                 placeholder="Rechercher un produit..."
//                 className="price-request-search"
//                 value={productSearchTerm}
//                 onChange={(e) => setProductSearchTerm(e.target.value)}
//               />
//             </div>
//             <div className="price-request-center-content">
//               {mode === null ? (
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6c757d', fontSize: '16px', flexDirection: 'column', gap: '16px' }}>
//                   <p>Choisissez un mode pour commencer</p>
//                   <p style={{ fontSize: '14px', marginTop: '8px' }}>Cliquez sur "Par fournisseur" ou "Par produit(s)" en haut à gauche</p>
//                 </div>
//               ) : (
//                 <div className="price-request-products-grid">
//                   {filteredProducts.map((product) => {
//                     const mappedProduct: Product = {
//                       id: String(product.id),
//                       name: product.name,
//                       reference: product.supplier_reference || '',
//                       familyId: product.famille_name || '',
//                       supplierId: String(product.library_id || ''),
//                       description: product.description || '',
//                       unit: product.unit || '',
//                       imageUrl: product.image || ''
//                     };

//                     return (
//                       <ProductCard
//                         key={product.id}
//                         product={mappedProduct}
//                         onAdd={handleAddToCart}
//                         onViewDetails={setSelectedProductDetail}
//                       />
//                     );
//                   })}

//                   {filteredProducts.length === 0 && (
//                     <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6c757d', fontSize: '14px' }}>
//                       {mode === 'by_supplier' && !selectedSupplier
//                         ? 'Produits Solutravo et fournisseurs disponibles ci-dessous'
//                         : 'Aucun produit trouvé'}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </section>

//           <aside className={`price-request-panel price-request-panel-right ${isRightPanelOpen ? 'open' : ''}`}>
//             <div className="price-request-panel-header">
//               <h3 className="price-request-panel-title">Produit(s) sélectionné(s) ({cartItems.length})</h3>
//             </div>

//             <div className="price-request-right-scrollable" ref={cartScrollRef}>

//               {cartItems.length === 0 ? (
//                 <div className="price-request-cart-empty">Aucun produit sélectionné</div>
//               ) : (
//                 <div className="price-request-cart-items-list">
//                   {cartItems.map((item) => (
//                     <CartItem
//                       key={item.product.id}
//                       item={item}
//                       totalItems={cartItems.length}
//                       isExpanded={expandedItemId === item.product.id}
//                       onToggle={() => setExpandedItemId(expandedItemId === item.product.id ? null : item.product.id)}
//                       onUpdateQuantity={handleUpdateQuantity}
//                       onUpdateNote={handleUpdateNote}
//                       onUpdateReference={handleUpdateReference}
//                       onRemove={handleRemoveFromCart}
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="price-request-right-fixed">
//               <div className="price-request-form-group">
//                 <label className="price-request-form-label">Urgence</label>
//                 <div className="price-request-urgency-options">
//                   <label className={`price-request-urgency-option ${urgency === 'normal' ? ' active' : ''}`}>
//                     <input type="radio" name="urgence" checked={urgency === 'normal'} onChange={() => setUrgency('normal')} />
//                     <span>Normal</span>
//                   </label>
//                   <label className={`price-request-urgency-option ${urgency === 'urgent' ? ' active' : ''}`}>
//                     <input type="radio" name="urgence" checked={urgency === 'urgent'} onChange={() => setUrgency('urgent')} />
//                     <span>Urgent</span>
//                   </label>
//                   <label className={`price-request-urgency-option ${urgency === 'tres_urgent' ? ' active' : ''}`}>
//                     <input type="radio" name="urgence" checked={urgency === 'tres_urgent'} onChange={() => setUrgency('tres_urgent')} />
//                     <span>Très urgent</span>
//                   </label>
//                 </div>
//               </div>

//               <div className="price-request-form-group">
//                 <label className="price-request-form-label">Détails généraux</label>
//                 <textarea value={generalNote} onChange={(e) => setGeneralNote(e.target.value)} className="price-request-form-textarea" placeholder="Informations générales pour les fournisseurs..." />
//               </div>

//               <div className="price-request-form-group">
//                 <label className="price-request-form-label">Adresse de livraison</label>
//                 <div className="price-request-delivery-options">
//                   <div className="price-request-delivery-option">
//                     <input type="radio" id="delivery-hq" name="delivery" checked={deliveryType === 'headquarters'} onChange={() => setDeliveryType('headquarters')} />
//                     <label htmlFor="delivery-hq">A mon siège</label>
//                   </div>
//                   <div className="price-request-delivery-option">
//                     <input type="radio" id="delivery-new" name="delivery" checked={deliveryType === 'new'} onChange={() => setDeliveryType('new')} />
//                     <label htmlFor="delivery-new">Nouvelle adresse</label>
//                   </div>
//                 </div>
//                 {deliveryType === 'new' && (
//                   <div className="price-request-new-address">
//                     <textarea value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="price-request-form-textarea" placeholder="Adresse complète de livraison..." />
//                     <div className="price-request-save-address">
//                       <input type="checkbox" id="save-address" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
//                       <label htmlFor="save-address">Enregistrer cette adresse</label>
//                     </div>
//                   </div>
//                 )}

//                 {mode === 'by_product' && (
//                   <>
//                     <div className="price-request-form-group">
//                       <label className="price-request-form-label">Mes fournisseurs de matériaux</label>
//                       <SupplierSelect suppliers={suppliers} selectedIds={selectedSuppliers} onSelectionChange={setSelectedSuppliers} onSelectAll={handleSelectAllSuppliers} />
//                     </div>

//                     <div className="price-request-form-group">
//                       <label className="price-request-form-label">Envoyer par mail</label>
//                       <p style={{ fontSize: '12px', color: '#6c757d', margin: '0 0 8px 0' }}>Ajoutez le mail de votre contact</p>
//                       <div className="price-request-email-input">
//                         <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="price-request-form-input" placeholder="email@example.com" onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()} />
//                         <button onClick={handleAddEmail} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Ajouter</button>
//                       </div>
//                       {manualEmails.length > 0 && (
//                         <div className="price-request-file-list">
//                           {manualEmails.map((email) => (
//                             <div key={email} className="price-request-file-item">
//                               <span>{email}</span>
//                               <button onClick={() => handleRemoveEmail(email)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}>
//                                 <X size={16} />
//                               </button>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </>
//                 )}

//                 <button
//                   className={`price-request-submit-button ${isFormValid ? 'ready' : ''}`}
//                   disabled={!isFormValid}
//                   title={submitDisabledReason}
//                   onClick={handleSubmit}
//                 >
//                   Envoyer ma demande de prix
//                 </button>
//               </div>
//             </div>
//           </aside>
//         </main>
//       )}

//       <button
//         className="price-request-mobile-toggle"
//         onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
//       >
//         <ShoppingCart size={24} />
//         {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
//       </button>

//       {selectedProductDetail && (
//         <ProductDetailModal product={selectedProductDetail} onClose={() => setSelectedProductDetail(null)} />
//       )}

//       {loadingHistoryDetail && (
//         <div className="price-request-modal-overlay">
//           <div className="price-request-modal">
//             <div style={{padding: 32, textAlign: 'center'}}>Chargement du détail...</div>
//           </div>
//         </div>
//       )}
//       {selectedHistoryRequest && !loadingHistoryDetail && (
//         <div className="price-request-modal-overlay" onClick={() => setSelectedHistoryRequest(null)}>
//           <div className="price-request-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="price-request-modal-header">
//               <h3 className="price-request-modal-title">Détail de la demande</h3>
//               <button 
//                 className="price-request-modal-close" 
//                 onClick={() => setSelectedHistoryRequest(null)}
//               >
//                 <X size={24} />
//               </button>
//             </div>
//             <div className="price-request-modal-content">
//               <div className="price-request-modal-info">
//                 <div className="price-request-modal-label">Référence</div>
//                 <p className="price-request-modal-value">{selectedHistoryRequest.reference}</p>
//               </div>

//               <div className="price-request-modal-info">
//                 <div className="price-request-modal-label">Date</div>
//                 <p className="price-request-modal-value">
//                   {selectedHistoryRequest.createdAt.toLocaleDateString('fr-FR')} à{' '}
//                   {selectedHistoryRequest.createdAt.toLocaleTimeString('fr-FR', {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                   })}
//                 </p>
//               </div>

//               <div className="price-request-modal-info">
//                 <div className="price-request-modal-label">Statut</div>
//                 <p className="price-request-modal-value" style={{ textTransform: 'capitalize' }}>
//                   {selectedHistoryRequest.status}
//                 </p>
//               </div>

//               <div className="price-request-modal-info">
//                 <div className="price-request-modal-label">Urgence</div>
//                 <p className="price-request-modal-value">
//                   {selectedHistoryRequest.urgency === 'urgent'
//                     ? 'Urgent'
//                     : selectedHistoryRequest.urgency === 'very_urgent'
//                       ? 'Très urgent'
//                       : 'Normal'}
//                 </p>
//               </div>

//               <div className="price-request-modal-info">
//                 <div className="price-request-modal-label">Adresse de livraison</div>
//                 <p className="price-request-modal-value">{selectedHistoryRequest.deliveryAddress}</p>
//               </div>

//               <div className="price-request-modal-info">
//                 <div className="price-request-modal-label">Produits ({selectedHistoryRequest.items.length})</div>
//                 <div className="price-request-modal-products">
//                   {selectedHistoryRequest.items.map((item) => (
//                     <div key={item.product.id} className="price-request-modal-product-item">
//                       <span>{item.product.name} (x{item.quantity})</span>
//                       <span className="price-request-modal-product-reference">{item.product.reference}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="price-request-modal-info">
//                 <div className="price-request-modal-label">Fournisseurs ({selectedHistoryRequest.suppliers.length})</div>
//                 <div className="price-request-modal-suppliers">
//                   {selectedHistoryRequest.suppliers.map((supplier) => (
//                     <div key={supplier.id} className="price-request-modal-supplier-item">
//                       {supplier.name}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {selectedHistoryRequest.generalNote && (
//                 <div className="price-request-modal-info">
//                   <div className="price-request-modal-label">Note générale</div>
//                   <p className="price-request-modal-value">{selectedHistoryRequest.generalNote}</p>
//                 </div>
//               )}

//               {selectedHistoryRequest.attachments.length > 0 && (
//                 <div className="price-request-modal-info">
//                   <div className="price-request-modal-label">Pièces jointes ({selectedHistoryRequest.attachments.length})</div>
//                   <div className="price-request-modal-attachments">
//                     {selectedHistoryRequest.attachments.map((file, index) => (
//                       <div key={index} className="price-request-modal-attachment-item">
//                         {file}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchData } from '../helpers/fetchData';
import solutravo from "../assets/images/solutravo.png"
import { CartItem } from './CartItem';
import { ShoppingCart, X } from 'lucide-react';
import '../styles/priceRequest.css';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailsPrice';
import { SupplierSelect } from './SupplierSelect';
import {  
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
  const cartScrollRef = useRef<HTMLDivElement>(null);
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'tres_urgent'>('normal');

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [families, setFamilies] = useState<string[]>([]);

  const params = useParams();
  const societeId = params.societeId ? Number(params.societeId) : undefined;
  const membreId = params.membreId ? Number(params.membreId) : undefined;
  const [deliveryType, setDeliveryType] = useState<'headquarters' | 'new'>('headquarters');
  const [newAddress, setNewAddress] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);

  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<PriceRequests[]>([]);
  const [selectedHistoryRequest, setSelectedHistoryRequest] = useState<PriceRequests | null>(null);
  const [loadingHistoryDetail, setLoadingHistoryDetail] = useState(false);
  
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [familySearchTerm, setFamilySearchTerm] = useState('');

  // Charger l'historique des demandes de prix depuis le backend
  useEffect(() => {
    if (!societeId) return;
    fetchData<{ success: boolean; data: PriceRequests[] }>(`demandes-prix?societe_id=${societeId}`)
      .then(res => {
        if (res.result?.data) setHistory(res.result.data);
      });
  }, [societeId]);

  // Filter products coming from API
  const filteredProducts = products.filter((product) => {
    if (mode === 'by_supplier') {
      if (selectedFamilies.length > 0) {
        if (selectedSupplier && String(product.library_id) !== selectedSupplier) return false;
        if (!selectedFamilies.includes(product.famille_name)) return false;
      }
    }

    if (mode === 'by_product') {
      if (selectedFamilies.length > 0 && !selectedFamilies.includes(product.famille_name)) return false;
    }

    if (productSearchTerm) {
      return (
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        (product.supplier_reference || '').toLowerCase().includes(productSearchTerm.toLowerCase())
      );
    }

    return true;
  });

  const handleAddToCart = (product: any) => {
    const mappedProduct: Product = {
      id: String(product.id),
      name: product.name,
      reference: product.supplier_reference || '',
      familyId: product.famille_name || '',
      supplierId: String(product.library_id || ''),
      description: product.description || '',
      unit: product.unit || '',
      imageUrl: product.image || ''
    };

    const existing = cartItems.find((item) => item.product.id === mappedProduct.id);
    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.product.id === mappedProduct.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems((prev) => {
        const next = [...prev, { product: mappedProduct, quantity: 1, note: '' }];
        
        setTimeout(() => {
          if (cartScrollRef.current) {
            cartScrollRef.current.scrollTo({
              top: cartScrollRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 100);
        
        if (prev.length === 0) setExpandedItemId(mappedProduct.id);
        
        return next;
      });
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

  const handleUpdateReference = (productId: string, reference: string) => {
    setCartItems(cartItems.map((item) => (item.product.id === productId ? { ...item, reference } : item)));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => item.product.id !== productId);
      if (expandedItemId === productId) {
        setExpandedItemId(next.length > 0 ? next[0].product.id : null);
      }
      return next;
    });
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
    if (selectedSuppliers.length === suppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(suppliers.map((s) => String(s.id)));
    }
  };

  useEffect(() => {
    const fetchDataAsync = async () => {
      if (!societeId) return;

      try {
        const supRes = await fetchData<any>(`demandes-prix/fournisseurs?societe_id=${societeId}`);
        if (supRes.result && Array.isArray(supRes.result.data)) {
          const mapped = supRes.result.data.map((r: any) => ({ id: String(r.id), name: r.name, image: r.image }));
          setSuppliers(mapped);
        }

        const libQuery = selectedSupplier ? `&library_id=${selectedSupplier}` : '';
        const prodRes = await fetchData<any>(`demandes-prix/produits?societe_id=${societeId}${libQuery}`);
        if (prodRes.result && Array.isArray(prodRes.result.data)) {
          setProducts(prodRes.result.data);

          const fams = Array.from(new Set(prodRes.result.data.map((p: any) => p.famille_name || ''))) as string[];
          setFamilies(fams.filter((f) => f));
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des fournisseurs/produits:', err.message || err);
      }
    };

    fetchDataAsync();
  }, [societeId, selectedSupplier]);

  const handleSubmit = async () => {
    if (!mode || societeId === undefined || membreId === undefined) return;

    if (!isFormValid) {
      alert(submitDisabledReason || 'Formulaire invalide, vérifiez les champs');
      return;
    }

    const composedReference = cartItems.map((i) => (i.reference || i.product.reference || '').toString().trim()).filter(Boolean).join(' | ');

    const payload: any = {
      reference: composedReference || reference || '',
      type_demande: mode === 'by_supplier' ? 'par_fournisseur' : 'par_produit',
      note_generale: generalNote || undefined,
      urgence: urgency || 'normal',
      adresse_livraison_type: deliveryType === 'headquarters' ? 'siege' : 'nouvelle',
      adresse_livraison: deliveryType === 'new' ? newAddress || undefined : undefined,
      societe_id: societeId,
      membre_id: membreId,
      lignes: cartItems.map((item, index) => ({
        product_id: Number(item.product.id),
        quantite: item.quantity,
        note_ligne: `${(item.reference || item.product.reference || '').toString().trim()}${item.note ? ' — ' + item.note : ''}` || undefined,
        ordre: index
      })),
      destinataires: [] as any[],
    };

    if (mode === 'by_supplier') {
      if (selectedSupplier) payload.destinataires.push({ library_id: Number(selectedSupplier) });
    } else {
      payload.destinataires.push(...selectedSuppliers.map((id) => ({ library_id: Number(id) })));
    }

    payload.destinataires.push(...manualEmails.map((email) => ({ email_manuel: email })));

    try {
      const res = await fetchData<any>('demandes-prix', 'POST', payload);
      if (res.status >= 200 && res.status < 300) {
        alert('Demande de prix créée et envoyée avec succès');
        setCartItems([]);
        setReference('');
        setGeneralNote('');
        setUrgency('normal');
        setDeliveryType('headquarters');
        setNewAddress('');
        setSelectedSuppliers([]);
        setManualEmails([]);
        setIsRightPanelOpen(false);
      }
    } catch (err: any) {
      console.error('Erreur création demande:', err);
      const message = err?.message || (err?.result && err.result.message) || 'Erreur lors de l\'envoi de la demande, réessayer.';
      alert(message);
    }
  };

  const itemsHaveValidQuantity = cartItems.length > 0 && cartItems.every((i) => typeof i.quantity === 'number' && i.quantity > 0);
  const itemsHaveValidReference = cartItems.length > 0 && cartItems.every((i) => ((i.reference || i.product.reference) || '').toString().trim() !== '');

  const hasRecipientForMode = (() => {
    if (mode === 'by_supplier') {
      return !!selectedSupplier || manualEmails.length > 0;
    }
    if (mode === 'by_product') {
      return selectedSuppliers.length > 0 || manualEmails.length > 0;
    }
    return false;
  })();

  const isFormValid = cartItems.length > 0 && itemsHaveValidQuantity && itemsHaveValidReference && societeId !== undefined && membreId !== undefined && hasRecipientForMode;

  let submitDisabledReason = '';
  if (cartItems.length === 0) {
    submitDisabledReason = 'Ajoutez au moins un produit à la demande';
  } else if (!itemsHaveValidQuantity) {
    submitDisabledReason = 'Vérifiez les quantités des produits (>= 1)';
  } else if (!itemsHaveValidReference) {
    submitDisabledReason = 'Référence produit requise pour chaque ligne';
  } else if (!hasRecipientForMode) {
    submitDisabledReason = mode === 'by_supplier' ? 'Veuillez sélectionner un fournisseur ou ajouter un email destinataire' : 'Veuillez sélectionner au moins un fournisseur ou ajouter un email destinataire';
  } else if (societeId === undefined || membreId === undefined) {
    submitDisabledReason = 'Paramètres d\'environnement manquants (societe/membre)';
  }

  return (
    <div className="price-request-container">
      <header className="price-request-header">
        <div className="price-request-logo">
          <div className="logo">
            <img src={solutravo} alt="Solutravo" className="logo-icon" />
          </div>
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
                onClick={async () => {
                  setLoadingHistoryDetail(true);
                  try {
                    const res = await fetchData<{ success: boolean; data: PriceRequests }>(`demandes-prix/${request.id}?societe_id=${societeId}`);
                    if (res.result?.data) setSelectedHistoryRequest(res.result.data);
                  } catch (e) {
                    setSelectedHistoryRequest(null);
                  } finally {
                    setLoadingHistoryDetail(false);
                  }
                }}
              >
                <div className="price-request-history-header">
                  <span className="price-request-history-reference">{request.reference}</span>
                  <span className="price-request-history-date">
                    {(() => {
                      const dateObj = new Date(request.date_creation);
                      if (isNaN(dateObj.getTime())) return 'Date invalide';
                      return `${dateObj.toLocaleDateString('fr-FR')} à ${dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                    })()}
                  </span>
                </div>
                
                <p className="price-request-history-info">
                  {request.nb_lignes || (request.lignes ? request.lignes.length : 0)} produit(s) - {request.nb_destinataires || (request.destinataires ? request.destinataires.length : 0)} fournisseur(s)
                </p>
                
                <p className="price-request-history-info">
                  Livraison: {request.adresse_livraison || (request.adresse_livraison_type === 'siege' ? 'Siège social' : 'Nouvelle adresse')}
                </p>
                
                <span
                  className={`price-request-badge ${
                    request.urgence === 'urgent' ? 'urgent' : 
                    request.urgence === 'tres_urgent' ? 'very-urgent' : 
                    'normal'
                  }`}
                >
                  {request.urgence === 'urgent' ? 'Urgent' : 
                   request.urgence === 'tres_urgent' ? 'Très urgent' : 
                   'Normal'}
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
                    setProductSearchTerm('');
                    setFamilySearchTerm('');
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
                    setProductSearchTerm('');
                    setFamilySearchTerm('');
                  }}
                >
                  Par produit(s)
                </button>
              </div>
            </div>

            <div className="price-request-panel-header">
              <h3 className="price-request-panel-title">
                {mode === 'by_supplier' ? 'Fournisseur' : mode === 'by_product' ? '' : ''}
              </h3>
              {mode === 'by_supplier' && (
                <input
                  type="text"
                  placeholder={'Rechercher un fournisseur...'}
                  className="price-request-search"
                  value={supplierSearchTerm}
                  onChange={(e) => setSupplierSearchTerm(e.target.value)}
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
                    {suppliers
                      .filter((s) => !supplierSearchTerm || s.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()))
                      .map((supplier) => (
                        <div key={supplier.id} className="price-request-checkbox-item">
                          <input
                            type="checkbox"
                            id={`supplier-${supplier.id}`}
                            checked={selectedSupplier === String(supplier.id)}
                            onChange={() =>
                              setSelectedSupplier(selectedSupplier === String(supplier.id) ? '' : String(supplier.id))
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
                        placeholder="Rechercher une famille de produit"
                        className="price-request-search"
                        value={familySearchTerm}
                        onChange={(e) => setFamilySearchTerm(e.target.value)}
                      />
                      <div className="price-request-checkbox-group">
                        {Array.from(
                          new Set(
                            products
                              .filter((p) => String(p.library_id) === String(selectedSupplier))
                              .map((p) => p.famille_name || '')
                          )
                        )
                          .filter((f) => f)
                          .filter((family) => !familySearchTerm || family.toLowerCase().includes(familySearchTerm.toLowerCase()))
                          .map((family) => (
                            <div key={family} className="price-request-checkbox-item">
                              <input
                                type="checkbox"
                                id={`family-${family}`}
                                checked={selectedFamilies.includes(family)}
                                onChange={() => {
                                  if (selectedFamilies.includes(family)) {
                                    setSelectedFamilies(selectedFamilies.filter((id) => id !== family));
                                  } else {
                                    setSelectedFamilies([...selectedFamilies, family]);
                                  }
                                }}
                              />
                              <label htmlFor={`family-${family}`}>{family}</label>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="price-request-section-title">Groupes</div>
                  <input
                    type="text"
                    placeholder="Rechercher une famille de produit"
                    className="price-request-search"
                    value={familySearchTerm}
                    onChange={(e) => setFamilySearchTerm(e.target.value)}
                  />
                  <div className="price-request-checkbox-group">
                    {families
                      .filter((f) => !familySearchTerm || f.toLowerCase().includes(familySearchTerm.toLowerCase()))
                      .map((family) => (
                        <div key={family} className="price-request-checkbox-item">
                          <input
                            type="checkbox"
                            id={`family-prod-${family}`}
                            checked={selectedFamilies.includes(family)}
                            onChange={() => {
                              if (selectedFamilies.includes(family)) {
                                setSelectedFamilies(selectedFamilies.filter((id) => id !== family));
                              } else {
                                setSelectedFamilies([...selectedFamilies, family]);
                              }
                            }}
                          />
                          <label htmlFor={`family-prod-${family}`}>{family}</label>
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
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
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
                  {filteredProducts.map((product) => {
                    const mappedProduct: Product = {
                      id: String(product.id),
                      name: product.name,
                      reference: product.supplier_reference || '',
                      familyId: product.famille_name || '',
                      supplierId: String(product.library_id || ''),
                      description: product.description || '',
                      unit: product.unit || '',
                      imageUrl: product.image || ''
                    };

                    return (
                      <ProductCard
                        key={product.id}
                        product={mappedProduct}
                        onAdd={handleAddToCart}
                        onViewDetails={setSelectedProductDetail}
                      />
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6c757d', fontSize: '14px' }}>
                      {mode === 'by_supplier' && !selectedSupplier
                        ? 'Produits Solutravo et fournisseurs disponibles ci-dessous'
                        : 'Aucun produit trouvé'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <aside className={`price-request-panel price-request-panel-right ${isRightPanelOpen ? 'open' : ''}`}>
            <div className="price-request-panel-header">
              <h3 className="price-request-panel-title">Produit(s) sélectionné(s) ({cartItems.length})</h3>
            </div>

            <div className="price-request-right-scrollable" ref={cartScrollRef}>
              {cartItems.length === 0 ? (
                <div className="price-request-cart-empty">Aucun produit sélectionné</div>
              ) : (
                <div className="price-request-cart-items-list">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.product.id}
                      item={item}
                      totalItems={cartItems.length}
                      isExpanded={expandedItemId === item.product.id}
                      onToggle={() => setExpandedItemId(expandedItemId === item.product.id ? null : item.product.id)}
                      onUpdateQuantity={handleUpdateQuantity}
                      onUpdateNote={handleUpdateNote}
                      onUpdateReference={handleUpdateReference}
                      onRemove={handleRemoveFromCart}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="price-request-right-fixed">
              <div className="price-request-form-group">
                <label className="price-request-form-label">Urgence</label>
                <div className="price-request-urgency-options">
                  <label className={`price-request-urgency-option ${urgency === 'normal' ? ' active' : ''}`}>
                    <input type="radio" name="urgence" checked={urgency === 'normal'} onChange={() => setUrgency('normal')} />
                    <span>Normal</span>
                  </label>
                  <label className={`price-request-urgency-option ${urgency === 'urgent' ? ' active' : ''}`}>
                    <input type="radio" name="urgence" checked={urgency === 'urgent'} onChange={() => setUrgency('urgent')} />
                    <span>Urgent</span>
                  </label>
                  <label className={`price-request-urgency-option ${urgency === 'tres_urgent' ? ' active' : ''}`}>
                    <input type="radio" name="urgence" checked={urgency === 'tres_urgent'} onChange={() => setUrgency('tres_urgent')} />
                    <span>Très urgent</span>
                  </label>
                </div>
              </div>

              <div className="price-request-form-group">
                <label className="price-request-form-label">Détails généraux</label>
                <textarea value={generalNote} onChange={(e) => setGeneralNote(e.target.value)} className="price-request-form-textarea" placeholder="Informations générales pour les fournisseurs..." />
              </div>

              <div className="price-request-form-group">
                <label className="price-request-form-label">Adresse de livraison</label>
                <div className="price-request-delivery-options">
                  <div className="price-request-delivery-option">
                    <input type="radio" id="delivery-hq" name="delivery" checked={deliveryType === 'headquarters'} onChange={() => setDeliveryType('headquarters')} />
                    <label htmlFor="delivery-hq">A mon siège</label>
                  </div>
                  <div className="price-request-delivery-option">
                    <input type="radio" id="delivery-new" name="delivery" checked={deliveryType === 'new'} onChange={() => setDeliveryType('new')} />
                    <label htmlFor="delivery-new">Nouvelle adresse</label>
                  </div>
                </div>
                {deliveryType === 'new' && (
                  <div className="price-request-new-address">
                    <textarea value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="price-request-form-textarea" placeholder="Adresse complète de livraison..." />
                    <div className="price-request-save-address">
                      <input type="checkbox" id="save-address" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                      <label htmlFor="save-address">Enregistrer cette adresse</label>
                    </div>
                  </div>
                )}

                {mode === 'by_product' && (
                  <>
                    <div className="price-request-form-group">
                      <label className="price-request-form-label">Mes fournisseurs de matériaux</label>
                      <SupplierSelect suppliers={suppliers} selectedIds={selectedSuppliers} onSelectionChange={setSelectedSuppliers} onSelectAll={handleSelectAllSuppliers} />
                    </div>

                    <div className="price-request-form-group">
                      <label className="price-request-form-label">Envoyer par mail</label>
                      <p style={{ fontSize: '12px', color: '#6c757d', margin: '0 0 8px 0' }}>Ajoutez le mail de votre contact</p>
                      <div className="price-request-email-input">
                        <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="price-request-form-input" placeholder="email@example.com" onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()} />
                        <button onClick={handleAddEmail} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Ajouter</button>
                      </div>
                      {manualEmails.length > 0 && (
                        <div className="price-request-file-list">
                          {manualEmails.map((email) => (
                            <div key={email} className="price-request-file-item">
                              <span>{email}</span>
                              <button onClick={() => handleRemoveEmail(email)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}>
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
                  title={submitDisabledReason}
                  onClick={handleSubmit}
                >
                  Envoyer ma demande de prix
                </button>
              </div>
            </div>
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

      {loadingHistoryDetail && (
        <div className="price-request-modal-overlay">
          <div className="price-request-modal">
            <div style={{padding: 32, textAlign: 'center'}}>Chargement du détail...</div>
          </div>
        </div>
      )}

     

      {selectedHistoryRequest && !loadingHistoryDetail && (
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
        {/* RÉFÉRENCE */}
        <div className="price-request-modal-info">
          <div className="price-request-modal-label">Référence</div>
          <p className="price-request-modal-value">{selectedHistoryRequest.reference}</p>
        </div>

        {/* DATE */}
        <div className="price-request-modal-info">
          <div className="price-request-modal-label">Date</div>
          <p className="price-request-modal-value">
            {(() => {
              const dateObj = new Date(selectedHistoryRequest.date_creation);
              return `${dateObj.toLocaleDateString('fr-FR')} à ${dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
            })()}
          </p>
        </div>

        <div className="price-request-modal-divider"></div>

        {/* STATUT */}
        <div className="price-request-modal-info">
          <div className="price-request-modal-label">Statut</div>
          <span className={`price-request-modal-status-badge ${selectedHistoryRequest.statut}`}>
            {selectedHistoryRequest.statut}
          </span>
        </div>

        {/* URGENCE */}
        <div className="price-request-modal-info">
          <div className="price-request-modal-label">Urgence</div>
          <span className={`price-request-modal-urgency-badge ${
            selectedHistoryRequest.urgence === 'urgent' ? 'urgent' : 
            selectedHistoryRequest.urgence === 'tres_urgent' ? 'tres-urgent' : 
            'normal'
          }`}>
            {selectedHistoryRequest.urgence === 'urgent' ? 'Urgent' : 
             selectedHistoryRequest.urgence === 'tres_urgent' ? 'Très urgent' : 
             'Normal'}
          </span>
        </div>

        <div className="price-request-modal-divider"></div>

        {/* ADRESSE DE LIVRAISON */}
        <div className="price-request-modal-info">
          <div className="price-request-modal-label">Adresse de livraison</div>
          <p className="price-request-modal-value">
            {selectedHistoryRequest.adresse_livraison || 
             (selectedHistoryRequest.adresse_livraison_type === 'siege' ? 'Siège social' : 'Non spécifiée')}
          </p>
        </div>

        <div className="price-request-modal-divider"></div>

        {/* PRODUITS */}
        {selectedHistoryRequest.lignes && selectedHistoryRequest.lignes.length > 0 && (
          <div className="price-request-modal-info">
            <div className="price-request-modal-label">
              Produits ({selectedHistoryRequest.lignes.length})
            </div>
            <div className="price-request-modal-products">
              {selectedHistoryRequest.lignes.map((ligne) => (
                <div key={ligne.id} className="price-request-modal-product-item">
                  {/* Nom du produit */}
                  <div className="price-request-modal-product-info">
                    <h4 className="price-request-modal-product-name">
                      {ligne.product_name}
                    </h4>
                    <span className="price-request-modal-product-reference">
                      Réf: {ligne.supplier_reference || 'N/A'}
                    </span>
                  </div>

                  {/* Détails produit */}
                  <div className="price-request-modal-product-details">
                    <div className="price-request-modal-product-detail">
                      <span className="price-request-modal-product-detail-label">Quantité</span>
                      <span className="price-request-modal-product-detail-value">
                        {ligne.quantite} {ligne.unit || ''}
                      </span>
                    </div>
                    
                    {ligne.public_price && (
                      <div className="price-request-modal-product-detail">
                        <span className="price-request-modal-product-detail-label">Prix unitaire</span>
                        <span className="price-request-modal-product-detail-value">
                          {Number(ligne.public_price).toFixed(2)} €
                        </span>
                      </div>
                    )}
                    
                    {ligne.public_price && (
                      <div className="price-request-modal-product-detail">
                        <span className="price-request-modal-product-detail-label">Total</span>
                        <span className="price-request-modal-product-detail-value">
                          {(Number(ligne.public_price) * ligne.quantite).toFixed(2)} €
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Note produit */}
                  {ligne.note_ligne && (
                    <div className="price-request-modal-product-note">
                      <strong>Note :</strong> {ligne.note_ligne}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="price-request-modal-divider"></div>

        {/* FOURNISSEURS */}
        {selectedHistoryRequest.destinataires && selectedHistoryRequest.destinataires.length > 0 && (
          <div className="price-request-modal-info">
            <div className="price-request-modal-label">
              Fournisseurs ({selectedHistoryRequest.destinataires.length})
            </div>
            <div className="price-request-modal-suppliers">
              {selectedHistoryRequest.destinataires.map((dest) => (
                <div key={dest.id} className="price-request-modal-supplier-item">
                  <span className="price-request-modal-supplier-name">
                    {dest.library_name || dest.nom_manuel || 'Fournisseur'}
                  </span>
                  {(dest.library_email || dest.email_manuel) && (
                    <span className="price-request-modal-supplier-email">
                      {dest.library_email || dest.email_manuel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTE GÉNÉRALE */}
        {selectedHistoryRequest.note_generale && (
          <>
            <div className="price-request-modal-divider"></div>
            <div className="price-request-modal-info">
              <div className="price-request-modal-label">Note générale</div>
              <p className="price-request-modal-value">{selectedHistoryRequest.note_generale}</p>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};
