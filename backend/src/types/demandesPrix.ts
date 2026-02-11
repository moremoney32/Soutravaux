import { RowDataPacket } from 'mysql2';

// ============================================
// Types de base
// ============================================

export type TypeDemande = 'par_fournisseur' | 'par_produit';
export type UrgenceDemande = 'normal' | 'urgent' | 'tres_urgent';
export type StatutDemande = 'envoyee' | 'archivee';
export type AdresseLivraisonType = 'retrait_point_vente' | 'siege' | 'nouvelle_adresse';
export type StatutDestinataire = 'envoyee' | 'traitee' | 'acceptee' | 'trop_cher' | 'aucun_retour';
export type StatutEnvoiEmail = 'en_attente' | 'envoye' | 'erreur';
export type ProductSource = 'library' | 'catalogue';

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
  adresse_livraison_sauvegardee?: boolean;
  date_limite_retour?: string;
  societe_id: number;
  membre_id: number;
  statut: StatutDemande;
  library_id?: number;
  date_creation: Date;
  date_modification?: Date;

  // Jointures
  societe_name?: string;
  societe_adresse?: string;
  societe_email?: string;
  societe_telephone?: string;
  membre_prenom?: string;
  membre_nom?: string;
  membre_email?: string;
  nb_lignes?: number;
  nb_destinataires?: number;

  // Relations chargées
  lignes?: DemandePrixLigne[];
  destinataires?: DemandePrixDestinataire[];
  pieces_jointes?: DemandePrixPieceJointe[];
  relances?: DemandePrixRelance[];
}

export interface DemandePrixLigne {
  id: number;
  demande_prix_id: number;
  product_source: ProductSource;
  product_id: number;
  product_nom: string;
  product_description?: string;
  product_unite?: string;
  product_marque?: string;
  product_image?: string;
  quantite: number;
  note_ligne?: string;
  ordre: number;
  date_creation?: Date;
}

export interface DemandePrixDestinataire {
  id: number;
  demande_prix_id: number;
  fournisseur_id?: number;
  library_id?: number;
  email_manuel?: string;
  nom_manuel?: string;
  email_envoye_a: string;
  nom_affiche?: string;
  statut: StatutDestinataire;
  statut_envoi_email: StatutEnvoiEmail;
  date_envoi_email?: Date;
  erreur_envoi?: string;
  date_creation?: Date;
  date_modification?: Date;
}

export interface DemandePrixPieceJointe {
  id: number;
  demande_prix_id: number;
  filename_original: string;
  filename_stocke: string;
  filepath: string;
  filesize?: number;
  mimetype?: string;
  date_upload: Date;
}

export interface DemandePrixRelance {
  id: number;
  demande_prix_id: number;
  type_relance: 'x_jours_avant' | '1_jour_avant';
  jours_avant?: number;
  date_relance_prevue: string;
  statut: 'en_attente' | 'envoye' | 'erreur';
  date_envoi?: Date;
  erreur?: string;
  date_creation?: Date;
}

// ============================================
// Types pour les requêtes (Input)
// ============================================

// export interface CreateDemandePrixInput {
//   reference: string;
//   type_demande: TypeDemande;
//   note_generale?: string;
//   urgence?: UrgenceDemande;
//   adresse_livraison_type?: AdresseLivraisonType;
//   adresse_livraison?: string;
//   adresse_livraison_sauvegardee?: boolean;
//   date_limite_retour?: string;
//   societe_id: number;
//   membre_id: number;
//   library_id?: number;
//   lignes: CreateLigneInput[];
//   destinataires: CreateDestinataireInput[];
//   relances?: CreateRelanceInput[];
// }

export interface CreateDemandePrixInput {
  reference: string;
  type_demande: 'par_fournisseur' | 'par_produit';
  societe_id: number;
  membre_id: number;
  urgence?: 'normal' | 'urgent' | 'tres_urgent';
  note_generale?: string;
  adresse_livraison_type: 'siege' | 'retrait' | 'nouvelle';  // ← 3 valeurs
  adresse_livraison?: string;
  sauvegarder_adresse?: boolean;                               // ← était 'adresse_livraison_sauvegardee'
  date_limite_retour?: string;
  library_id?: number;
  relances?: CreateRelanceInput[];
  lignes: CreateLigneInput[];
  destinataires: CreateDestinataireInput[];
}

export interface CreateLigneInput {
  product_source: ProductSource;
  product_id: number;
  product_nom: string;
  product_description?: string;
  product_unite?: string;
  product_marque?: string;
  product_image?: string;
  quantite: number;
  note_ligne?: string;
  ordre?: number;
}

export interface CreateLigneInput {
  product_source: 'library' | 'catalogue';
  product_id: number;
  product_nom: string;
  product_description?: string;
  product_unite?: string;
  product_marque?: string;
  product_image?: string;
  quantite: number;
  note_ligne?: string;
  ordre?: number;
}

// export interface CreateDestinataireInput {
//   fournisseur_id?: number;
//   library_id?: number;
//   email_manuel?: string;
//   nom_manuel?: string;
//   email_envoye_a: string;
//   nom_affiche?: string;
// }
export interface CreateDestinataireInput {
  fournisseur_id?: number;
  library_id?: number;
  email_manuel?: string;
  nom_manuel?: string;
  // Ces champs NE sont PAS envoyés par le frontend, le service les calcule :
  email_envoye_a?: string;
  nom_affiche?: string;
}

// export interface CreateRelanceInput {
//   type_relance: 'x_jours_avant' | '1_jour_avant';
//   jours_avant?: number;
//   date_relance_prevue: string;
// }
export interface CreateRelanceInput {
  type: 'x_jours_avant' | '1_jour_avant';   // ← était 'type_relance'
  nb_jours?: number;                          // ← était 'jours_avant'
  // date_relance_prevue est calculée côté service, pas envoyée par le frontend
}

// ============================================
// Types MySQL (RowDataPacket)
// ============================================

export interface DemandePrixRow extends RowDataPacket, DemandePrix {}
export interface DemandePrixLigneRow extends RowDataPacket, DemandePrixLigne {}
export interface DemandePrixDestinataireRow extends RowDataPacket, DemandePrixDestinataire {}

// ============================================
// Filtres
// ============================================

export interface GetDemandesFilters {
  societe_id: number;
  statut?: StatutDemande;
  type_demande?: TypeDemande;
  search?: string;
  date_debut?: string;
  date_fin?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// Type PDF
// ============================================

export interface DemandePrixPDFData {
  demande: DemandePrix;
  lignes: Array<{
    quantite: number;
    note_ligne?: string;
    product_nom: string;
    product_description?: string;
    product_unite?: string;
    product_marque?: string;
  }>;
  societe: {
    name: string;
    adresse?: string;
    email?: string;
    telephone?: string;
    logo?: string;
  };
  membre: {
    prenom: string;
    nom: string;
    email: string;
  };
  pieces_jointes?: DemandePrixPieceJointe[];
}