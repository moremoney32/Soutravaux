import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import {
  DemandePrix,
  DemandePrixRow,
  DemandePrixLigne,
  DemandePrixLigneRow,
  DemandePrixDestinataire,
  DemandePrixDestinataireRow,
  CreateDemandePrixInput,
  GetDemandesFilters,
  DemandePrixPDFData
} from '../types/demandesPrix';

// ============================================
// 1. Récupérer toutes les demandes (avec filtres)
// ============================================

// export async function getDemandes(
//   filters: GetDemandesFilters
// ): Promise<DemandePrix[]> {
//   const conn = await pool.getConnection();

//   try {
//     // Construction dynamique de la requête WHERE
//     let whereConditions: string[] = ['dp.societe_id = ?'];
//     let params: any[] = [filters.societe_id];

//     if (filters.statut) {
//       whereConditions.push('dp.statut = ?');
//       params.push(filters.statut);
//     }

//     if (filters.type_demande) {
//       whereConditions.push('dp.type_demande = ?');
//       params.push(filters.type_demande);
//     }

//     if (filters.date_debut) {
//       whereConditions.push('dp.date_creation >= ?');
//       params.push(filters.date_debut);
//     }

//     if (filters.date_fin) {
//       whereConditions.push('dp.date_creation <= ?');
//       params.push(filters.date_fin);
//     }

//     const whereClause = whereConditions.join(' AND ');

//     // Pagination
//     const limit = filters.limit || 50;
//     const offset = filters.offset || 0;

//     const [rows] = await conn.query<DemandePrixRow[]>(
//       `SELECT 
//         dp.*,
//         s.nomsociete as societe_name,
//         m.prenom as membre_prenom,
//         m.nom as membre_nom,
//         COUNT(DISTINCT dpl.id) as nb_lignes,
//         COUNT(DISTINCT dpd.id) as nb_destinataires
//       FROM demandes_prix dp
//       LEFT JOIN societes s ON dp.societe_id = s.id
//       LEFT JOIN membres m ON dp.membre_id = m.id
//       LEFT JOIN demandes_prix_lignes dpl ON dp.id = dpl.demande_prix_id
//       LEFT JOIN demandes_prix_destinataires dpd ON dp.id = dpd.demande_prix_id
//       WHERE ${whereClause}
//       GROUP BY dp.id
//       ORDER BY dp.date_creation DESC
//       LIMIT ? OFFSET ?`,
//       [...params, limit, offset]
//     );

//     return rows as DemandePrix[];
//   } finally {
//     conn.release();
//   }
// }

export async function getDemandes(
  filters: GetDemandesFilters
): Promise<DemandePrix[]> {
  const conn = await pool.getConnection();

  try {
    let whereConditions: string[] = ['dp.societe_id = ?'];
    let params: any[] = [filters.societe_id];

    if (filters.statut) {
      whereConditions.push('dp.statut = ?');
      params.push(filters.statut);
    }
    if (filters.type_demande) {
      whereConditions.push('dp.type_demande = ?');
      params.push(filters.type_demande);
    }
    if (filters.date_debut) {
      whereConditions.push('dp.date_creation >= ?');
      params.push(filters.date_debut);
    }
    if (filters.date_fin) {
      whereConditions.push('dp.date_creation <= ?');
      params.push(filters.date_fin);
    }

    const whereClause = whereConditions.join(' AND ');
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    // ✅ Récupérer les demandes avec compteurs
    const [rows] = await conn.query<DemandePrixRow[]>(
      `SELECT 
        dp.*,
        s.nomsociete as societe_name,
        s.adresse as societe_adresse,
        m.prenom as membre_prenom,
        m.nom as membre_nom,
        COUNT(DISTINCT dpl.id) as nb_lignes,
        COUNT(DISTINCT dpd.id) as nb_destinataires
      FROM demandes_prix dp
      LEFT JOIN societes s ON dp.societe_id = s.id
      LEFT JOIN membres m ON dp.membre_id = m.id
      LEFT JOIN demandes_prix_lignes dpl ON dp.id = dpl.demande_prix_id
      LEFT JOIN demandes_prix_destinataires dpd ON dp.id = dpd.demande_prix_id
      WHERE ${whereClause}
      GROUP BY dp.id
      ORDER BY dp.date_creation DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // ✅ Pour chaque demande, récupérer les lignes et destinataires
    const demandesWithDetails = await Promise.all(
      rows.map(async (demande) => {
        // Récupérer les lignes
        const [lignesRows] = await conn.query<RowDataPacket[]>(
          `SELECT 
            dpl.*,
            p.name as product_name,
            p.supplier_reference,
            p.public_price
          FROM demandes_prix_lignes dpl
          JOIN products p ON dpl.product_id = p.id
          WHERE dpl.demande_prix_id = ?
          ORDER BY dpl.ordre ASC`,
          [demande.id]
        );

        // Récupérer les destinataires
        const [destinatairesRows] = await conn.query<RowDataPacket[]>(
          `SELECT 
            dpd.*,
            l.name as library_name,
            m.email as library_email
          FROM demandes_prix_destinataires dpd
          LEFT JOIN libraries l ON dpd.library_id = l.id
          LEFT JOIN membres m ON l.member_id = m.id
          WHERE dpd.demande_prix_id = ?`,
          [demande.id]
        );

        return {
          ...demande,
          lignes: lignesRows,
          destinataires: destinatairesRows
        };
      })
    );

    return demandesWithDetails as DemandePrix[];
  } finally {
    conn.release();
  }
}

// ============================================
// 2. Récupérer une demande par ID (complète)
// ============================================

// export async function getDemandeById(
//   id: number,
//   societeId: number
// ): Promise<DemandePrix | null> {
//   const conn = await pool.getConnection();

//   try {
//     // 1. Récupérer la demande principale
//     const [demandeRows] = await conn.query<DemandePrixRow[]>(
//       `SELECT 
//         dp.*,
//         s.nomsociete as societe_name,
//         s.adresse as societe_adresse,
//         m.prenom as membre_prenom,
//         m.nom as membre_nom,
//         m.email as membre_email
//       FROM demandes_prix dp
//       LEFT JOIN societes s ON dp.societe_id = s.id
//       LEFT JOIN membres m ON dp.membre_id = m.id
//       WHERE dp.id = ? AND dp.societe_id = ?`,
//       [id, societeId]
//     );

//     if (demandeRows.length === 0) {
//       return null;
//     }

//     const demande = demandeRows[0] as DemandePrix;

//     // 2. Récupérer les lignes de produits
//     const [lignesRows] = await conn.query<DemandePrixLigneRow[]>(
//       `SELECT 
//         dpl.*,
//         p.name as product_name,
//         p.supplier_reference,
//         p.description as product_description,
//         p.image as product_image,
//         p.public_price,
//         p.unit,
//         lc.name as famille_name,
//         l.id as library_id,
//         l.name as library_name
//       FROM demandes_prix_lignes dpl
//       JOIN products p ON dpl.product_id = p.id
//       LEFT JOIN library_categories lc ON p.category_id = lc.id
//       LEFT JOIN libraries l ON lc.library_id = l.id
//       WHERE dpl.demande_prix_id = ?
//       ORDER BY dpl.ordre ASC`,
//       [id]
//     );

//     demande.lignes = lignesRows as DemandePrixLigne[];

//     // 3. Récupérer les destinataires
//     const [destinatairesRows] = await conn.query<DemandePrixDestinataireRow[]>(
//       `SELECT 
//         dpd.*,
//         l.name as library_name,
//         l.email as library_email,
//         l.image as library_image
//       FROM demandes_prix_destinataires dpd
//       LEFT JOIN libraries l ON dpd.library_id = l.id
//       WHERE dpd.demande_prix_id = ?`,
//       [id]
//     );

//     demande.destinataires = destinatairesRows as DemandePrixDestinataire[];

//     // 4. Récupérer les pièces jointes
//     const [pjRows] = await conn.query<RowDataPacket[]>(
//       `SELECT * FROM demandes_prix_pieces_jointes 
//        WHERE demande_prix_id = ?
//        ORDER BY date_upload DESC`,
//       [id]
//     );

//     demande.pieces_jointes = pjRows as any[];

//     return demande;
//   } finally {
//     conn.release();
//   }
// }

export async function getDemandeById(
  id: number,
  societeId: number
): Promise<DemandePrix | null> {
  const conn = await pool.getConnection();

  try {
    // 1. Récupérer la demande principale
    const [demandeRows] = await conn.query<DemandePrixRow[]>(
      `SELECT 
        dp.*,
        s.nomsociete as societe_name,
        s.adresse as societe_adresse,
        s.email as societe_email,
        s.telephone as societe_telephone,
        m.prenom as membre_prenom,
        m.nom as membre_nom,
        m.email as membre_email
      FROM demandes_prix dp
      LEFT JOIN societes s ON dp.societe_id = s.id
      LEFT JOIN membres m ON dp.membre_id = m.id
      WHERE dp.id = ? AND dp.societe_id = ?`,
      [id, societeId]
    );

    if (demandeRows.length === 0) {
      return null;
    }

    const demande = demandeRows[0] as DemandePrix;

    // 2. Récupérer les lignes de produits
    const [lignesRows] = await conn.query<DemandePrixLigneRow[]>(
      `SELECT 
        dpl.*,
        p.name as product_name,
        p.supplier_reference,
        p.description as product_description,
        p.image as product_image,
        p.public_price,
        p.unit,
        lc.name as famille_name,
        l.id as library_id,
        l.name as library_name
      FROM demandes_prix_lignes dpl
      JOIN products p ON dpl.product_id = p.id
      LEFT JOIN library_categories lc ON p.category_id = lc.id
      LEFT JOIN libraries l ON lc.library_id = l.id
      WHERE dpl.demande_prix_id = ?
      ORDER BY dpl.ordre ASC`,
      [id]
    );

    demande.lignes = lignesRows as DemandePrixLigne[];

    // 3. Récupérer les destinataires
    // ✅ CORRECTION : Récupérer l'email via membres.email (pas libraries.email)
    const [destinatairesRows] = await conn.query<DemandePrixDestinataireRow[]>(
      `SELECT 
        dpd.*,
        l.name as library_name,
        l.image as library_image,
        m.email as library_email  -- ✅ Email depuis membres (pas libraries)
      FROM demandes_prix_destinataires dpd
      LEFT JOIN libraries l ON dpd.library_id = l.id
      LEFT JOIN membres m ON l.member_id = m.id  -- ✅ JOIN avec membres
      WHERE dpd.demande_prix_id = ?`,
      [id]
    );

    demande.destinataires = destinatairesRows as DemandePrixDestinataire[];

    // 4. Récupérer les pièces jointes
    const [pjRows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM demandes_prix_pieces_jointes 
       WHERE demande_prix_id = ?
       ORDER BY date_upload DESC`,
      [id]
    );

    demande.pieces_jointes = pjRows as any[];

    return demande;
  } finally {
    conn.release();
  }
}

// ============================================
// 3. Créer une demande de prix
// ============================================

export async function createDemande(
  input: CreateDemandePrixInput
): Promise<{ id: number; reference: string }> {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Préparer la référence : s'assurer d'une valeur unique (évite Duplicate entry)
    let referenceToUse = (input.reference || '').toString().trim();

    if (!referenceToUse) {
      referenceToUse = `DP-${Date.now()}`; // fallback si aucune référence fournie
    } else {
      // Vérifier s'il existe déjà
      const [existingRows] = await conn.query<RowDataPacket[]>(
        `SELECT COUNT(*) as cnt FROM demandes_prix WHERE reference = ?`,
        [referenceToUse]
      );
      const cnt = Array.isArray(existingRows) && existingRows[0] ? (existingRows[0] as any).cnt : 0;
      if (cnt > 0) {
        // Si duplicate, ajouter timestamp pour garantir l'unicité
        referenceToUse = `${referenceToUse}-${Date.now()}`;
      }
    }

    // 2. Créer la demande principale
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO demandes_prix (
        reference, type_demande, note_generale, urgence,
        adresse_livraison_type, adresse_livraison,
        societe_id, membre_id, statut, date_creation, date_envoi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'envoyee', NOW(), NOW())`,
      [
        referenceToUse,
        input.type_demande,
        input.note_generale || null,
        input.urgence || 'normal',
        input.adresse_livraison_type || 'siege',
        input.adresse_livraison || null,
        input.societe_id,
        input.membre_id
      ]
    );

    const demandeId = result.insertId;

    // 2. Créer les lignes de produits
    if (input.lignes && input.lignes.length > 0) {
      const lignesValues = input.lignes.map((ligne, index) => [
        demandeId,
        ligne.product_id,
        ligne.quantite,
        ligne.note_ligne || null,
        ligne.ordre !== undefined ? ligne.ordre : index
      ]);

      await conn.query(
        `INSERT INTO demandes_prix_lignes (
          demande_prix_id, product_id, quantite, note_ligne, ordre
        ) VALUES ?`,
        [lignesValues]
      );
    }

    // 3. Créer les destinataires
    if (input.destinataires && input.destinataires.length > 0) {
      const destinatairesValues = input.destinataires.map(dest => [
        demandeId,
        dest.library_id || null,
        dest.email_manuel || null,
        dest.nom_manuel || null,
        new Date()
      ]);

      await conn.query(
        `INSERT INTO demandes_prix_destinataires (
          demande_prix_id, library_id, email_manuel, nom_manuel, date_envoi
        ) VALUES ?`,
        [destinatairesValues]
      );
    }

    await conn.commit();

    return { id: demandeId, reference: referenceToUse };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// ============================================
// 4. Récupérer les données pour le PDF
// ============================================

export async function getDemandeForPDF(
  demandeId: number
): Promise<DemandePrixPDFData> {
  const conn = await pool.getConnection();

  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT 
        dp.id,
        dp.reference,
        dp.type_demande,
        dp.note_generale,
        dp.urgence,
        dp.adresse_livraison_type,
        dp.adresse_livraison,
        dp.date_creation,
        
        s.nomsociete as societe_name,
        s.adresse as societe_adresse,
        s.email as societe_email,
        s.telephone as societe_telephone,
        
        m.prenom as membre_prenom,
        m.nom as membre_nom,
        m.email as membre_email,
        
        dpl.quantite,
        dpl.note_ligne,
        
        p.name as product_name,
        p.supplier_reference,
        p.description as product_description,
        p.public_price,
        p.unit,
        
        l.name as library_name
        
      FROM demandes_prix dp
      JOIN demandes_prix_lignes dpl ON dp.id = dpl.demande_prix_id
      JOIN products p ON dpl.product_id = p.id
      LEFT JOIN library_categories lc ON p.category_id = lc.id
      LEFT JOIN libraries l ON lc.library_id = l.id
      JOIN societes s ON dp.societe_id = s.id
      JOIN membres m ON dp.membre_id = m.id
      WHERE dp.id = ?
      ORDER BY dpl.ordre ASC`,
      [demandeId]
    );

    if (rows.length === 0) {
      throw new Error('Demande de prix introuvable');
    }

    const firstRow = rows[0];

    return {
      demande: {
        id: firstRow.id,
        reference: firstRow.reference,
        type_demande: firstRow.type_demande,
        note_generale: firstRow.note_generale,
        urgence: firstRow.urgence,
        adresse_livraison_type: firstRow.adresse_livraison_type,
        adresse_livraison: firstRow.adresse_livraison,
        date_creation: firstRow.date_creation,
        societe_id: 0,
        membre_id: 0,
        statut: 'envoyee'
      },
      lignes: rows.map(row => ({
        quantite: row.quantite,
        note_ligne: row.note_ligne,
        product_name: row.product_name,
        supplier_reference: row.supplier_reference,
        description: row.product_description,
        public_price: row.public_price,
        unit: row.unit,
        library_name: row.library_name
      })),
      societe: {
        name: firstRow.societe_name,
        adresse: firstRow.societe_adresse,
        email: firstRow.societe_email,
        telephone: firstRow.societe_telephone
      },
      membre: {
        prenom: firstRow.membre_prenom,
        nom: firstRow.membre_nom,
        email: firstRow.membre_email
      }
    };
  } finally {
    conn.release();
  }
}

// ============================================
// 5. Récupérer les fournisseurs accessibles
// ============================================

export async function getFournisseursAccessibles(
  societeId: number
): Promise<any[]> {
  const conn = await pool.getConnection();

  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT DISTINCT
        l.id,
        l.name,
        l.image,
        COUNT(DISTINCT p.id) as nb_produits
      FROM libraries l
      LEFT JOIN societe_library sl ON l.id = sl.library_id 
        AND sl.societe_id = ?
      JOIN library_categories lc ON l.id = lc.library_id
      JOIN products p ON lc.id = p.category_id
      WHERE 
        sl.status = 'validated' OR l.id = 18
      GROUP BY l.id, l.name, l.image
      ORDER BY l.name`,
      [societeId]
    );

    return rows;
  } finally {
    conn.release();
  }
}

// ============================================
// 6. Récupérer les produits accessibles
// ============================================

export async function getProduitsAccessibles(
  societeId: number,
  libraryId?: number,
  categoryId?: number
): Promise<any[]> {
  const conn = await pool.getConnection();

  try {
    let whereConditions = [
      '(sl.status = \'validated\' OR l.id = 18)',
      'p.id IS NOT NULL'
    ];
    let params: any[] = [societeId];

    if (libraryId) {
      whereConditions.push('l.id = ?');
      params.push(libraryId);
    }

    if (categoryId) {
      whereConditions.push('lc.id = ?');
      params.push(categoryId);
    }

    const whereClause = whereConditions.join(' AND ');

    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT 
        p.id,
        p.name,
        p.supplier_reference,
        p.description,
        p.image,
        p.public_price,
        p.unit,
        lc.name as famille_name,
        l.id as library_id,
        l.name as library_name
      FROM products p
      JOIN library_categories lc ON p.category_id = lc.id
      JOIN libraries l ON lc.library_id = l.id
      LEFT JOIN societe_library sl ON l.id = sl.library_id 
        AND sl.societe_id = ?
      WHERE ${whereClause}
      ORDER BY l.name, lc.name, p.name`,
      params
    );

    return rows;
  } finally {
    conn.release();
  }
}