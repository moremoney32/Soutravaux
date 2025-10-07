import { Request, Response } from "express";
import pool from "../config/db";
// import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
export const CheckSubscription = async (req: Request, res: Response) => {
    const userId = req.body.userId
    const societe_id =req.body.societe_id

  try {

  console.log("userId:", userId);
  console.log("societe_id:", societe_id);
    // Vérifier le membre
    const [membreRows]: any = await pool.query(
  "SELECT id, type, ref FROM membres WHERE id = ?",
  [userId]
);

    if (membreRows.length === 0) {
      return res.status(401).json({ error: "Membre introuvable" });
    }
    const membre = membreRows[0];

//     // 2 Récupérer la société correspondant à cette ref et societe_id
    const [societeRows]: any = await pool.query(
      "SELECT id, role, plan_id FROM societes WHERE refmembre = ? AND id = ?",
      [membre.ref, societe_id]
    );
    if (societeRows.length === 0) {
      return res.status(401).json({ error: "Société introuvable pour ce membre" });
    }
    const societe = societeRows[0];



// 2️ Récupérer tous les plans disponibles pour ce rôle
const [plans]: any = await pool.query(
  "SELECT * FROM plans WHERE role = ?",
  [societe.role]
);

// 3 Identifier le plan actif à partir du plan_id de la société
let subscription = null;

if (societe.plan_id !== 1) {
  // La société a déjà changé de plan, donc on peut se baser sur plan_id
  subscription = plans.find((p: any) => p.id === societe.plan_id) || null;
} else {
  // La société est encore sur le plan par défaut (Gratuit / Découverte / Essai)
  subscription = plans.find((p: any) => p.is_default === 1) || null;
}

const plansParsed = plans.map((p: any) => ({
  ...p,
  features: typeof p.features === "string" ? JSON.parse(p.features) : p.features
}));
    console.log("https://frontend.staging.solutravo-compta.fr/subscription")

    // 4 Retourner la réponse
    return res.json({
    //   redirectUrl:"https://frontend.staging.solutravo-compta.fr/subscription",
      role: societe.role,
      type: membre.type,
       subscription,      // le plan actif
      plans: plansParsed // plan correspondant au role et plan_id de la société
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur interne serveur" });
  }
};
