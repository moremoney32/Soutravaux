import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

export const CheckSubscription = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token manquant" });

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.secretKey!);

    // Vérifier le membre
    // const [membreRows]: any = await pool.query(
    //   "SELECT id, type FROM membres WHERE id = ?",
    //   [decoded.userId]
    // );
    const [membreRows]: any = await pool.query(
  "SELECT id, type, ref FROM membres WHERE id = ?",
  [decoded.userId]
);

    if (membreRows.length === 0) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }
    const membre = membreRows[0];

    // Vérifier la société liée
    // const [societeRows]: any = await pool.query(
    //   "SELECT id, role FROM societes WHERE membre_id = ?",
    //   [membre.id]
    // );
    const [societeRows]: any = await pool.query(
  "SELECT id, role FROM societes WHERE refmembre = ?",
  [membre.ref]
);
    if (societeRows.length === 0) {
      return res.status(401).json({ error: "Société introuvable" });
    }
    const societe = societeRows[0];

    // Vérifier la souscription active
    const [subRows]: any = await pool.query(
      `SELECT s.id, s.status, p.id as planId, p.name as planName, p.price, p.is_default
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.societe_id = ? AND s.status = 'active'`,
      [societe.id]
    );
    const subscription = subRows.length > 0 ? subRows[0] : null;

    // Récupérer tous les plans disponibles pour ce rôle
    const [plans]: any = await pool.query(
      "SELECT * FROM plans WHERE role = ?",
      [societe.role]
    );

const plansParsed = plans.map((p: any) => ({
  ...p,
  features: typeof p.features === "string" 
    ? JSON.parse(p.features) 
    : p.features
}));
// "https://solutravo.zeta-app.fr/subscription",
    return res.json({
      redirectUrl: "https://frontend.staging.solutravo-compta.fr/subscription",
      role: societe.role,
      type: membre.type,
      subscription,      // le plan actif
      plans: plansParsed // tous les plans pour affichage
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Token invalide" });
  }
};
