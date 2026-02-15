// import express, { Application, Request, Response} from "express";
// import dotenv from "dotenv";
// import path from "path";
// // import cors, { type CorsOptions } from "cors";
// import cors from "cors";

// import cookieParser from "cookie-parser";
// import routes from "./src/routes/router";
// import {errorHandler} from "./src/middleware/errorHandler";
//   //import { setupSwagger } from "./src/config/swagger";
// dotenv.config({ path: "./.env" });
// const app: Application = express();
// const allowedOrigins = [
//   "https://gilded-sunflower-4c737b.netlify.app",
//   "http://localhost:5173",
//   "https://frontend.staging.solutravo-compta.fr",
//   "http://127.0.0.1:5500",
//   "https://staging.solutravo-compta.fr",
//   "http://localhost:5174",
//   "http://localhost:3000",
//   "https://solutravo.zeta-app.fr",
//   "https://authentification-entreprise.solutravo-compta.fr",
//   "https://abonnement.solutravo-compta.fr",
//   "https://auth.solutravo-compta.fr",
//   "https://abonnement.solutravo-app.fr",
//   "https://auth.solutravo-app.fr",
//   "http://localhost:5500",
//   "https://staging.solutravo.zeta-app.fr",
//   "http://localhost"
// ];



// // app.use(cors({
// //   origin: (origin, callback) => {
// //     if (!origin) return callback(null, true);
// //     if (allowedOrigins.includes(origin)) {
// //       return callback(null, true);
// //     }
// //     return callback(new Error('CORS policy: Origin not allowed'));
// //   },
// //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
// //   credentials: true,
// //   allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
// // }));

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(new Error('CORS policy: Origin not allowed'));
//   },
//   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],  // ✅ Ajouter OPTIONS + array
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
//   preflightContinue: false,    // ✅ Laisser cors gérer le preflight
//   optionsSuccessStatus: 204    // ✅ Statut standard pour OPTIONS
// }));
// //kekekk

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// //app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// // Exposer les PDFs générés pour téléchargement (ex: /pdfs/nom.pdf)
// app.use('/pdfs', express.static(path.join(process.cwd(), 'storage', 'pdfs')));
// app.use('/pieces-jointes', express.static(path.join(process.cwd(), 'storage', 'pieces_jointes')));

// app.get("/", (_req: Request, res: Response) => {
//   res.json({
//     success: true,
//     message: `API Solutravo ${process.env.NODE_ENV} - Opérationnelle`,
//     environment: process.env.NODE_ENV,
//     endpoints: {
//       config: "/api/config",
//       plans: "/api/plans",
//       features: "/api/features",
//       upload: "/api/upload"
//     },
//     timestamp: new Date().toISOString()
//   });
// });
// // Health check
// app.get('/health', (_req: Request, res: Response) =>{
//   res.json({ 
//     status: 'OK', 
//     message: 'Scraper API is running',
//     timestamp: new Date().toISOString()
//   });
// });

// //  Route de configuration pour le frontend
// app.get("/api/config", (_req: Request, res: Response) => {
//   res.json({
//     success: true,
//     message: "Configuration API Solutravo",
//   });
// });
// // Routes API
// app.use("/api", routes);

// app.use(errorHandler);


// export default app;



import express, { Application, Request, Response} from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./src/routes/router";
import {errorHandler} from "./src/middleware/errorHandler";

dotenv.config({ path: "./.env" });
const app: Application = express();

// ✅ CORS OUVERT - Accepte TOUTES les origines
app.use(cors({
  origin: '*',  // ← Accepte tout le monde
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: false,  // ← IMPORTANT: Doit être false avec origin: '*'
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 204
}));

// ⚠️ Alternative si tu DOIS utiliser credentials: true
// app.use(cors({
//   origin: true,  // ← Reflète l'origine du client (permissif mais pas *)
//   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
//   optionsSuccessStatus: 204
// }));

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

app.use(errorHandler);

export default app;
