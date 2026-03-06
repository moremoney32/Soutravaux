
import express, { Application, NextFunction, Request, Response} from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./src/routes/router";
import {errorHandler} from "./src/middleware/errorHandler";

dotenv.config({ path: "./.env" });
const app: Application = express();

// ✅ CORS OUVERT - Accepte TOUTES les origines
const corsOptions = {
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: false,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Exposer les PDFs générés pour téléchargement
app.use('/pdfs', express.static(path.join(process.cwd(), 'storage', 'pdfs')));
app.use('/pieces-jointes', express.static(path.join(process.cwd(), 'storage', 'pieces_jointes')));

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: `API Solutravo ${process.env.NODE_ENV} - Opérationnelle`,
    environment: process.env.NODE_ENV,
    endpoints: {
      config: "/api/config",
      plans: "/api/plans",
      features: "/api/features",
      upload: "/api/upload"
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (_req: Request, res: Response) =>{
  res.json({ 
    status: 'OK', 
    message: 'Scraper API is running',
    timestamp: new Date().toISOString()
  });
});

// Route de configuration pour le frontend
app.get("/api/config", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Configuration API Solutravo",
  });
});

// Routes API
app.use("/api", routes);

// ✅ FORCE les headers CORS même après les routes
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return; // ✅ Return explicite après sendStatus
  }
  next();
});

app.use(errorHandler);

export default app;