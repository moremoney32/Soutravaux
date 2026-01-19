"use strict";
// // src/services/ochestratorscraperService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestrateScrapingOptimized = orchestrateScrapingOptimized;
const googleMapServices_1 = require("./googleMapServices");
const inseeService_1 = require("./inseeService");
const websideScraperServices_1 = require("./websideScraperServices");
const playwright_1 = require("playwright");
const CONFIG = {
    MAX_PARALLEL_VILLES: 3,
    MAX_CONCURRENT_ENRICH: 4,
    ENRICH_TIMEOUT_MS: 5000,
    BATCH_SIZE: 15,
    OBJECTIF_MAX: 500,
    MAX_ENTREPRISES_PAR_VILLE: 30,
    MAX_BATCHES_PAR_VILLE: 2,
    PROGRESS_CHECK_INTERVAL: 2000,
    MIN_VALID_RATE: 0.3
};
class SmartScrapingController {
    constructor(objectif) {
        this.entreprises = [];
        this.siretsSeen = new Set();
        this.isGoalReached = false;
        this.shouldStopAll = false; // ⚡ NOUVEAU : flag d'arrêt global
        this.objectif = Math.min(objectif, CONFIG.OBJECTIF_MAX);
    }
    // ⚡ Vérification rapide avant toute opération
    shouldContinue() {
        return !this.isGoalReached && !this.shouldStopAll;
    }
    addEntreprise(entreprise) {
        // ⚡ Vérification ultra-rapide
        if (!this.shouldContinue()) {
            return { added: false, goalReached: this.isGoalReached };
        }
        // Déduplication rapide
        if (entreprise.siret && this.siretsSeen.has(entreprise.siret)) {
            return { added: false, goalReached: false };
        }
        if (entreprise.siret)
            this.siretsSeen.add(entreprise.siret);
        this.entreprises.push(entreprise);
        // ⚡ Objectif atteint → signal d'arrêt GLOBAL
        if (this.entreprises.length >= this.objectif) {
            this.isGoalReached = true;
            this.shouldStopAll = true; // ⚡ ARRÊT IMMÉDIAT POUR TOUS
            console.log(`🎯 OBJECTIF ATTEINT : ${this.entreprises.length}/${this.objectif} → ARRÊT IMMÉDIAT`);
            return { added: true, goalReached: true };
        }
        return { added: true, goalReached: false };
    }
    // ⚡ Méthode pour forcer l'arrêt (appelée par l'orchestrateur)
    forceStop() {
        this.shouldStopAll = true;
        console.log('🛑 Arrêt forcé déclenché');
    }
    isStopped() {
        return this.shouldStopAll;
    }
    getEntreprises() {
        return this.entreprises.slice(0, this.objectif);
    }
    getCount() {
        return this.entreprises.length;
    }
    getGoal() {
        return this.objectif;
    }
    getRemainingCount() {
        return Math.max(0, this.objectif - this.entreprises.length);
    }
}
// ============================================
// ENRICHISSEMENT SUPER-RAPIDE (avec cache)
// ============================================
const emailCache = new Map();
const gerantCache = new Map();
const siretCache = new Map();
async function enrichEntrepriseUltraRapide(gmResult, query) {
    // ⚡ Validation ultra-rapide
    if (!gmResult.nom_societe || gmResult.nom_societe.length < 2) {
        return null;
    }
    const cpMatch = gmResult.adresse?.match(/\b\d{5}\b/);
    const code_postal = cpMatch ? cpMatch[0] : '';
    const departement = code_postal ? code_postal.substring(0, 2) : '';
    const entreprise = {
        id: `${Date.now()}-${Math.random()}`,
        nom_societe: gmResult.nom_societe,
        telephone: gmResult.telephone,
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
    // ⚡ Enrichissement conditionnel RAPIDE
    try {
        const promises = [];
        // Email (avec cache)
        // if (gmResult.site_web && !emailCache.has(gmResult.site_web)) {
        //   promises.push(
        //     scrapeEmailFromWebsite(gmResult.site_web)
        //       .then(email => emailCache.set(gmResult.site_web!, email))
        //       .catch(() => emailCache.set(gmResult.site_web!, undefined))
        //   );
        // }
        // Gérant (avec cache)
        if (gmResult.site_web && !gerantCache.has(gmResult.site_web)) {
            promises.push((0, websideScraperServices_1.scrapeGerantFromWebsite)()
                .then(gerant => gerantCache.set(gmResult.site_web, gerant))
                .catch(() => gerantCache.set(gmResult.site_web, undefined)));
        }
        // SIRET (avec cache)
        if (!siretCache.has(gmResult.nom_societe)) {
            promises.push((0, inseeService_1.getSiretFromInsee)(gmResult.nom_societe)
                .then(data => siretCache.set(gmResult.nom_societe, data))
                .catch(() => siretCache.set(gmResult.nom_societe, null)));
        }
        // ⚡ Attendre MAX 5 secondes
        if (promises.length > 0) {
            await Promise.race([
                Promise.allSettled(promises),
                new Promise(resolve => setTimeout(resolve, CONFIG.ENRICH_TIMEOUT_MS))
            ]);
        }
        // Récupérer depuis les caches
        if (gmResult.site_web) {
            entreprise.email = emailCache.get(gmResult.site_web);
            entreprise.nom_gerant = gerantCache.get(gmResult.site_web);
        }
        const inseeData = siretCache.get(gmResult.nom_societe);
        if (inseeData?.siret) {
            entreprise.siret = inseeData.siret;
            entreprise.siren = inseeData.siren;
            // ... autres champs
        }
    }
    catch (error) {
        // Silencieux
    }
    // ⚡ Validation finale RAPIDE
    const hasValidData = entreprise.telephone ||
        entreprise.email ||
        entreprise.siret ||
        (entreprise.nom_societe && entreprise.nom_societe.length > 3);
    return hasValidData ? entreprise : null;
}
// ============================================
// ⚡ SCRAPER VILLE AVEC ARRÊT INTELLIGENT
// ============================================
async function scraperVilleIntelligent(ville, query, controller) {
    console.log(`🏙️  Début: ${ville}`);
    let browser;
    try {
        browser = await playwright_1.chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        let offset = 0;
        let entreprisesVille = 0;
        let batchNumber = 0;
        let consecutiveEmptyBatches = 0;
        // ⚡ BOUCLE AVEC VÉRIFICATION CONSTANTE
        while (controller.shouldContinue() &&
            batchNumber < CONFIG.MAX_BATCHES_PAR_VILLE &&
            consecutiveEmptyBatches < 2) {
            batchNumber++;
            // ⚡ Vérification RAPIDE avant chaque batch
            if (!controller.shouldContinue()) {
                console.log(`⏹️  ${ville}: Arrêt demandé avant batch ${batchNumber}`);
                return { success: true, count: entreprisesVille, reason: 'arrêt_global' };
            }
            const restantGlobal = controller.getRemainingCount();
            const batchSize = Math.min(CONFIG.BATCH_SIZE, restantGlobal * 2); // ⚡ Dynamique
            if (batchSize <= 0) {
                console.log(`✅ ${ville}: Plus besoin de résultats`);
                break;
            }
            console.log(`📡 ${ville}: Batch ${batchNumber}, demande ${batchSize} résultats`);
            const queryVille = { ...query, ville };
            let results;
            try {
                const scraped = await (0, googleMapServices_1.scrapeGoogleMapsWithOffset)(queryVille, offset, batchSize, browser, undefined);
                results = scraped.results;
            }
            catch (error) {
                console.log(`⚠️  ${ville}: Erreur scraping batch ${batchNumber} }`);
                break;
            }
            // ⚡ ANALYSE RAPIDE DES RÉSULTATS
            if (!results || results.length === 0) {
                console.log(`ℹ️  ${ville}: Aucun résultat batch ${batchNumber}`);
                consecutiveEmptyBatches++;
                offset += batchSize;
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            consecutiveEmptyBatches = 0; // Reset
            console.log(`📊 ${ville}: ${results.length} résultats bruts`);
            // ⚡ ENRICHISSEMENT PAR CHUNKS AVEC ARRÊT RAPIDE
            const chunkSize = CONFIG.MAX_CONCURRENT_ENRICH;
            let addedInBatch = 0;
            let validResults = 0;
            for (let i = 0; i < results.length; i += chunkSize) {
                // ⚡ Vérification ultra-rapide entre chaque chunk
                if (!controller.shouldContinue()) {
                    console.log(`⏹️  ${ville}: Arrêt pendant enrichissement chunk`);
                    break;
                }
                const chunk = results.slice(i, i + chunkSize);
                // ⚡ ENRICHISSEMENT PARALLÈLE MAIS LIMITÉ
                const enrichPromises = chunk.map(gmResult => enrichEntrepriseUltraRapide(gmResult, queryVille));
                const enriched = await Promise.allSettled(enrichPromises);
                // ⚡ TRAITEMENT RAPIDE DES RÉSULTATS
                for (const result of enriched) {
                    if (!controller.shouldContinue())
                        break;
                    if (result.status === 'fulfilled' && result.value) {
                        const { added } = controller.addEntreprise(result.value);
                        if (added) {
                            entreprisesVille++;
                            addedInBatch++;
                            validResults++;
                        }
                    }
                }
                // ⚡ Petite pause entre chunks
                if (controller.shouldContinue() && i + chunkSize < results.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            // ⚡ ANALYSE DE PERFORMANCE
            const validityRate = results.length > 0 ? validResults / results.length : 0;
            console.log(`✅ ${ville}: Batch ${batchNumber} → ${addedInBatch} valides (taux: ${Math.round(validityRate * 100)}%)`);
            // ⚡ DÉCISION INTELLIGENTE : CONTINUER OU ARRÊTER ?
            if (validityRate < CONFIG.MIN_VALID_RATE && addedInBatch < 2) {
                console.log(`⚠️  ${ville}: Taux de validité trop bas (${Math.round(validityRate * 100)}%), arrêt`);
                break;
            }
            if (addedInBatch > 0) {
                offset += batchSize;
                // ⚡ Pause optimisée
                if (controller.shouldContinue() && batchNumber < CONFIG.MAX_BATCHES_PAR_VILLE) {
                    const pauseTime = Math.min(1000 + batchNumber * 500, 3000);
                    await new Promise(resolve => setTimeout(resolve, pauseTime));
                }
            }
            else {
                offset += batchSize;
                consecutiveEmptyBatches++;
            }
        }
        console.log(`🏁 ${ville}: Terminé avec ${entreprisesVille} entreprises`);
        return { success: true, count: entreprisesVille };
    }
    catch (error) {
        console.error(`❌ ${ville}: Erreur - ${error.message}`);
        return { success: false, count: 0 };
    }
    finally {
        if (browser)
            await browser.close();
    }
}
// ============================================
// 🚀 ORCHESTRATEUR HYPER-INTELLIGENT
// ============================================
async function orchestrateScrapingOptimized(query) {
    const startTime = Date.now();
    console.log('\n🚀 SCRAPING OPTIMISÉ V4 - ARRÊT INTELLIGENT');
    console.log(`⚙️  ${CONFIG.MAX_PARALLEL_VILLES} villes || ${CONFIG.MAX_CONCURRENT_ENRICH} enrich || Batch ${CONFIG.BATCH_SIZE}`);
    // VALIDATION
    if (!query.region) {
        return {
            entreprises: [],
            stats: createEmptyStats('⚠️ La région est obligatoire')
        };
    }
    // ⚡ CONTROLLER INTELLIGENT
    const controller = new SmartScrapingController(query.nombre_resultats || 20);
    console.log(`🎯 Objectif: ${controller.getGoal()} entreprises`);
    // ⚡ PRÉPARATION DES VILLES
    let villesToScrape = [];
    if (query.ville) {
        villesToScrape = Array.isArray(query.ville) ? query.ville : [query.ville];
    }
    // ⚡ LIMITATION INTELLIGENTE : Moins de villes si petit objectif
    const parallelLimit = Math.min(CONFIG.MAX_PARALLEL_VILLES, Math.ceil(controller.getGoal() / 10) // 1 ville pour 10 résultats max
    );
    villesToScrape = villesToScrape.slice(0, parallelLimit);
    console.log(`📍 ${villesToScrape.length} villes sélectionnées (objectif: ${controller.getGoal()})`);
    // ⚡ EXÉCUTION AVEC SURVEILLANCE EN TEMPS RÉEL
    const scrapingPromises = villesToScrape.map(ville => scraperVilleIntelligent(ville, query, controller));
    // ⚡ SURVEILLANCE ACTIVE TOUTES LES 2 SECONDES
    const progressInterval = setInterval(() => {
        const current = controller.getCount();
        const goal = controller.getGoal();
        const progress = Math.round((current / goal) * 100);
        console.log(`📈 ${current}/${goal} (${progress}%) - ${controller.isStopped() ? 'ARRÊT' : 'EN COURS'}`);
    }, CONFIG.PROGRESS_CHECK_INTERVAL);
    try {
        // ⚡ ATTENTE INTELLIGENTE : On n'attend pas tout finir !
        const results = await Promise.allSettled(scrapingPromises);
        // ⚡ ANALYSE DES RÉSULTATS
        let totalExtracted = 0;
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const ville = villesToScrape[index];
                console.log(`📊 ${ville}: ${result.value.count} entreprises`);
                totalExtracted += result.value.count;
            }
        });
        console.log(`📦 Total extrait: ${totalExtracted} entreprises`);
    }
    catch (error) {
        console.error('💥 Erreur globale:', error);
    }
    finally {
        clearInterval(progressInterval);
        // ⚡ FORCER L'ARRÊT AU CAS OÙ
        controller.forceStop();
    }
    // ⚡ NETTOYAGE URGENT
    await (0, websideScraperServices_1.closeBrowserPool)();
    // 📊 STATISTIQUES FINALES
    const entreprisesFinales = controller.getEntreprises();
    const dureeSecondes = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n✨ SCRAPING TERMINÉ`);
    console.log(`📊 Résultats: ${entreprisesFinales.length}/${controller.getGoal()}`);
    console.log(`⏱️ Durée: ${dureeSecondes}s`);
    if (dureeSecondes > 0) {
        const perMinute = Math.round(entreprisesFinales.length / dureeSecondes * 60);
        console.log(`🚀 Performance: ${perMinute} entreprises/min`);
    }
    const stats = {
        total_vise: controller.getGoal(),
        total_trouve: entreprisesFinales.length,
        avec_telephone: entreprisesFinales.filter(e => e.telephone).length,
        avec_email: entreprisesFinales.filter(e => e.email).length,
        avec_siret: entreprisesFinales.filter(e => e.siret).length,
        avec_gerant: entreprisesFinales.filter(e => e.nom_gerant).length,
        duree_secondes: dureeSecondes,
        villes_scrappees: villesToScrape
    };
    return { entreprises: entreprisesFinales, stats };
}
// ============================================
// 🛠️ FONCTION UTILITAIRE
// ============================================
function createEmptyStats(message) {
    return {
        total_vise: 0,
        total_trouve: 0,
        avec_telephone: 0,
        avec_email: 0,
        avec_siret: 0,
        avec_gerant: 0,
        duree_secondes: 0,
        message
    };
}
//# sourceMappingURL=ochestratorscraperService.js.map