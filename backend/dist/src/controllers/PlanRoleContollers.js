"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = exports.deletePlan = exports.createPlan = exports.updatePlan = exports.GetPlansByRole = void 0;
const db_1 = __importDefault(require("../config/db"));
const GetPlansByRole = async (req, res) => {
    try {
        const { role } = req.query;
        const [rows] = await db_1.default.query("SELECT * FROM plans WHERE role = ?", [role]);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors du chargement des plans" });
    }
};
exports.GetPlansByRole = GetPlansByRole;
const updatePlan = async (req, res) => {
    try {
        const { id, name, price, period, description, features, popular, color, stripe_link } = req.body;
        await db_1.default.query(`UPDATE plans 
       SET name=?, price=?, period=?, description=?, features=?, popular=?, color=?, stripe_link=?
       WHERE id=?`, [name, price, period, description, JSON.stringify(features), popular, color, stripe_link, id]);
        res.json({ message: "Plan mis à jour avec succès" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la mise à jour du plan" });
    }
};
exports.updatePlan = updatePlan;
// controllers/PlanRoleControllers.ts
const createPlan = async (req, res) => {
    try {
        const { name, price, period, description, features, popular, color, stripe_link } = req.body;
        const [result] = await db_1.default.query(`INSERT INTO plans (name, price, period, description, features, popular, color, stripe_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [name, price, period, description, JSON.stringify(features), popular ? 1 : 0, color, stripe_link]);
        res.json({
            message: "Plan créé avec succès",
            plan: {
                id: result.insertId,
                name,
                price,
                period,
                description,
                features,
                popular,
                color,
                stripe_link
            }
        });
    }
    catch (err) {
        console.error("Erreur création plan:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.createPlan = createPlan;
// DELETE /api/plans/:id
const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        // Vérifie si le plan existe
        const [rows] = await db_1.default.query("SELECT * FROM plans WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Plan introuvable" });
        }
        // Supprime le plan
        await db_1.default.query("DELETE FROM plans WHERE id = ?", [id]);
        return res.json({ message: "Plan supprimé avec succès" });
    }
    catch (err) {
        console.error("Erreur suppression plan:", err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.deletePlan = deletePlan;
//Récupérer les settings
const getSettings = async (_req, res) => {
    try {
        const [rows] = await db_1.default.query("SELECT hero_title, hero_subtitle FROM settings LIMIT 1");
        console.log("Résultat DB:", rows);
        if (Array.isArray(rows) && rows.length > 0) {
            res.json(rows[0]);
        }
        else {
            res.json({ hero_title: "", hero_subtitle: "" });
        }
    }
    catch (err) {
        res.status(500).json({ error: "Erreur récupération des settings" });
    }
};
exports.getSettings = getSettings;
// Mettre à jour les settings
const updateSettings = async (req, res) => {
    const { hero_title, hero_subtitle } = req.body;
    try {
        await db_1.default.query("UPDATE settings SET hero_title=?, hero_subtitle=? WHERE id=1", [hero_title, hero_subtitle]);
        res.json({ message: "Settings mis à jour avec succès" });
    }
    catch (err) {
        res.status(500).json({ error: "Erreur mise à jour des settings" });
    }
};
exports.updateSettings = updateSettings;
//# sourceMappingURL=PlanRoleContollers.js.map