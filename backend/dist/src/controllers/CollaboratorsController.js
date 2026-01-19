"use strict";
// controllers/CollaboratorsController.ts
// Contrôleur pour gérer les collaborateurs
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCollaboratorController = exports.assignCollaboratorController = exports.getSocietesByMemberController = exports.checkCollaboratorController = exports.getCollaboratorsBySocieteController = void 0;
const CollaboratorsService_1 = require("../services/CollaboratorsService");
/**
 * GET /api/collaborators/:societeId
 * Récupérer tous les collaborateurs d'une société
 */
const getCollaboratorsBySocieteController = async (req, res, next) => {
    try {
        const { societeId } = req.params;
        if (!societeId) {
            res.status(400).json({
                success: false,
                message: "societeId est requis"
            });
            return;
        }
        const collaborators = await (0, CollaboratorsService_1.getUniqueCollaboratorsBySociete)(Number(societeId));
        res.status(200).json({
            success: true,
            data: collaborators,
            count: collaborators.length
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getCollaboratorsBySocieteController = getCollaboratorsBySocieteController;
/**
 * GET /api/collaborators/check/:memberId/:societeId
 * Vérifier si un membre est collaborateur d'une société
 */
const checkCollaboratorController = async (req, res, next) => {
    try {
        const { memberId, societeId } = req.params;
        if (!memberId || !societeId) {
            res.status(400).json({
                success: false,
                message: "memberId et societeId sont requis"
            });
            return;
        }
        const isCollaborator = await (0, CollaboratorsService_1.isCollaboratorOfSociete)(Number(memberId), Number(societeId));
        res.status(200).json({
            success: true,
            data: { isCollaborator }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.checkCollaboratorController = checkCollaboratorController;
/**
 * GET /api/collaborators/member/:memberId
 * Récupérer les sociétés pour lesquelles un membre est collaborateur
 */
const getSocietesByMemberController = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        if (!memberId) {
            res.status(400).json({
                success: false,
                message: "memberId est requis"
            });
            return;
        }
        const societes = await (0, CollaboratorsService_1.getSocietesByCollaborator)(Number(memberId));
        res.status(200).json({
            success: true,
            data: societes,
            count: societes.length
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getSocietesByMemberController = getSocietesByMemberController;
/**
 * POST /api/collaborators
 * Assigner un collaborateur à une société
 */
const assignCollaboratorController = async (req, res, next) => {
    try {
        const { memberId, posteId, societeId, assignedBy, expiresAt } = req.body;
        if (!memberId || !posteId || !societeId) {
            res.status(400).json({
                success: false,
                message: "memberId, posteId et societeId sont requis"
            });
            return;
        }
        const assignmentId = await (0, CollaboratorsService_1.assignCollaborator)(Number(memberId), BigInt(posteId), Number(societeId), assignedBy ? Number(assignedBy) : undefined, expiresAt);
        res.status(201).json({
            success: true,
            data: { id: assignmentId },
            message: "Collaborateur assigné avec succès"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.assignCollaboratorController = assignCollaboratorController;
/**
 * DELETE /api/collaborators/:memberId/:societeId
 * Retirer l'assignation d'un collaborateur
 */
const removeCollaboratorController = async (req, res, next) => {
    try {
        const { memberId, societeId } = req.params;
        if (!memberId || !societeId) {
            res.status(400).json({
                success: false,
                message: "memberId et societeId sont requis"
            });
            return;
        }
        await (0, CollaboratorsService_1.removeCollaborator)(Number(memberId), Number(societeId));
        res.status(200).json({
            success: true,
            message: "Collaborateur retiré avec succès"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.removeCollaboratorController = removeCollaboratorController;
//# sourceMappingURL=CollaboratorsController.js.map