// // export interface Supplier {
// //   id: string;
// //   name: string;
// //   email: string;
// //   address: string;
// //   logo?: string;
// // }

// // export interface ProductFamily {
// //   id: string;
// //   name: string;
// // }

// // export interface Product {
// //   id: string;
// //   name: string;
// //   reference: string;
// //   familyId: string;
// //   supplierId: string;
// //   description: string;
// //   unit: string;
// //   imageUrl?: string;
// // }

// // export interface PriceRequestItem {
// //   product: Product;
// //   quantity: number;
// //   note: string;
// //   reference?: string;
// //   generalNote?: string;
// //   urgency?: 'normal' | 'urgent' | 'very_urgent';
// // }

// // export interface PriceRequests {
// //   id: string;
// //   reference: string;
// //   type: 'by_supplier' | 'by_product';
// //   items: PriceRequestItem[];
// //   generalNote: string;
// //   urgency: 'normal' | 'urgent' | 'very_urgent';
// //   deliveryAddress: string;
// //   attachments: string[];
// //   suppliers: Supplier[];
// //   createdAt: Date;
// //   status: 'sent' | 'draft';
// // }

// // export const mockSuppliers: Supplier[] = [
// //   {
// //     id: 'sup1',
// //     name: 'DAZE',
// //     email: 'contact@daze.fr',
// //     address: '15 Rue de la République, 75001 Paris',
// //   },
// //   {
// //     id: 'sup2',
// //     name: 'Point P',
// //     email: 'contact@pointp.fr',
// //     address: '28 Avenue des Champs, 75008 Paris',
// //   },
// //   {
// //     id: 'sup3',
// //     name: 'Leroy Merlin',
// //     email: 'pro@leroymerlin.fr',
// //     address: '45 Boulevard Haussmann, 75009 Paris',
// //   },
// //   {
// //     id: 'sup4',
// //     name: 'Cedeo',
// //     email: 'info@cedeo.fr',
// //     address: '12 Rue Victor Hugo, 75002 Paris',
// //   },
// // ];

// // export const mockProductFamilies: ProductFamily[] = [
// //   { id: 'fam1', name: 'Radiateur' },
// //   { id: 'fam2', name: 'Chauffage' },
// //   { id: 'fam3', name: 'Isolation' },
// //   { id: 'fam4', name: 'Borne' },
// //   { id: 'fam5', name: 'Portail' },
// //   { id: 'fam6', name: 'Pompe à chaleur' },
// //   { id: 'fam7', name: 'Climatisation' },
// // ];

// // export const mockProducts: Product[] = [
// //   {
// //     id: 'prod1',
// //     name: 'Radiateur 1',
// //     reference: 'RAD-001',
// //     familyId: 'fam1',
// //     supplierId: 'sup1',
// //     description: 'Radiateur en acier avec finition blanc brillant. Puissance: 1500W. Dimensions: 60x80cm.',
// //     unit: 'Unité',
// //   },
// //   {
// //     id: 'prod2',
// //     name: 'Radiateur 2',
// //     reference: 'RAD-002',
// //     familyId: 'fam1',
// //     supplierId: 'sup1',
// //     description: 'Radiateur design vertical en aluminium. Puissance: 2000W. Dimensions: 40x180cm.',
// //     unit: 'Unité',
// //   },
// //   {
// //     id: 'prod3',
// //     name: 'Radiateur 3',
// //     reference: 'RAD-003',
// //     familyId: 'fam1',
// //     supplierId: 'sup1',
// //     description: 'Radiateur économique basse température. Puissance: 1200W. Dimensions: 50x70cm.',
// //     unit: 'Unité',
// //   },
// //   {
// //     id: 'prod4',
// //     name: 'Radiateur électrique Premium',
// //     reference: 'RAD-PRE-001',
// //     familyId: 'fam1',
// //     supplierId: 'sup2',
// //     description: 'Radiateur électrique haut de gamme avec thermostat intelligent. Puissance: 1800W.',
// //     unit: 'Unité',
// //   },
// //   {
// //     id: 'prod5',
// //     name: 'Pompe à chaleur Air/Eau',
// //     reference: 'PAC-AE-100',
// //     familyId: 'fam6',
// //     supplierId: 'sup2',
// //     description: 'Pompe à chaleur air/eau haute performance, COP 4.2, puissance 12kW.',
// //     unit: 'Unité',
// //   },
// //   {
// //     id: 'prod6',
// //     name: 'Isolation thermique 100mm',
// //     reference: 'ISO-TH-100',
// //     familyId: 'fam3',
// //     supplierId: 'sup3',
// //     description: 'Panneau isolation thermique laine de roche, épaisseur 100mm, R=3.0.',
// //     unit: 'm²',
// //   },
// //   {
// //     id: 'prod7',
// //     name: 'Climatiseur réversible',
// //     reference: 'CLIM-REV-350',
// //     familyId: 'fam7',
// //     supplierId: 'sup3',
// //     description: 'Climatiseur réversible split 3500W, classe énergétique A+++.',
// //     unit: 'Unité',
// //   },
// //   {
// //     id: 'prod8',
// //     name: 'Borne de recharge véhicule électrique',
// //     reference: 'BORNE-VE-22',
// //     familyId: 'fam4',
// //     supplierId: 'sup4',
// //     description: 'Borne de recharge 22kW avec câble Type 2, compatible tous véhicules électriques.',
// //     unit: 'Unité',
// //   },
// //   {
// //     id: 'prod9',
// //     name: 'Portail coulissant aluminium',
// //     reference: 'PORT-ALU-400',
// //     familyId: 'fam5',
// //     supplierId: 'sup4',
// //     description: 'Portail coulissant en aluminium motorisé, largeur 4m, coloris au choix.',
// //     unit: 'Unité',
// //   },
// //   {
// //     id: 'prod10',
// //     name: 'Chaudière gaz condensation',
// //     reference: 'CHAUD-GAZ-24',
// //     familyId: 'fam2',
// //     supplierId: 'sup2',
// //     description: 'Chaudière murale gaz à condensation 24kW, rendement 109%.',
// //     unit: 'Unité',
// //   },
// // ];

// // export const mockPriceRequests: PriceRequests[] = [
// //   {
// //     id: 'req1',
// //     reference: 'DDP-2026-001',
// //     type: 'by_supplier',
// //     items: [
// //       {
// //         product: mockProducts[0],
// //         quantity: 5,
// //         note: 'Coloris blanc uniquement',
// //       },
// //       {
// //         product: mockProducts[1],
// //         quantity: 2,
// //         note: '',
// //       },
// //     ],
// //     generalNote: 'Chantier urgent prévu mi-février',
// //     urgency: 'urgent',
// //     deliveryAddress: 'A mon siège',
// //     attachments: ['plan_installation.pdf', 'specifications.pdf'],
// //     suppliers: [mockSuppliers[0]],
// //     createdAt: new Date('2026-01-20T14:30:00'),
// //     status: 'sent',
// //   },
// //   {
// //     id: 'req2',
// //     reference: 'DDP-2026-002',
// //     type: 'by_product',
// //     items: [
// //       {
// //         product: mockProducts[4],
// //         quantity: 1,
// //         note: 'Installation prévue en mars',
// //       },
// //     ],
// //     generalNote: 'Besoin de devis détaillé avec installation',
// //     urgency: 'normal',
// //     deliveryAddress: '15 Avenue de la Construction, 69000 Lyon',
// //     attachments: ['cahier_charges.pdf'],
// //     suppliers: [mockSuppliers[1], mockSuppliers[2]],
// //     createdAt: new Date('2026-01-18T10:15:00'),
// //     status: 'sent',
// //   },
// //   {
// //     id: 'req3',
// //     reference: 'DDP-2026-003',
// //     type: 'by_supplier',
// //     items: [
// //       {
// //         product: mockProducts[5],
// //         quantity: 50,
// //         note: 'Livraison échelonnée possible',
// //       },
// //     ],
// //     generalNote: '',
// //     urgency: 'very_urgent',
// //     deliveryAddress: 'A mon siège',
// //     attachments: [],
// //     suppliers: [mockSuppliers[2]],
// //     createdAt: new Date('2026-01-15T16:45:00'),
// //     status: 'sent',
// //   },
// // ];

// // Types pour les demandes de prix
// export interface PriceRequestProduct {
//   id: string;
//   name: string;
//   reference: string;
//   familyId: string;
//   supplierId: string;
//   description: string;
//   unit: string;
//   imageUrl: string;
// }

// export interface PriceRequestItem {
//   product: PriceRequestProduct;
//   quantity: number;
//   note: string;
//   reference?: string;
// }

// export interface Supplier {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
// }

// // ✅ TYPE CORRIGÉ POUR LES DEMANDES DU BACKEND
// export interface PriceRequests {
//   // Champs de la table demandes_prix
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
//   date_creation: string;  // ISO date string
//   date_envoi?: string;
  
//   // Champs calculés (depuis les JOINs)
//   societe_name?: string;
//   societe_adresse?: string;
//   membre_prenom?: string;
//   membre_nom?: string;
//   nb_lignes?: number;
//   nb_destinataires?: number;
  
//   // Relations (chargées dynamiquement)
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

// // Type pour l'historique (alias pour compatibilité)
// export type PriceRequest = PriceRequests;

// // Type Product (déjà existant, on garde)
// export interface Product {
//   id: string;
//   name: string;
//   reference: string;
//   familyId: string;
//   supplierId: string;
//   description: string;
//   unit: string;
//   imageUrl: string;
// }

// // Mock data (optionnel, pour les tests)
// export const mockPriceRequests: PriceRequests[] = [];


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
export interface PriceRequests {
  id: number;
  reference: string;
  type_demande: 'par_fournisseur' | 'par_produit';
  statut: 'brouillon' | 'envoyee' | 'validee' | 'annulee';
  note_generale?: string;
  urgence: 'normal' | 'urgent' | 'tres_urgent';
  adresse_livraison_type: 'siege' | 'nouvelle';
  adresse_livraison?: string;
  societe_id: number;
  membre_id: number;
  date_creation: string;
  date_envoi?: string;
  
  societe_name?: string;
  societe_adresse?: string;
  membre_prenom?: string;
  membre_nom?: string;
  nb_lignes?: number;
  nb_destinataires?: number;
  
  lignes?: Array<{
    id: number;
    demande_prix_id: number;
    product_id: number;
    product_name: string;
    supplier_reference?: string;
    quantite: number;
    note_ligne?: string;
    public_price?: number;
    unit?: string;
    ordre: number;
  }>;
  
  destinataires?: Array<{
    id: number;
    demande_prix_id: number;
    library_id?: number;
    library_name?: string;
    library_email?: string;
    email_manuel?: string;
    nom_manuel?: string;
    date_envoi?: string;
  }>;
  
  pieces_jointes?: Array<{
    id: number;
    demande_prix_id: number;
    nom_fichier: string;
    chemin_fichier: string;
    type_fichier: string;
    date_upload: string;
  }>;
}

export type PriceRequest = PriceRequests;

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

// ✅ PAS DE MOCK DATA
export const mockPriceRequests: PriceRequests[] = [];
export const mockSuppliers: Supplier[] = [];
export const mockProducts: Product[] = [];
