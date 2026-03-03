

import pool from '../config/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { RowDataPacket } from 'mysql2';

import { Request, Response, NextFunction } from 'express';
import {
  createDemande, getDemandeById, getDemandeForPDF, getDemandes,
  getBibliotheques, getCategoriesBibliotheque, getProduitsBibliotheque,
  getProduitsCatalogue, updateStatutDestinataire, archiverDemande,
  getFournisseursAvecEmail
} from '../services/DemandesPrixServices';
import { CreateDemandePrixInput } from '../types/demandesPrix'
import { generateDemandePrixPDF } from '../helpers/pdfGenerator';
import { sendDemandePrixEmail,  sendNotificationVincent } from '../helpers/emailSender';


// ── Config multer ────────────────────────────────────────────
const PJ_DIR = path.join(__dirname, '../../storage/pieces_jointes');
if (!fs.existsSync(PJ_DIR)) fs.mkdirSync(PJ_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PJ_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9.\-_]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 100);
    cb(null, `${Date.now()}-${safe}`);
  }
});

export const uploadPJ = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }, // 10MB max, 5 fichiers max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé : ${file.mimetype}`));
    }
  }
});

// ─── GET /api/demandes-prix ─────────────────────────────────
export const getDemandesController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { societe_id, statut, type_demande, search, date_debut, date_fin, limit, offset } = req.query;
    if (!societe_id) { res.status(400).json({ success: false, message: 'societe_id requis' }); return; }
    const demandes = await getDemandes({
      societe_id: Number(societe_id), statut: statut as any, type_demande: type_demande as any,
      search: search as string, date_debut: date_debut as string, date_fin: date_fin as string,
      limit: limit ? Number(limit) : undefined, offset: offset ? Number(offset) : undefined
    });
    res.status(200).json({ success: true, data: demandes, total: demandes.length });
  } catch (err) { next(err); }
};

// ─── GET /api/demandes-prix/:id ─────────────────────────────
export const getDemandeByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { societe_id } = req.query;
    if (!societe_id) { res.status(400).json({ success: false, message: 'societe_id requis' }); return; }
    const demande = await getDemandeById(Number(id), Number(societe_id));
    if (!demande) { res.status(404).json({ success: false, message: 'Demande introuvable' }); return; }
    res.status(200).json({ success: true, data: demande });
  } catch (err) { next(err); }
};

// ─── POST /api/demandes-prix ────────────────────────────────


export const createDemandeController = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    // ✅ FormData → les données JSON sont dans req.body.data
    //    JSON pur  → les données sont directement dans req.body

    console.log('📦 req.body:', JSON.stringify(req.body));
    console.log('📎 req.files:', (req.files as any[])?.map(f => f.originalname));
    console.log('📋 Content-Type:', req.headers['content-type']);
    let input: CreateDemandePrixInput;
    if (req.body?.data) {
      try {
        input = JSON.parse(req.body.data);
      } catch {
        res.status(400).json({ success: false, message: 'Données JSON invalides dans le champ "data"' });
        return;
      }
    } else {
      input = req.body;
    }

    // Validations
    if (!input?.reference || !input.type_demande || !input.societe_id || !input.membre_id) {
      res.status(400).json({ success: false, message: 'Champs requis manquants : reference, type_demande, societe_id, membre_id' });
      return;
    }
    if (!input.lignes?.length) {
      res.status(400).json({ success: false, message: 'Ajoutez au moins un produit à votre demande' });
      return;
    }
    if (!input.destinataires?.length) {
      res.status(400).json({ success: false, message: 'Ajoutez au moins un destinataire à votre demande' });
      return;
    }

    // 1. Créer la demande en BDD
    const { id: demandeId, reference } = await createDemande(input);
    console.log('✅ createDemande OK - id:', demandeId, 'reference:', reference);

    // 2. Sauvegarder les pièces jointes en BDD
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length > 0) {
      const conn = await pool.getConnection();
      try {
        const pjValues = files.map(file => [
          demandeId,
          file.originalname,
          file.filename,
          file.path,
          file.size,
          file.mimetype
        ]);
        await conn.query(
          `INSERT INTO demandes_prix_pieces_jointes
            (demande_prix_id, filename_original, filename_stocke, filepath, filesize, mimetype)
           VALUES ?`,
          [pjValues]
        );
        console.log(`✅ ${files.length} PJ sauvegardée(s)`);
      } finally {
        conn.release();
      }
    }

    // 3. Données PDF (inclut maintenant les PJ depuis la BDD)
    const pdfData = await getDemandeForPDF(demandeId);
    console.log('✅ getDemandeForPDF OK - reference:', pdfData?.demande?.reference);

    // 4. Générer PDF
    const pdfPath = await generateDemandePrixPDF(pdfData);
    console.log('✅ PDF généré:', pdfPath);

    // 5. Récupérer destinataires avec email
    const conn2 = await pool.getConnection();
    let destinatairesRows: any[] = [];
    try {
      const [rows] = await conn2.query<RowDataPacket[]>(
        `SELECT email_envoye_a, nom_affiche
         FROM demandes_prix_destinataires
         WHERE demande_prix_id = ?
           AND email_envoye_a IS NOT NULL
           AND email_envoye_a != ''`,
        [demandeId]
      );
      destinatairesRows = rows;
    } finally {
      conn2.release();
    }

    // 6. Envoyer emails
    const emailsEnvoyes: string[] = [];
    await Promise.all(
      destinatairesRows.map(async (dest) => {
        const nom = dest.nom_affiche || 'Fournisseur';
        await sendDemandePrixEmail({
          to: dest.email_envoye_a,
          recipientName: nom,
          reference,
          pdfPath,
          societe: pdfData.societe,
          membre: pdfData.membre,
          urgence: input.urgence,
          note_generale: input.note_generale,
          date_limite_retour: input.date_limite_retour
        });
        emailsEnvoyes.push(`${nom} <${dest.email_envoye_a}>`);
      })
    );

    await sendNotificationVincent({
      entreprise: pdfData.societe.name,
      fournisseurs: emailsEnvoyes,
      reference
    });

    // 7. Email de confirmation à l'émetteur
    // if (pdfData.membre.email) {
    //   await sendConfirmationEmail({
    //     to: pdfData.membre.email,
    //     societe_name: pdfData.societe.name,
    //     membre_prenom: pdfData.membre.prenom,
    //     reference,
    //     nb_produits: input.lignes.length,
    //     nb_destinataires: emailsEnvoyes.length,
    //     destinataires: emailsEnvoyes
    //   });
    // }

    const pdfUrl = `https://solutravo.zeta-app.fr/api/demandes-prix/${demandeId}/pdf?societe_id=${input.societe_id}`;

    res.status(201).json({
      success: true,
      message: `Demande créée et envoyée à ${emailsEnvoyes.length} destinataire(s)`,
      data: {
        id: demandeId,
        reference,
        pdf_url: pdfUrl,
        nb_pieces_jointes: files.length
      }
    });

  } catch (err) {
    next(err);
  }
};



// ─── GET /api/demandes-prix/bibliotheques ──────────────────
// ✅ CORRIGÉ : societe_id (pas membre_id)
export const getBibliothequesController = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const { societe_id } = req.query;
    if (!societe_id) {
      res.status(400).json({ success: false, message: 'societe_id requis' });
      return;
    }
    const bibliotheques = await getBibliotheques(Number(societe_id));
    res.status(200).json({ success: true, data: bibliotheques });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/demandes-prix/bibliotheques/:id/categories ───
// ✅ Appelle getCategoriesBibliotheque → table library_categories
export const getCategoriesControllerPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params; // id = library_id
    const categories = await getCategoriesBibliotheque(Number(id));
    res.status(200).json({ success: true, data: categories });
  } catch (err) { next(err); }
};

// ─── GET /api/demandes-prix/bibliotheques/:id/produits ─────
export const getProduitsBibliothequeController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { category_id, societe_id } = req.query;
    const produits = await getProduitsBibliotheque(
      Number(id),
      category_id ? Number(category_id) : undefined,
      societe_id ? Number(societe_id) : undefined
    );
    res.status(200).json({ success: true, data: produits });
  } catch (err) { next(err); }
};

// ─── GET /api/demandes-prix/catalogue ──────────────────────
// export const getCatalogueController = async (
//   req: Request, res: Response, next: NextFunction
// ): Promise<void> => {
//   try {
//     const { search } = req.query;
//     // ✅ Plus de filtre societe_id — catalogue global + Solutravo
//     const produits = await getProduitsCatalogue(search as string | undefined);
//     res.status(200).json({ success: true, data: produits });
//   } catch (err) {
//     next(err);
//   }
// };

export const getCatalogueController = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const { search, societe_id } = req.query;
    
    if (!societe_id) {
      res.status(400).json({ success: false, message: 'societe_id requis' });
      return;
    }
    
    const produits = await getProduitsCatalogue(
      Number(societe_id),
      search as string | undefined
    );
    
    res.status(200).json({ success: true, data: produits });
  } catch (err) {
    next(err);
  }
};
// ─── GET /api/demandes-prix/fournisseurs ───────────────────
// ✅ Retourne nom_societe AS name + has_email
// export const getFournisseursController = async (
//   _req: Request, res: Response, next: NextFunction
// ): Promise<void> => {
//   try {
//     // ✅ Plus de societe_id requis — tous les fournisseurs avec email
//     const fournisseurs = await getFournisseursAvecEmail();
//     res.status(200).json({ success: true, data: fournisseurs });
//   } catch (err) {
//     next(err);
//   }
// };

export const getFournisseursController = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const { societe_id } = req.query;
    
    if (!societe_id) {
      res.status(400).json({ success: false, message: 'societe_id requis' });
      return;
    }
    
    const fournisseurs = await getFournisseursAvecEmail(Number(societe_id));
    res.status(200).json({ success: true, data: fournisseurs });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/demandes-prix/:id/destinataires/:destId ────
export const updateStatutDestinataireController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, destId } = req.params;
    const { societe_id, statut } = req.body;
    if (!societe_id || !statut) { res.status(400).json({ success: false, message: 'societe_id et statut requis' }); return; }
    const ok = await updateStatutDestinataire(Number(destId), Number(id), Number(societe_id), statut);
    if (!ok) { res.status(404).json({ success: false, message: 'Destinataire introuvable' }); return; }
    res.status(200).json({ success: true, message: 'Statut mis à jour' });
  } catch (err) { next(err); }
};

// ─── PATCH /api/demandes-prix/:id/archiver ─────────────────
export const archiverDemandeController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { societe_id } = req.body;
    if (!societe_id) { res.status(400).json({ success: false, message: 'societe_id requis' }); return; }
    const ok = await archiverDemande(Number(id), Number(societe_id));
    if (!ok) { res.status(404).json({ success: false, message: 'Demande introuvable' }); return; }
    res.status(200).json({ success: true, message: 'Demande archivée' });
  } catch (err) { next(err); }
};

// ─── GET /api/demandes-prix/:id/pdf ────────────────────────
export const downloadPDFController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { societe_id } = req.query;
    if (!societe_id) { res.status(400).json({ success: false, message: 'societe_id requis' }); return; }
    const demande = await getDemandeById(Number(id), Number(societe_id));
    if (!demande) { res.status(404).json({ success: false, message: 'Demande introuvable' }); return; }
    const pdfData = await getDemandeForPDF(Number(id));
    const pdfPath = await generateDemandePrixPDF(pdfData);
    res.download(pdfPath, `demande-prix-${demande.reference}.pdf`, (err) => { if (err) next(err); });
  } catch (err) { next(err); }
};




