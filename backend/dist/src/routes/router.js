"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserControllers_1 = require("../controllers/UserControllers");
const CompanyController_1 = require("../controllers/CompanyController");
const PlanRoleContollers_1 = require("../controllers/PlanRoleContollers");
const CheckSubscriptionControllers_1 = require("../controllers/CheckSubscriptionControllers");
const featuresControllers_1 = require("../controllers/featuresControllers");
// import { scrapeGoogleMapsController } from "../controllers/ScraperController";
const UpdatePlanFree_1 = __importDefault(require("../controllers/UpdatePlanFree"));
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const PushNotificationsControllers_1 = require("../controllers/PushNotificationsControllers");
const sse_routes_1 = __importDefault(require("./sse.routes"));
// import { scrapeGoogleMapsController } from "../controllers/ScraperControllerOptimized";
const ContactListController_1 = require("../controllers/ContactListController");
const CalendarController_1 = require("../controllers/CalendarController");
const CollaboratorsController_1 = require("../controllers/CollaboratorsController");
const router = express_1.default.Router();
router.use('/sse', sse_routes_1.default);
router.post("/register", UserControllers_1.UserControllers);
router.post("/registerAnnonceur", UserControllers_1.AnnonceurControllers);
router.post("/registerFournisseur", UserControllers_1.FournisseurControllers);
router.post("/verifyCode", UserControllers_1.UserControllersVerifyCode);
router.post("/check_subscription", CheckSubscriptionControllers_1.CheckSubscription);
router.post("/register/complete", UserControllers_1.completeController);
router.post("/users/resend-code", UserControllers_1.resendCodeController);
router.get("/entreprises", CompanyController_1.SearchCompanies);
router.get("/plans", PlanRoleContollers_1.GetPlansByRole);
router.put("/plans/:id", PlanRoleContollers_1.updatePlan);
router.post("/plans", PlanRoleContollers_1.createPlan);
router.delete("/plans/:id", PlanRoleContollers_1.deletePlan);
router.put("/subscription-settings", PlanRoleContollers_1.updateSettings);
router.get("/subscription-settings", PlanRoleContollers_1.getSettings);
router.post("/downgrade-to-free", UpdatePlanFree_1.default);
// router.post("/google-maps", scrapeGoogleMapsController);
// GET - Récupérer toutes les listes d'une société avec compteur
router.get('/contact-lists/societe/:societeId', ContactListController_1.getContactListsController);
// GET - Récupérer une liste spécifique avec ses contacts
router.get('/contact-lists/:listId/societe/:societeId', ContactListController_1.getContactListByIdController);
// POST - Récupérer numéros de téléphone de plusieurs listes (pour campagne SMS)
router.post('/contact-lists/phone-numbers', ContactListController_1.getPhoneNumbersController);
// POST - Récupérer contacts complets de plusieurs listes
router.post('/contact-lists/contacts', ContactListController_1.getContactsFromListsController);
// POST - Compter contacts totaux de plusieurs listes
router.post('/contact-lists/count', ContactListController_1.countContactsController);
// ROUTES - PLANS
/**
 * @route   GET /api/admin/plans
 * @desc    Récupérer tous les plans
 * @access  Private/Admin
 */
router.get('/plans', featuresControllers_1.getAllPlansController);
/**
 * @route   GET /api/admin/plans/by-role
 * @desc    Récupérer les plans par rôle
 * @access  Private/Admin
 */
router.get('/plans/by-role', featuresControllers_1.getPlansByRoleController);
/**
 * @route   GET /api/admin/plans/:id
 * @desc    Récupérer un plan par ID
 * @access  Private/Admin
 */
router.get('/plans/:id', featuresControllers_1.getPlanByIdController);
// ============================================
// ROUTES - FEATURES
// ============================================
/**
 * @route   GET /api/admin/features
 * @desc    Récupérer toutes les fonctionnalités
 * @access  Private/Admin
 */
router.get('/features', featuresControllers_1.getAllFeaturesController);
/**
 * @route   GET /api/admin/features/by-page
 * @desc    Récupérer les fonctionnalités par page
 * @access  Private/Admin
 */
router.get('/features/by-page', featuresControllers_1.getFeaturesByPageController);
/**
 * @route   POST /api/admin/features
 * @desc    Créer une nouvelle fonctionnalité
 * @access  Private/Admin
 */
router.post('/features', featuresControllers_1.createFeatureController);
/**
 * @route   PUT /api/admin/features/:id
 * @desc    Mettre à jour une fonctionnalité
 * @access  Private/Admin
 */
router.put('/features/:id', featuresControllers_1.updateFeatureController);
/**
 * @route   DELETE /api/admin/features/:id
 * @desc    Supprimer une fonctionnalité
 * @access  Private/Admin
 */
router.delete('/features/:id', featuresControllers_1.deleteFeatureController);
// ============================================
// ROUTES - FEATURE-PLAN ASSOCIATIONS
// ============================================
/**
 * @route   GET /api/admin/plans/:planId/features
 * @desc    Récupérer les fonctionnalités d'un plan avec statut
 * @access  Private/Admin
 */
router.get('/plans/:planId/features', featuresControllers_1.getPlanFeaturesController);
/**
 * @route   POST /api/admin/plans/:planId/features/sync
 * @desc    Synchroniser les fonctionnalités d'un plan
 * @access  Private/Admin
 */
router.post('/plans/:planId/features/sync', featuresControllers_1.syncPlanFeaturesController);
/**
 * @route   POST /api/admin/features/:featureId/plans/:planId
 * @desc    Ajouter une fonctionnalité à un plan
 * @access  Private/Admin
 */
router.post('/features/:featureId/plans/:planId', featuresControllers_1.addFeatureToPlanController);
/**
 * @route   DELETE /api/admin/features/:featureId/plans/:planId
 * @desc    Retirer une fonctionnalité d'un plan
 * @access  Private/Admin
 */
router.delete('/features/:featureId/plans/:planId', featuresControllers_1.removeFeatureFromPlanController);
/**
 * @route   GET /api/admin/features/:featureId/plans
 * @desc    Récupérer les plans associés à une fonctionnalité
 * @access  Private/Admin
 */
router.get('/features/:featureId/plans', featuresControllers_1.getPlansByFeatureController);
router.get('/features/by-role', featuresControllers_1.getFeaturesByRoleController);
router.get("/presocietes", PushNotificationsControllers_1.getPreSocietesController);
router.get("/societes", PushNotificationsControllers_1.getSocietesController);
router.get("/activites", PushNotificationsControllers_1.getActivitesController);
router.get("/departements", PushNotificationsControllers_1.getDepartementsController);
router.get("/stats", PushNotificationsControllers_1.getStatsController);
router.post("/send", PushNotificationsControllers_1.sendNotificationController);
router.post('/upload', uploadMiddleware_1.default, (req, res) => {
    const url = req.fileUrl;
    if (!url) {
        res.status(500).json({
            success: false,
            error: "Erreur lors de l'upload"
        });
        return;
    }
    res.status(200).json({
        success: true,
        message: "Image uploadée avec succès",
        url: url
    });
});
/**
 * ROUTES CALENDRIER
 */
// GET /api/calendar/events - Récupérer événements
router.get('/calendar/events', CalendarController_1.getEventsController); /*fff***/
// POST /api/calendar/events - Créer événement
router.post('/calendar/events', CalendarController_1.createEventController);
// PUT /api/calendar/events/:eventId - Modifier événement
router.put('/calendar/events/:eventId', CalendarController_1.updateEventController);
// DELETE /api/calendar/events/:eventId - Supprimer événement
router.delete('/calendar/events/:eventId', CalendarController_1.deleteEventController);
// GET /api/calendar/events/:eventId/attendees - Récupérer participants
router.get('/calendar/events/:eventId/attendees', CalendarController_1.getAttendeesController);
// POST /api/calendar/events/:eventId/invite - Inviter sociétés
router.post('/calendar/events/:eventId/invite', CalendarController_1.inviteAttendeesController);
// POST /api/calendar/events/:eventId/respond - Répondre invitation
router.post('/calendar/events/:eventId/respond', CalendarController_1.respondToInviteController);
// GET /api/calendar/societes - Liste sociétés disponibles (au lieu de artisans)
router.get('/calendar/societes', PushNotificationsControllers_1.getPreSocietesController);
router.get('/calendar/categories', CalendarController_1.getCategoriesController);
router.post('/calendar/categories', CalendarController_1.createCategoryController);
/**
 * ROUTES COLLABORATEURS
 */
// GET /api/collaborators/:societeId - Récupérer tous les collaborateurs d'une société
router.get('/collaborators/:societeId', CollaboratorsController_1.getCollaboratorsBySocieteController);
// GET /api/collaborators/check/:memberId/:societeId - Vérifier si un membre est collaborateur
router.get('/collaborators/check/:memberId/:societeId', CollaboratorsController_1.checkCollaboratorController);
// GET /api/collaborators/member/:memberId - Récupérer les sociétés d'un membre
router.get('/collaborators/member/:memberId', CollaboratorsController_1.getSocietesByMemberController);
// POST /api/collaborators - Assigner un collaborateur
router.post('/collaborators', CollaboratorsController_1.assignCollaboratorController);
// DELETE /api/collaborators/:memberId/:societeId - Retirer un collaborateur
router.delete('/collaborators/:memberId/:societeId', CollaboratorsController_1.removeCollaboratorController);
/**
 * GET /api/push-notifications/presocietes
 * Récupère les présociétés filtrées
 * Query params:
 *   - role: artisan | annonceur | fournisseur (required)
 *   - activiteIds: string (comma-separated IDs, optional)
 *   - departementIds: string (comma-separated IDs, optional)
 */
// router.get("/presocietes",getPreSocietesController);
/**
 * GET /api/push-notifications/societes
 * Récupère les sociétés filtrées
 * Query params:
 *   - role: artisan | annonceur | fournisseur (required)
 *   - activiteIds: string (comma-separated IDs, optional)
 *   - departementIds: string (comma-separated IDs, optional)
 */
// router.get("/societes",getSocietesController);
/**
 * GET /api/push-notifications/activites
 * Récupère toutes les activités disponibles
 */
// router.get("/activites",getActivitesController);
/**
 * GET /api/push-notifications/departements
 * Récupère tous les départements disponibles
 */
// router.get("/departements",getDepartementsController);
/**
 * GET /api/push-notifications/stats
 * Récupère les statistiques pour un rôle donné
 * Query params:
 *   - role: artisan | annonceur | fournisseur (required)
 */
// router.get("/stats",getStatsController);
// ===== ROUTE D'ENVOI DE NOTIFICATION =====
/**
 * POST /api/push-notifications/send
 * Envoie une notification aux destinataires sélectionnés
 * Body:
 * {
 *   "message": string (required),
 *   "emoji": string (optional),
 *   "notificationTypes": ["push" | "internal"] (required, min 1),
 *   "recipients": {
 *     "preSocieteIds": string[] (optional),
 *     "societeIds": string[] (optional)
 *   },
 *   "filters": {
 *     "group": "artisan" | "annonceur" | "fournisseur" (optional),
 *     "activiteIds": string[] (optional),
 *     "departementIds": string[] (optional)
 *   }
 * }
 */
//  router.post("/send",sendNotificationController);
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: |
 *       Crée un nouveau compte utilisateur avec envoi d'un code OTP par email.
 *       Processus en 3 étapes :
 *       1. Inscription → 2. Vérification OTP → 3. Définition du mot de passe
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterInput'
 *     responses:
 *       201:
 *         description: Inscription réussie, code OTP envoyé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Inscription réussie, code envoyé"
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *       400:
 *         description: Données manquantes ou invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email ou SIRET déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Email invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", UserControllers_1.UserControllers);
/**
 * @swagger
 * /api/verifyCode:
 *   post:
 *     summary: Vérification du code OTP
 *     description: Vérifie le code OTP envoyé par email pour valider l'inscription
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyInput'
 *     responses:
 *       200:
 *         description: Code vérifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Code vérifié avec succès"
 *       400:
 *         description: Code invalide ou expiré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/verifyCode", UserControllers_1.UserControllersVerifyCode);
/**
 * @swagger
 * /api/register/complete:
 *   post:
 *     summary: Finalisation de l'inscription
 *     description: Définit le mot de passe final après vérification OTP réussie
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteRegistrationInput'
 *     responses:
 *       200:
 *         description: Inscription complétée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Inscription complétée. Vous pouvez vous connecter."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     prenom:
 *                       type: string
 *                       example: "John"
 *                 token:
 *                   type: string
 *                   description: JWT token d'authentification
 *       410:
 *         description: Compte non vérifié (OTP manquant)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Mot de passe trop faible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register/complete", UserControllers_1.completeController);
/**
 * @swagger
 * /api/users/resend-code:
 *   post:
 *     summary: Renvoi du code OTP
 *     description: Envoie un nouveau code OTP par email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Nouveau code envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Nouveau code envoyé par email"
 *                 result:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Utilisateur déjà vérifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/users/resend-code", UserControllers_1.resendCodeController);
/**
 * @swagger
 * /api/check_subscription:
 *   post:
 *     summary: Vérification de l'abonnement utilisateur
 *     description: |
 *       Récupère les informations d'abonnement d'un utilisateur, le plan actif et tous les plans disponibles pour son rôle.
 *       Cette route est utilisée pour afficher les abonnements dans l'interface utilisateur.
 *     tags:
 *       - Subscriptions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionCheckInput'
 *           examples:
 *             example1:
 *               summary: Exemple de requête
 *               value:
 *                 userId: "123"
 *                 societe_id: "456"
 *     responses:
 *       200:
 *         description: Informations d'abonnement récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   type: string
 *                   example: "artisan"
 *                   description: Rôle de l'utilisateur
 *                 type:
 *                   type: string
 *                   example: "membre"
 *                   description: Type de compte
 *                 subscription:
 *                   $ref: '#/components/schemas/Plan'
 *                   description: Plan d'abonnement actif
 *                 plans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Plan'
 *                   description: Liste de tous les plans disponibles pour ce rôle
 *             examples:
 *               successResponse:
 *                 summary: Réponse réussie
 *                 value:
 *                   role: "artisan"
 *                   type: "membre"
 *                   subscription:
 *                     id: "18"
 *                     name: "TPE"
 *                     price: 49
 *                     period: "mois"
 *                     description: "Solution complète pour les artisans"
 *                     features: ["Gestion multi-chantiers", "Facturation professionnelle"]
 *                     popular: true
 *                     color: "#E77131"
 *                     stripe_link: "price_abc123"
 *                   plans:
 *                     - id: "17"
 *                       name: "Gratuit"
 *                       price: 0
 *                       period: "mois"
 *                       description: "Plan de découverte"
 *                       features: ["1 chantier simultané", "Devis simples"]
 *                     - id: "18"
 *                       name: "TPE"
 *                       price: 49
 *                       period: "mois"
 *                       description: "Solution complète pour les artisans"
 *                       features: ["Gestion multi-chantiers", "Facturation professionnelle"]
 *       401:
 *         description: Non authentifié ou utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               userNotFound:
 *                 summary: Membre introuvable
 *                 value:
 *                   success: false
 *                   message: "Membre introuvable"
 *                   error: "Aucun membre correspondant à l'ID fourni"
 *                   statusCode: 401
 *               societeNotFound:
 *                 summary: Société introuvable
 *                 value:
 *                   success: false
 *                   message: "Société introuvable pour ce membre"
 *                   error: "Aucune société correspondant aux critères"
 *                   statusCode: 401
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 summary: Erreur serveur
 *                 value:
 *                   success: false
 *                   message: "Erreur interne serveur"
 *                   error: "Erreur de base de données"
 *                   statusCode: 500
 */
router.post("/check_subscription", CheckSubscriptionControllers_1.CheckSubscription);
/**
 * @swagger
 * /api/registerAnnonceur:
 *   post:
 *     summary: Inscription d'un annonceur
 *     description: Crée un compte annonceur avec envoi d'un code OTP par email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnnonceurRegisterInput'
 *     responses:
 *       201:
 *         description: Inscription réussie
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Email ou SIRET déjà utilisé
 *       422:
 *         description: Email invalide
 *       500:
 *         description: Erreur serveur
 */
router.post("/registerAnnonceur", UserControllers_1.AnnonceurControllers);
/**
 * @swagger
 * /api/registerFournisseur:
 *   post:
 *     summary: Demande de contact fournisseur
 *     description: Enregistre une demande de contact de fournisseur
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FournisseurRegisterInput'
 *     responses:
 *       201:
 *         description: Demande envoyée avec succès
 *       400:
 *         description: Données invalides
 *       422:
 *         description: Email invalide
 *       500:
 *         description: Erreur serveur
 */
router.post("/registerFournisseur", UserControllers_1.FournisseurControllers);
/**
 * @swagger
 * /api/entreprises:
 *   get:
 *     summary: Recherche d'entreprises par SIRET dans la base SIRENE
 *     description: |
 *       Recherche des entreprises dans la base de données SIRENE de l'INSEE à partir d'un numéro SIRET.
 *       Cette API interroge directement l'API officielle de l'INSEE pour obtenir des informations fiables
 *       et à jour sur les entreprises françaises.
 *
 *       **Fonctionnalités :**
 *       - Recherche par numéro SIRET (partiel ou complet)
 *       - Retourne les informations détaillées de l'entreprise
 *       - Données officielles de l'INSEE
 *       - Validation en temps réel des entreprises
 *     tags:
 *       - Companies
 *     parameters:
 *       - in: query
 *         name: siret
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 14
 *           pattern: '^[0-9]+$'
 *         description: |
 *           Numéro SIRET ou début du numéro SIRET (minimum 3 chiffres)
 *
 *           **Format :** 14 chiffres (9 pour SIREN + 5 pour NIC)
 *
 *           **Exemples :**
 *           - Recherche complète : `12345678901234`
 *           - Recherche partielle : `123456789`
 *         example: "123456789"
 *     responses:
 *       200:
 *         description: Liste des entreprises trouvées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nom:
 *                     type: string
 *                     example: "ENTREPRISE EXAMPLE SARL"
 *                     description: Dénomination sociale de l'entreprise
 *                   siren:
 *                     type: string
 *                     example: "123456789"
 *                     description: Numéro SIREN (9 chiffres)
 *                   siret:
 *                     type: string
 *                     example: "12345678901234"
 *                     description: Numéro SIRET complet (14 chiffres)
 *                   activite:
 *                     type: string
 *                     example: "62.01Z"
 *                     description: Code APE/NAF de l'activité principale
 *                   rue:
 *                     type: string
 *                     example: "RUE"
 *                     description: Type de voie (RUE, AVENUE, BOULEVARD, etc.)
 *                   ville:
 *                     type: string
 *                     example: "DE L EXAMPLE"
 *                     description: Libellé de la voie
 *                   cp:
 *                     type: string
 *                     example: "123"
 *                     description: Numéro dans la voie
 *                   libelle:
 *                     type: string
 *                     example: "PARIS"
 *                     description: Libellé de la commune
 *                   type:
 *                     type: string
 *                     example: "RUE"
 *                     description: Type de voie (identique à rue)
 *                   code:
 *                     type: string
 *                     example: "75001"
 *                     description: Code postal
 *                   pays:
 *                     type: string
 *                     example: "FRANCE"
 *                     description: Libellé du pays
 *             examples:
 *               singleResult:
 *                 summary: Une entreprise trouvée
 *                 value:
 *                   - nom: "BOULANGERIE DU CENTRE SARL"
 *                     siren: "123456789"
 *                     siret: "12345678900012"
 *                     activite: "47.11C"
 *                     rue: "RUE"
 *                     ville: "DE LA BOULANGERIE"
 *                     cp: "25"
 *                     libelle: "PARIS"
 *                     type: "RUE"
 *                     code: "75001"
 *                     pays: "FRANCE"
 *               multipleResults:
 *                 summary: Plusieurs entreprises trouvées
 *                 value:
 *                   - nom: "ENTREPRISE A SARL"
 *                     siren: "123456789"
 *                     siret: "12345678900012"
 *                     activite: "62.01Z"
 *                     rue: "AVENUE"
 *                     ville: "DES CHAMPS ELYSEES"
 *                     cp: "123"
 *                     libelle: "PARIS"
 *                     type: "AVENUE"
 *                     code: "75008"
 *                     pays: "FRANCE"
 *                   - nom: "ENTREPRISE B SAS"
 *                     siren: "987654321"
 *                     siret: "98765432100098"
 *                     activite: "70.21Z"
 *                     rue: "BOULEVARD"
 *                     ville: "SAINT GERMAIN"
 *                     cp: "456"
 *                     libelle: "PARIS"
 *                     type: "BOULEVARD"
 *                     code: "75006"
 *                     pays: "FRANCE"
 *               noResults:
 *                 summary: Aucune entreprise trouvée
 *                 value: []
 *       400:
 *         description: Paramètre SIRET invalide ou manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               siretTooShort:
 *                 summary: SIRET trop court
 *                 value:
 *                   success: false
 *                   message: "Veuillez saisir au moins 3 caractères."
 *                   error: "Paramètre siret manquant ou trop court"
 *                   statusCode: 400
 *               invalidFormat:
 *                 summary: Format SIRET invalide
 *                 value:
 *                   success: false
 *                   message: "Le SIRET doit contenir uniquement des chiffres"
 *                   error: "SIRET contient des caractères non numériques"
 *                   statusCode: 400
 *       500:
 *         description: Erreur lors de la recherche dans l'API INSEE
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               inseeApiError:
 *                 summary: Erreur API INSEE
 *                 value:
 *                   success: false
 *                   message: "Erreur lors de la recherche d'entreprises"
 *                   error: "API INSEE indisponible ou clé API invalide"
 *                   statusCode: 500
 *               networkError:
 *                 summary: Erreur réseau
 *                 value:
 *                   success: false
 *                   message: "Erreur lors de la recherche d'entreprises"
 *                   error: "Problème de connexion à l'API INSEE"
 *                   statusCode: 500
 *       502:
 *         description: L'API INSEE est temporairement indisponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       503:
 *         description: Service temporairement indisponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// router.get("/entreprises", SearchCompanies);
exports.default = router;
//# sourceMappingURL=router.js.map