"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = exports.createPlan = exports.updatePlan = exports.GetPlansByRole = exports.deletePlan = void 0;
const db_1 = __importDefault(require("../config/db"));
// DELETE - Supprimer un plan
const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        // Vérifie si le plan existe
        const [rows] = await db_1.default.query("SELECT * FROM plans WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Plan introuvable" });
        }
        // Vérifier si le plan est utilisé par des sociétés
        const [societeRows] = await db_1.default.query("SELECT COUNT(*) as count FROM societes WHERE plan_id = ?", [id]);
        if (societeRows[0].count > 0) {
            return res.status(400).json({
                error: "Impossible de supprimer ce plan car il est utilisé par des sociétés"
            });
        }
        // Supprime le plan
        await db_1.default.query("DELETE FROM plans WHERE id = ?", [id]);
        return res.json({
            message: "Plan supprimé avec succès",
            deletedId: id
        });
    }
    catch (err) {
        console.error("Erreur suppression plan:", err);
        return res.status(500).json({ error: "Erreur serveur lors de la suppression" });
    }
};
exports.deletePlan = deletePlan;
const GetPlansByRole = async (req, res) => {
    try {
        const { role } = req.query;
        const [rows] = await db_1.default.query("SELECT * FROM plans WHERE role = ?", [role]);
        // Parser tous les champs JSON
        const plansParsed = rows.map((p) => ({
            ...p,
            features: typeof p.features === "string" ? JSON.parse(p.features) : p.features,
            key_benefits: typeof p.key_benefits === "string" ? JSON.parse(p.key_benefits) : p.key_benefits,
            detailed_features: typeof p.detailed_features === "string" ? JSON.parse(p.detailed_features) : p.detailed_features
        }));
        res.json(plansParsed);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors du chargement des plans" });
    }
};
exports.GetPlansByRole = GetPlansByRole;
const updatePlan = async (req, res) => {
    try {
        const { id, name, price, period, description, features, popular, color, stripe_link, subtitle, target_audience, key_benefits, detailed_features, why_choose, icon_name, gradient } = req.body;
        await db_1.default.query(`UPDATE plans 
       SET name=?, price=?, period=?, description=?, features=?, popular=?, color=?, stripe_link=?,
           subtitle=?, target_audience=?, key_benefits=?, detailed_features=?, why_choose=?, icon_name=?, gradient=?
       WHERE id=?`, [
            name, price, period, description, JSON.stringify(features), popular, color, stripe_link,
            subtitle, target_audience, JSON.stringify(key_benefits), JSON.stringify(detailed_features),
            why_choose, icon_name, gradient, id
        ]);
        res.json({ message: "Plan mis à jour avec succès" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la mise à jour du plan" });
    }
};
exports.updatePlan = updatePlan;
const createPlan = async (req, res) => {
    try {
        const { name, price, period, description, features, popular, color, stripe_link, subtitle, target_audience, key_benefits, detailed_features, why_choose, icon_name, gradient } = req.body;
        const [result] = await db_1.default.query(`INSERT INTO plans (name, price, period, description, features, popular, color, stripe_link,
                          subtitle, target_audience, key_benefits, detailed_features, why_choose, icon_name, gradient)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            name, price, period, description, JSON.stringify(features), popular ? 1 : 0, color, stripe_link,
            subtitle, target_audience, JSON.stringify(key_benefits), JSON.stringify(detailed_features),
            why_choose, icon_name, gradient
        ]);
        res.json({
            message: "Plan créé avec succès",
            plan: {
                id: result.insertId,
                name, price, period, description, features, popular, color, stripe_link,
                subtitle, target_audience, key_benefits, detailed_features, why_choose, icon_name, gradient
            }
        });
    }
    catch (err) {
        console.error("Erreur création plan:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.createPlan = createPlan;
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