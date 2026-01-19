"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_AGENTS = void 0;
exports.getRandomUserAgent = getRandomUserAgent;
exports.getRandomDelay = getRandomDelay;
exports.waitRandomDelay = waitRandomDelay;
/**
 * 🛡️ USER-AGENTS POUR ROTATION
 * Prévient la détection par Google
 */
exports.USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];
/**
 * Obtenir un user-agent aléatoire
 */
function getRandomUserAgent() {
    return exports.USER_AGENTS[Math.floor(Math.random() * exports.USER_AGENTS.length)];
}
/**
 * Délai aléatoire (anti-bot)
 */
function getRandomDelay(min = 300, max = 1500) {
    return Math.random() * (max - min) + min;
}
/**
 * Attendre avec délai aléatoire
 */
async function waitRandomDelay(min = 300, max = 1500) {
    const delay = getRandomDelay(min, max);
    await new Promise(resolve => setTimeout(resolve, delay));
}
//# sourceMappingURL=userAgentsRotation.js.map