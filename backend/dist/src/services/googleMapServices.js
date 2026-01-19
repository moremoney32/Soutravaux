"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBrowser = initBrowser;
exports.scrapeGoogleMapsWithOffset = scrapeGoogleMapsWithOffset;
exports.closeBrowser = closeBrowser;
const playwright_1 = require("playwright");
const userAgentsRotation_1 = require("./userAgentsRotation");
async function initBrowser() {
    console.log('Initialisation du navigateur...');
    const browser = await playwright_1.chromium.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled'
        ]
    });
    console.log('Navigateur lancé');
    return browser;
}
// ============================================
// ACCEPTER LES COOKIES GOOGLE (VERSION RAPIDE)
// ============================================
async function acceptGoogleCookiesFast(page) {
    try {
        // STRATÉGIE 1 : Attendre TOUS les sélecteurs en PARALLÈLE (race)
        const clicked = await Promise.race([
            // Sélecteurs les plus courants en premier
            page.click('button:has-text("Tout accepter")', { timeout: 2000 }).then(() => true),
            page.click('button:has-text("Accept all")', { timeout: 2000 }).then(() => true),
            page.click('#L2AGLb', { timeout: 2000 }).then(() => true),
            page.click('button[aria-label*="Accept"]', { timeout: 2000 }).then(() => true),
            // Timeout global de 2 secondes
            new Promise(resolve => setTimeout(() => resolve(false), 2000))
        ]).catch(() => false);
        if (clicked) {
            console.log('Cookies acceptés');
            await page.waitForTimeout(500); //Réduit de 2s à 0.5s
        }
        else {
            console.log('Pas de popup cookies');
        }
    }
    catch (error) {
        // Silencieux, on continue
    }
}
async function checkIfBlocked(page) {
    const blockedIndicators = await page.evaluate(() => {
        const bodyText = document.body.innerText.toLowerCase();
        return {
            hasCaptcha: !!document.querySelector('#captcha') || bodyText.includes('captcha'),
            has403: bodyText.includes('403') || bodyText.includes('forbidden'),
            has429: bodyText.includes('429') || bodyText.includes('too many requests'),
            hasBlocked: bodyText.includes('blocked') || bodyText.includes('access denied')
        };
    });
    return Object.values(blockedIndicators).some(v => v === true);
}
async function scrollToLoadResults(page, targetCount) {
    const feedSelector = 'div[role="feed"]';
    let scrollAttempts = 0;
    let previousCount = 0;
    let stuckCount = 0; // Compte combien de fois on ne bouge pas
    const maxScrollAttempts = 20; // Limite dure pour éviter les boucles très longues
    const maxStuckAttempts = 3; // Si pas de progrès plusieurs fois d'affilée, on arrête
    console.log(`Scroll pour charger ${targetCount} résultats...`);
    while (scrollAttempts < maxScrollAttempts) {
        const currentCount = await page.evaluate((selector) => {
            const feed = document.querySelector(selector);
            return feed ? feed.querySelectorAll('div[jsaction]').length : 0;
        }, feedSelector);
        console.log(`Résultats chargés: ${currentCount}/${targetCount}`);
        if (currentCount >= targetCount) {
            break;
        }
        // Si pas de progrès, incrémenter compteur "stuck"
        if (currentCount === previousCount) {
            stuckCount++;
            // S'il n'y a plus de progrès après plusieurs tentatives, arrêter rapidement
            if (stuckCount >= maxStuckAttempts) {
                console.log(`⚠️ Plus de résultats à charger (stagnation après ${maxStuckAttempts} tentatives, total: ${currentCount} résultats)`);
                break;
            }
        }
        else {
            stuckCount = 0; // Reset si on a du progrès
        }
        // SCROLL avec délais maîtrisés
        await page.evaluate((selector) => {
            const feed = document.querySelector(selector);
            if (feed) {
                // Scroller jusqu'en bas
                feed.scrollTop = feed.scrollHeight;
            }
        }, feedSelector);
        const baseDelay = 1200; // 1.2s minimum
        const scrollBonus = 400; // +0.4s par tentative
        const delayMs = Math.min(baseDelay + scrollAttempts * scrollBonus, 3000); // max 3s
        console.log(`  ⏳ Attente ${delayMs}ms avant prochain scroll...`);
        await page.waitForTimeout(delayMs);
        // 🎯 Attendre explicitement que le feed change ou que les animations se terminent
        try {
            await page.waitForFunction(() => {
                const feed = document.querySelector('div[role="feed"]');
                return feed && feed.querySelectorAll('div[jsaction]').length > 0;
            }, { timeout: 2000 });
        }
        catch (_e) {
            // Si timeout, continuer quand même
        }
        previousCount = currentCount;
        scrollAttempts++;
    }
    console.log(`Scroll terminé: ${previousCount} résultats chargés après ${scrollAttempts} tentatives`);
}
async function extractGoogleMapsDataWithOffset(page, offset, limit) {
    console.log(`Extraction ${offset}-${offset + limit}...`);
    const results = await page.evaluate(({ offset, limit }) => {
        const businesses = [];
        const cards = document.querySelectorAll('div[role="feed"] > div > div[jsaction]');
        const slicedCards = Array.from(cards).slice(offset, offset + limit);
        slicedCards.forEach((card) => {
            try {
                const nameElement = card.querySelector('div.fontHeadlineSmall');
                const nom_societe = nameElement?.textContent?.trim() || '';
                if (!nom_societe)
                    return;
                const ratingElement = card.querySelector('span[role="img"][aria-label*="étoiles"]');
                const ariaLabel = ratingElement?.getAttribute('aria-label') || '';
                let note;
                let nombre_avis;
                const noteMatch = ariaLabel.match(/(\d+[,.]?\d*)\s*étoiles?/i);
                if (noteMatch) {
                    note = parseFloat(noteMatch[1].replace(',', '.'));
                }
                const avisMatch = ariaLabel.match(/(\d+)\s*avis/i);
                if (avisMatch) {
                    nombre_avis = parseInt(avisMatch[1].replace(/\s/g, ''), 10);
                }
                const categoryElements = card.querySelectorAll('div.fontBodyMedium > div > div');
                let activite = '';
                categoryElements.forEach((el) => {
                    const text = el.textContent?.trim();
                    if (text && !text.includes('·') && !text.match(/\d+/)) {
                        activite = text;
                    }
                });
                const addressElements = Array.from(card.querySelectorAll('div.fontBodyMedium span'));
                const adresseElement = addressElements.find((el) => el.textContent?.includes(',') || el.textContent?.match(/\d{5}/));
                const adresse = adresseElement?.textContent?.trim() || '';
                const phoneElements = Array.from(card.querySelectorAll('span'));
                const phoneElement = phoneElements.find((el) => el.textContent?.match(/[\+\d\s\*\-\(\)]{10,}/));
                const telephone = phoneElement?.textContent?.trim();
                const linkElement = card.querySelector('a[href*="http"]:not([href*="google"])');
                const site_web = linkElement?.getAttribute('href') || undefined;
                businesses.push({
                    nom_societe,
                    telephone,
                    adresse,
                    site_web,
                    activite,
                    note,
                    nombre_avis
                });
            }
            catch (error) {
                console.error('Erreur extraction carte:', error);
            }
        });
        return businesses;
    }, { offset, limit });
    console.log(`${results.length} entreprises extraites (offset ${offset})`);
    return results;
}
async function scrapeGoogleMapsWithOffset(query, offset, limit, existingBrowser, existingPage) {
    let browser = existingBrowser;
    let page = existingPage;
    // 1) S'assurer qu'on a un browser
    if (!browser) {
        browser = await initBrowser();
    }
    // 2) Créer une page si nécessaire
    if (!page) {
        const context = await browser.newContext({
            userAgent: (0, userAgentsRotation_1.getRandomUserAgent)(),
            locale: 'fr-FR',
            viewport: { width: 1920, height: 1080 }
        });
        page = await context.newPage();
    }
    // 3) Construire la requête de recherche (ville + activité)
    // Gérer query.ville qui peut être string | string[] | undefined
    let villeValue = '';
    if (Array.isArray(query.ville)) {
        villeValue = query.ville[0] || '';
    }
    else if (typeof query.ville === 'string') {
        villeValue = query.ville;
    }
    let searchQuery = query.activite
        ? `${query.activite} ${villeValue}`
        : villeValue;
    // Gérer query.departement qui peut être string[]
    if (query.departement && query.departement.length > 0) {
        searchQuery += ` ${query.departement[0]}`;
    }
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    console.log('Navigation vers Google Maps:', url);
    const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
    });
    const status = response?.status();
    console.log(`📡 Status HTTP: ${status}`);
    if (status === 403 || status === 429) {
        throw new Error(`Bloqué par Google (Status ${status})`);
    }
    //ACCEPTER LES COOKIES (VERSION RAPIDE)
    await acceptGoogleCookiesFast(page);
    await page.waitForSelector('div[role="feed"]', { timeout: 15000 });
    console.log('Résultats chargés');
    const isBlocked = await checkIfBlocked(page);
    if (isBlocked) {
        throw new Error('IP bloquée par Google');
    }
    await scrollToLoadResults(page, offset + limit);
    // 🔍 Vérifier combien on a réellement chargé
    const loadedCount = await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        return feed ? feed.querySelectorAll('div[jsaction]').length : 0;
    });
    // Si on n'a pas assez de résultats, éventuelle 2ème vague de scroll (mais limitée)
    if (loadedCount > 0 && loadedCount < offset + limit && loadedCount >= 5) {
        console.log(`📌 2ème vague de scroll : ${loadedCount} < ${offset + limit}, relancer scroll agressif...`);
        await page.waitForTimeout(1500); // Pause courte
        await scrollToLoadResults(page, offset + Math.floor(limit * 1.2)); // Demander un peu plus, sans excès
    }
    const results = await extractGoogleMapsDataWithOffset(page, offset, limit);
    if (results.length === 0) {
        console.log('Aucun résultat Google Maps pour ce batch');
    }
    return { results, browser, page };
}
async function closeBrowser(browser) {
    await browser.close();
    console.log('Navigateur fermé');
}
// import { chromium, Browser, Page } from 'playwright';
// import { GoogleMapsResult, ScraperQuery } from '../types/scraper';
// import { getRandomUserAgent } from './userAgents';
// // import { userAgents } from './userAgents';
// // import { getRandomUserAgent, userAgents } from './userAgents';
// // ============================================
// // CONFIGURATION AVANCÉE DE FINGERPRINTING
// // ============================================
// export async function initBrowser(headless: boolean = true): Promise<Browser> {
//   console.log('Initialisation du navigateur avancé...');
// //   function getRandomUserAgent(): string {
// //   return userAgents[Math.floor(Math.random() * userAgents.length)];
// // }
//   // Rotation aléatoire d'User-Agent
//   const randomUA = getRandomUserAgent();
//   // const randomUA = userAgents.getRandomUserAgents()
//   const browser = await chromium.launch({
//     headless,
//     args: [
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-dev-shm-usage',
//       '--disable-blink-features=AutomationControlled',
//       '--disable-web-security',
//       '--disable-features=IsolateOrigins,site-per-process',
//       '--disable-accelerated-2d-canvas',
//       '--no-first-run',
//       '--no-zygote',
//       '--disable-gpu',
//       '--disable-background-networking',
//       '--disable-default-apps',
//       '--disable-extensions',
//       '--disable-sync',
//       '--disable-translate',
//       '--hide-scrollbars',
//       '--metrics-recording-only',
//       '--mute-audio',
//       '--no-default-browser-check',
//       '--safebrowsing-disable-auto-update',
//       `--user-agent=${randomUA}`,
//       '--window-size=1920,1080'
//     ],
//     // Timeouts plus longs
//     timeout: 60000
//   });
//   console.log(`Navigateur lancé avec UA: ${randomUA.substring(0, 50)}...`);
//   return browser;
// }
// // ============================================
// // GESTION INTELLIGENTE DES COOKIES
// // ============================================
// async function handleGoogleConsent(page: Page): Promise<void> {
//   try {
//     console.log('Traitement du consentement Google...');
//     // Attendre que la page soit stable
//     await page.waitForLoadState('networkidle', { timeout: 10000 });
//     // Essayer plusieurs approches
//     const consentSelectors = [
//       // Français
//       'button:has-text("Tout accepter")',
//       'button:has-text("Accepter tout")',
//       'button:has-text("J\'accepte")',
//       '#L2AGLb', // Bouton cookies classique
//       'button[aria-label*="cookies" i]',
//       'button[aria-label*="accept" i]',
//       // Anglais
//       'button:has-text("Accept all")',
//       'button:has-text("I agree")',
//       'button:has-text("Agree")',
//       // Générique
//       'button[jsaction*="cookie"]',
//       'div[role="dialog"] button:last-child',
//       'form[action*="consent"] button'
//     ];
//     let consentAccepted = false;
//     for (const selector of consentSelectors) {
//       try {
//         const button = await page.$(selector);
//         if (button && await button.isVisible()) {
//           await button.click({ delay: randomDelay(100, 300) });
//           console.log(`✅ Consentement accepté via: ${selector}`);
//           consentAccepted = true;
//           break;
//         }
//       } catch (e) {
//         // Continuer avec le sélecteur suivant
//       }
//     }
//     if (consentAccepted) {
//       // Attendre que le popup disparaisse
//       await page.waitForTimeout(randomDelay(500, 1000));
//       // Vérifier que le popup a bien disparu
//       try {
//         await page.waitForSelector('div[role="dialog"]', { 
//           state: 'hidden', 
//           timeout: 3000 
//         });
//       } catch (e) {
//         // Le popup n'existe pas ou est déjà caché
//       }
//     } else {
//       console.log('ℹ️ Pas de popup de consentement détecté');
//     }
//   } catch (error) {
//     console.log('Erreur:', 
//     error instanceof Error ? error.message : String(error));
//     // console.log('⚠️ Erreur lors du traitement du consentement:', error.message);
//     // Continuer malgré l'erreur
//   }
// }
// // ============================================
// // DÉTECTION DE BLOCAGE AMÉLIORÉE
// // ============================================
// async function checkIfBlocked(page: Page): Promise<{ blocked: boolean; reason?: string }> {
//   try {
//     // Vérifier plusieurs indicateurs
//     const indicators = await page.evaluate(() => {
//       const body = document.body;
//       const bodyText = body.innerText.toLowerCase();
//       const html = body.innerHTML.toLowerCase();
//       return {
//         // CAPTCHA
//         hasCaptcha: !!document.querySelector('#captcha, .g-recaptcha, iframe[src*="recaptcha"]'),
//         captchaText: bodyText.includes('captcha') || bodyText.includes('robot'),
//         // Erreurs HTTP
//         has403: bodyText.includes('403') || html.includes('403 forbidden'),
//         has429: bodyText.includes('429') || bodyText.includes('too many requests'),
//         has5xx: bodyText.includes('50') && bodyText.includes('error'),
//         // Messages de blocage
//         hasBlocked: bodyText.includes('blocked') || 
//                    bodyText.includes('access denied') ||
//                    bodyText.includes('sorry') ||
//                    bodyText.includes('we\'re sorry'),
//         // Redirections suspectes
//         hasRedirect: window.location.href.includes('/sorry/') ||
//                     window.location.href.includes('blocked') ||
//                     window.location.href.includes('checkpoint'),
//         // Pages vides/erreurs
//         hasNoResults: bodyText.includes('no results') ||
//                      bodyText.includes('aucun résultat') ||
//                      bodyText.includes('did not match'),
//         // Éléments manquants
//         hasNoFeed: !document.querySelector('div[role="feed"], [role="feed"], .section-layout-root'),
//         // Google sign-in demand
//         hasSignInPrompt: bodyText.includes('sign in') || 
//                         bodyText.includes('connectez-vous')
//       };
//     });
//     // Analyser les résultats
//     if (indicators.hasCaptcha || indicators.captchaText) {
//       return { blocked: true, reason: 'CAPTCHA détecté' };
//     }
//     if (indicators.has403 || indicators.has429 || indicators.has5xx) {
//       return { blocked: true, reason: `Erreur HTTP (${indicators.has403 ? '403' : indicators.has429 ? '429' : '5xx'})` };
//     }
//     if (indicators.hasBlocked || indicators.hasRedirect) {
//       return { blocked: true, reason: 'Page de blocage détectée' };
//     }
//     if (indicators.hasNoFeed && indicators.hasNoResults) {
//       return { blocked: false, reason: 'Aucun résultat mais pas bloqué' };
//     }
//     if (indicators.hasSignInPrompt) {
//       return { blocked: true, reason: 'Connexion Google requise' };
//     }
//     return { blocked: false };
//   } catch (error) {
//     console.error('Erreur lors de la vérification de blocage:', error);
//     return { blocked: true, reason: 'Erreur lors de la vérification' };
//   }
// }
// // ============================================
// // NAVIGATION ROBUSTE AVEC FALLBACKS
// // ============================================
// async function navigateToGoogleMaps(
//   page: Page, 
//   query: ScraperQuery
// ): Promise<{ success: boolean; error?: string }> {
//   let villeValue = '';
//   if (Array.isArray(query.ville)) {
//     villeValue = query.ville[0] || '';
//   } else if (typeof query.ville === 'string') {
//     villeValue = query.ville;
//   }
//   const searchTerms = [
//     query.activite ? `${query.activite} ${villeValue}` : villeValue,
//     query.activite ? `${query.activite} à ${villeValue}` : villeValue,
//     query.activite ? `${villeValue} ${query.activite}` : villeValue,
//   ];
//   if (query.departement?.length) {
//     searchTerms.forEach((term, i) => {
//       searchTerms[i] = `${term} ${query.departement![0]}`;
//     });
//   }
//   // Essayer différentes formulations
//   for (const searchQuery of searchTerms) {
//     if (!searchQuery.trim()) continue;
//     const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
//     console.log(`📍 Essai de navigation: ${url}`);
//     try {
//       // Navigation avec timeout long
//       const response = await page.goto(url, {
//         waitUntil: 'domcontentloaded',
//         timeout: 45000, // 45 secondes
//         referer: 'https://www.google.com/'
//       });
//       const status = response?.status();
//       console.log(`📡 Status: ${status}`);
//       if (status && status >= 400 && status < 500) {
//         console.log(`❌ Erreur ${status}, essai formulation suivante...`);
//         continue;
//       }
//       // Attendre que la page se stabilise
//       await page.waitForTimeout(randomDelay(2000, 4000));
//       // Gérer le consentement
//       await handleGoogleConsent(page);
//       // Vérifier si bloqué
//       const { blocked, reason } = await checkIfBlocked(page);
//       if (blocked) {
//         console.log(`❌ Bloqué: ${reason}`);
//         return { success: false, error: reason };
//       }
//       return { success: true };
//     } catch (error) {
//       console.log('⚠️ Erreur:', 
//     error instanceof Error ? error.message : String(error));
//       // console.log(`⚠️ Échec navigation: ${error.message}`);
//       continue;
//     }
//   }
//   return { success: false, error: 'Toutes les formulations ont échoué' };
// }
// // ============================================
// // ATTENTE INTELLIGENTE DES RÉSULTATS
// // ============================================
// async function waitForGoogleMapsResults(page: Page): Promise<boolean> {
//   console.log('⏳ Attente des résultats Google Maps...');
//   const maxWaitTime = 45000; // 45 secondes
//   const startTime = Date.now();
//   let lastLogTime = startTime;
//   // Sélecteurs possibles pour les résultats
//   const resultSelectors = [
//     'div[role="feed"]',
//     '[role="feed"]',
//     '.section-layout-root',
//     '.widget-pane-content',
//     '[aria-label*="résultats" i]',
//     '[aria-label*="results" i]',
//     '.section-result',
//     '.section-layout',
//     'div[jsaction*="mouseover"]',
//     'div:has(> div[jsaction])'
//   ];
//   while (Date.now() - startTime < maxWaitTime) {
//     // Vérifier périodiquement si bloqué
//     if (Date.now() - lastLogTime > 5000) {
//       const { blocked } = await checkIfBlocked(page);
//       if (blocked) {
//         console.log('❌ Bloqué pendant l\'attente');
//         return false;
//       }
//       lastLogTime = Date.now();
//     }
//     // Essayer chaque sélecteur
//     for (const selector of resultSelectors) {
//       try {
//         const element = await page.$(selector);
//         if (element) {
//           const isVisible = await element.isVisible();
//           const hasChildren = await element.$$eval('*', els => els.length > 0);
//           if (isVisible && hasChildren) {
//             console.log(`✅ Résultats détectés via: ${selector}`);
//             // Vérifier qu'il y a du contenu
//             const content = await element.textContent();
//             if (content && content.length > 50) {
//               console.log('📊 Contenu valide détecté');
//               return true;
//             }
//           }
//         }
//       } catch (error) {
//         // Ignorer et continuer
//       }
//     }
//     // Faire un petit scroll pour déclencher le chargement
//     try {
//       await page.evaluate(() => {
//         window.scrollBy(0, 300);
//       });
//     } catch (e) {}
//     // Attente exponentielle
//     const elapsed = Date.now() - startTime;
//     const waitTime = Math.min(1000 + (elapsed / 1000) * 200, 3000);
//     await page.waitForTimeout(waitTime);
//     // Log périodique
//     if (Math.floor(elapsed / 10000) > Math.floor((elapsed - waitTime) / 10000)) {
//       console.log(`⏱️ Attente depuis ${Math.round(elapsed/1000)}s...`);
//     }
//   }
//   console.log('⏱️ Timeout après 45 secondes');
//   // Dernière vérification
//   const pageText = await page.evaluate(() => document.body.innerText);
//   if (pageText.length > 1000) {
//     console.log('ℹ️ Page chargée mais structure différente');
//     return true; // On continue même si pas détecté par les sélecteurs
//   }
//   return false;
// }
// // ============================================
// // SCROLL OPTIMISÉ
// // ============================================
// async function scrollToLoadResults(
//   page: Page, 
//   targetCount: number
// ): Promise<number> {
//   console.log(`🔄 Scroll pour charger ${targetCount} résultats...`);
//   let loadedCount = 0;
//   let previousCount = 0;
//   let scrollAttempts = 0;
//   const maxScrollAttempts = 40;
//   while (scrollAttempts < maxScrollAttempts && loadedCount < targetCount) {
//     // Attendre avant de vérifier
//     await page.waitForTimeout(randomDelay(1000, 2500));
//     // Compter les éléments
//     const currentCount = await page.evaluate(() => {
//       // Plusieurs méthodes pour compter les résultats
//       const selectors = [
//         'div[role="feed"] > div > div[jsaction]',
//         '.section-result',
//         '[role="feed"] > div',
//         '.section-layout > div',
//         'div[jsaction]'
//       ];
//       for (const selector of selectors) {
//         const elements = document.querySelectorAll(selector);
//         if (elements.length > 0) {
//           return elements.length;
//         }
//       }
//       return 0;
//     });
//     console.log(`📊 Résultats: ${currentCount}/${targetCount}`);
//     // Vérifier la progression
//     if (currentCount > previousCount) {
//       loadedCount = currentCount;
//       previousCount = currentCount;
//       scrollAttempts = 0; // Reset le compteur quand on progresse
//     } else {
//       scrollAttempts++;
//     }
//     // Scroll
//     await page.evaluate(() => {
//       const scrollable = document.querySelector('div[role="feed"], [role="feed"]');
//       if (scrollable) {
//         scrollable.scrollTo(0, scrollable.scrollHeight);
//       } else {
//         window.scrollBy(0, window.innerHeight * 0.8);
//       }
//     });
//     // Vérifier si bloqué
//     if (scrollAttempts % 5 === 0) {
//       const { blocked } = await checkIfBlocked(page);
//       if (blocked) {
//         console.log('❌ Bloqué pendant le scroll');
//         break;
//       }
//     }
//   }
//   console.log(`🏁 Scroll terminé: ${loadedCount} résultats`);
//   return loadedCount;
// }
// // ============================================
// // EXTRACTION ROBUSTE DES DONNÉES
// // ============================================
// async function extractGoogleMapsDataWithOffset(
//   page: Page,
//   offset: number,
//   limit: number
// ): Promise<GoogleMapsResult[]> {
//   console.log(`🔍 Extraction ${offset}-${offset + limit}...`);
//   try {
//     const results = await page.evaluate(({ offset, limit }) => {
//       const businesses: GoogleMapsResult[] = [];
//       // Multiple selectors for business cards
//       const cardSelectors = [
//         'div[role="feed"] > div > div[jsaction]',
//         '.section-result',
//         '[role="feed"] > div > div',
//         '.section-layout > div > div',
//         'div[jsaction]:has(div.fontHeadlineSmall)'
//       ];
//       let allCards: Element[] = [];
//       for (const selector of cardSelectors) {
//         const cards = document.querySelectorAll(selector);
//         if (cards.length > 0) {
//           allCards = Array.from(cards);
//           break;
//         }
//       }
//       if (allCards.length === 0) {
//         console.warn('Aucune carte trouvée');
//         return [];
//       }
//       const slicedCards = allCards.slice(offset, offset + limit);
//       slicedCards.forEach((card, index) => {
//         try {
//           // Nom de l'entreprise
//           const nameSelectors = [
//             'div.fontHeadlineSmall',
//             'h1, h2, h3',
//             '.section-result-title',
//             '[aria-label*="entreprise" i]',
//             'div[role="heading"]'
//           ];
//           let nom_societe = '';
//           for (const selector of nameSelectors) {
//             const el = card.querySelector(selector);
//             if (el?.textContent?.trim()) {
//               nom_societe = el.textContent.trim();
//               break;
//             }
//           }
//           if (!nom_societe) {
//             // Fallback: premier texte significatif
//             const text = card.textContent || '';
//             const lines = text.split('\n').filter(line => line.trim().length > 3);
//             if (lines.length > 0) {
//               nom_societe = lines[0].trim();
//             }
//           }
//           if (!nom_societe) return;
//           // Note et avis
//           let note: number | undefined;
//           let nombre_avis: number | undefined;
//           const ratingSelectors = [
//             'span[role="img"][aria-label*="étoiles" i]',
//             'span[role="img"][aria-label*="star" i]',
//             '[aria-label*="rating" i]',
//             '.section-result-star-rating',
//             '.cards-rating-score'
//           ];
//           for (const selector of ratingSelectors) {
//             const ratingEl = card.querySelector(selector);
//             if (ratingEl) {
//               const ariaLabel = ratingEl.getAttribute('aria-label') || '';
//               // Extraire note
//               const noteMatch = ariaLabel.match(/(\d+[,.]?\d*)\s*(étoiles?|stars?)/i);
//               if (noteMatch) {
//                 note = parseFloat(noteMatch[1].replace(',', '.'));
//               }
//               // Extraire nombre d'avis
//               const avisMatch = ariaLabel.match(/(\d+[\s,]?\d*)\s*(avis|reviews?)/i);
//               if (avisMatch) {
//                 nombre_avis = parseInt(avisMatch[1].replace(/[\s,]/g, ''), 10);
//               }
//               break;
//             }
//           }
//           // Activité/Catégorie
//           let activite = '';
//           const categorySelectors = [
//             'div.fontBodyMedium > div > div',
//             '.section-result-details',
//             '[role="contentinfo"]',
//             '.section-result-content'
//           ];
//           for (const selector of categorySelectors) {
//             const elements = card.querySelectorAll(selector);
//             elements.forEach(el => {
//               const text = el.textContent?.trim();
//               if (text && !activite && 
//                   !text.includes('·') && 
//                   !text.match(/\d+/) &&
//                   text.length > 3 &&
//                   text.length < 100) {
//                 activite = text;
//               }
//             });
//           }
//           // Adresse
//           let adresse = '';
//           const addressSelectors = [
//             'div.fontBodyMedium span',
//             '.section-result-location',
//             '[role="region"]',
//             'address'
//           ];
//           for (const selector of addressSelectors) {
//             const elements = card.querySelectorAll(selector);
//             for (const el of Array.from(elements)) {
//               const text = el.textContent?.trim();
//               if (text && (text.includes(',') || text.match(/\d{5}/))) {
//                 adresse = text;
//                 break;
//               }
//             }
//             if (adresse) break;
//           }
//           // Téléphone
//           let telephone: string | undefined;
//           const phoneRegex = /[\+\d\s\*\-\(\)]{10,}/;
//           const cardText = card.textContent || '';
//           const phoneMatch = cardText.match(phoneRegex);
//           if (phoneMatch) {
//             telephone = phoneMatch[0].trim();
//           }
//           // Site web
//           let site_web: string | undefined;
//           const links = card.querySelectorAll('a[href*="http"]:not([href*="google"])');
//           if (links.length > 0) {
//             const href = links[0].getAttribute('href');
//             if (href && !href.includes('google') && !href.includes('maps')) {
//               site_web = href;
//             }
//           }
//           businesses.push({
//             nom_societe,
//             telephone,
//             adresse: adresse || 'Adresse non trouvée',
//             site_web,
//             activite: activite || 'Activité non spécifiée',
//             note,
//             nombre_avis
//           });
//         } catch (cardError) {
//           console.error(`Erreur extraction carte ${index}:`, cardError);
//         }
//       });
//       return businesses;
//     }, { offset, limit });
//     console.log(`✅ ${results.length} entreprises extraites`);
//     return results;
//   } catch (error) {
//     console.error('❌ Erreur lors de l\'extraction:', error);
//     return [];
//   }
// }
// // ============================================
// // FONCTION PRINCIPALE AMÉLIORÉE
// // ============================================
// export async function scrapeGoogleMapsWithOffset(
//   query: ScraperQuery,
//   offset: number,
//   limit: number,
//   existingBrowser?: Browser,
//   existingPage?: Page
// ): Promise<{ results: GoogleMapsResult[]; browser: Browser; page: Page }> {
//   let browser = existingBrowser;
//   let page = existingPage;
//   let shouldCloseBrowser = false;
//   try {
//     if (!browser || !page) {
//       browser = await initBrowser(true); // headless: true pour la production
//       shouldCloseBrowser = true;
//       const context = await browser.newContext({
//         userAgent: getRandomUserAgent(),
//         locale: 'fr-FR',
//         timezoneId: 'Europe/Paris',
//         viewport: { width: 1920, height: 1080 },
//         permissions: ['geolocation'],
//         geolocation: { latitude: 48.8566, longitude: 2.3522 }, // Paris
//         colorScheme: 'light'
//       });
//       // Ajouter des cookies "normaux"
//       await context.addCookies([
//         {
//           name: 'CONSENT',
//           value: 'YES+FR.fr+V10+BX',
//           domain: '.google.com',
//           path: '/'
//         },
//         {
//           name: 'NID',
//           value: '511=some_random_value', // Doit être généré dynamiquement
//           domain: '.google.com',
//           path: '/',
//           httpOnly: true,
//           secure: true
//         }
//       ]);
//       page = await context.newPage();
//       // Random mouse movements
//       // page.on('load', async () => {
//       //   await page.mouse.move(
//       //     Math.random() * 1920,
//       //     Math.random() * 1080
//       //   );
//       // });
//       page.on('load', async () => {
//   if (!page) return;  // ✅ Vérification
//   await page.mouse.move(
//     Math.random() * 1920,
//     Math.random() * 1080
//   );
// });
//       console.log('🌐 Contexte créé avec fingerprinting avancé');
//     }
//     // Navigation
//     const { success, error } = await navigateToGoogleMaps(page, query);
//     if (!success) {
//       throw new Error(`Échec navigation: ${error}`);
//     }
//     // Attendre les résultats
//     const resultsLoaded = await waitForGoogleMapsResults(page);
//     if (!resultsLoaded) {
//       console.warn('⚠️ Résultats non détectés, tentative de poursuite...');
//     }
//     // Scroll pour charger plus de résultats
//     const totalToLoad = offset + limit;
//     await scrollToLoadResults(page, totalToLoad);
//     // Extraction
//     const results = await extractGoogleMapsDataWithOffset(page, offset, limit);
//     if (results.length === 0) {
//       console.log('ℹ️ Aucun résultat extrait pour ce batch');
//       // Fallback: essayer une autre méthode d'extraction
//       const fallbackResults = await page.evaluate(() => {
//         const businesses: any[] = [];
//         // Logique de fallback simplifiée
//         document.querySelectorAll('div').forEach(div => {
//           const text = div.textContent;
//           if (text && text.length > 50 && text.length < 500) {
//             businesses.push({
//               nom_societe: text.substring(0, 100),
//               adresse: 'Extraction fallback',
//               activite: 'Non spécifiée'
//             });
//           }
//         });
//         return businesses.slice(0, 5);
//       });
//       if (fallbackResults.length > 0) {
//         console.log(`🔄 ${fallbackResults.length} résultats via fallback`);
//         return { results: fallbackResults, browser, page };
//       }
//     }
//     return { results, browser, page };
//   } catch (error) {
//     console.error('💥 Erreur critique dans scrapeGoogleMapsWithOffset:', error);
//     // Nettoyage en cas d'erreur
//     if (shouldCloseBrowser && browser) {
//       await browser.close().catch(() => {});
//     }
//     // Retourner des résultats vides plutôt que de faire planter
//     return { 
//       results: [], 
//       browser: browser!, 
//       page: page! 
//     };
//   }
// }
// // ============================================
// // FONCTIONS UTILITAIRES
// // ============================================
// function randomDelay(min: number, max: number): number {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }
// export async function closeBrowser(browser: Browser): Promise<void> {
//   try {
//     await browser.close();
//     console.log('🔒 Navigateur fermé');
//   } catch (error) {
//     console.error('Erreur fermeture navigateur:', error);
//   }
// }
//# sourceMappingURL=googleMapServices.js.map