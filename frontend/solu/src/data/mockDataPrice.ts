
// Types pour les demandes de prix
export interface PriceRequestProduct {
  id: string;
  name: string;
  reference: string;
  familyId: string;
  supplierId: string;
  description: string;
  unit: string;
  imageUrl: string;
}

export interface PriceRequestItem {
  product: PriceRequestProduct;
  quantity: number;
  note: string;
  reference?: string;
}

// ✅ INTERFACE SUPPLIER CORRIGÉE
export interface Supplier {
  id: string;
  name: string;
  image?: string;
  // Pas d'email car libraries n'a pas d'email direct
}

// ✅ TYPE CORRIGÉ POUR LES DEMANDES DU BACKEND
// export interface PriceRequests {
//   id: number;
//   reference: string;
//   type_demande: 'par_fournisseur' | 'par_produit';
//   statut: 'brouillon' | 'envoyee' | 'validee' | 'annulee';
//   note_generale?: string;
//   urgence: 'normal' | 'urgent' | 'tres_urgent';
//   adresse_livraison_type: 'siege' | 'nouvelle';
//   adresse_livraison?: string;
//   societe_id: number;
//   membre_id: number;
//   date_creation: string;
//   date_envoi?: string;
  
//   societe_name?: string;
//   societe_adresse?: string;
//   membre_prenom?: string;
//   membre_nom?: string;
//   nb_lignes?: number;
//   nb_destinataires?: number;
  
//   lignes?: Array<{
//     id: number;
//     demande_prix_id: number;
//     product_id: number;
//     product_name: string;
//     supplier_reference?: string;
//     quantite: number;
//     note_ligne?: string;
//     public_price?: number;
//     unit?: string;
//     ordre: number;
//   }>;
  
//   destinataires?: Array<{
//     id: number;
//     demande_prix_id: number;
//     library_id?: number;
//     library_name?: string;
//     library_email?: string;
//     email_manuel?: string;
//     nom_manuel?: string;
//     date_envoi?: string;
//   }>;
  
//   pieces_jointes?: Array<{
//     id: number;
//     demande_prix_id: number;
//     nom_fichier: string;
//     chemin_fichier: string;
//     type_fichier: string;
//     date_upload: string;
//   }>;
// }

// export type PriceRequest = PriceRequests;

export interface Product {
  id: string;
  name: string;
  reference: string;
  familyId: string;
  supplierId: string;
  description: string;
  unit: string;
  imageUrl: string;
}


// // ── Ligne dans l'historique ──────────────────────────────────
export interface DemandeLigne {
  id: number;
  product_name: string;
  product_nom?: string;
  supplier_reference?: string;
  quantite: number;
  unit?: string;
  note_ligne?: string;
}

// ── Destinataire dans l'historique ──────────────────────────
export interface DemandeDestinataire {
  id: number;
  fournisseur_id?: number;
  library_id?: number;
  email_manuel?: string;
  email_envoye_a?: string;
  nom_affiche?: string;
  nom_manuel?: string;
  library_name?: string;
  fournisseur_nom?: string;
  statut?: 'envoyee' | 'traitee' | 'acceptee' | 'trop_cher' | 'aucun_retour';
}

// ── Demande de prix (historique) ─────────────────────────────
export interface PriceRequests {
  id: number;
  reference: string;
  type_demande: 'par_fournisseur' | 'par_produit';
  societe_id: number;
  membre_id: number;
  urgence: 'normal' | 'urgent' | 'tres_urgent';
  note_generale?: string;
  // ✅ CORRIGÉ : 'archivee' ajouté
  statut: 'envoyee' | 'archivee';
  // ✅ CORRIGÉ : 'retrait' et 'nouvelle' ajoutés
  adresse_livraison_type: 'siege' | 'retrait' | 'nouvelle';
  adresse_livraison?: string;
  date_limite_retour?: string;
  date_creation: string;
  nb_lignes?: number;
  nb_destinataires?: number;
  // Relations chargées dans le détail
  lignes?: DemandeLigne[];
  destinataires?: DemandeDestinataire[];
  relances?: any[];
  pieces_jointes?: any[];
}


































































// ✅ PAS DE MOCK DATA
export const mockPriceRequests: PriceRequests[] = [];
export const mockSuppliers: Supplier[] = [];
export const mockProducts: Product[] = [];
