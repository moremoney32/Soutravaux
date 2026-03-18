
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



// import express, { Application, NextFunction, Request, Response} from "express";
// import dotenv from "dotenv";
// import path from "path";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import routes from "./src/routes/router";
// import {errorHandler} from "./src/middleware/errorHandler";

// dotenv.config({ path: "./.env" });
// const app: Application = express();

// // ✅ CORS OUVERT
// const corsOptions = {
//   origin: '*',
//   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
//   credentials: false,
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
//   optionsSuccessStatus: 204
// };

// app.use(cors(corsOptions));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // ═══════════════════════════════════════════════════════════
// // ✅ NOUVEAU : MIDDLEWARE DE LOGGING - AJOUTER ICI
// // ═══════════════════════════════════════════════════════════
// app.use((req: Request, res: Response, next: NextFunction) => {
//   const timestamp = new Date().toISOString();
//   console.log('═══════════════════════════════════════════════════════════');
//   console.log(`📥 ${timestamp}`);
//   console.log(`${req.method} ${req.url}`);
//   console.log('Headers:', {
//     'content-type': req.headers['content-type'],
//     'origin': req.headers['origin'],
//     'user-agent': req.headers['user-agent']
//   });
  
//   if (Object.keys(req.query).length > 0) {
//     console.log('Query params:', req.query);
//   }
  
//   if (Object.keys(req.body).length > 0) {
//     console.log('Body:', req.body);
//   }
  
//   console.log('═══════════════════════════════════════════════════════════');
  
//   // Logger la réponse aussi
//   const originalSend = res.send;
//   res.send = function(data: any) {
//     console.log(`📤 Response ${req.method} ${req.url} - Status: ${res.statusCode}`);
//     if (res.statusCode >= 400) {
//       console.log('Response body:', data);
//     }
//     return originalSend.call(this, data);
//   };
  
//   next();
// });

// app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
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

// app.get('/health', (_req: Request, res: Response) =>{
//   res.json({ 
//     status: 'OK', 
//     message: 'Scraper API is running',
//     timestamp: new Date().toISOString()
//   });
// });

// app.get("/api/config", (_req: Request, res: Response) => {
//   res.json({
//     success: true,
//     message: "Configuration API Solutravo",
//   });
// });

// // Routes API
// app.use("/api", routes);

// // ✅ FORCE les headers CORS même après les routes
// app.use((req: Request, res: Response, next: NextFunction): void => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
//   if (req.method === 'OPTIONS') {
//     res.sendStatus(204);
//     return;
//   }
//   next();
// });

// // ✅ MODIFIER : Error handler avec PLUS de logs
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   console.error('═══════════════════════════════════════════════════════════');
//   console.error('❌❌❌ ERROR HANDLER TRIGGERED');
//   console.error('URL:', req.method, req.url);
//   console.error('Error:', err);
//   console.error('Message:', err.message);
//   console.error('Stack:', err.stack);
//   console.error('═══════════════════════════════════════════════════════════');
  
//   errorHandler(err, req, res, next);
// });

// export default app;