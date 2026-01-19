"use strict";
// /**
//  * 🎯 CONTRÔLEUR DE SCRAPING OPTIMISÉ
//  * Utilise orchestrateScrapingOptimized pour une meilleure performance
//  */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeGoogleMapsController = void 0;
const orchestratorScraperOptimized_1 = require("../services/orchestratorScraperOptimized");
const scrapeGoogleMapsController = async (req, res) => {
    try {
        const { region, departement, ville, activite, nombre_resultats } = req.body;
        console.log('📥 Requête reçue:', {
            region,
            departements: Array.isArray(departement) ? departement.length : 0,
            villes: Array.isArray(ville) ? ville.length : 0,
            activite,
            nombre_resultats
        });
        // ✅ Validation
        if (!region) {
            res.status(400).json({
                success: false,
                message: 'La région est obligatoire',
                stats: createEmptyStats('⚠️ La région est obligatoire'),
                data: []
            });
            return;
        }
        // Limiter le nombre de résultats pour la performance
        const maxResults = Math.min(nombre_resultats || 20, 100);
        // Construire la query
        const query = {
            region,
            departement: departement
                ? (Array.isArray(departement) ? departement : [departement])
                : undefined,
            ville: ville
                ? (Array.isArray(ville) ? ville : [ville])
                : undefined,
            activite: activite || undefined,
            nombre_resultats: maxResults
        };
        console.log('🔧 Query finale:', {
            region: query.region,
            departements: query.departement?.length || 0,
            villes: query.ville?.length || 0,
            activite: query.activite,
            nombre_resultats: query.nombre_resultats
        });
        // 🚀 Lancer le scraping optimisé
        const { entreprises, stats } = await (0, orchestratorScraperOptimized_1.orchestrateScrapingOptimized)(query);
        // ✅ Retourner les résultats
        res.status(200).json({
            success: true,
            message: stats.message,
            stats,
            data: entreprises
        });
        console.log(`✅ Scraping terminé: ${entreprises.length} entreprises en ${stats.duree_secondes}s`);
    }
    catch (error) {
        console.error('❌ Erreur controller:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            stats: createEmptyStats('❌ Erreur serveur'),
            data: [],
            error: error.message
        });
    }
};
exports.scrapeGoogleMapsController = scrapeGoogleMapsController;
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
//# sourceMappingURL=ScraperControllerOptimized.js.map