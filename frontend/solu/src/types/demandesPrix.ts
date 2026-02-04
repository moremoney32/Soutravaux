export interface PriceRequests {
  id: number;
  reference: string;
  type_demande: string;
  statut: string;
  urgence: string;
  note_generale?: string;
  adresse_livraison_type: string;
  adresse_livraison?: string;
  date_creation: string | Date;
  createdAt?: string | Date;  // Alias pour compatibilité
  created_at?: string | Date;  // Alias pour compatibilité
  
  // ✅ AJOUTER ces champs
  nb_lignes?: number;
  nb_destinataires?: number;
  lignes?: Array<{
    id: number;
    product_id: number;
    product_name: string;
    supplier_reference?: string;
    quantite: number;
    note_ligne?: string;
    public_price?: number;
  }>;
  destinataires?: Array<{
    id: number;
    library_id?: number;
    library_name?: string;
    library_email?: string;
    email_manuel?: string;
    nom_manuel?: string;
  }>;
  
  // Anciens champs pour compatibilité
  items?: Array<any>;
  suppliers?: Array<any>;
  deliveryAddress?: string;
  generalNote?: string;
  status?: string;
  attachments?: string[];
}