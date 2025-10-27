
import { Request, Response } from "express";
import pool from "../config/db";

const UpdatePlanFree =  async (req: Request, res: Response) => {
    const {societe_id, plan_id} = req.body;;
    console.log("Received plan_id:", plan_id);
    const societeId = parseInt(societe_id);
        const planId = parseInt(plan_id);

  try {
    
    // Mise à jour la société avec planId 
    await pool.query(
      "UPDATE societes SET plan_id = ? WHERE id = ?",
      [planId, societeId]  
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


