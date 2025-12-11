"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatsController = exports.sendNotificationController = exports.getDepartementsController = exports.getActivitesController = exports.getSocietesController = exports.getPreSocietesController = void 0;
const PushNotificationService_1 = require("../services/PushNotificationService");
// ===== GET PRÉSOCIÉTÉS =====
const getPreSocietesController = async (req, res, next) => {
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
        const preSocietes = await (0, PushNotificationService_1.getPreSocietes)(role, activiteIds, departementIds);
        res.status(200).json({
            success: true,
            count: preSocietes.length,
            data: preSocietes
        });
    }
    catch (error) {
        console.error('Erreur getPreSocietes:', error);
        next(error);
    }
};
exports.getPreSocietesController = getPreSocietesController;
// ===== GET SOCIÉTÉS =====
const getSocietesController = async (req, res, next) => {
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
        const societes = await (0, PushNotificationService_1.getSocietes)(role, activiteIds, departementIds);
        res.status(200).json({
            success: true,
            count: societes.length,
            data: societes
        });
    }
    catch (error) {
        console.error('Erreur getSocietes:', error);
        next(error);
    }
};
exports.getSocietesController = getSocietesController;
// ===== GET ACTIVITÉS =====
const getActivitesController = async (_req, res, next) => {
    try {
        const activites = await (0, PushNotificationService_1.getActivites)();
        res.status(200).json({
            success: true,
            count: activites.length,
            data: activites
        });
    }
    catch (error) {
        console.error('Erreur getActivites:', error);
        next(error);
    }
};
exports.getActivitesController = getActivitesController;
// ===== GET DÉPARTEMENTS =====
const getDepartementsController = async (_req, res, next) => {
    try {
        const departements = await (0, PushNotificationService_1.getDepartements)();
        res.status(200).json({
            success: true,
            count: departements.length,
            data: departements
        });
    }
    catch (error) {
        console.error('Erreur getDepartements:', error);
        next(error);
    }
};
exports.getDepartementsController = getDepartementsController;
// ===== SEND NOTIFICATION =====
const sendNotificationController = async (req, res, next) => {
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
        const result = await (0, PushNotificationService_1.sendNotification)({
            message,
            emoji,
            notificationTypes,
            recipients,
            filters
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Erreur sendNotification:', error);
        next(error);
    }
};
exports.sendNotificationController = sendNotificationController;
//GET STATS 
const getStatsController = async (req, res, next) => {
    try {
        const { role } = req.query;
        if (!role || !['artisan', 'annonceur', 'fournisseur'].includes(String(role))) {
            res.status(400).json({
                success: false,
                message: "Le paramètre 'role' est requis"
            });
        }
        const stats = await (0, PushNotificationService_1.getNotificationStats)(role);
        res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Erreur getStats:', error);
        next(error);
    }
};
exports.getStatsController = getStatsController;
//# sourceMappingURL=PushNotificationsControllers.js.map