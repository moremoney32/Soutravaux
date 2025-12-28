// controllers/contactListController.ts

import { Request, Response, NextFunction } from 'express';
import {
  getContactListsBySociete,
  getContactListById,
  getPhoneNumbersFromLists,
  getContactsFromLists,
  countContactsInLists
} from '../services/ContactsListServices';

/**
 * GET /api/contact-lists/societe/:societeId
 * Récupérer toutes les listes d'une société avec compteur contacts
 */

export const getContactListsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) : Promise<void> => {
  try {
    const { societeId } = req.params;
    const societeIdNum = Number(societeId);

    if (isNaN(societeIdNum)) {
     res.status(400).json({
        success: false,
        message: "ID société invalide"
      });
    }

    const lists = await getContactListsBySociete(societeIdNum);

    res.status(200).json({
      success: true,
      data: lists,
      count: lists.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/contact-lists/:listId/societe/:societeId
 * Récupérer une liste spécifique avec tous ses contacts
 */
export const getContactListByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) : Promise<void> => {
  try {
    const { listId, societeId } = req.params;
    const listIdNum = Number(listId);
    const societeIdNum = Number(societeId);

    if (isNaN(listIdNum) || isNaN(societeIdNum)) {
       res.status(400).json({
        success: false,
        message: "IDs invalides"
      });
    }

    const list = await getContactListById(listIdNum, societeIdNum);

    res.status(200).json({
      success: true,
      data: list
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/contact-lists/phone-numbers
 * Récupérer les numéros de téléphone de plusieurs listes
 * Body: { listIds: number[], societeId: number }
 */
export const getPhoneNumbersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) : Promise<void> => {
  try {
    const { listIds, societeId } = req.body;

    if (!Array.isArray(listIds) || !societeId) {
       res.status(400).json({
        success: false,
        message: "listIds (array) et societeId sont requis"
      });
    }

    const phoneNumbers = await getPhoneNumbersFromLists(listIds, Number(societeId));

    res.status(200).json({
      success: true,
      data: phoneNumbers,
      count: phoneNumbers.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/contact-lists/contacts
 * Récupérer les contacts complets de plusieurs listes
 * Body: { listIds: number[], societeId: number }
 */
export const getContactsFromListsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) : Promise<void> => {
  try {
    const { listIds, societeId } = req.body;

    if (!Array.isArray(listIds) || !societeId) {
       res.status(400).json({
        success: false,
        message: "listIds (array) et societeId sont requis"
      });
    }

    const contacts = await getContactsFromLists(listIds, Number(societeId));

    res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/contact-lists/count
 * Compter le nombre total de contacts de plusieurs listes
 * Body: { listIds: number[], societeId: number }
 */
export const countContactsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) : Promise<void> => {
  try {
    const { listIds, societeId } = req.body;

    if (!Array.isArray(listIds) || !societeId) {
       res.status(400).json({
        success: false,
        message: "listIds (array) et societeId sont requis"
      });
    }

    const total = await countContactsInLists(listIds, Number(societeId));

    res.status(200).json({
      success: true,
      data: { total }
    });
  } catch (err) {
    next(err);
  }
};