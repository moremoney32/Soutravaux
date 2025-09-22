import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import routes from "./src/routes/router";

// Charger les variables d’env
dotenv.config({ path: "./.env" });

const app: Application = express();

// CORS
const corsOptions: CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Custom-Header"
  ],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Ping route
app.get("/", (_req: Request, res: Response) => {
  res.send("API Solutravo en marche !");
});

// Routes API
app.use("/api", routes);

// Gestion erreurs
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌", err);
  res
    .status(err.statusCode || 500)
    .json({ error: err.message || "Erreur serveur" });
});

export default app;
