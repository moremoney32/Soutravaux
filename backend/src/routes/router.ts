import express, { Router } from "express";
import { Request, Response} from "express";
import { AnnonceurControllers, FournisseurControllers, UserControllers, UserControllersVerifyCode,completeController, resendCodeController } from "../controllers/UserControllers";
import { SearchCompanies } from "../controllers/CompanyController";
import { createPlan, deletePlan, GetPlansByRole, getSettings, updatePlan, updateSettings } from "../controllers/PlanRoleContollers";
 import { CheckSubscription } from "../controllers/CheckSubscriptionControllers";
 import {
  getAllPlansController,
  getPlansByRoleController,
  getPlanByIdController,
  getAllFeaturesController,
  getFeaturesByPageController,
  createFeatureController,
  updateFeatureController,
  deleteFeatureController,
  getPlanFeaturesController,
  addFeatureToPlanController,
  removeFeatureFromPlanController,
  syncPlanFeaturesController,
  getPlansByFeatureController,
  getFeaturesByRoleController
} from '../controllers/featuresControllers';
// import { scrapeGoogleMapsController } from "../controllers/ScraperController";
import UpdatePlanFree from "../controllers/UpdatePlanFree";
import handleImageUpload from "../middleware/uploadMiddleware";
import { getActivitesController, getDepartementsController, getPreSocietesController, getSocietesController, getStatsController, sendNotificationController } from "../controllers/PushNotificationsControllers";
import sseRoutes from './sse.routes';
// import { scrapeGoogleMapsController } from "../controllers/ScraperControllerOptimized";
import { countContactsController, getContactListByIdController, getContactListsController, getContactsFromListsController, getPhoneNumbersController } from "../controllers/ContactListController";
import { createCategoryController,  createEventController,  deleteEventController, getAttendeesController, getCategoriesController, getEventsController, inviteAttendeesController, respondToInviteController, updateEventController } from "../controllers/CalendarController";
import { getCollaboratorsBySocieteController, checkCollaboratorController, getSocietesByMemberController, assignCollaboratorController, removeCollaboratorController } from "../controllers/CollaboratorsController";
import { createDemandeController, downloadPDFController, getDemandeByIdController, getDemandesController, getFournisseursController, getProduitsController } from "../controllers/DemandesPrixControllers";

const router: Router = express.Router();
router.use('/sse', sseRoutes);

router.post("/register", UserControllers);
router.post("/registerAnnonceur",AnnonceurControllers);
router.post("/registerFournisseur", FournisseurControllers);
router.post("/verifyCode", UserControllersVerifyCode);
 router.post("/check_subscription", CheckSubscription);
router.post("/register/complete", completeController);
router.post("/users/resend-code", resendCodeController);

router.get("/entreprises", SearchCompanies);
router.get("/plans", GetPlansByRole);
router.put("/plans/:id", updatePlan);
router.post("/plans", createPlan);
router.delete("/plans/:id", deletePlan);
router.put("/subscription-settings", updateSettings);
router.get("/subscription-settings", getSettings);
router.post("/downgrade-to-free", UpdatePlanFree);
// router.post("/google-maps", scrapeGoogleMapsController);


// GET - Récupérer toutes les listes d'une société avec compteur
router.get('/contact-lists/societe/:societeId', getContactListsController);

// GET - Récupérer une liste spécifique avec ses contacts
router.get('/contact-lists/:listId/societe/:societeId', getContactListByIdController);

// POST - Récupérer numéros de téléphone de plusieurs listes (pour campagne SMS)
router.post('/contact-lists/phone-numbers', getPhoneNumbersController);

// POST - Récupérer contacts complets de plusieurs listes
router.post('/contact-lists/contacts', getContactsFromListsController);

// POST - Compter contacts totaux de plusieurs listes
router.post('/contact-lists/count', countContactsController);



// ROUTES - PLANS


/**
 * @route   GET /api/admin/plans
 * @desc    Récupérer tous les plans
 * @access  Private/Admin
 */
router.get('/plans', getAllPlansController);

/**
 * @route   GET /api/admin/plans/by-role
 * @desc    Récupérer les plans par rôle
 * @access  Private/Admin
 */
router.get('/plans/by-role', getPlansByRoleController);

/**
 * @route   GET /api/admin/plans/:id
 * @desc    Récupérer un plan par ID
 * @access  Private/Admin
 */
router.get('/plans/:id', getPlanByIdController);

// ============================================
// ROUTES - FEATURES
// ============================================

/**
 * @route   GET /api/admin/features
 * @desc    Récupérer toutes les fonctionnalités
 * @access  Private/Admin
 */
router.get('/features', getAllFeaturesController);

/**
 * @route   GET /api/admin/features/by-page
 * @desc    Récupérer les fonctionnalités par page
 * @access  Private/Admin
 */
router.get('/features/by-page', getFeaturesByPageController);

/**
 * @route   POST /api/admin/features
 * @desc    Créer une nouvelle fonctionnalité
 * @access  Private/Admin
 */
router.post('/features', createFeatureController);

/**
 * @route   PUT /api/admin/features/:id
 * @desc    Mettre à jour une fonctionnalité
 * @access  Private/Admin
 */
router.put('/features/:id', updateFeatureController);

/**
 * @route   DELETE /api/admin/features/:id
 * @desc    Supprimer une fonctionnalité
 * @access  Private/Admin
 */
router.delete('/features/:id', deleteFeatureController);

// ============================================
// ROUTES - FEATURE-PLAN ASSOCIATIONS
// ============================================

/**
 * @route   GET /api/admin/plans/:planId/features
 * @desc    Récupérer les fonctionnalités d'un plan avec statut
 * @access  Private/Admin
 */
router.get('/plans/:planId/features', getPlanFeaturesController);

/**
 * @route   POST /api/admin/plans/:planId/features/sync
 * @desc    Synchroniser les fonctionnalités d'un plan
 * @access  Private/Admin
 */
router.post('/plans/:planId/features/sync', syncPlanFeaturesController);

/**
 * @route   POST /api/admin/features/:featureId/plans/:planId
 * @desc    Ajouter une fonctionnalité à un plan
 * @access  Private/Admin
 */
router.post('/features/:featureId/plans/:planId', addFeatureToPlanController);

/**
 * @route   DELETE /api/admin/features/:featureId/plans/:planId
 * @desc    Retirer une fonctionnalité d'un plan
 * @access  Private/Admin
 */
router.delete('/features/:featureId/plans/:planId', removeFeatureFromPlanController);

/**
 * @route   GET /api/admin/features/:featureId/plans
 * @desc    Récupérer les plans associés à une fonctionnalité
 * @access  Private/Admin
 */
router.get('/features/:featureId/plans', getPlansByFeatureController);
router.get('/features/by-role', getFeaturesByRoleController);
router.get("/presocietes",getPreSocietesController);
router.get("/societes",getSocietesController);
router.get("/activites",getActivitesController);
router.get("/departements",getDepartementsController);
router.get("/stats",getStatsController);
router.post("/send",sendNotificationController);

router.post('/upload', handleImageUpload, (req: Request, res: Response) => {
  const url = (req as any).fileUrl;
  
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
router.get('/calendar/events', getEventsController);/*fff***/

// POST /api/calendar/events - Créer événement
router.post('/calendar/events', createEventController);

// router.post('/calendar/events', (_req,res)=>{
//   console.log("🔥 ROUTE DIRECTE TOUCHÉE");
//   res.json({ok:true});
// });

// PUT /api/calendar/events/:eventId - Modifier événement
router.put('/calendar/events/:eventId', updateEventController);

// DELETE /api/calendar/events/:eventId - Supprimer événement
router.delete('/calendar/events/:eventId', deleteEventController);

// GET /api/calendar/events/:eventId/attendees - Récupérer participants
router.get('/calendar/events/:eventId/attendees', getAttendeesController);

// POST /api/calendar/events/:eventId/invite - Inviter sociétés
router.post('/calendar/events/:eventId/invite', inviteAttendeesController);

// POST /api/calendar/events/:eventId/respond - Répondre invitation
router.post('/calendar/events/:eventId/respond', respondToInviteController);

// GET /api/calendar/societes - Liste sociétés disponibles (au lieu de artisans)
router.get('/calendar/societes', getPreSocietesController);

router.get('/calendar/categories', getCategoriesController);
router.post('/calendar/categories', createCategoryController);

/**
 * ROUTES COLLABORATEURS
 */

// GET /api/collaborators/:societeId - Récupérer tous les collaborateurs d'une société
router.get('/collaborators/:societeId', getCollaboratorsBySocieteController);

// GET /api/collaborators/check/:memberId/:societeId - Vérifier si un membre est collaborateur
router.get('/collaborators/check/:memberId/:societeId', checkCollaboratorController);

// GET /api/collaborators/member/:memberId - Récupérer les sociétés d'un membre
router.get('/collaborators/member/:memberId', getSocietesByMemberController);

// POST /api/collaborators - Assigner un collaborateur
router.post('/collaborators', assignCollaboratorController);

// DELETE /api/collaborators/:memberId/:societeId - Retirer un collaborateur
router.delete('/collaborators/:memberId/:societeId', removeCollaboratorController);

/**
 * GET /api/demandes-prix
 * Récupérer toutes les demandes d'une société
 * Query params: societe_id, statut?, type_demande?, date_debut?, date_fin?, limit?, offset?
 */
router.get('/demandes-prix', getDemandesController);

/**
 * GET /api/demandes-prix/fournisseurs
 * Récupérer les fournisseurs accessibles
 * Query params: societe_id
 */
router.get('/demandes-prix/fournisseurs', getFournisseursController);

/**
 * GET /api/demandes-prix/produits
 * Récupérer les produits accessibles
 * Query params: societe_id, library_id?, category_id?
 */
router.get('/demandes-prix/produits', getProduitsController);

/**
 * GET /api/demandes-prix/:id
 * Récupérer une demande complète par ID
 * Query params: societe_id
 */
router.get('/demandes-prix/:id', getDemandeByIdController);

/**
 * GET /api/demandes-prix/:id/pdf
 * Télécharger le PDF d'une demande
 * Query params: societe_id
 */
router.get('/demandes-prix/:id/pdf', downloadPDFController);

/**
 * POST /api/demandes-prix
 * Créer une nouvelle demande de prix
 */
router.post('/demandes-prix', createDemandeController);



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
router.post("/register", UserControllers);

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
router.post("/verifyCode", UserControllersVerifyCode);

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
router.post("/register/complete", completeController);
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
router.post("/users/resend-code", resendCodeController);
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
router.post("/check_subscription", CheckSubscription);
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
router.post("/registerAnnonceur", AnnonceurControllers);

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
router.post("/registerFournisseur", FournisseurControllers);

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








export default router;
