import { Request, Response } from "express";
import pool from "../config/db";

export const GetPlansByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    const [rows]: any = await pool.query("SELECT * FROM plans WHERE role = ?", [role]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du chargement des plans" });
  }
};



export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id, name, price, period, description, features, popular, color, stripe_link } = req.body;

    await pool.query(
      `UPDATE plans 
       SET name=?, price=?, period=?, description=?, features=?, popular=?, color=?, stripe_link=?
       WHERE id=?`,
      [name, price, period, description, JSON.stringify(features), popular, color, stripe_link, id]
    );

    res.json({ message: "Plan mis à jour avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du plan" });
  }
};


// controllers/PlanRoleControllers.ts
export const createPlan = async (req: Request, res: Response) => {
  try {
    const { name, price, period, description, features, popular, color, stripe_link } = req.body;

    const [result]: any = await pool.query(
      `INSERT INTO plans (name, price, period, description, features, popular, color, stripe_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, price, period, description, JSON.stringify(features), popular ? 1 : 0, color, stripe_link]
    );

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
  } catch (err) {
    console.error("Erreur création plan:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


// DELETE /api/plans/:id
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifie si le plan existe
    const [rows]: any = await pool.query("SELECT * FROM plans WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Plan introuvable" });
    }

    // Supprime le plan
    await pool.query("DELETE FROM plans WHERE id = ?", [id]);

    return res.json({ message: "Plan supprimé avec succès" });
  } catch (err) {
    console.error("Erreur suppression plan:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

//Récupérer les settings
export const getSettings = async (_req: Request, res: Response)  => {
  try {
    const [rows] = await pool.query("SELECT hero_title, hero_subtitle FROM settings LIMIT 1");
    console.log("Résultat DB:", rows);
    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ hero_title: "", hero_subtitle: "" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération des settings" });
  }
};

// Mettre à jour les settings
export const updateSettings = async (req: Request, res: Response) => {
  const { hero_title, hero_subtitle } = req.body;
  try {
    await pool.query(
      "UPDATE settings SET hero_title=?, hero_subtitle=? WHERE id=1",
      [hero_title, hero_subtitle]
    );
    res.json({ message: "Settings mis à jour avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Erreur mise à jour des settings" });
  }
};


