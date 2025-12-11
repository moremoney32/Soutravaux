"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// import cors, { type CorsOptions } from "cors";
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const router_1 = __importDefault(require("./src/routes/router"));
const errorHandler_1 = require("./src/middleware/errorHandler");
//import { setupSwagger } from "./src/config/swagger";
dotenv_1.default.config({ path: "./.env" });
const app = (0, express_1.default)();
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
// const corsOptions: CorsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true); // autorisé
//     } else {
//       callback(new Error("CORS non autorisé"));
//     }
//   },
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   allowedHeaders: [
//     "Origin",
//     "X-Requested-With",
//     "Content-Type",
//     "Accept",
//     "Authorization",
//     "Custom-Header"
//   ],
// };
// const getBackendBaseUrl = () => {
//   if (process.env.NODE_ENV === 'production') {
//     return 'https://solutravo.zeta-app.fr';
//   } else {
//     return 'https://staging.solutravo.zeta-app.fr';
//   }
// };
// Middlewares
//  app.use(cors(corsOptions));
app.use((0, cors_1.default)({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: false
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
//app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "public", "uploads")));
app.get("/", (_req, res) => {
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
app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        message: 'Scraper API is running',
        timestamp: new Date().toISOString()
    });
});
//  Route de configuration pour le frontend
app.get("/api/config", (_req, res) => {
    res.json({
        success: true,
        message: "Configuration API Solutravo",
    });
});
// Routes API
app.use("/api", router_1.default);
//swagger
// setupSwagger(app);
// Middleware global erreurs
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map