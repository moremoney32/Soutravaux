// controllers/calendarController.ts - VERSION CORRIGÉE

import { Request, Response, NextFunction } from 'express';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees,
  inviteAttendees,
  respondToInvite,
  getAvailableSocietes
} from '../services/CalendarService';
import { createCategory, getCategories } from '../services/CategoryService';

/**
 * GET /api/calendar/events
 * Récupérer les événements d'une société
 */
export const getEventsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { societe_id, start_date, end_date } = req.query;

    if (!societe_id || !start_date || !end_date) {
      res.status(400).json({
        success: false,
        message: "societe_id, start_date et end_date sont requis"
      });
      return;
    }

    const events = await getEvents(
      Number(societe_id),
      String(start_date),
      String(end_date)
    );

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/calendar/events
 * Créer un nouvel événement
 */
export const createEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventData = req.body;

    if (!eventData.societe_id || !eventData.title || !eventData.event_date || !eventData.start_time || !eventData.end_time) {
      res.status(400).json({
        success: false,
        message: "Données manquantes (societe_id, title, event_date, start_time, end_time requis)"
      });
      return;
    }

    // Validate / normalize `scope`
    if (!eventData.scope) {
      eventData.scope = 'personal';
    } else if (!['personal', 'collaborative'].includes(eventData.scope)) {
      res.status(400).json({ success: false, message: 'scope invalide (personal|collaborative)' });
      return;
    }

    // Validate invite_method if provided
    if (eventData.invite_method && !['email', 'sms', 'push', 'contact'].includes(eventData.invite_method)) {
      res.status(400).json({ success: false, message: 'invite_method invalide (email|sms|push|contact)' });
      return;
    }

    // Coerce numeric ids if provided as strings
    if (eventData.event_category_id) {
      eventData.event_category_id = Number(eventData.event_category_id);
      if (Number.isNaN(eventData.event_category_id)) {
        res.status(400).json({ success: false, message: 'event_category_id invalide' });
        return;
      }
    }

    const eventId = await createEvent(eventData);

    res.status(201).json({
      success: true,
      data: { id: eventId },
      message: "Événement créé avec succès"
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/calendar/events/:eventId
 * Modifier un événement
 */
export const updateEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { societe_id, ...updateData } = req.body;

    if (!societe_id) {
      res.status(400).json({
        success: false,
        message: "societe_id requis"
      });
      return;
    }

    await updateEvent(Number(eventId), updateData, Number(societe_id));

    res.status(200).json({
      success: true,
      message: "Événement modifié avec succès"
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/calendar/events/:eventId
 * Supprimer un événement
 */
export const deleteEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { societe_id } = req.body;

    if (!societe_id) {
      res.status(400).json({
        success: false,
        message: "societe_id requis"
      });
      return;
    }

    await deleteEvent(Number(eventId), Number(societe_id));

    res.status(200).json({
      success: true,
      message: "Événement supprimé avec succès"
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/calendar/events/:eventId/attendees
 * Récupérer les participants (sociétés) d'un événement
 */
export const getAttendeesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;

    const attendees = await getEventAttendees(Number(eventId));

    res.status(200).json({
      success: true,
      data: attendees
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/calendar/events/:eventId/invite
 * Inviter des sociétés à un événement
 */
export const inviteAttendeesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { societe_ids, invite_method } = req.body;

    if (!societe_ids || !Array.isArray(societe_ids) || societe_ids.length === 0) {
      res.status(400).json({
        success: false,
        message: "societe_ids (array) requis"
      });
      return;
    }

    if (!invite_method || !['email', 'sms', 'push', 'contact'].includes(invite_method)) {
      res.status(400).json({
        success: false,
        message: "invite_method invalide (email, sms, push, contact)"
      });
      return;
    }

    await inviteAttendees(Number(eventId), societe_ids, invite_method);

    res.status(200).json({
      success: true,
      message: `Invitations envoyées par ${invite_method}`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/calendar/events/:eventId/respond
 * Répondre à une invitation (accepter/refuser)
 */
export const respondToInviteController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { societe_id, status } = req.body;

    if (!societe_id || !status || !['accepted', 'declined'].includes(status)) {
      res.status(400).json({
        success: false,
        message: "societe_id et status (accepted/declined) requis"
      });
      return;
    }

    await respondToInvite(Number(eventId), Number(societe_id), status);

    res.status(200).json({
      success: true,
      message: `Invitation ${status === 'accepted' ? 'acceptée' : 'refusée'}`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/calendar/societes
 * Récupérer la liste des sociétés disponibles (pour invitation)
 */
export const getSocietesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { exclude_societe_id } = req.query;

    const societes = await getAvailableSocietes(
      exclude_societe_id ? Number(exclude_societe_id) : undefined
    );

    res.status(200).json({
      success: true,
      data: societes
    });
  } catch (err) {
    next(err);
  }
};


export const getCategoriesController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { societe_id } = req.query;
  
      if (!societe_id) {
        res.status(400).json({
          success: false,
          message: "societe_id requis"
        });
        return;
      }
  
      const categories = await getCategories(Number(societe_id));
  
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (err) {
      next(err);
    }
  };
  
  /**
   * POST /api/calendar/categories
   * Créer catégorie personnalisée
   */
  export const createCategoryController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { societe_id, label, icon, color, requires_location } = req.body;
  
      if (!societe_id || !label) {
        res.status(400).json({
          success: false,
          message: "societe_id et label requis"
        });
        return;
      }
  
      const category = await createCategory({
        societe_id: Number(societe_id),
        label,
        icon,
        color,
        requires_location
      });
  
      res.status(201).json({
        success: true,
        data: category,
        message: "Catégorie créée avec succès"
      });
    } catch (err: any) {
      if (err.message.includes('existe déjà')) {
        res.status(409).json({
          success: false,
          message: err.message
        });
        return;
      }
      next(err);
    }
  };