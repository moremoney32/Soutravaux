
// controllers/calendarController.ts -- VERSION AVEC AUTORISATION
import { Request, Response, NextFunction } from 'express';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees,
  inviteAttendees,
  respondToInvite,
  getAvailableSocietes,
  inviterSociete,
  searchSocietes
} from '../services/CalendarService';
import { createCategory, getCategories } from '../services/CategoryService';
import { verifyAccess } from '../services/AuthorizationService';

/**
 * GET /api/calendar/events
 * ✅ AVEC AUTORISATION
 */
export const getEventsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { societe_id, membre_id, start_date, end_date } = req.query;

    if (!societe_id || !membre_id || !start_date || !end_date) {
      res.status(400).json({
        success: false,
        message: "societe_id, membre_id, start_date et end_date sont requis"
      });
      return;
    }

    const societeId = Number(societe_id);
    const membreId = Number(membre_id);

    // ✅ VÉRIFIER AUTORISATION
    const auth = await verifyAccess(societeId, membreId);

    if (!auth.authorized) {
      res.status(403).json({
        success: false,
        message: "Accès refusé",
        reason: auth.reason
      });
      return;
    }

    // ✅ RÉCUPÉRER ÉVÉNEMENTS SELON RÔLE
    const events = await getEvents(
      societeId,
      membreId,
      auth.role!,
      String(start_date),
      String(end_date)
    );

    res.status(200).json({
      success: true,
      data: events,
      role: auth.role
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/calendar/events
 * ✅ AVEC AUTORISATION
 */
export const createEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventData = req.body;
    console.log("🔥 DATA REÇUE BACK CREATE =", eventData);

    if (!eventData.societe_id || !eventData.membre_id || !eventData.title || !eventData.event_date || !eventData.start_time || !eventData.end_time) {
      res.status(400).json({
        success: false,
        message: "Données manquantes (societe_id, membre_id, title, event_date, start_time, end_time requis)"
      });
      return;
    }

    const societeId = Number(eventData.societe_id);
    const membreId = Number(eventData.membre_id);

    // ✅ VÉRIFIER AUTORISATION
    const auth = await verifyAccess(societeId, membreId);

    if (!auth.authorized) {
      res.status(403).json({
        success: false,
        message: "Accès refusé",
        reason: auth.reason
      });
      return;
    }

    // Valider scope
    if (!eventData.scope) {
      eventData.scope = 'personal';
    } else if (!['personal', 'collaborative'].includes(eventData.scope)) {
      res.status(400).json({ success: false, message: 'scope invalide (personal|collaborative)' });
      return;
    }

    // Valider invite_method
    if (eventData.invite_method && !['email', 'sms', 'push', 'contact'].includes(eventData.invite_method)) {
      res.status(400).json({ success: false, message: 'invite_method invalide' });
      return;
    }

    // Coerce category_id
    if (eventData.event_category_id) {
      eventData.event_category_id = Number(eventData.event_category_id);
      if (Number.isNaN(eventData.event_category_id)) {
        res.status(400).json({ success: false, message: 'event_category_id invalide' });
        return;
      }
    }

    // ✅ CRÉER ÉVÉNEMENT avec membreId
    const eventId = await createEvent(eventData, membreId);

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
 * ✅ AVEC AUTORISATION
 */
export const updateEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { societe_id, membre_id, ...updateData } = req.body;

    if (!societe_id || !membre_id) {
      res.status(400).json({
        success: false,
        message: "societe_id et membre_id requis"
      });
      return;
    }

    const societeId = Number(societe_id);
    const membreId = Number(membre_id);

    // ✅ VÉRIFIER AUTORISATION
    const auth = await verifyAccess(societeId, membreId);

    if (!auth.authorized) {
      res.status(403).json({
        success: false,
        message: "Accès refusé",
        reason: auth.reason
      });
      return;
    }

    // ✅ MODIFIER ÉVÉNEMENT avec membreId
    await updateEvent(Number(eventId), updateData, societeId, membreId);

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
 * ✅ AVEC AUTORISATION
 */
export const deleteEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { societe_id, membre_id } = req.body;

    if (!societe_id || !membre_id) {
      res.status(400).json({
        success: false,
        message: "societe_id et membre_id requis"
      });
      return;
    }

    const societeId = Number(societe_id);
    const membreId = Number(membre_id);

    // ✅ VÉRIFIER AUTORISATION
    const auth = await verifyAccess(societeId, membreId);

    if (!auth.authorized) {
      res.status(403).json({
        success: false,
        message: "Accès refusé",
        reason: auth.reason
      });
      return;
    }

    // ✅ SUPPRIMER ÉVÉNEMENT
    await deleteEvent(Number(eventId), societeId, membreId);

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
 * (Inchangé)
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
 * (Inchangé)
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
 * (Inchangé)
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
 * (Inchangé)
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

/**
 * GET /api/calendar/categories
 * (Inchangé)
 */
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
 * (Inchangé)
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


  export const searchSocietesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, exclude_id } = req.query;

    if (!exclude_id) {
      res.status(400).json({
        success: false,
        message: "exclude_id requis"
      });
      return;
    }

    const societes = await searchSocietes(
      String(q || ''),
      Number(exclude_id)
    );

    res.status(200).json({
      success: true,
      data: societes
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/calendar/events/:eventId/invite-societe
 */
export const inviterSocieteController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { societe_invitante_id, societe_invitee_id, membre_id } = req.body;

    if (!societe_invitante_id || !societe_invitee_id || !membre_id) {
      res.status(400).json({
        success: false,
        message: "societe_invitante_id, societe_invitee_id et membre_id requis"
      });
      return;
    }

    await inviterSociete(
      Number(eventId),
      Number(societe_invitante_id),
      Number(societe_invitee_id),
      Number(membre_id)
    );

    res.status(200).json({
      success: true,
      message: "Société invitée avec succès"
    });

  } catch (err: any) {
    if (err.message === "Cette société a déjà été invitée") {
      res.status(409).json({ success: false, message: err.message });
      return;
    }
    if (err.message === "Seul l'admin peut inviter une société") {
      res.status(403).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};