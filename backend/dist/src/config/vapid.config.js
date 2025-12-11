"use strict";
/**
 * Configuration VAPID pour Web Push Notifications
 * Version: 4.0
 *
 * Rôle: Configurer web-push avec les clés VAPID
 *
 * VAPID = Voluntary Application Server Identification
 * Permet d'authentifier ton serveur auprès de Google FCM / Mozilla Push
 *
 * IMPORTANT: Les clés doivent être générées UNE SEULE FOIS avec:
 * npx web-push generate-vapid-keys
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VAPID_PUBLIC_KEY = void 0;
const web_push_1 = __importDefault(require("web-push"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Vérification des clés VAPID dans .env
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error('❌ ERREUR CRITIQUE: Clés VAPID manquantes dans .env');
    console.error('');
    console.error('📝 Pour générer les clés VAPID:');
    console.error('   1. npm install -g web-push');
    console.error('   2. npx web-push generate-vapid-keys');
    console.error('   3. Copie les clés dans ton fichier .env');
    console.error('');
    process.exit(1);
}
// Configuration VAPID pour web-push
web_push_1.default.setVapidDetails(`mailto:${process.env.VAPID_EMAIL || 'contact@solutravo.fr'}`, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
console.log('✅ Configuration VAPID chargée');
console.log(`📧 Email VAPID: ${process.env.VAPID_EMAIL}`);
console.log(`🔑 Clé publique: ${process.env.VAPID_PUBLIC_KEY.substring(0, 20)}...`);
// Exporter web-push configuré
exports.default = web_push_1.default;
// Exporter aussi la clé publique pour les endpoints API
exports.VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
//# sourceMappingURL=vapid.config.js.map