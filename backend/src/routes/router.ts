import express, { Router } from "express";
import { AnnonceurControllers, FournisseurControllers, UserControllers, UserControllersVerifyCode,completeController, resendCodeController } from "../controllers/UserControllers";
import { SearchCompanies } from "../controllers/CompanyController";
import { createPlan, deletePlan, GetPlansByRole, getSettings, updatePlan, updateSettings } from "../controllers/PlanRoleContollers";
 import { CheckSubscription } from "../controllers/CheckSubscriptionControllers";

const router: Router = express.Router();

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


// router.post("/register", UserControllers);
router.post("/registerAnnonceur",AnnonceurControllers);
router.post("/registerFournisseur", FournisseurControllers);
// router.post("/verifyCode", UserControllersVerifyCode);
 router.post("/check_subscription", CheckSubscription);
// router.post("/register/complete", completeController);
// router.post("/users/resend-code", resendCodeController);
router.get("/entreprises", SearchCompanies);
router.get("/plans", GetPlansByRole);
router.put("/plans/:id", updatePlan);
router.post("/plans", createPlan);
router.delete("/plans/:id", deletePlan);
router.put("/subscription-settings", updateSettings);
router.get("/subscription-settings", getSettings);


export default router;
