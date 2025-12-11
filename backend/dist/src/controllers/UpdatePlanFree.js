"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const UpdatePlanFree = async (req, res) => {
    const { societe_id, plan_id } = req.body;
    ;
    console.log("Received plan_id:", plan_id);
    const societeId = parseInt(societe_id);
    const planId = parseInt(plan_id);
    try {
        // Mise à jour la société avec planId 
        await db_1.default.query("UPDATE societes SET plan_id = ? WHERE id = ?", [planId, societeId]);
        res.json({
            success: true,
            message: "Abonnement mis à jour vers gratuit"
        });
    }
    catch (error) {
        console.error("Erreur downgrade:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.default = UpdatePlanFree;
//# sourceMappingURL=UpdatePlanFree.js.map