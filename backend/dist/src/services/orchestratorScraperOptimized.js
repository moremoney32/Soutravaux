"use strict";
// /**
//  * 🚀 SERVICE D'ORCHESTRATION SCRAPING INTELLIGENT
//  * 
//  * Caractéristiques :
//  * ✅ Scrape les PLUS GRANDES villes en premier
//  * ✅ Scrape 5 villes EN PARALLÈLE
//  * ✅ Arrête IMMÉDIATEMENT quand objectif atteint
//  * ✅ Délais aléatoires (anti-détection)
//  * ✅ Rotation d'user-agents
//  * ✅ Pool de browsers réutilisable
//  * ✅ Enrichissement optionnel et rapide
//  */
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestrateScrapingOptimized = orchestrateScrapingOptimized;
const googleMapServices_1 = require("./googleMapServices");
const inseeService_1 = require("./inseeService");
const websideScraperServices_1 = require("./websideScraperServices");
const geoHelpers_1 = require("../helpers/geoHelpers");
const userAgentsRotation_1 = require("./userAgentsRotation");
// ============================================
// 🎯 CONFIGURATION ULTRA-OPTIMISÉE
// ============================================
const OPTIMIZED_CONFIG = {
    // Anti-détection
    MIN_DELAY_MS: 800,
    MAX_DELAY_MS: 2500,
    PAUSE_AFTER_REQUESTS: 6,
    PAUSE_DURATION_MS: 60000, // 1 minute
    // Performances
    MAX_RESULTS_PER_CITY: 40, // Réaliste, pas 150
    MAX_CITIES_PARALLEL: 3, // Réduit pour éviter blocage
    ENRICHMENT_TIMEOUT_MS: 8000, // 8 secondes max
    // Qualité
    MIN_SUCCESS_RATE: 0.9, // 90% minimum
    REQUIRED_FIELDS: ['telephone'] // Seul le téléphone requis
};
// ============================================
// 🔧 UTILITAIRES AMÉLIORÉS
// ============================================
/**
 * Attendre délai intelligent avec rotation user-agent
 */
async function intelligentDelay() {
    await (0, userAgentsRotation_1.waitRandomDelay)(OPTIMIZED_CONFIG.MIN_DELAY_MS, OPTIMIZED_CONFIG.MAX_DELAY_MS);
}
/**
 * Trier les villes par population (grandes d'abord)
 */
function sortVillesByPopulation(villes) {
    return [...villes].sort((a, b) => (b.population || 0) - (a.population || 0));
}
/**
 * Nettoyer le nom pour INSEE - OPTIMISÉ
 */
function nettoyerNomPourInsee(nom) {
    if (!nom)
        return '';
    return nom
        .replace(/[\p{Emoji}]/gu, ' ')
        .split('|')[0]
        .replace(/\d+J\/\d+/gi, ' ')
        .replace(/(\d+)\s*(?:ème|ère|e|er)\b/gi, ' ')
        .replace(/\b\d{5}\b|\b\d{2}\b$/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 50); // Limiter la longueur
}
/**
 * Générer quelques variantes proches d'une activité (sans exploser les requêtes)
 * Exemple: "Maçon" → ["Maçon bâtiment", "Rénovation maçonnerie", "Entreprises maçonnerie"]
 */
function generateActivityVariants(activite) {
    const base = activite.toLowerCase().trim();
    const variants = [];
    // Variantes génériques autour du bâtiment / rénovation
    variants.push(`${activite} bâtiment`);
    variants.push(`Rénovation ${activite}`);
    variants.push(`Entreprise ${activite}`);
    // Quelques cas spéciaux très fréquents
    if (base.includes('maçon')) {
        variants.push('Rénovation maçonnerie');
        variants.push('Entreprise maçonnerie');
    }
    if (base.includes('plomb')) {
        variants.push('Plombier dépannage');
        variants.push('Plomberie sanitaire');
    }
    if (base.includes('électric')) {
        variants.push('Électricien dépannage');
        variants.push('Installation électrique');
    }
    // Nettoyer doublons + garder 3-4 max pour ne pas sur-solliciter Google
    const unique = Array.from(new Set(variants.map(v => v.trim())))
        .filter(v => v.length > 3);
    return unique.slice(0, 4);
}
async function enrichEntrepriseIntelligent(gmResult, query, options = {}) {
    const cpMatch = gmResult.adresse?.match(/\b\d{5}\b/);
    const code_postal = cpMatch ? cpMatch[0] : '';
    const departement = code_postal ? code_postal.substring(0, 2) : '';
    const entreprise = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nom_societe: gmResult.nom_societe || '',
        telephone: gmResult.telephone || '',
        adresse: gmResult.adresse || '',
        code_postal,
        ville: gmResult.ville || '',
        departement,
        activite: gmResult.activite || query.activite || '',
        site_web: gmResult.site_web,
        note: gmResult.note,
        nombre_avis: gmResult.nombre_avis,
        scraped_at: new Date()
    };
    // Vérification basique - le téléphone est requis
    if (!entreprise.telephone) {
        return null;
    }
    // 🔥 Enrichissement PARALLELE avec timeout intelligent - CORRIGÉ
    try {
        await Promise.race([
            (async () => {
                const enrichmentPromises = [];
                // 1. EMAIL (si site web) - promesse qui retourne string | undefined
                if (!options.skipEmail) {
                    if (entreprise.site_web) {
                        enrichmentPromises.push((0, websideScraperServices_1.scrapeEmailFromWebsite)(entreprise.site_web).catch(() => undefined));
                    }
                    else {
                        enrichmentPromises.push(Promise.resolve(undefined));
                    }
                }
                else {
                    // Mode "light" : on ne scrape pas les emails pour alléger la RAM / Playwright
                    enrichmentPromises.push(Promise.resolve(undefined));
                }
                // 2. SIRET (si nom valide) - promesse qui retourne InseeResult
                if (entreprise.nom_societe && entreprise.nom_societe.length > 3) {
                    const nomNettoye = nettoyerNomPourInsee(entreprise.nom_societe);
                    enrichmentPromises.push((0, inseeService_1.getSiretFromInsee)(nomNettoye).catch(() => ({})));
                }
                else {
                    // Si nom trop court, on push une promesse résolue avec objet vide
                    enrichmentPromises.push(Promise.resolve({}));
                }
                // Exécuter en parallèle - Maintenant les types sont cohérents
                const results = await Promise.all(enrichmentPromises);
                // 🔥 CORRECTION ICI : results[0] est email, results[1] est inseeData
                // TypeScript sait maintenant que results[0] peut être string | undefined
                // et results[1] est InseeResult
                const emailResult = results[0];
                const inseeData = results[1];
                if (emailResult) {
                    entreprise.email = emailResult;
                }
                if (inseeData?.siret) {
                    entreprise.siret = inseeData.siret;
                    entreprise.siren = inseeData.siren;
                    entreprise.etat_administratif = inseeData.etat_administratif;
                    entreprise.adresse_etablissement = inseeData.adresse_etablissement;
                    entreprise.code_postal_etablissement = inseeData.code_postal_etablissement;
                    entreprise.ville_etablissement = inseeData.ville_etablissement;
                    entreprise.nom_gerant = inseeData.nom_gerant || entreprise.nom_gerant;
                }
            })(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout enrichissement')), OPTIMIZED_CONFIG.ENRICHMENT_TIMEOUT_MS))
        ]);
    }
    catch (error) {
        // Timeout acceptable, on garde ce qu'on a
        console.log(`⚠️ Timeout enrichissement pour ${entreprise.nom_societe}`);
    }
    return entreprise;
}
/**
 * Scraper une ville OPTIMISÉ
 */
async function scraperVilleOptimized(ville, query, resultsNeeded, browser, page, isSingleCityMode, skipEmail) {
    console.log(`🏙️ Scraping ${ville.nom} (objectif: ${resultsNeeded})`);
    try {
        // 🔥 REQUÊTE PRINCIPALE bien formulée
        const baseSearchQuery = `${query.activite || ''} ${ville.nom}`.trim();
        let allGoogleResults = [];
        // Appel principal à Google Maps en réutilisant navigateur/page si dispo
        const baseCall = await (0, googleMapServices_1.scrapeGoogleMapsWithOffset)({
            ...query,
            activite: baseSearchQuery,
            ville: [ville.nom]
        }, 0, Math.min(resultsNeeded * 2, OPTIMIZED_CONFIG.MAX_RESULTS_PER_CITY), // Demander 2x plus
        browser || undefined, page || undefined).catch(() => ({ results: [], browser: browser, page: page }));
        browser = baseCall.browser;
        page = baseCall.page;
        allGoogleResults.push(...baseCall.results);
        // 🔁 MODE "MONO-VILLE" : tester quelques variantes proches de l'activité
        // Utile quand Google ne renvoie que ~20 résultats pour la requête principale
        if (isSingleCityMode &&
            query.activite &&
            allGoogleResults.length < resultsNeeded &&
            resultsNeeded > 20 // on ne déclenche les variantes que pour des besoins "gros"
        ) {
            const variants = generateActivityVariants(query.activite);
            console.log(`   🔍 Mono-ville: ${variants.length} variantes d'activité pour enrichir (${variants.join(', ')})`);
            for (const variant of variants) {
                // Arrêt si on a déjà suffisamment de matière brute
                if (allGoogleResults.length >= resultsNeeded * 2)
                    break;
                const variantCall = await (0, googleMapServices_1.scrapeGoogleMapsWithOffset)({
                    ...query,
                    activite: `${variant} ${ville.nom}`.trim(),
                    ville: [ville.nom]
                }, 0, Math.min(resultsNeeded * 2, OPTIMIZED_CONFIG.MAX_RESULTS_PER_CITY), browser || undefined, page || undefined).catch(() => ({ results: [], browser: browser, page: page }));
                browser = variantCall.browser;
                page = variantCall.page;
                if (variantCall.results.length > 0) {
                    console.log(`   ➕ Variante "${variant}": +${variantCall.results.length} résultats bruts`);
                    allGoogleResults.push(...variantCall.results);
                }
                // Petite pause entre variantes pour éviter d'enchaîner trop vite
                await (0, userAgentsRotation_1.waitRandomDelay)(600, 1500);
            }
        }
        // Déduplication des résultats Google Maps (nom + adresse)
        if (allGoogleResults.length === 0) {
            console.log(`  ⚠️ Aucun résultat pour ${ville.nom}`);
            // On retourne quand même le browser/page pour réutilisation potentielle
            return { entreprises: [], browser: browser, page: page };
        }
        const seenKey = new Set();
        const dedupedGoogleResults = allGoogleResults.filter(result => {
            const key = `${(result.nom_societe || '').trim()}_${(result.adresse || '').trim()}`;
            if (!key.trim())
                return false;
            if (seenKey.has(key))
                return false;
            seenKey.add(key);
            return true;
        });
        console.log(`  📊 ${dedupedGoogleResults.length} résultats bruts (après déduplication nom+adresse sur ${allGoogleResults.length} bruts)`);
        // Enrichissement par lots de 3
        const entreprises = [];
        const seenSirets = new Set();
        const ENRICH_BATCH_SIZE = 5; // petit parallèle raisonnable vers INSEE / emails
        for (let i = 0; i < dedupedGoogleResults.length; i += ENRICH_BATCH_SIZE) {
            const batch = dedupedGoogleResults.slice(i, i + ENRICH_BATCH_SIZE);
            const enrichedBatch = await Promise.all(batch.map(result => enrichEntrepriseIntelligent(result, query, { skipEmail })));
            // Filtrer et dédupliquer
            const validBatch = enrichedBatch.filter((e) => {
                if (!e)
                    return false;
                // Éviter doublons SIRET
                if (e.siret && seenSirets.has(e.siret))
                    return false;
                if (e.siret)
                    seenSirets.add(e.siret);
                return true;
            });
            entreprises.push(...validBatch);
            // Arrêt précoce si on a assez
            if (entreprises.length >= resultsNeeded) {
                console.log(`  ✅ Objectif atteint dans ${ville.nom} (${entreprises.length})`);
                break;
            }
            // Petite pause entre les lots
            if (i + ENRICH_BATCH_SIZE < dedupedGoogleResults.length) {
                await (0, userAgentsRotation_1.waitRandomDelay)(300, 800);
            }
        }
        console.log(`  ✅ ${ville.nom}: ${entreprises.length} entreprises valides`);
        return { entreprises: entreprises.slice(0, resultsNeeded), browser: browser, page: page };
    }
    catch (error) {
        console.error(`  ❌ Erreur ${ville.nom}:`, error);
        return { entreprises: [], browser: browser, page: page };
    }
}
// ============================================
// 🚀 ORCHESTRATEUR PRINCIPAL - ULTRA OPTIMISÉ
// ============================================
async function orchestrateScrapingOptimized(query) {
    const startTime = Date.now();
    console.log('\n🚀 SCRAPING ULTRA-OPTIMISÉ - DÉMARRAGE');
    console.log('📋 Config:', OPTIMIZED_CONFIG);
    // ✅ Validation
    if (!query.region) {
        return {
            entreprises: [],
            stats: createStats(0, 0, 0, 0, 0, 0, 0, '⚠️ La région est obligatoire')
        };
    }
    const target = query.nombre_resultats || 20;
    const minTarget = Math.ceil(target * OPTIMIZED_CONFIG.MIN_SUCCESS_RATE);
    console.log(`🎯 Objectif: ${target} entreprises (minimum: ${minTarget})`);
    // ============================================
    // ÉTAPE 1 : RÉCUPÉRER LES VILLES
    // ============================================
    let villesToScrape = [];
    if (query.ville && Array.isArray(query.ville)) {
        villesToScrape = query.ville.map(nom => ({ nom, population: 0 }));
    }
    else if (query.departement && query.departement.length > 0) {
        try {
            const villes = await (0, geoHelpers_1.getVillesFromMultipleDepartements)(query.departement);
            villesToScrape = villes;
        }
        catch (error) {
            console.error('Erreur récupération villes:', error);
            return {
                entreprises: [],
                stats: createStats(target, 0, 0, 0, 0, 0, 0, '❌ Erreur récupération villes')
            };
        }
    }
    else {
        return {
            entreprises: [],
            stats: createStats(target, 0, 0, 0, 0, 0, 0, '⚠️ Département ou ville requis')
        };
    }
    // Trier par population
    const villesTriees = sortVillesByPopulation(villesToScrape);
    console.log(`📍 ${villesTriees.length} villes (triées par population)`);
    // ============================================
    // ÉTAPE 2 : SCRAPING INTELLIGENT
    // ============================================
    const allEntreprises = [];
    const villesScrappees = [];
    let browser = null;
    let page = null;
    let requestCount = 0;
    // Mode "light" pour les très gros volumes de villes :
    // - on désactive le scraping des emails pour éviter d'ouvrir trop de navigateurs Playwright
    // - l'INSEE reste actif mais limité par les batches
    const isHugeRun = villesToScrape.length > 80;
    if (isHugeRun) {
        console.log(`⚙️ Mode LIGHT activé: ${villesToScrape.length} villes -> emails désactivés pour préserver la RAM`);
    }
    try {
        // Taille de batch pour paralléliser les villes sans surcharger la machine
        const parallelCities = villesTriees.length > 3 ? 2 : 1;
        // Scraper par batches de 1 ou 2 villes en parallèle
        for (let i = 0; i < villesTriees.length; i += parallelCities) {
            if (allEntreprises.length >= target) {
                console.log(`\n🎯 OBJECTIF ATTEINT: ${allEntreprises.length}/${target}`);
                break;
            }
            const batch = villesTriees.slice(i, i + parallelCities);
            const remainingGlobal = target - allEntreprises.length;
            if (remainingGlobal <= 0)
                break;
            // Pause stratégique tous les N requêtes (par ville)
            requestCount += batch.length;
            if (requestCount > 0 && requestCount % OPTIMIZED_CONFIG.PAUSE_AFTER_REQUESTS === 0) {
                console.log(`⏸️ Pause anti-détection: ${OPTIMIZED_CONFIG.PAUSE_DURATION_MS / 1000}s`);
                await new Promise(resolve => setTimeout(resolve, OPTIMIZED_CONFIG.PAUSE_DURATION_MS));
            }
            console.log(`\n📦 Batch ${Math.floor(i / parallelCities) + 1}: ${batch.map(v => v.nom).join(', ')} | Progression: ${allEntreprises.length}/${target}`);
            const perCityTarget = Math.min(Math.ceil(remainingGlobal / batch.length) + 5, 30);
            const promises = batch.map(ville => scraperVilleOptimized(ville, query, perCityTarget, browser, page, villesTriees.length === 1, // mono-ville => variantes permises
            isHugeRun // si énorme run, pas d'emails
            ));
            const results = await Promise.all(promises);
            // Mettre à jour browser/page avec le dernier utilisé (même process Playwright)
            if (results.length > 0) {
                const last = results[results.length - 1];
                browser = last.browser;
                page = last.page;
            }
            for (let idx = 0; idx < results.length; idx++) {
                const r = results[idx];
                const ville = batch[idx];
                if (r.entreprises.length > 0) {
                    allEntreprises.push(...r.entreprises);
                    villesScrappees.push(ville.nom);
                    console.log(`✅ ${ville.nom}: +${r.entreprises.length} entreprises (Total: ${allEntreprises.length}/${target})`);
                }
                else {
                    console.log(`⚠️ Aucune entreprise valide pour ${ville.nom}`);
                }
                if (allEntreprises.length >= target) {
                    console.log(`\n🎯 OBJECTIF ATTEINT PENDANT LE BATCH: ${allEntreprises.length}/${target}`);
                    break;
                }
            }
            // Délai intelligent entre les batches si l'objectif n'est pas encore atteint
            if (allEntreprises.length < target) {
                await intelligentDelay();
            }
        }
        // ============================================
        // ÉTAPE 3 : FINALISATION
        // ============================================
        const finalResults = deduplicateEntreprises(allEntreprises).slice(0, target);
        const successRate = finalResults.length / target;
        const stats = createStats(target, finalResults.length, finalResults.filter(e => e.telephone).length, finalResults.filter(e => e.email).length, finalResults.filter(e => e.siret).length, finalResults.filter(e => e.nom_gerant).length, Math.round((Date.now() - startTime) / 1000), successRate >= OPTIMIZED_CONFIG.MIN_SUCCESS_RATE
            ? `✅ Scraping réussi (${(successRate * 100).toFixed(0)}%)`
            : `⚠️ Objectif partiel (${(successRate * 100).toFixed(0)}%)`);
        stats.villes_scrappees = villesScrappees;
        console.log(`\n✨ SCRAPING TERMINÉ`);
        console.log(`📊 ${finalResults.length}/${target} entreprises`);
        console.log(`⏱️ ${stats.duree_secondes}s (${(finalResults.length / stats.duree_secondes).toFixed(1)}/sec)`);
        console.log(`📞 ${stats.avec_telephone} avec téléphone`);
        console.log(`📧 ${stats.avec_email} avec email`);
        console.log(`🆔 ${stats.avec_siret} avec SIRET`);
        return { entreprises: finalResults, stats };
    }
    catch (error) {
        console.error('❌ Erreur orchestration:', error);
        const partialResults = deduplicateEntreprises(allEntreprises).slice(0, target);
        const duree = Math.round((Date.now() - startTime) / 1000);
        return {
            entreprises: partialResults,
            stats: createStats(target, partialResults.length, partialResults.filter(e => e.telephone).length, partialResults.filter(e => e.email).length, partialResults.filter(e => e.siret).length, partialResults.filter(e => e.nom_gerant).length, duree, `⚠️ Erreur partielle: ${error instanceof Error ? error.message : 'Inconnue'}`)
        };
    }
    finally {
        if (browser) {
            await (0, googleMapServices_1.closeBrowser)(browser);
        }
        await (0, websideScraperServices_1.closeBrowserPool)();
    }
}
// ============================================
// 🛠️ FONCTIONS UTILITAIRES
// ============================================
function deduplicateEntreprises(entreprises) {
    const seen = new Set();
    return entreprises.filter(e => {
        const key = e.siret || `${e.nom_societe}_${e.adresse}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function createStats(total_vise, total_trouve, avec_telephone, avec_email, avec_siret, avec_gerant, duree_secondes, message) {
    return {
        total_vise,
        total_trouve,
        avec_telephone,
        avec_email,
        avec_siret,
        avec_gerant,
        duree_secondes,
        message
    };
}
//# sourceMappingURL=orchestratorScraperOptimized.js.map