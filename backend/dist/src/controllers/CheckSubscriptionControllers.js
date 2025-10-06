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
        const plansParsed = plans.map((p) => ({
            ...p,
            features: typeof p.features === "string" ? JSON.parse(p.features) : p.features
        }));
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
// export const CheckSubscription = async (req: Request, res: Response) => {
//   try {
//      const { userId } = req.body; 
//     if (!userId) {
//       return res.status(400).json({ error: "userId manquant dans la requête" });
//     }
//     // Vérifier le membre
//     const [membreRows]: any = await pool.query(
//       "SELECT id, type, ref FROM membres WHERE id = ?",
//       [userId]
//     );
//     const authHeader = req.headers?.authorization;
//     if (!authHeader) return res.status(401).json({ error: "Token manquant" });
//     const token = authHeader.split(" ")[1];
//     const decoded: any = jwt.verify(token, process.env.secretKey!);
//     // Vérifier le membre
//     const [membreRows]: any = await pool.query(
//   "SELECT id, type, ref FROM membres WHERE id = ?",
//   [decoded.userId]
// );
//     if (membreRows.length === 0) {
//       return res.status(401).json({ error: "Utilisateur introuvable" });
//     }
//      const membre = membreRows[0];
// //     const [societeRows]: any = await pool.query(
// //   "SELECT id, role FROM presocietes WHERE membre_id = ?",
// //   [membre.id]
// // );
//     // Vérifier la société liée
//     const [societeRows]: any = await pool.query(
//   "SELECT id, role FROM societes WHERE refmembre = ?",
//   [membre.ref]
// );
//     if (societeRows.length === 0) {
//       return res.status(401).json({ error: "Société introuvable" });
//     }
//     const societe = societeRows[0];
// Vérifier la souscription active
//     const [subRows]: any = await pool.query(
//       `SELECT s.id, s.status, p.id as planId, p.name as planName, p.price, p.is_default
//        FROM subscriptions s
//        JOIN plans p ON p.id = s.plan_id
//        WHERE s.societe_id = ? AND s.status = 'active'`,
//       [societe.id]
//     );
//     // 3. Récupérer la souscription active et le plan
// const [subRows]: any = await pool.query(
//   `SELECT s.id AS subscription_id, s.status, p.id AS plan_id, p.name AS plan_name, p.price, p.is_default
//    FROM subscriptions s
//    JOIN plans p ON p.id = s.plan_id
//    WHERE s.refmembre = ? AND s.status = 'active'`,
//   [membre.ref]
// );
//     const subscription = subRows.length > 0 ? subRows[0] : null;
//     // Récupérer tous les plans disponibles pour ce rôle
//     const [plans]: any = await pool.query(
//       "SELECT * FROM plans WHERE role = ?",
//       [societe.role]
//     );
// const plansParsed = plans.map((p: any) => ({
//   ...p,
//   features: typeof p.features === "string" 
//     ? JSON.parse(p.features) 
//     : p.features
// }));
// // "https://solutravo.zeta-app.fr/subscription",
//     return res.json({
//     //   redirectUrl: "https://frontend.staging.solutravo-compta.fr/subscription",
//     redirectUrl:"http://localhost:5174/subscription",
//       role: societe.role,
//       type: membre.type,
//       subscription,      // le plan actif
//       plans: plansParsed // tous les plans pour affichage
//     });
//   } catch (err) {
//     console.error(err);
//     //  return res.status(500).json({ error: "Erreur interne serveur" });
//     return res.status(401).json({ error: "Token invalide" });
//   }
// };
//# sourceMappingURL=CheckSubscriptionControllers.js.map