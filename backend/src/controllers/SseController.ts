import { addSseConnection } from "../services/SseServices";
import { Request, Response } from 'express';

export async function connectSse(req: Request, res: Response): Promise<void> {
  const userId = req.query.userId as string;

  if (!userId) {
    res.status(400).json({
      success: false,
      message: 'userId est requis'
    });
    return;
  }

  console.log(`🔌 SSE: Connexion demandée par user ${userId}`);
  addSseConnection(userId, res);
}