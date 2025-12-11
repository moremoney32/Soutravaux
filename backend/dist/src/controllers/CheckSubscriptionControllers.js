"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckSubscription = void 0;
const db_1 = __importDefault(require("../config/db"));
// import jwt from "jsonwebtoken";
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "../../.env" });
const CheckSubscription = async (req, res) => {
    const userId = req.body.userId;
    const societe_id = req.body.societe_id;
    try {
        console.log("userId:", userId);
        console.log("societe_id:", societe_id);
        // Vérifier le membre
        const [membreRows] = await db_1.default.query("SELECT id, type, ref FROM membres WHERE id = ?", [userId]);
        if (membreRows.length === 0) {
            return res.status(401).json({ error: "Membre introuvable" });
        }
        const membre = membreRows[0];
        //     // 2 Récupérer la société correspondant à cette ref et societe_id
        const [societeRows] = await db_1.default.query("SELECT id, role, plan_id FROM societes WHERE refmembre = ? AND id = ?", [membre.ref, societe_id]);
        if (societeRows.length === 0) {
            return res.status(401).json({ error: "Société introuvable pour ce membre" });
        }
        const societe = societeRows[0];
        // 2️ Récupérer tous les plans disponibles pour ce rôle
        const [plans] = await db_1.default.query("SELECT * FROM plans WHERE role = ?", [societe.role]);
        // 3 Identifier le plan actif à partir du plan_id de la société
        let subscription = null;
        if (societe.plan_id !== 1) {
            // La société a déjà changé de plan, donc on peut se baser sur plan_id
            subscription = plans.find((p) => p.id === societe.plan_id) || null;
        }
        else {
            // La société est encore sur le plan par défaut (Gratuit / Découverte / Essai)
            subscription = plans.find((p) => p.is_default === 1) || null;
        }
        const plansParsed = plans.map((p) => {
            try {
                const parsedPlan = {
                    ...p,
                    features: safeJsonParse(p.features, []),
                    key_benefits: safeJsonParse(p.key_benefits, ['Solution complète', 'Support inclus']),
                    detailed_features: safeJsonParse(p.detailed_features, [{
                            category: 'Fonctionnalités principales',
                            features: safeJsonParse(p.features, [])
                        }])
                };
                console.log(`Plan ${p.name} - features:`, parsedPlan.features?.length || 0, 'éléments');
                console.log(`Plan ${p.name} - key_benefits:`, parsedPlan.key_benefits?.length || 0, 'éléments');
                console.log(`Plan ${p.name} - detailed_features:`, parsedPlan.detailed_features?.length || 0, 'catégories');
                return parsedPlan;
            }
            catch (error) {
                console.error(`Erreur parsing plan ${p.name}:`, error);
                // Retourner le plan avec des valeurs par défaut en cas d'erreur
                return {
                    ...p,
                    features: [],
                    key_benefits: ['Solution complète', 'Support inclus'],
                    detailed_features: [{
                            category: 'Fonctionnalités principales',
                            features: []
                        }]
                };
            }
        });
        console.log("https://frontend.staging.solutravo-compta.fr/subscription");
        // 4 Retourner la réponse
        return res.json({
            //   redirectUrl:"https://frontend.staging.solutravo-compta.fr/subscription",
            role: societe.role,
            type: membre.type,
            subscription, // le plan actif
            plans: plansParsed // plan correspondant au role et plan_id de la société
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur interne serveur" });
    }
};
exports.CheckSubscription = CheckSubscription;
// Fonction helper pour parser JSON 
const safeJsonParse = (str, defaultValue) => {
    if (!str)
        return defaultValue;
    if (typeof str === 'object')
        return str;
    if (typeof str !== 'string')
        return defaultValue;
    try {
        return JSON.parse(str);
    }
    catch (error) {
        console.warn("Erreur parsing JSON:", str, "-> utilisation valeur par défaut");
        return defaultValue;
    }
};
//# sourceMappingURL=CheckSubscriptionControllers.js.map