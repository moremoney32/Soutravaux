import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createDemande, getDemandeById, getDemandeForPDF, getDemandes, getFournisseursAccessibles, getProduitsAccessibles } from '../services/DemandesPrixServices';
import { CreateDemandePrixInput } from '../types/demandesPrix';
import { generateDemandePrixPDF } from '../helpers/pdfGenerator';
import { sendDemandePrixEmail } from '../helpers/emailSender';
// import {
//   getDemandes,
//   getDemandeById,
//   createDemande,
//   getDemandeForPDF,
//   getFournisseursAccessibles,
//   getProduitsAccessibles
// } from '../services/DemandesPrixService';
// import { generateDemandePrixPDF } from '../utils/pdfGenerator';
// import { sendDemandePrixEmail } from '../utils/emailSender';
// import { CreateDemandePrixInput } from '../types/demandesPrix';

/**
 * GET /api/demandes-prix
 * Récupérer toutes les demandes d'une société (avec filtres)
 */
export const getDemandesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { societe_id, statut, type_demande, date_debut, date_fin, limit, offset } = req.query;

    if (!societe_id) {
      res.status(400).json({
        success: false,
        message: "societe_id est requis"
      });
      return;
    }

    const demandes = await getDemandes({
      societe_id: Number(societe_id),
      statut: statut as any,
      type_demande: type_demande as any,
      date_debut: date_debut as string,
      date_fin: date_fin as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.status(200).json({
      success: true,
      data: demandes,
      total: demandes.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/demandes-prix/:id
 * Récupérer une demande complète par ID
 */
export const getDemandeByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { societe_id } = req.query;

    if (!societe_id) {
      res.status(400).json({
        success: false,
        message: "societe_id est requis"
      });
      return;
    }

    const demande = await getDemandeById(Number(id), Number(societe_id));

    if (!demande) {
      res.status(404).json({
        success: false,
        message: "Demande de prix introuvable"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: demande
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/demandes-prix
 * Créer une nouvelle demande de prix et l'envoyer
 */
export const createDemandeController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input: CreateDemandePrixInput = req.body;

    // Validation basique
    if (!input.reference || !input.type_demande || !input.societe_id || !input.membre_id) {
      res.status(400).json({
        success: false,
        message: "Champs requis manquants (reference, type_demande, societe_id, membre_id)"
      });
      return;
    }

    if (!input.lignes || input.lignes.length === 0) {
      res.status(400).json({
        success: false,
        message: "Au moins un produit doit être ajouté"
      });
      return;
    }

    if (!input.destinataires || input.destinataires.length === 0) {
      res.status(400).json({
        success: false,
        message: "Au moins un destinataire doit être spécifié"
      });
      return;
    }

    // 1. Créer la demande en base de données
    const { id: demandeId, reference } = await createDemande(input);

    // 2. Récupérer les données complètes pour le PDF
    const pdfData = await getDemandeForPDF(demandeId);

    // 3. Générer le PDF
    const pdfPath = await generateDemandePrixPDF(pdfData);

    // Log: vérifier l'existence et la taille du PDF
    try {
      const fs = await import('fs');
      const stats = fs.statSync(pdfPath);
      console.log(`📝 PDF généré: ${pdfPath} (taille: ${stats.size} bytes)`);
      console.log(`🔍 Nom de fichier utilisé pour le PDF: ${path.basename(pdfPath)}`);
    } catch (err) {
      console.error('⚠️ Impossible de lire le fichier PDF généré:', err && (err as any).message ? (err as any).message : err);
    }

    // 4. Envoyer les emails à tous les destinataires
    console.log('📧 Destinataires:', input.destinataires.map(d => d.library_id ? `library:${d.library_id}` : d.email_manuel));

    const emailPromises = input.destinataires.map(async (dest) => {
      const email = dest.email_manuel || pdfData.destinataire?.email;
      const name = dest.nom_manuel || pdfData.destinataire?.name;

      if (email) {
        await sendDemandePrixEmail({
          to: email,
          recipientName: name || 'Fournisseur',
          reference: reference,
          pdfPath: pdfPath,
          societe: pdfData.societe,
          membre: pdfData.membre,
          urgence: pdfData.demande?.urgence,
          note_generale: pdfData.demande?.note_generale
        });
      }
    });

    await Promise.all(emailPromises);

    res.status(201).json({
      success: true,
      message: "Demande de prix créée et envoyée avec succès",
      data: {
        id: demandeId,
        reference: reference
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/demandes-prix/fournisseurs
 * Récupérer les fournisseurs accessibles par une société
 */
export const getFournisseursController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { societe_id } = req.query;

    if (!societe_id) {
      res.status(400).json({
        success: false,
        message: "societe_id est requis"
      });
      return;
    }

    const fournisseurs = await getFournisseursAccessibles(Number(societe_id));

    res.status(200).json({
      success: true,
      data: fournisseurs
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/demandes-prix/produits
 * Récupérer les produits accessibles par une société
 */
export const getProduitsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { societe_id, library_id, category_id } = req.query;

    if (!societe_id) {
      res.status(400).json({
        success: false,
        message: "societe_id est requis"
      });
      return;
    }

    const produits = await getProduitsAccessibles(
      Number(societe_id),
      library_id ? Number(library_id) : undefined,
      category_id ? Number(category_id) : undefined
    );

    res.status(200).json({
      success: true,
      data: produits
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/demandes-prix/:id/pdf
 * Télécharger le PDF d'une demande
 */
export const downloadPDFController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { societe_id } = req.query;

    if (!societe_id) {
      res.status(400).json({
        success: false,
        message: "societe_id est requis"
      });
      return;
    }

    // Vérifier que la demande existe et appartient à la société
    const demande = await getDemandeById(Number(id), Number(societe_id));

    if (!demande) {
      res.status(404).json({
        success: false,
        message: "Demande de prix introuvable"
      });
      return;
    }

    // Récupérer les données pour le PDF
    const pdfData = await getDemandeForPDF(Number(id));

    // Générer le PDF
    const pdfPath = await generateDemandePrixPDF(pdfData);

    // Envoyer le fichier
    res.download(pdfPath, `demande-prix-${demande.reference}.pdf`, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du PDF:', err);
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
};