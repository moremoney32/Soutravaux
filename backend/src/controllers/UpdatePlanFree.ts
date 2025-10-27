
import { Request, Response } from "express";
import pool from "../config/db";

const UpdatePlanFree =  async (req: Request, res: Response) => {
    const {societe_id, plan_id} = req.body;;
    console.log("Received plan_id:", plan_id);

  try {
    
    // Mettre à jour la société avec planId = 17 (plan gratuit)
    await pool.query(
      "UPDATE societes SET planId = ? WHERE id = ?",
      [17, societe_id]  // 17 = ID du plan gratuit
    );
    
    res.json({ 
      success: true, 
      message: "Abonnement mis à jour vers gratuit" 
    });
  } catch (error) {
    console.error("Erreur downgrade:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
export default UpdatePlanFree;