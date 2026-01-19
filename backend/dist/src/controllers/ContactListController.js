"use strict";
// controllers/contactListController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.countContactsController = exports.getContactsFromListsController = exports.getPhoneNumbersController = exports.getContactListByIdController = exports.getContactListsController = void 0;
const ContactsListServices_1 = require("../services/ContactsListServices");
/**
 * GET /api/contact-lists/societe/:societeId
 * Récupérer toutes les listes d'une société avec compteur contacts
 */
const getContactListsController = async (req, res, next) => {
    try {
        const { societeId } = req.params;
        const societeIdNum = Number(societeId);
        if (isNaN(societeIdNum)) {
            res.status(400).json({
                success: false,
                message: "ID société invalide"
            });
        }
        const lists = await (0, ContactsListServices_1.getContactListsBySociete)(societeIdNum);
        res.status(200).json({
            success: true,
            data: lists,
            count: lists.length
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getContactListsController = getContactListsController;
/**
 * GET /api/contact-lists/:listId/societe/:societeId
 * Récupérer une liste spécifique avec tous ses contacts
 */
const getContactListByIdController = async (req, res, next) => {
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
        const list = await (0, ContactsListServices_1.getContactListById)(listIdNum, societeIdNum);
        res.status(200).json({
            success: true,
            data: list
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getContactListByIdController = getContactListByIdController;
/**
 * POST /api/contact-lists/phone-numbers
 * Récupérer les numéros de téléphone de plusieurs listes
 * Body: { listIds: number[], societeId: number }
 */
const getPhoneNumbersController = async (req, res, next) => {
    try {
        const { listIds, societeId } = req.body;
        if (!Array.isArray(listIds) || !societeId) {
            res.status(400).json({
                success: false,
                message: "listIds (array) et societeId sont requis"
            });
        }
        const phoneNumbers = await (0, ContactsListServices_1.getPhoneNumbersFromLists)(listIds, Number(societeId));
        res.status(200).json({
            success: true,
            data: phoneNumbers,
            count: phoneNumbers.length
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getPhoneNumbersController = getPhoneNumbersController;
/**
 * POST /api/contact-lists/contacts
 * Récupérer les contacts complets de plusieurs listes
 * Body: { listIds: number[], societeId: number }
 */
const getContactsFromListsController = async (req, res, next) => {
    try {
        const { listIds, societeId } = req.body;
        if (!Array.isArray(listIds) || !societeId) {
            res.status(400).json({
                success: false,
                message: "listIds (array) et societeId sont requis"
            });
        }
        const contacts = await (0, ContactsListServices_1.getContactsFromLists)(listIds, Number(societeId));
        res.status(200).json({
            success: true,
            data: contacts,
            count: contacts.length
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getContactsFromListsController = getContactsFromListsController;
/**
 * POST /api/contact-lists/count
 * Compter le nombre total de contacts de plusieurs listes
 * Body: { listIds: number[], societeId: number }
 */
const countContactsController = async (req, res, next) => {
    try {
        const { listIds, societeId } = req.body;
        if (!Array.isArray(listIds) || !societeId) {
            res.status(400).json({
                success: false,
                message: "listIds (array) et societeId sont requis"
            });
        }
        const total = await (0, ContactsListServices_1.countContactsInLists)(listIds, Number(societeId));
        res.status(200).json({
            success: true,
            data: { total }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.countContactsController = countContactsController;
//# sourceMappingURL=ContactListController.js.map