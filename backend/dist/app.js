"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const router_1 = __importDefault(require("./src/routes/router"));
const errorHandler_1 = require("./src/middleware/errorHandler");
dotenv_1.default.config({ path: "./.env" });
const app = (0, express_1.default)();
// "http://127.0.0.1:5500"
// origin: "https://frontend.staging.solutravo-compta.fr",
//https://gilded-sunflower-4c737b.netlify.app/
// const corsOptions: CorsOptions = {
//   origin: "https://gilded-sunflower-4c737b.netlify.app",
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
const allowedOrigins = [
    "https://gilded-sunflower-4c737b.netlify.app",
    "http://localhost:5173",
    "https://frontend.staging.solutravo-compta.fr",
    "http://127.0.0.1:5500",
    "https://staging.solutravo-compta.fr",
    "http://localhost:5174"
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // autorisé
        }
        else {
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
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "public/uploads")));
// Ping route
app.get("/", (_req, res) => {
    res.send("API Solutravo tout pret!!");
});
// Routes API
app.use("/api", router_1.default);
// Middleware global erreurs
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map