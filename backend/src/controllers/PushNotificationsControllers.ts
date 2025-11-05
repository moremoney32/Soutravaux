import { Request, Response, NextFunction } from "express";
import { getActivites, getDepartements, getNotificationStats, getPreSocietes, getSocietes, sendNotification } from "../services/PushNotificationService";
import { GroupType } from "../types/Pushnotifications";

// ===== GET PRÉSOCIÉTÉS =====
export const getPreSocietesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
     const role = req.query.role ? String(req.query.role) : 'artisan';
    // const { role } = req.query;
    const activiteIds = req.query.activiteIds 
      ? String(req.query.activiteIds).split(',') 
      : undefined;
    const departementIds = req.query.departementIds 
      ? String(req.query.departementIds).split(',') 
      : undefined;

    if (!role || !['artisan', 'annonceur', 'fournisseur'].includes(String(role))) {
       res.status(400).json({
        success: false,
        message: "Le paramètre 'role' est requis et doit être: artisan, annonceur ou fournisseur"
      });
    }

    const preSocietes = await getPreSocietes(
      role as GroupType,
      activiteIds,
      departementIds
    );

    res.status(200).json({
      success: true,
      count: preSocietes.length,
      data: preSocietes
    });
    
  } catch (error: any) {
    console.error('Erreur getPreSocietes:', error);
    next(error);
  }
};

// ===== GET SOCIÉTÉS =====
export const getSocietesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.query;
    const activiteIds = req.query.activiteIds 
      ? String(req.query.activiteIds).split(',') 
      : undefined;
    const departementIds = req.query.departementIds 
      ? String(req.query.departementIds).split(',') 
      : undefined;

    if (!role || !['artisan', 'annonceur', 'fournisseur'].includes(String(role))) {
      res.status(400).json({
        success: false,
        message: "Le paramètre 'role' est requis et doit être: artisan, annonceur ou fournisseur"
      });
    }

    const societes = await getSocietes(
      role as GroupType,
      activiteIds,
      departementIds
    );

    res.status(200).json({
      success: true,
      count: societes.length,
      data: societes
    });
    
  } catch (error: any) {
    console.error('Erreur getSocietes:', error);
    next(error);
  }
};

// ===== GET ACTIVITÉS =====
export const getActivitesController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const activites = await getActivites();

    res.status(200).json({
      success: true,
      count: activites.length,
      data: activites
    });
    
  } catch (error: any) {
    console.error('Erreur getActivites:', error);
    next(error);
  }
};

// ===== GET DÉPARTEMENTS =====
export const getDepartementsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const departements = await getDepartements();

    res.status(200).json({
      success: true,
      count: departements.length,
      data: departements
    });
    
  } catch (error: any) {
    console.error('Erreur getDepartements:', error);
    next(error);
  }
};

// ===== SEND NOTIFICATION =====
export const sendNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, emoji, notificationTypes, recipients, filters } = req.body;

    // Validation
    if (!message || !message.trim()) {
     res.status(400).json({
        success: false,
        message: "Le message est requis"
      });
    }

    if (!notificationTypes || !Array.isArray(notificationTypes) || notificationTypes.length === 0) {
    res.status(400).json({
        success: false,
        message: "Au moins un type de notification est requis (push ou internal)"
      });
    }

    if (!recipients || (!recipients.preSocieteIds?.length && !recipients.societeIds?.length)) {
      res.status(400).json({
        success: false,
        message: "Au moins un destinataire est requis"
      });
    }

    const result = await sendNotification({
      message,
      emoji,
      notificationTypes,
      recipients,
      filters
    });

    res.status(200).json(result);
    
  } catch (error: any) {
    console.error('Erreur sendNotification:', error);
    next(error);
  }
};

//GET STATS 
export const getStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.query;

    if (!role || !['artisan', 'annonceur', 'fournisseur'].includes(String(role))) {
    res.status(400).json({
        success: false,
        message: "Le paramètre 'role' est requis"
      });
    }

    const stats = await getNotificationStats(role as GroupType);

    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error: any) {
    console.error('Erreur getStats:', error);
    next(error);
  }
};