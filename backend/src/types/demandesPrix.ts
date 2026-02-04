import { RowDataPacket } from 'mysql2';

// ============================================
// Types de base
// ============================================

export type TypeDemande = 'par_fournisseur' | 'par_produit';
export type UrgenceDemande = 'normal' | 'urgent' | 'tres_urgent';
export type StatutDemande = 'brouillon' | 'envoyee' | 'annulee';
export type AdresseLivraisonType = 'siege' | 'nouvelle';
export type TypeDestinataire = 'library' | 'email_manuel';
export type StatutLecture = 'non_lu' | 'lu';

// ============================================
// Interfaces principales
// ============================================

export interface DemandePrix {
  id: number;
  reference: string;
  type_demande: TypeDemande;
  note_generale?: string;
  urgence: UrgenceDemande;
  adresse_livraison_type: AdresseLivraisonType;
  adresse_livraison?: string;
  societe_id: number;
  membre_id: number;
  statut: StatutDemande;
  date_creation: Date;
  date_envoi?: Date;
  created_at?: Date;
  updated_at?: Date;
  
  // Relations (optionnelles, chargées à la demande)
  lignes?: DemandePrixLigne[];
  destinataires?: DemandePrixDestinataire[];
  pieces_jointes?: DemandePrixPieceJointe[];
  societe?: {
    id: number;
    name: string;
    adresse?: string;
  };
  membre?: {
    id: number;
    prenom: string;
    nom: string;
    email: string;
  };
}

export interface DemandePrixLigne {
  id: number;
  demande_prix_id: number;
  product_id: number;
  quantite: number;
  note_ligne?: string;
  ordre: number;
  created_at?: Date;
  updated_at?: Date;
  
  // Relations
  product?: {
    id: number;
    name: string;
    supplier_reference?: string;
    description?: string;
    image?: string;
    public_price: number;
    unit: string;
    library_id?: number;
    library_name?: string;
    famille_name?: string;
  };
}

export interface DemandePrixDestinataire {
  id: number;
  demande_prix_id: number;
  library_id?: number;
  email_manuel?: string;
  nom_manuel?: string;
  date_envoi?: Date;
  statut_lecture: StatutLecture;
  created_at?: Date;
  updated_at?: Date;
  
  // Relations
  library?: {
    id: number;
    name: string;
    email?: string;
    image?: string;
  };
}

export interface DemandePrixPieceJointe {
  id: number;
  demande_prix_id: number;
  nom_fichier: string;
  nom_fichier_original: string;
  chemin_fichier: string;
  type_fichier?: string;
  taille?: number;
  date_upload: Date;
  created_at?: Date;
  updated_at?: Date;
}

// ============================================
// Types pour les requêtes (Input)
// ============================================

export interface CreateDemandePrixInput {
  reference: string;
  type_demande: TypeDemande;
  note_generale?: string;
  urgence?: UrgenceDemande;
  adresse_livraison_type?: AdresseLivraisonType;
  adresse_livraison?: string;
  societe_id: number;
  membre_id: number;
  lignes: CreateLigneInput[];
  destinataires: CreateDestinataireInput[];
}

export interface CreateLigneInput {
  product_id: number;
  quantite: number;
  note_ligne?: string;
  ordre?: number;
}

export interface CreateDestinataireInput {
  library_id?: number;
  email_manuel?: string;
  nom_manuel?: string;
}

// ============================================
// Types pour MySQL (avec RowDataPacket)
// ============================================

export interface DemandePrixRow extends RowDataPacket {
  id: number;
  reference: string;
  type_demande: TypeDemande;
  note_generale?: string;
  urgence: UrgenceDemande;
  adresse_livraison_type: AdresseLivraisonType;
  adresse_livraison?: string;
  societe_id: number;
  membre_id: number;
  statut: StatutDemande;
  date_creation: Date;
  date_envoi?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface DemandePrixLigneRow extends RowDataPacket {
  id: number;
  demande_prix_id: number;
  product_id: number;
  quantite: number;
  note_ligne?: string;
  ordre: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface DemandePrixDestinataireRow extends RowDataPacket {
  id: number;
  demande_prix_id: number;
  library_id?: number;
  email_manuel?: string;
  nom_manuel?: string;
  date_envoi?: Date;
  statut_lecture: StatutLecture;
  created_at?: Date;
  updated_at?: Date;
}

// ============================================
// Types pour les réponses API
// ============================================

export interface GetDemandesResponse {
  success: boolean;
  data: DemandePrix[];
  total?: number;
}

export interface GetDemandeByIdResponse {
  success: boolean;
  data: DemandePrix;
}

export interface CreateDemandeResponse {
  success: boolean;
  data: {
    id: number;
    reference: string;
  };
  message: string;
}

// ============================================
// Types pour les filtres/queries
// ============================================

export interface GetDemandesFilters {
  societe_id: number;
  statut?: StatutDemande;
  type_demande?: TypeDemande;
  date_debut?: string;
  date_fin?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// Type pour les données complètes du PDF
// ============================================

export interface DemandePrixPDFData {
  demande: DemandePrix;
  lignes: Array<{
    quantite: number;
    note_ligne?: string;
    product_name: string;
    supplier_reference?: string;
    description?: string;
    public_price: number;
    unit: string;
    library_name?: string;
  }>;
  societe: {
    name: string;
    adresse?: string;
    email?: string;
    telephone?: string;
  };
  membre: {
    prenom: string;
    nom: string;
    email: string;
  };
  destinataire?: {
    name: string;
    email?: string;
  };
}