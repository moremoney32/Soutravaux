import express, { Application, Request, Response} from "express";
import dotenv from "dotenv";
import path from "path";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import routes from "./src/routes/router";
import {errorHandler} from "./src/middleware/errorHandler";
  //import { setupSwagger } from "./src/config/swagger";


dotenv.config({ path: "./.env" });

const app: Application = express();
const allowedOrigins = [
  "https://gilded-sunflower-4c737b.netlify.app",
  "http://localhost:5173",
  "https://frontend.staging.solutravo-compta.fr",
  "http://127.0.0.1:5500",
  "https://staging.solutravo-compta.fr",
   "http://localhost:5174",
   "http://localhost:3000",
   "https://solutravo.zeta-app.fr",
   "https://authentification-entreprise.solutravo-compta.fr",
   "https://abonnement.solutravo-compta.fr",
   "https://auth.solutravo-compta.fr",
   "https://abonnement.solutravo-app.fr"
];


const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // autorisé
    } else {
      callback(new Error("CORS non autorisé"));
    }
  },
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
  res.send("API Solutravo tout pret!!");
});

// Routes API
app.use("/api", routes);

//swagger
  // setupSwagger(app);
// Middleware global erreurs
app.use(errorHandler);



export default app;
