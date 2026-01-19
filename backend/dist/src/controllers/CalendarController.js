"use strict";
// controllers/calendarController.ts - VERSION CORRIGÉE
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryController = exports.getCategoriesController = exports.getSocietesController = exports.respondToInviteController = exports.inviteAttendeesController = exports.getAttendeesController = exports.deleteEventController = exports.updateEventController = exports.createEventController = exports.getEventsController = void 0;
const CalendarService_1 = require("../services/CalendarService");
const CategoryService_1 = require("../services/CategoryService");
/**
 * GET /api/calendar/events
 * Récupérer les événements d'une société
 */
const getEventsController = async (req, res, next) => {
    try {
        const { societe_id, start_date, end_date } = req.query;
        if (!societe_id || !start_date || !end_date) {
            res.status(400).json({
                success: false,
                message: "societe_id, start_date et end_date sont requis"
            });
            return;
        }
        const events = await (0, CalendarService_1.getEvents)(Number(societe_id), String(start_date), String(end_date));
        res.status(200).json({
            success: true,
            data: events
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getEventsController = getEventsController;
/**
 * POST /api/calendar/events
 * Créer un nouvel événement
 */
const createEventController = async (req, res, next) => {
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
        }
        else if (!['personal', 'collaborative'].includes(eventData.scope)) {
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
        const eventId = await (0, CalendarService_1.createEvent)(eventData);
        res.status(201).json({
            success: true,
            data: { id: eventId },
            message: "Événement créé avec succès"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createEventController = createEventController;
/**
 * PUT /api/calendar/events/:eventId
 * Modifier un événement
 */
const updateEventController = async (req, res, next) => {
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
        await (0, CalendarService_1.updateEvent)(Number(eventId), updateData, Number(societe_id));
        res.status(200).json({
            success: true,
            message: "Événement modifié avec succès"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateEventController = updateEventController;
/**
 * DELETE /api/calendar/events/:eventId
 * Supprimer un événement
 */
const deleteEventController = async (req, res, next) => {
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
        await (0, CalendarService_1.deleteEvent)(Number(eventId), Number(societe_id));
        res.status(200).json({
            success: true,
            message: "Événement supprimé avec succès"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEventController = deleteEventController;
/**
 * GET /api/calendar/events/:eventId/attendees
 * Récupérer les participants (sociétés) d'un événement
 */
const getAttendeesController = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const attendees = await (0, CalendarService_1.getEventAttendees)(Number(eventId));
        res.status(200).json({
            success: true,
            data: attendees
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAttendeesController = getAttendeesController;
/**
 * POST /api/calendar/events/:eventId/invite
 * Inviter des sociétés à un événement
 */
const inviteAttendeesController = async (req, res, next) => {
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
        await (0, CalendarService_1.inviteAttendees)(Number(eventId), societe_ids, invite_method);
        res.status(200).json({
            success: true,
            message: `Invitations envoyées par ${invite_method}`
        });
    }
    catch (err) {
        next(err);
    }
};
exports.inviteAttendeesController = inviteAttendeesController;
/**
 * POST /api/calendar/events/:eventId/respond
 * Répondre à une invitation (accepter/refuser)
 */
const respondToInviteController = async (req, res, next) => {
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
        await (0, CalendarService_1.respondToInvite)(Number(eventId), Number(societe_id), status);
        res.status(200).json({
            success: true,
            message: `Invitation ${status === 'accepted' ? 'acceptée' : 'refusée'}`
        });
    }
    catch (err) {
        next(err);
    }
};
exports.respondToInviteController = respondToInviteController;
/**
 * GET /api/calendar/societes
 * Récupérer la liste des sociétés disponibles (pour invitation)
 */
const getSocietesController = async (req, res, next) => {
    try {
        const { exclude_societe_id } = req.query;
        const societes = await (0, CalendarService_1.getAvailableSocietes)(exclude_societe_id ? Number(exclude_societe_id) : undefined);
        res.status(200).json({
            success: true,
            data: societes
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getSocietesController = getSocietesController;
const getCategoriesController = async (req, res, next) => {
    try {
        const { societe_id } = req.query;
        if (!societe_id) {
            res.status(400).json({
                success: false,
                message: "societe_id requis"
            });
            return;
        }
        const categories = await (0, CategoryService_1.getCategories)(Number(societe_id));
        res.status(200).json({
            success: true,
            data: categories
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getCategoriesController = getCategoriesController;
/**
 * POST /api/calendar/categories
 * Créer catégorie personnalisée
 */
const createCategoryController = async (req, res, next) => {
    try {
        const { societe_id, label, icon, color, requires_location } = req.body;
        if (!societe_id || !label) {
            res.status(400).json({
                success: false,
                message: "societe_id et label requis"
            });
            return;
        }
        const category = await (0, CategoryService_1.createCategory)({
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
    }
    catch (err) {
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
exports.createCategoryController = createCategoryController;
//# sourceMappingURL=CalendarController.js.map