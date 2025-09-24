import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("❌ Global Error Handler:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Erreur serveur",
  });
}