

import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import {
  DemandePrix,
  DemandePrixRow,
  DemandePrixLigneRow,
  DemandePrixDestinataireRow,
  CreateDemandePrixInput,
  GetDemandesFilters,
  DemandePrixPDFData
} from '../types/demandesPrix';

// ============================================
// 1. Historique
// ============================================
export async function getDemandes(filters: GetDemandesFilters): Promise<DemandePrix[]> {
  const conn = await pool.getConnection();
  try {
    let whereConditions: string[] = ['dp.societe_id = ?'];
    let params: any[] = [filters.societe_id];

    if (filters.statut) { whereConditions.push('dp.statut = ?'); params.push(filters.statut); }
    if (filters.type_demande) { whereConditions.push('dp.type_demande = ?'); params.push(filters.type_demande); }
    if (filters.search) { whereConditions.push('dp.reference LIKE ?'); params.push(`%${filters.search}%`); }
    if (filters.date_debut) { whereConditions.push('dp.date_creation >= ?'); params.push(filters.date_debut); }
    if (filters.date_fin) { whereConditions.push('dp.date_creation <= ?'); params.push(filters.date_fin); }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const [rows] = await conn.query<DemandePrixRow[]>(
      `SELECT dp.*, s.nomsociete as societe_name, m.prenom as membre_prenom, m.nom as membre_nom,
        COUNT(DISTINCT dpl.id) as nb_lignes, COUNT(DISTINCT dpd.id) as nb_destinataires
       FROM demandes_prix dp
       LEFT JOIN societes s ON dp.societe_id = s.id
       LEFT JOIN membres m ON dp.membre_id = m.id
       LEFT JOIN demandes_prix_lignes dpl ON dp.id = dpl.demande_prix_id
       LEFT JOIN demandes_prix_destinataires dpd ON dp.id = dpd.demande_prix_id
       WHERE ${whereConditions.join(' AND ')}
       GROUP BY dp.id ORDER BY dp.date_creation DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const demandesWithDetails = await Promise.all(
      rows.map(async (demande) => {
        const [destinatairesRows] = await conn.query<RowDataPacket[]>(
          `SELECT dpd.*, f.nom_societe as fournisseur_nom, l.name as library_name
           FROM demandes_prix_destinataires dpd
           LEFT JOIN fournisseurs f ON dpd.fournisseur_id = f.id
           LEFT JOIN libraries l ON dpd.library_id = l.id
           WHERE dpd.demande_prix_id = ? ORDER BY dpd.id ASC`,
          [demande.id]
        );
        return { ...demande, destinataires: destinatairesRows };
      })
    );
    return demandesWithDetails as DemandePrix[];
  } finally {
    conn.release();
  }
}

// ============================================
// 2. Détail demande
// ============================================
export async function getDemandeById(id: number, societeId: number): Promise<DemandePrix | null> {
  const conn = await pool.getConnection();
  try {
    const [demandeRows] = await conn.query<DemandePrixRow[]>(
      `SELECT dp.*, s.nomsociete as societe_name, s.adresse as societe_adresse,
        s.email as societe_email, s.telephone as societe_telephone,
        m.prenom as membre_prenom, m.nom as membre_nom, m.email as membre_email
       FROM demandes_prix dp
       LEFT JOIN societes s ON dp.societe_id = s.id
       LEFT JOIN membres m ON dp.membre_id = m.id
       WHERE dp.id = ? AND dp.societe_id = ?`,
      [id, societeId]
    );
    if (demandeRows.length === 0) return null;

    const demande = demandeRows[0] as DemandePrix;

    const [lignesRows] = await conn.query<DemandePrixLigneRow[]>(
      `SELECT * FROM demandes_prix_lignes WHERE demande_prix_id = ? ORDER BY ordre ASC`,
      [id]
    );
    demande.lignes = lignesRows;

    const [destinatairesRows] = await conn.query<DemandePrixDestinataireRow[]>(
      `SELECT dpd.*, f.nom_societe as fournisseur_nom, l.name as library_name, mem.email as library_email
       FROM demandes_prix_destinataires dpd
       LEFT JOIN fournisseurs f ON dpd.fournisseur_id = f.id
       LEFT JOIN libraries l ON dpd.library_id = l.id
       LEFT JOIN membres mem ON l.member_id = mem.id
       WHERE dpd.demande_prix_id = ? ORDER BY dpd.id ASC`,
      [id]
    );
    demande.destinataires = destinatairesRows;

    const [pjRows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM demandes_prix_pieces_jointes WHERE demande_prix_id = ? ORDER BY date_upload DESC`,
      [id]
    );
    demande.pieces_jointes = pjRows as any[];

    const [relancesRows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM demandes_prix_relances WHERE demande_prix_id = ? ORDER BY date_relance_prevue ASC`,
      [id]
    );
    demande.relances = relancesRows as any[];

    return demande;
  } finally {
    conn.release();
  }
}

// ============================================
// 3. Créer une demande — BUG CORRIGÉ
//    email_envoye_a peut être null si la bibliothèque
//    n'a pas d'email configuré (colonne rendue nullable)
// ============================================
export async function createDemande(input: CreateDemandePrixInput): Promise<{ id: number; reference: string }> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Référence unique
    let referenceToUse = (input.reference || '').toString().trim() || `DP-${Date.now()}`;
    const [existingRows] = await conn.query<RowDataPacket[]>(
      `SELECT COUNT(*) as cnt FROM demandes_prix WHERE reference = ?`,
      [referenceToUse]
    );
    if ((existingRows[0] as any).cnt > 0) referenceToUse = `${referenceToUse}-${Date.now()}`;

    // Valider ENUM
    const validAdresseTypes = ['siege', 'retrait', 'nouvelle'];
    const adresseType = validAdresseTypes.includes(input.adresse_livraison_type)
      ? input.adresse_livraison_type : 'siege';

    // 1. Créer la demande
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO demandes_prix (
        reference, type_demande, note_generale, urgence,
        adresse_livraison_type, adresse_livraison, adresse_livraison_sauvegardee,
        date_limite_retour, societe_id, membre_id, library_id, statut
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'envoyee')`,
      [
        referenceToUse, input.type_demande, input.note_generale || null,
        input.urgence || 'normal', adresseType, input.adresse_livraison || null,
        input.sauvegarder_adresse ? 1 : 0, input.date_limite_retour || null,
        input.societe_id, input.membre_id, input.library_id || null
      ]
    );
    const demandeId = result.insertId;

    // 2. Lignes
    if (input.lignes?.length > 0) {
      const lignesValues = input.lignes.map((ligne, index) => [
        demandeId, ligne.product_source, ligne.product_id,
        ligne.product_nom, ligne.product_description || null,
        ligne.product_unite || null, ligne.product_marque || null,
        ligne.product_image || null, ligne.quantite,
        ligne.note_ligne || null, ligne.ordre ?? index
      ]);
      await conn.query(
        `INSERT INTO demandes_prix_lignes (
          demande_prix_id, product_source, product_id,
          product_nom, product_description, product_unite,
          product_marque, product_image, quantite, note_ligne, ordre
        ) VALUES ?`,
        [lignesValues]
      );
    }

    // 3. Destinataires — résolution email
    //    ✅ email_envoye_a peut être NULL (colonne rendue nullable par migration)
    if (input.destinataires?.length > 0) {
      const destinatairesValues: any[] = [];

      for (const dest of input.destinataires) {
        let emailEnvoyeA: string | null = null;
        let nomAffiche: string | null = null;

        if (dest.email_manuel) {
          // Email saisi manuellement → direct
          emailEnvoyeA = dest.email_manuel;
          nomAffiche = dest.email_manuel;
        } else if (dest.fournisseur_id) {
          // Résoudre depuis table fournisseurs (nom_societe + email)
          const [fRows] = await conn.query<RowDataPacket[]>(
            `SELECT nom_societe, email FROM fournisseurs WHERE id = ?`,
            [dest.fournisseur_id]
          );
          if (fRows.length > 0) {
            emailEnvoyeA = fRows[0].email || null;   // null si pas d'email
            nomAffiche = fRows[0].nom_societe;
          }
        } else if (dest.library_id) {
          // Résoudre depuis libraries → membres (member_id)
          const [lRows] = await conn.query<RowDataPacket[]>(
            `SELECT l.name, m.email, m.prenom, m.nom
             FROM libraries l
             LEFT JOIN membres m ON l.member_id = m.id
             WHERE l.id = ?`,
            [dest.library_id]
          );
          if (lRows.length > 0) {
            emailEnvoyeA = lRows[0].email || null;   // null si membre sans email
            nomAffiche = lRows[0].name;
          }
        }

        destinatairesValues.push([
          demandeId,
          dest.fournisseur_id || null,
          dest.library_id || null,
          dest.email_manuel || null,
          dest.email_manuel || null,   // nom_manuel = email pour les manuels
          emailEnvoyeA,                // ← peut être NULL maintenant
          nomAffiche
        ]);
      }

      await conn.query(
        `INSERT INTO demandes_prix_destinataires (
          demande_prix_id, fournisseur_id, library_id,
          email_manuel, nom_manuel, email_envoye_a, nom_affiche
        ) VALUES ?`,
        [destinatairesValues]
      );
    }

    // 4. Relances — calculer date depuis date_limite_retour
    // if (input.relances?.length > 0 && input.date_limite_retour) {
    if (input.relances && input.relances.length > 0 && input.date_limite_retour) {
      const dateLimite = new Date(input.date_limite_retour);
      const relancesValues: any[] = [];

      for (const relance of input.relances) {
        if (relance.type === '1_jour_avant') {
          const d = new Date(dateLimite);
          d.setDate(d.getDate() - 1);
          relancesValues.push([demandeId, '1_jour_avant', 1, d.toISOString().split('T')[0]]);
        } else if (relance.type === 'x_jours_avant' && relance.nb_jours) {
          const d = new Date(dateLimite);
          d.setDate(d.getDate() - relance.nb_jours);
          relancesValues.push([demandeId, 'x_jours_avant', relance.nb_jours, d.toISOString().split('T')[0]]);
        }
      }

      if (relancesValues.length > 0) {
        await conn.query(
          `INSERT INTO demandes_prix_relances (
            demande_prix_id, type_relance, jours_avant, date_relance_prevue
          ) VALUES ?`,
          [relancesValues]
        );
      }
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
// 4. PDF
// ============================================
// export async function getDemandeForPDF(demandeId: number): Promise<DemandePrixPDFData> {
//   const conn = await pool.getConnection();
//   try {
//     const [rows] = await conn.query<RowDataPacket[]>(
//       `SELECT dp.*, s.nomsociete as societe_name, s.adresse as societe_adresse,
//         s.email as societe_email, s.telephone as societe_telephone,
//         s.logo as societe_logo,
//         m.prenom as membre_prenom, m.nom as membre_nom, m.email as membre_email
//        FROM demandes_prix dp
//        JOIN societes s ON dp.societe_id = s.id
//        JOIN membres m ON dp.membre_id = m.id
//        WHERE dp.id = ?`,
//       [demandeId]
//     );
//     if (rows.length === 0) throw new Error('Demande introuvable');
//     const firstRow = rows[0];

//     const [lignesRows] = await conn.query<RowDataPacket[]>(
//       `SELECT * FROM demandes_prix_lignes WHERE demande_prix_id = ? ORDER BY ordre ASC`,
//       [demandeId]
//     );
//     const [pjRows] = await conn.query<RowDataPacket[]>(
//       `SELECT * FROM demandes_prix_pieces_jointes WHERE demande_prix_id = ?`,
//       [demandeId]
//     );

//     return {
//       demande: {
//         id: firstRow.id, reference: firstRow.reference,
//         type_demande: firstRow.type_demande, note_generale: firstRow.note_generale,
//         urgence: firstRow.urgence, adresse_livraison_type: firstRow.adresse_livraison_type,
//         adresse_livraison: firstRow.adresse_livraison, date_limite_retour: firstRow.date_limite_retour,
//         date_creation: firstRow.date_creation, societe_id: firstRow.societe_id,
//         membre_id: firstRow.membre_id, statut: firstRow.statut
//       },
//       lignes: lignesRows.map(row => ({
//         quantite: row.quantite, note_ligne: row.note_ligne,
//         product_nom: row.product_nom, product_description: row.product_description,
//         product_unite: row.product_unite, product_marque: row.product_marque
//       })),
//       societe: { name: firstRow.societe_name, adresse: firstRow.societe_adresse, email: firstRow.societe_email, telephone: firstRow.societe_telephone,logo: firstRow.societe_logo || null },
//       membre: { prenom: firstRow.membre_prenom, nom: firstRow.membre_nom, email: firstRow.membre_email },
//       pieces_jointes: pjRows as any[]
//     };
//   } finally {
//     conn.release();
//   }
// }

export async function getDemandeForPDF(demandeId: number): Promise<DemandePrixPDFData> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT dp.*, 
        s.nomsociete as societe_name, 
        s.adresse as societe_adresse,
        s.email as societe_email, 
        s.telephone as societe_telephone,
        s.logo as societe_logo,
        m.prenom as membre_prenom, 
        m.nom as membre_nom, 
        m.email as membre_email
       FROM demandes_prix dp
       JOIN societes s ON dp.societe_id = s.id
       JOIN membres m ON dp.membre_id = m.id
       WHERE dp.id = ?`,
      [demandeId]
    );
    
    if (rows.length === 0) throw new Error('Demande introuvable');
    const firstRow = rows[0];

    const [lignesRows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM demandes_prix_lignes WHERE demande_prix_id = ? ORDER BY ordre ASC`,
      [demandeId]
    );
    
    const [pjRows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM demandes_prix_pieces_jointes WHERE demande_prix_id = ?`,
      [demandeId]
    );

    return {
      demande: {
        id: firstRow.id, 
        reference: firstRow.reference,
        type_demande: firstRow.type_demande, 
        note_generale: firstRow.note_generale,
        urgence: firstRow.urgence, 
        
        // ✅ IMPORTANT : Ces 2 champs doivent être récupérés de la BD
        adresse_livraison_type: firstRow.adresse_livraison_type,  // 'a_mon_siege', 'retrait_point_vente', 'nouvelle_adresse'
        adresse_livraison: firstRow.adresse_livraison,             // Texte libre si nouvelle_adresse
        
        date_limite_retour: firstRow.date_limite_retour,
        date_creation: firstRow.date_creation, 
        societe_id: firstRow.societe_id,
        membre_id: firstRow.membre_id, 
        statut: firstRow.statut
      },
      lignes: lignesRows.map(row => ({
        quantite: row.quantite, 
        note_ligne: row.note_ligne,
        product_nom: row.product_nom, 
        product_description: row.product_description,
        product_unite: row.product_unite, 
        product_marque: row.product_marque
      })),
      societe: { 
        name: firstRow.societe_name, 
        adresse: firstRow.societe_adresse, 
        email: firstRow.societe_email, 
        telephone: firstRow.societe_telephone,
        logo: firstRow.societe_logo || null 
      },
      membre: { 
        prenom: firstRow.membre_prenom, 
        nom: firstRow.membre_nom, 
        email: firstRow.membre_email 
      },
      pieces_jointes: pjRows as any[]
    };
  } finally {
    conn.release();
  }
}

// ============================================
// 5. Bibliothèques — Solutravo (id!=18) toujours + abonnements validés
// ============================================
export async function getBibliotheques(societeId: number): Promise<any[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT
        l.id,
        l.name,
        l.image,
        m.email  AS contact_email,
        m.prenom AS contact_prenom,
        m.nom    AS contact_nom,
        COUNT(DISTINCT lc.id) AS nb_categories,
        COUNT(DISTINCT p.id)  AS nb_produits
       FROM libraries l
       LEFT JOIN membres m ON l.member_id = m.id
       LEFT JOIN library_categories lc ON lc.library_id = l.id
       LEFT JOIN products p ON p.category_id = lc.id
       -- Uniquement les bibliothèques avec souscription validée
       JOIN societe_library sl
         ON sl.library_id = l.id
         AND sl.societe_id = ?
         AND sl.status = 'validated'
       -- ✅ Exclure Solutravo (réservé au mode par_produit)
       WHERE l.id != 18
       GROUP BY l.id, l.name, l.image, m.email, m.prenom, m.nom
       ORDER BY l.name ASC`,
      [societeId]
    );
    return rows;
  } finally {
    conn.release();
  }
}

// ============================================
// 6. Catégories (familles) — table library_categories
//    ✅ CORRIGÉ : SELECT sur library_categories, PAS event_categories
// ============================================
export async function getCategoriesBibliotheque(libraryId: number): Promise<any[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT lc.id, lc.name, lc.image, lc.library_id,
        COUNT(DISTINCT p.id) AS nb_produits
       FROM library_categories lc
       LEFT JOIN products p ON p.category_id = lc.id
       WHERE lc.library_id = ?
       GROUP BY lc.id, lc.name, lc.image, lc.library_id
       ORDER BY lc.name ASC`,
      [libraryId]
    );
    return rows;
  } finally {
    conn.release();
  }
}

// ============================================
// 7. Produits d'une bibliothèque
// ============================================
export async function getProduitsBibliotheque(
  libraryId: number,
  categoryId?: number,
  _societeId?: number
): Promise<any[]> {
  const conn = await pool.getConnection();
  try {
    let whereConditions = ['lc.library_id = ?'];
    let params: any[] = [libraryId];

    if (categoryId) {
      whereConditions.push('p.category_id = ?');
      params.push(categoryId);
    }

    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT p.id, p.name, p.supplier_reference, p.image, p.public_price, p.unit,
        lc.id AS category_id, lc.name AS famille_name,
        l.id AS library_id, l.name AS library_name
       FROM products p
       JOIN library_categories lc ON p.category_id = lc.id
       JOIN libraries l ON lc.library_id = l.id
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY lc.name, p.name ASC`,
      params
    );
    return rows;
  } finally {
    conn.release();
  }
}


export async function getProduitsCatalogue(search?: string): Promise<any[]> {
  const conn = await pool.getConnection();
  try {
    let searchCatalogue = '';
    let searchSolutravo = '';
    const paramsCatalogue: any[] = [];
    const paramsSolutravo: any[] = [];

    if (search) {
      searchCatalogue = 'WHERE (c.nom LIKE ? OR c.description LIKE ?)';
      paramsCatalogue.push(`%${search}%`, `%${search}%`);
      searchSolutravo = 'AND (p.name LIKE ? OR p.description LIKE ?)';
      paramsSolutravo.push(`%${search}%`, `%${search}%`);
    }

    // ── 1. Produits du catalogue global (table catalogue, SANS filtre societe) ──
    const [catalogueRows] = await conn.query<RowDataPacket[]>(
      `SELECT
        c.id,
        c.nom         AS name,
        c.nom         AS product_nom,
        c.description,
        c.unite       AS unit,
        c.marque,
        c.type,
        c.image,
        c.societe_id,
        'catalogue'   AS source,
        NULL          AS famille_name,
        NULL          AS supplier_reference,
        NULL          AS library_id
       FROM catalogue c
       ${searchCatalogue}
       ORDER BY c.nom ASC`,
      paramsCatalogue
    );

    // ── 2. Produits Solutravo (library_id = 18) ─────────────
    const [solutravoRows] = await conn.query<RowDataPacket[]>(
      `SELECT
        p.id,
        p.name,
        p.name        AS product_nom,
        p.description,
        p.unit,
        NULL          AS marque,
        'produit'     AS type,
        p.image,
        NULL          AS societe_id,
        'library'     AS source,
        lc.name       AS famille_name,
        p.supplier_reference,
        lc.library_id AS library_id
       FROM products p
       JOIN library_categories lc ON p.category_id = lc.id
       WHERE lc.library_id = 18
       ${searchSolutravo}
       ORDER BY lc.name, p.name ASC`,
      paramsSolutravo
    );

    // ── Combiner : catalogue d'abord, puis Solutravo ─────────
    return [...catalogueRows, ...solutravoRows];
  } finally {
    conn.release();
  }
}

export async function getFournisseursAvecEmail(): Promise<any[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT
        f.id,
        f.nom_societe AS name,
        f.nom,
        f.prenom,
        f.email,
        f.telephone,
        f.ville,
        f.pays,
        f.societe_id,
        1 AS has_email
       FROM fournisseurs f
       WHERE f.email IS NOT NULL
         AND f.email != ''
       ORDER BY f.nom_societe ASC`
    );
    return rows;
  } finally {
    conn.release();
  }
}


// ============================================
// 10. Statut destinataire
// ============================================
export async function updateStatutDestinataire(
  destinataireId: number, demandeId: number, societeId: number, statut: string
): Promise<boolean> {
  const conn = await pool.getConnection();
  try {
    const [check] = await conn.query<RowDataPacket[]>(
      `SELECT dp.id FROM demandes_prix dp
       JOIN demandes_prix_destinataires dpd ON dp.id = dpd.demande_prix_id
       WHERE dpd.id = ? AND dp.id = ? AND dp.societe_id = ?`,
      [destinataireId, demandeId, societeId]
    );
    if (check.length === 0) return false;
    await conn.query(
      `UPDATE demandes_prix_destinataires SET statut = ? WHERE id = ?`,
      [statut, destinataireId]
    );
    return true;
  } finally {
    conn.release();
  }
}

// ============================================
// 11. Archiver
// ============================================
export async function archiverDemande(demandeId: number, societeId: number): Promise<boolean> {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query<ResultSetHeader>(
      `UPDATE demandes_prix SET statut = 'archivee' WHERE id = ? AND societe_id = ?`,
      [demandeId, societeId]
    );
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
}

// ============================================
// 12. CRON relances
// ============================================
export async function getRelancesAEnvoyer(): Promise<any[]> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT dpr.*, dp.reference, dp.societe_id, dp.membre_id, dp.urgence,
        s.nomsociete as societe_name, s.email as societe_email,
        m.prenom as membre_prenom, m.nom as membre_nom, m.email as membre_email
       FROM demandes_prix_relances dpr
       JOIN demandes_prix dp ON dp.id = dpr.demande_prix_id
       JOIN societes s ON dp.societe_id = s.id
       JOIN membres m ON dp.membre_id = m.id
       WHERE dpr.statut = 'en_attente'
         AND dpr.date_relance_prevue <= CURDATE()
         AND dp.statut = 'envoyee'`,
      []
    );
    const relancesWithDest = await Promise.all(
      rows.map(async (relance) => {
        const [destRows] = await conn.query<RowDataPacket[]>(
          `SELECT email_envoye_a, nom_affiche FROM demandes_prix_destinataires
           WHERE demande_prix_id = ? AND statut = 'envoyee' AND email_envoye_a IS NOT NULL`,
          [relance.demande_prix_id]
        );
        return { ...relance, destinataires: destRows };
      })
    );
    return relancesWithDest;
  } finally {
    conn.release();
  }
}

// ============================================
// 13. Marquer relance envoyée
// ============================================
export async function marquerRelanceEnvoyee(relanceId: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `UPDATE demandes_prix_relances SET statut = 'envoye', date_envoi = NOW() WHERE id = ?`,
      [relanceId]
    );
  } finally {
    conn.release();
  }
}