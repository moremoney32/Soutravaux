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

import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

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
webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'contact@solutravo.fr'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

console.log('✅ Configuration VAPID chargée');
console.log(`📧 Email VAPID: ${process.env.VAPID_EMAIL}`);
console.log(`🔑 Clé publique: ${process.env.VAPID_PUBLIC_KEY.substring(0, 20)}...`);

// Exporter web-push configuré
export default webpush;

// Exporter aussi la clé publique pour les endpoints API
export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;