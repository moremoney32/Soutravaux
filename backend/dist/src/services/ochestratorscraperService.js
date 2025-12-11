"use strict";
// // src/services/ochestratorscraperService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestrateScrapingOptimized = orchestrateScrapingOptimized;
const googleMapSevices_1 = require("./googleMapSevices");
const inseeService_1 = require("./inseeService");
const websideScraperServices_1 = require("./websideScraperServices");
const playwright_1 = require("playwright");
// ============================================
// 🎯 CONFIGURATION
// ============================================
// const CONFIG = {
//   MAX_PARALLEL_VILLES: 10,        // Maximum de villes en parallèle
//   MAX_CONCURRENT_ENRICH: 5,       // 5 enrichissements max en parallèle
//   ENRICH_TIMEOUT_MS: 8000,
//   BATCH_SIZE: 20,
//   OBJECTIF_MAX: 500
// };
const CONFIG = {
    MAX_PARALLEL_VILLES: 10, // ✅ 10 villes (optimal pour 7GB)
    MAX_CONCURRENT_ENRICH: 8, // ✅ 8 au lieu de 5 (tu as la RAM)
    ENRICH_TIMEOUT_MS: 8000, // ✅ 8 secondes
    BATCH_SIZE: 20, // ✅ 20 entreprises par batch Google Maps
    OBJECTIF_MAX: 500 // ✅ Limite de sécurité
};
// ============================================
// 🛡️ CONTROLLER SÉCURISÉ (pas besoin de p-limit)
// ============================================
class ScrapingController {
    constructor(objectif) {
        this.entreprises = [];
        this.siretsSeen = new Set();
        this.isGoalReached = false;
        this.objectif = Math.min(objectif, CONFIG.OBJECTIF_MAX);
    }
    // 🎯 Ajout thread-safe
    addEntreprise(entreprise) {
        // Vérifier atomiquement
        if (this.isGoalReached) {
            return { added: false, goalReached: true };
        }
        // Déduplication
        if (entreprise.siret && this.siretsSeen.has(entreprise.siret)) {
            return { added: false, goalReached: false };
        }
        // Ajouter
        if (entreprise.siret) {
            this.siretsSeen.add(entreprise.siret);
        }
        this.entreprises.push(entreprise);
        // Vérifier objectif
        if (this.entreprises.length >= this.objectif) {
            this.isGoalReached = true;
            return { added: true, goalReached: true };
        }
        return { added: true, goalReached: false };
    }
    isCompleted() {
        return this.isGoalReached;
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
}
// ============================================
// 🚀 ENRICHISSEMENT (inchangé)
// ============================================
async function enrichEntrepriseRapide(gmResult, query) {
    const cpMatch = gmResult.adresse.match(/\b\d{5}\b/);
    const code_postal = cpMatch ? cpMatch[0] : '';
    const departement = code_postal ? code_postal.substring(0, 2) : '';
    const entreprise = {
        id: `${Date.now()}-${Math.random()}`,
        nom_societe: gmResult.nom_societe,
        telephone: gmResult.telephone,
        adresse: gmResult.adresse,
        code_postal,
        ville: gmResult.ville || '',
        departement,
        activite: gmResult.activite || query.activite || '',
        site_web: gmResult.site_web,
        note: gmResult.note,
        nombre_avis: gmResult.nombre_avis,
        scraped_at: new Date()
    };
    try {
        await Promise.race([
            (async () => {
                const [email, gerant, inseeData] = await Promise.all([
                    gmResult.site_web ? (0, websideScraperServices_1.scrapeEmailFromWebsite)(gmResult.site_web) : undefined,
                    gmResult.site_web ? (0, websideScraperServices_1.scrapeGerantFromWebsite)(gmResult.site_web) : undefined,
                    (0, inseeService_1.getSiretFromInsee)(gmResult.nom_societe)
                ]);
                if (email)
                    entreprise.email = email;
                if (gerant)
                    entreprise.nom_gerant = gerant;
                if (inseeData.siret) {
                    entreprise.siret = inseeData.siret;
                    entreprise.siren = inseeData.siren;
                    entreprise.etat_administratif = inseeData.etat_administratif;
                    entreprise.adresse_etablissement = inseeData.adresse_etablissement;
                    entreprise.code_postal_etablissement = inseeData.code_postal_etablissement;
                    entreprise.ville_etablissement = inseeData.ville_etablissement;
                    if (!entreprise.nom_gerant && inseeData.nom_gerant) {
                        entreprise.nom_gerant = inseeData.nom_gerant;
                    }
                }
            })(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
        ]);
    }
    catch (error) {
        // Timeout - on garde les données partielles
    }
    // 🎯 VALIDER : Garder si SIRET OU email OU téléphone
    if (entreprise.siret || entreprise.email || entreprise.telephone) {
        return entreprise;
    }
    return null;
}
// ============================================
// 🚀 SCRAPER D'UNE VILLE (AMÉLIORÉ)
// ============================================
async function scraperVille(ville, query, controller) {
    console.log(`🏙️  Début: ${ville}`);
    const browser = await playwright_1.chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
        let offset = 0;
        let entreprisesVille = 0;
        let batchNumber = 0;
        // 🎯 BOUCLE JUSQU'À LIMITE OU OBJECTIF ATTEINT
        while (!controller.isCompleted() && entreprisesVille < 50) { // Max 50 par ville
            batchNumber++;
            const queryVille = { ...query, ville };
            const { results } = await (0, googleMapSevices_1.scrapeGoogleMapsWithOffset)(queryVille, offset, CONFIG.BATCH_SIZE, browser, undefined);
            if (!results || results.length === 0) {
                console.log(`ℹ️  ${ville}: Aucun résultat (batch ${batchNumber})`);
                break;
            }
            console.log(`📊 ${ville}: ${results.length} résultats (batch ${batchNumber})`);
            // 🎯 ENRICHIR AVEC LIMITATION MANUELLE (pas de p-limit)
            const enrichPromises = results.map(gmResult => enrichEntrepriseRapide(gmResult, queryVille));
            // Limiter manuellement à 5 enrichissements "actifs"
            const chunkSize = CONFIG.MAX_CONCURRENT_ENRICH;
            let addedInBatch = 0;
            for (let i = 0; i < enrichPromises.length; i += chunkSize) {
                if (controller.isCompleted())
                    break;
                const chunk = enrichPromises.slice(i, i + chunkSize);
                const enriched = await Promise.allSettled(chunk);
                for (const result of enriched) {
                    if (controller.isCompleted())
                        break;
                    if (result.status === 'fulfilled' && result.value) {
                        const { added, goalReached } = controller.addEntreprise(result.value);
                        if (added) {
                            entreprisesVille++;
                            addedInBatch++;
                        }
                        if (goalReached) {
                            console.log(`🎯 ${ville}: Objectif global atteint`);
                            return { success: true, count: entreprisesVille };
                        }
                    }
                }
                // Petite pause entre chunks d'enrichissement
                if (!controller.isCompleted() && i + chunkSize < enrichPromises.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            console.log(`✅ ${ville}: +${addedInBatch} entreprises (total: ${entreprisesVille})`);
            // Vérifier si on peut arrêter cette ville
            if (addedInBatch === 0 && results.length > 0) {
                console.log(`⚠️  ${ville}: Aucune entreprise valide, arrêt`);
                break;
            }
            offset += CONFIG.BATCH_SIZE;
            // Petite pause entre batches Google Maps
            if (!controller.isCompleted() && batchNumber < 3) {
                await new Promise(resolve => setTimeout(resolve, 2000));
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
        await browser.close();
    }
}
// ============================================
// 🚀 ORCHESTRATEUR OPTIMISÉ POUR FRONTEND
// ============================================
async function orchestrateScrapingOptimized(query) {
    const startTime = Date.now();
    console.log('\n🚀 SCRAPING OPTIMISÉ POUR FRONTEND...');
    // VALIDATION
    if (!query.region) {
        return {
            entreprises: [],
            stats: createEmptyStats('⚠️ La région est obligatoire')
        };
    }
    // 🎯 CRÉER LE CONTROLLER
    const controller = new ScrapingController(query.nombre_resultats || 20);
    console.log(`🎯 Objectif: ${controller.getGoal()} entreprises`);
    // 🎯 RÉCUPÉRER LES VILLES (DÉJÀ TRIÉES PAR FRONTEND)
    let villesToScrape = [];
    if (query.ville) {
        // ⚠️ Frontend a déjà trié par population !
        villesToScrape = Array.isArray(query.ville) ? query.ville : [query.ville];
        console.log(`📍 ${villesToScrape.length} villes (triées par frontend)`);
    }
    else if (query.departement?.length) {
        // Fallback si pas de villes spécifiées
        // const villesData = await getVillesFromMultipleDepartements(query.departement);
        // villesData.sort((a, b) => (b.population || 0) - (a.population || 0));
        // villesToScrape = villesData.map(v => v.nom);
        console.log(`📍 ${villesToScrape.length} villes triées par population`);
    }
    else {
        return {
            entreprises: [],
            stats: createEmptyStats('⚠️ Au moins un département ou une ville requis')
        };
    }
    // 🎯 LIMITER LE PARALLÉLISME
    villesToScrape = villesToScrape.slice(0, CONFIG.MAX_PARALLEL_VILLES);
    console.log(`⚙️  Configuration: ${villesToScrape.length} villes en parallèle`);
    // 🎯 LANCER LE SCRAPING EN PARALLÈLE MAIS AVEC SURVEILLANCE
    const scrapingPromises = villesToScrape.map(ville => scraperVille(ville, query, controller));
    // 🎯 SURVEILLANCE EN TEMPS RÉEL
    const progressInterval = setInterval(() => {
        console.log(`📈 Progression: ${controller.getCount()}/${controller.getGoal()}`);
        if (controller.isCompleted()) {
            console.log(`🎯 Objectif atteint ! Arrêt en cours...`);
        }
    }, 3000);
    // 🎯 ATTENDRE TOUTES LES PROMESSES MAIS AVEC ARRÊT INTELLIGENT
    try {
        // Attendre un peu pour voir si objectif atteint rapidement
        await Promise.race([
            Promise.allSettled(scrapingPromises),
            new Promise(resolve => {
                // Vérifier périodiquement si objectif atteint
                const checkInterval = setInterval(() => {
                    if (controller.isCompleted()) {
                        clearInterval(checkInterval);
                        resolve('goal_reached');
                    }
                }, 1000);
            })
        ]);
    }
    catch (error) {
        console.error('💥 Erreur globale:', error);
    }
    finally {
        clearInterval(progressInterval);
    }
    // 🎯 NETTOYAGE
    await (0, websideScraperServices_1.closeBrowserPool)();
    // 📊 STATISTIQUES FINALES
    const entreprisesFinales = controller.getEntreprises();
    const dureeSecondes = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n✨ SCRAPING TERMINÉ`);
    console.log(`📊 Résultats: ${entreprisesFinales.length}/${controller.getGoal()}`);
    console.log(`⏱️ Durée: ${dureeSecondes}s`);
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
// 🛠️ FONCTIONS UTILITAIRES
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