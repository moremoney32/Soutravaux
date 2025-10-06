"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./.env" });
const PORT = process.env.PORT || 3000;
app_1.default.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
// DB_HOST=localhost
// DB_USER=root
// DB_PASSWORD=root1993
// DB_NAME=u839546084_solutravo
// DB_PORT=3306
// secretKey=franckmanu18@
// expiresIn=15d
// expiresInn=15d
// COOKIE_MAX_AGE=1296000000
// PORT=3000
// INSEE_API_KEY=09d6f36e-48f3-42be-96f3-6e48f3b2be06
//# sourceMappingURL=server.js.map