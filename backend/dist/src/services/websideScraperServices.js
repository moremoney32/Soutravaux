"use strict";
// src/services/websideScraperServices.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeBrowserPool = closeBrowserPool;
exports.scrapeEmailFromWebsite = scrapeEmailFromWebsite;
exports.scrapeGerantFromWebsite = scrapeGerantFromWebsite;
const playwright_1 = require("playwright");
const parralel_1 = require("./parralel");
// Pool global de navigateurs (max 5)
let browserPool = [];
const MAX_BROWSERS = 5;
/**
 * Obtenir un navigateur du pool (ou en créer un nouveau)
 */
async function getBrowserFromPool() {
    if (browserPool.length < MAX_BROWSERS) {
        const browser = await playwright_1.chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        browserPool.push(browser);
        console.log(`🌐 Navigateur créé (${browserPool.length}/${MAX_BROWSERS})`);
        return browser;
    }
    // Réutiliser un navigateur aléatoire
    return browserPool[Math.floor(Math.random() * browserPool.length)];
}
/**
 * Fermer tous les navigateurs du pool
 */
async function closeBrowserPool() {
    console.log(`🔒 Fermeture de ${browserPool.length} navigateurs...`);
    await Promise.all(browserPool.map(b => b.close().catch(() => { })));
    browserPool = [];
}
/**
 * Scraper email depuis un site web
 */
async function scrapeEmailFromWebsite(url) {
    if (!url)
        return undefined;
    return (0, parralel_1.retryAsync)(async () => {
        console.log(`📧 Recherche email: ${url}`);
        const browser = await getBrowserFromPool();
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'
        });
        const page = await context.newPage();
        try {
            // Aller sur le site
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 8000
            }).catch(() => null);
            // Chercher page contact
            const contactLinks = await page.$$eval('a', (links) => links
                .filter((a) => {
                const text = a.textContent?.toLowerCase() || '';
                const href = a.href.toLowerCase();
                return text.includes('contact') ||
                    href.includes('contact') ||
                    href.includes('nous-contacter');
            })
                .map((a) => a.href));
            // Aller sur page contact
            if (contactLinks.length > 0) {
                await page.goto(contactLinks[0], {
                    waitUntil: 'domcontentloaded',
                    timeout: 8000
                }).catch(() => null);
            }
            // Extraire email
            const pageContent = await page.content();
            const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}/g;
            const emails = pageContent.match(emailRegex);
            await context.close();
            if (emails && emails.length > 0) {
                const validEmail = emails.find((email) => !email.includes('example.com') &&
                    !email.includes('domain.com') &&
                    !email.includes('yoursite.com') &&
                    !email.includes('sentry.io') &&
                    !email.includes('facebook.com') &&
                    !email.includes('google.com'));
                if (validEmail) {
                    console.log(`Email trouvé: ${validEmail}`);
                    return validEmail;
                }
            }
            return undefined;
        }
        catch (error) {
            await context.close().catch(() => { });
            throw error;
        }
    }, 2, 500);
}
/**
 * Scraper nom gérant depuis un site web
 */
async function scrapeGerantFromWebsite(url) {
    if (!url)
        return undefined;
    return (0, parralel_1.retryAsync)(async () => {
        console.log(`👤 Recherche gérant: ${url}`);
        const browser = await getBrowserFromPool();
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 8000
            }).catch(() => null);
            const pageText = await page.evaluate(() => document.body.innerText);
            const patterns = [
                /Gérant\s*:\s*([A-ZÀ-Ÿ][a-zà-ÿ]+\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)/i,
                /Dirigeant\s*:\s*([A-ZÀ-Ÿ][a-zà-ÿ]+\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)/i,
                /Fondateur\s*:\s*([A-ZÀ-Ÿ][a-zà-ÿ]+\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)/i,
                /Président\s*:\s*([A-ZÀ-Ÿ][a-zà-ÿ]+\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)/i
            ];
            for (const pattern of patterns) {
                const match = pageText.match(pattern);
                if (match && match[1]) {
                    console.log(`Gérant trouvé: ${match[1]}`);
                    await context.close();
                    return match[1];
                }
            }
            await context.close();
            return undefined;
        }
        catch (error) {
            await context.close().catch(() => { });
            throw error;
        }
    }, 2, 500);
}
//# sourceMappingURL=websideScraperServices.js.map