// controllers/CollaboratorsController.ts
// Contrôleur pour gérer les collaborateurs

import { Request, Response, NextFunction } from 'express';
import {
  getUniqueCollaboratorsBySociete,
  isCollaboratorOfSociete,
  assignCollaborator,
  removeCollaborator,
  getSocietesByCollaborator
} from '../services/CollaboratorsService';

/**
 * GET /api/collaborators/:societeId
 * Récupérer tous les collaborateurs d'une société
 */
export const getCollaboratorsBySocieteController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { societeId } = req.params;

    if (!societeId) {
      res.status(400).json({
        success: false,
        message: "societeId est requis"
      });
      return;
    }

    const collaborators = await getUniqueCollaboratorsBySociete(Number(societeId));

    res.status(200).json({
      success: true,
      data: collaborators,
      count: collaborators.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/collaborators/check/:memberId/:societeId
 * Vérifier si un membre est collaborateur d'une société
 */
export const checkCollaboratorController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { memberId, societeId } = req.params;

    if (!memberId || !societeId) {
      res.status(400).json({
        success: false,
        message: "memberId et societeId sont requis"
      });
      return;
    }

    const isCollaborator = await isCollaboratorOfSociete(
      Number(memberId),
      Number(societeId)
    );

    res.status(200).json({
      success: true,
      data: { isCollaborator }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/collaborators/member/:memberId
 * Récupérer les sociétés pour lesquelles un membre est collaborateur
 */
export const getSocietesByMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { memberId } = req.params;

    if (!memberId) {
      res.status(400).json({
        success: false,
        message: "memberId est requis"
      });
      return;
    }

    const societes = await getSocietesByCollaborator(Number(memberId));

    res.status(200).json({
      success: true,
      data: societes,
      count: societes.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/collaborators
 * Assigner un collaborateur à une société
 */
export const assignCollaboratorController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { memberId, posteId, societeId, assignedBy, expiresAt } = req.body;

    if (!memberId || !posteId || !societeId) {
      res.status(400).json({
        success: false,
        message: "memberId, posteId et societeId sont requis"
      });
      return;
    }

    const assignmentId = await assignCollaborator(
      Number(memberId),
      BigInt(posteId),
      Number(societeId),
      assignedBy ? Number(assignedBy) : undefined,
      expiresAt
    );

    res.status(201).json({
      success: true,
      data: { id: assignmentId },
      message: "Collaborateur assigné avec succès"
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/collaborators/:memberId/:societeId
 * Retirer l'assignation d'un collaborateur
 */
export const removeCollaboratorController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { memberId, societeId } = req.params;

    if (!memberId || !societeId) {
      res.status(400).json({
        success: false,
        message: "memberId et societeId sont requis"
      });
      return;
    }

    await removeCollaborator(Number(memberId), Number(societeId));

    res.status(200).json({
      success: true,
      message: "Collaborateur retiré avec succès"
    });
  } catch (err) {
    next(err);
  }
};
