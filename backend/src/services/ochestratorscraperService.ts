
// // src/services/ochestratorscraperService.ts

// import { EntrepriseScraped, ScraperQuery, ScraperStats } from '../types/scraper';
// import { scrapeGoogleMapsWithOffset, closeBrowser } from './googleMapSevices';
// import { getSiretFromInsee } from './inseeService';
// import {
//   scrapeEmailFromWebsite,
//   scrapeGerantFromWebsite,
//   closeBrowserPool
// } from './websideScraperServices';
// import { parallelLimit } from './parralel';
// import { Browser, Page } from 'playwright';
// import { getVillesFromMultipleDepartements } from '../helpers/geoHelpers';



// // ENRICHIR UNE ENTREPRISE

// async function enrichEntreprise(
//   gmResult: any,
//   query: ScraperQuery,
//   index: number,
//   total: number
// ): Promise<EntrepriseScraped | null> {
//   console.log(`[${index + 1}/${total}] 🔄 ${gmResult.nom_societe}`);

//   const cpMatch = gmResult.adresse.match(/\b\d{5}\b/);
//   const code_postal = cpMatch ? cpMatch[0] : '';
//   const departement = code_postal ? code_postal.substring(0, 2) : '';

//   const entreprise: EntrepriseScraped = {
//     id: `${Date.now()}-${index}-${Math.random()}`,
//     nom_societe: gmResult.nom_societe,
//     telephone: gmResult.telephone,
//     adresse: gmResult.adresse,
//     code_postal,
//     ville: gmResult.ville || '',
//     departement,
//     activite: gmResult.activite || query.activite || '',
//     site_web: gmResult.site_web,
//     note: gmResult.note ?? undefined,
//     nombre_avis: gmResult.nombre_avis ?? undefined,
//     scraped_at: new Date()
//   };

//   const [email, gerant, inseeData] = await Promise.all([
//     gmResult.site_web ? scrapeEmailFromWebsite(gmResult.site_web) : Promise.resolve(undefined),
//     gmResult.site_web ? scrapeGerantFromWebsite(gmResult.site_web) : Promise.resolve(undefined),
//     getSiretFromInsee(gmResult.nom_societe)
//   ]);

//   if (email) entreprise.email = email;
//   if (gerant) entreprise.nom_gerant = gerant;

//   if (inseeData.siret) {
//     entreprise.siret = inseeData.siret;
//     entreprise.siren = inseeData.siren;
//     entreprise.etat_administratif = inseeData.etat_administratif;
//     entreprise.adresse_etablissement = inseeData.adresse_etablissement;
//     entreprise.code_postal_etablissement = inseeData.code_postal_etablissement;
//     entreprise.ville_etablissement = inseeData.ville_etablissement;

//     if (!entreprise.nom_gerant && inseeData.nom_gerant) {
//       entreprise.nom_gerant = inseeData.nom_gerant;
//     }
//   }

//   if (entreprise.siret || entreprise.email) {
//     console.log(`[${index + 1}/${total}] Valide`);
//     return entreprise;
//   } else {
//     console.log(`[${index + 1}/${total}] Ignorée`);
//     return null;
//   }
// }


// // SCRAPER UNE SEULE VILLE

// async function scraperVille(
//   ville: string,
//   query: ScraperQuery,
//   objectifParVille: number,
//   browser?: Browser,
//   page?: Page
// ): Promise<{ entreprises: EntrepriseScraped[], browser?: Browser, page?: Page }> {
//   console.log(`\n🏙️ Scraping ville: ${ville}`);

//   const entreprisesVille: EntrepriseScraped[] = [];
//   let offset = 0;
//   let attempts = 0;
//   const max_attempts = 5;

//   let currentBrowser = browser;
//   let currentPage = page;

//   while (entreprisesVille.length < objectifParVille && attempts < max_attempts) {
//     attempts++;

//     const queryVille = { ...query, ville };

//     const { results, browser: gmBrowser, page: gmPage } = await scrapeGoogleMapsWithOffset(
//       queryVille,
//       offset,
//       15,
//       currentBrowser,
//       currentPage
//     );

//     currentBrowser = gmBrowser;
//     currentPage = gmPage;

//     if (results.length === 0) {
//       console.log(` Aucun résultat pour ${ville}`);
//       break;
//     }

//     const enriched = await parallelLimit(
//       results,
//       (gmResult, index) => enrichEntreprise(gmResult, queryVille, index, results.length),
//       5
//     );

//     const valides = enriched.filter(e => e !== null) as EntrepriseScraped[];
//     entreprisesVille.push(...valides);

//     console.log(`${ville}: ${entreprisesVille.length}/${objectifParVille} entreprises`);

//     if (entreprisesVille.length >= objectifParVille) break;

//     offset += 15;
//   }

//   return {
//     entreprises: entreprisesVille.slice(0, objectifParVille),
//     browser: currentBrowser,
//     page: currentPage
//   };
// }


// // DÉDUPLICATION PAR SIRET

// function deduplicateBySiret(entreprises: EntrepriseScraped[]): EntrepriseScraped[] {
//   const seen = new Set<string>();
//   return entreprises.filter(e => {
//     if (!e.siret) return true;
//     if (seen.has(e.siret)) return false;
//     seen.add(e.siret);
//     return true;
//   });
// }


// // ORCHESTRER SCRAPING (MULTI-VILLES)


// export async function orchestrateScraping(query: ScraperQuery): Promise<{
//   entreprises: EntrepriseScraped[];
//   stats: ScraperStats;
// }> {
//   const startTime = Date.now();
//   const MAX_DURATION = 180000;
//   let timeoutReached = false;

//   console.log('\n🚀 SCRAPING MULTI-VILLES...');
//   console.log('📋 Paramètres:', query);

//   if (!query.region) {
//     return {
//       entreprises: [],
//       stats: {
//         total_vise: 0,
//         total_trouve: 0,
//         avec_telephone: 0,
//         avec_email: 0,
//         avec_siret: 0,
//         avec_gerant: 0,
//         duree_secondes: 0,
//         message: '⚠️ La région est obligatoire'
//       }
//     };
//   }

//   const objectif = query.nombre_resultats || 20;

//   let villesToScrape: string[] = [];

//   // : Vérifier le type de query.ville
//   if (query.ville) {
//     if (Array.isArray(query.ville)) {
//       villesToScrape = query.ville;
//     } else {
//       villesToScrape = [query.ville];
//     }
//     console.log(` ${villesToScrape.length} villes spécifiées`);
//   } 
//   else if (query.departement && query.departement.length > 0) {
//     console.log(` Récupération villes de ${query.departement.length} départements...`);
//     const villesData = await getVillesFromMultipleDepartements(query.departement);
//     villesToScrape = villesData.map(v => v.nom);
//     console.log(` ${villesToScrape.length} villes trouvées`);
//   } 
//   else {
//     return {
//       entreprises: [],
//       stats: {
//         total_vise: 0,
//         total_trouve: 0,
//         avec_telephone: 0,
//         avec_email: 0,
//         avec_siret: 0,
//         avec_gerant: 0,
//         duree_secondes: 0,
//         message: '⚠️ Au moins un département ou une ville est requis'
//       }
//     };
//   }

//   if (villesToScrape.length > 20) {
//     console.log(`⚠️ Limitation à 20 villes`);
//     villesToScrape = villesToScrape.slice(0, 20);
//   }

//   const allEntreprises: EntrepriseScraped[] = [];
//   const villesScrappees: string[] = [];
//   const objectifParVille = Math.ceil(objectif / villesToScrape.length);

//   console.log(`📊 Objectif : ${objectifParVille} entreprises par ville`);

//   let browser: Browser | undefined;
//   let page: Page | undefined;

//   const timeout = setTimeout(() => {
//     timeoutReached = true;
//     console.warn('⏱️ TIMEOUT 3 MINUTES');
//   }, MAX_DURATION);

//   try {
//     for (const ville of villesToScrape) {
//       if (timeoutReached) break;

//       const result = await scraperVille(ville, query, objectifParVille, browser, page);

//       browser = result.browser;
//       page = result.page;

//       allEntreprises.push(...result.entreprises);
//       villesScrappees.push(ville);

//       console.log(`📊 Total : ${allEntreprises.length}/${objectif}`);

//       if (allEntreprises.length >= objectif) break;
//     }

//     clearTimeout(timeout);

//     const entreprisesUniques = deduplicateBySiret(allEntreprises);
//     const entreprisesFinales = entreprisesUniques.slice(0, objectif);

//     console.log(` ${entreprisesFinales.length} entreprises uniques`);

//     if (entreprisesFinales.length === 0) {
//       return {
//         entreprises: [],
//         stats: {
//           total_vise: objectif,
//           total_trouve: 0,
//           avec_telephone: 0,
//           avec_email: 0,
//           avec_siret: 0,
//           avec_gerant: 0,
//           duree_secondes: Math.round((Date.now() - startTime) / 1000),
//           message: '❌ Aucune entreprise trouvée',
//           villes_scrappees: villesScrappees
//         }
//       };
//     }

//     const stats: ScraperStats = {
//       total_vise: objectif,
//       total_trouve: entreprisesFinales.length,
//       avec_telephone: entreprisesFinales.filter(e => e.telephone).length,
//       avec_email: entreprisesFinales.filter(e => e.email).length,
//       avec_siret: entreprisesFinales.filter(e => e.siret).length,
//       avec_gerant: entreprisesFinales.filter(e => e.nom_gerant).length,
//       duree_secondes: Math.round((Date.now() - startTime) / 1000),
//       villes_scrappees: villesScrappees,
//       message: timeoutReached ? '⏱️ Timeout - Résultats partiels' : undefined
//     };

//     return { entreprises: entreprisesFinales, stats };

//   } finally {
//     clearTimeout(timeout);
//     if (browser) await closeBrowser(browser);
//     await closeBrowserPool();
//   }
// }


// // src/services/orchestratorScraperOptimized.ts

// // src/services/orchestratorScraperOptimized.ts




// import { EntrepriseScraped, ScraperQuery, ScraperStats } from '../types/scraper';
// import { scrapeGoogleMapsWithOffset, closeBrowser } from './googleMapSevices';
// import { getSiretFromInsee } from './inseeService';
// import {
//   scrapeEmailFromWebsite,
//   scrapeGerantFromWebsite,
//   closeBrowserPool
// } from './websideScraperServices';
// import { Browser, Page } from 'playwright';
// import { getVillesFromMultipleDepartements } from '../helpers/geoHelpers';

// import { EntrepriseScraped, ScraperQuery, ScraperStats } from '../types/scraper';
// import { scrapeGoogleMapsWithOffset, closeBrowser } from './googleMapSevices';
// import { getSiretFromInsee } from './inseeService';
// import {
//   scrapeEmailFromWebsite,
//   scrapeGerantFromWebsite,
//   closeBrowserPool
// } from './websideScraperServices';
// import { getVillesFromMultipleDepartements } from '../helpers/geoHelpers';
// import { chromium} from 'playwright'

// // ============================================
// // ENRICHISSEMENT AVEC TIMEOUT AGRESSIF
// // ============================================
// async function enrichEntrepriseRapide(
//   gmResult: any,
//   query: ScraperQuery
// ): Promise<EntrepriseScraped | null> {
//   const cpMatch = gmResult.adresse.match(/\b\d{5}\b/);
//   const code_postal = cpMatch ? cpMatch[0] : '';
//   const departement = code_postal ? code_postal.substring(0, 2) : '';

//   const entreprise: EntrepriseScraped = {
//     id: `${Date.now()}-${Math.random()}`,
//     nom_societe: gmResult.nom_societe,
//     telephone: gmResult.telephone,
//     adresse: gmResult.adresse,
//     code_postal,
//     ville: gmResult.ville || '',
//     departement,
//     activite: gmResult.activite || query.activite || '',
//     site_web: gmResult.site_web,
//     note: gmResult.note,
//     nombre_avis: gmResult.nombre_avis,
//     scraped_at: new Date()
//   };

//   // 🔥 ENRICHISSEMENT AVEC TIMEOUT DE 8 SECONDES
//   try {
//     await Promise.race([
//       (async () => {
//         const [email, gerant, inseeData] = await Promise.all([
//           gmResult.site_web ? scrapeEmailFromWebsite(gmResult.site_web) : undefined,
//           gmResult.site_web ? scrapeGerantFromWebsite(gmResult.site_web) : undefined,
//           getSiretFromInsee(gmResult.nom_societe)
//         ]);

//         if (email) entreprise.email = email;
//         if (gerant) entreprise.nom_gerant = gerant;

//         if (inseeData.siret) {
//           entreprise.siret = inseeData.siret;
//           entreprise.siren = inseeData.siren;
//           entreprise.etat_administratif = inseeData.etat_administratif;
//           entreprise.adresse_etablissement = inseeData.adresse_etablissement;
//           entreprise.code_postal_etablissement = inseeData.code_postal_etablissement;
//           entreprise.ville_etablissement = inseeData.ville_etablissement;
//           if (!entreprise.nom_gerant && inseeData.nom_gerant) {
//             entreprise.nom_gerant = inseeData.nom_gerant;
//           }
//         }
//       })(),
//       new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
//     ]);
//   } catch (error) {
//     // Timeout ou erreur : on garde quand même l'entreprise si elle a un téléphone
//   }

//   // 🎯 VALIDER : Garder si SIRET OU email OU téléphone
//   if (entreprise.siret || entreprise.email || entreprise.telephone) {
//     return entreprise;
//   }

//   return null;
// }

// // ============================================
// // 🚀 SCRAPING D'UNE VILLE (RAPIDE)
// // ============================================
// async function scraperVilleRapide(
//   ville: string,
//   query: ScraperQuery,
//   limiteParVille: number,
//   entreprisesGlobales: EntrepriseScraped[],
//   objectifGlobal: number
// ): Promise<EntrepriseScraped[]> {
//   const entreprisesVille: EntrepriseScraped[] = [];
//   let offset = 0;

//   const browser = await chromium.launch({
//     headless: true,
//     args: ['--no-sandbox', '--disable-setuid-sandbox']
//   });

//   try {
//     // 🎯 SCRAPER JUSQU'À ATTEINDRE LA LIMITE GLOBALE
//     while (entreprisesVille.length < limiteParVille && 
//            entreprisesGlobales.length < objectifGlobal) {

//       const queryVille = { ...query, ville };

//       const { results } = await scrapeGoogleMapsWithOffset(
//         queryVille,
//         offset,
//         20, // Batch de 20
//         browser,
//         undefined
//       );

//       if (results.length === 0) break;

//       // 🔥 ENRICHIR EN PARALLÈLE (10 à la fois)
//       const enrichPromises = results.map(gmResult => 
//         enrichEntrepriseRapide(gmResult, queryVille)
//       );

//       const enriched = await Promise.all(enrichPromises);

//       // Ajouter les entreprises valides
//       for (const entreprise of enriched) {
//         if (!entreprise) continue;

//         entreprisesVille.push(entreprise);

//         // 🎯 ARRÊT SI LIMITE GLOBALE ATTEINTE
//         if (entreprisesGlobales.length + entreprisesVille.length >= objectifGlobal) {
//           console.log(`🎯 ${ville}: Limite globale atteinte`);
//           return entreprisesVille;
//         }

//         // 🎯 ARRÊT SI LIMITE PAR VILLE ATTEINTE
//         if (entreprisesVille.length >= limiteParVille) {
//           console.log(`✅ ${ville}: ${entreprisesVille.length} entreprises trouvées`);
//           return entreprisesVille;
//         }
//       }

//       offset += 20;
//     }

//     return entreprisesVille;

//   } finally {
//     await closeBrowser(browser);
//   }
// }

// // ============================================
// // 🚀 ORCHESTRATEUR ULTRA-RAPIDE
// // ============================================
// export async function orchestrateScrapingUltraFast(query: ScraperQuery): Promise<{
//   entreprises: EntrepriseScraped[];
//   stats: ScraperStats;
// }> {
//   const startTime = Date.now();
//   console.log('\n🚀 SCRAPING ULTRA-RAPIDE...');

//   if (!query.region) {
//     return {
//       entreprises: [],
//       stats: {
//         total_vise: 0,
//         total_trouve: 0,
//         avec_telephone: 0,
//         avec_email: 0,
//         avec_siret: 0,
//         avec_gerant: 0,
//         duree_secondes: 0,
//         message: '⚠️ La région est obligatoire'
//       }
//     };
//   }

//   const objectif = query.nombre_resultats || 20;

//   // RÉCUPÉRER LES VILLES
//   let villesToScrape: string[] = [];

//   if (query.ville) {
//     villesToScrape = Array.isArray(query.ville) ? query.ville : [query.ville];
//   } else if (query.departement && query.departement.length > 0) {
//     const villesData = await getVillesFromMultipleDepartements(query.departement);
//     // villesData.sort((a, b) => (b.population || 0) - (a.population || 0));
//     villesToScrape = villesData.map(v => v.nom);
//   } else {
//     return {
//       entreprises: [],
//       stats: {
//         total_vise: 0,
//         total_trouve: 0,
//         avec_telephone: 0,
//         avec_email: 0,
//         avec_siret: 0,
//         avec_gerant: 0,
//         duree_secondes: 0,
//         message: '⚠️ Au moins un département ou une ville requis'
//       }
//     };
//   }

//   // Limiter à 10 villes pour éviter trop de parallélisme
//   villesToScrape = villesToScrape.slice(0, 10);

//   const limiteParVille = Math.ceil(objectif / villesToScrape.length);
//   const entreprisesGlobales: EntrepriseScraped[] = [];
//   const siretsSeen = new Set<string>();

//   console.log(`📊 Objectif : ${objectif} entreprises sur ${villesToScrape.length} villes`);
//   console.log(`📊 Cible : ~${limiteParVille} par ville`);

//   // 🔥 LANCER LE SCRAPING DE TOUTES LES VILLES EN PARALLÈLE
//   const promesses = villesToScrape.map(ville => 
//     scraperVilleRapide(ville, query, limiteParVille, entreprisesGlobales, objectif)
//   );

//   // 🎯 ATTENDRE QUE TOUTES LES VILLES FINISSENT OU QUE LA LIMITE SOIT ATTEINTE
//   const resultatsVilles = await Promise.allSettled(promesses);

//   // 🎯 COLLECTER LES RÉSULTATS (DÉDUPLICATION)
//   for (const result of resultatsVilles) {
//     if (result.status === 'fulfilled') {
//       for (const entreprise of result.value) {
//         // Déduplication par SIRET
//         if (entreprise.siret && siretsSeen.has(entreprise.siret)) continue;
//         if (entreprise.siret) siretsSeen.add(entreprise.siret);

//         entreprisesGlobales.push(entreprise);

//         // 🎯 ARRÊT DÈS QUE LA LIMITE EST ATTEINTE
//         if (entreprisesGlobales.length >= objectif) break;
//       }
//     }
//   }

//   await closeBrowserPool();

//   // STATS FINALES
//   const entreprisesFinales = entreprisesGlobales.slice(0, objectif);
//   const dureeSecondes = Math.round((Date.now() - startTime) / 1000);

//   console.log(`\n✅ SCRAPING TERMINÉ`);
//   console.log(`📊 ${entreprisesFinales.length}/${objectif} entreprises trouvées`);
//   console.log(`⏱️ Durée: ${dureeSecondes}s`);

//   const stats: ScraperStats = {
//     total_vise: objectif,
//     total_trouve: entreprisesFinales.length,
//     avec_telephone: entreprisesFinales.filter(e => e.telephone).length,
//     avec_email: entreprisesFinales.filter(e => e.email).length,
//     avec_siret: entreprisesFinales.filter(e => e.siret).length,
//     avec_gerant: entreprisesFinales.filter(e => e.nom_gerant).length,
//     duree_secondes: dureeSecondes
//   };

//   return { entreprises: entreprisesFinales, stats };
// }

// src/services/orchestratorScraperOptimized.ts
// VERSION 3 FINALE - CORRIGÉE POUR OBTENIR TOUS LES RÉSULTATS

// ochestratorscraperService.ts - VERSION OPTIMISÉE

import { EntrepriseScraped, ScraperQuery, ScraperStats } from '../types/scraper';
import { scrapeGoogleMapsWithOffset } from './googleMapSevices';
import { getSiretFromInsee } from './inseeService';
import {
  scrapeEmailFromWebsite,
  scrapeGerantFromWebsite,
  closeBrowserPool
} from './websideScraperServices';
import { chromium } from 'playwright';

// ============================================
// 🎯 CONFIGURATION HYPER-OPTIMISÉE
// ============================================
const CONFIG = {
  MAX_PARALLEL_VILLES: 3,        // ⚡ RÉDUIT : 3 villes MAX en parallèle
  MAX_CONCURRENT_ENRICH: 4,      // ⚡ RÉDUIT : 4 enrichissements simultanés
  ENRICH_TIMEOUT_MS: 5000,       // ⚡ RÉDUIT : 5 secondes max
  BATCH_SIZE: 15,                // ⚡ OPTIMAL : 15 résultats par batch
  OBJECTIF_MAX: 500,
  MAX_ENTREPRISES_PAR_VILLE: 30, // ⚡ RÉDUIT : 30 max par ville
  MAX_BATCHES_PAR_VILLE: 2,      // ⚡ RÉDUIT : 2 batches max par ville
  PROGRESS_CHECK_INTERVAL: 2000, // Vérif toutes les 2 secondes
  MIN_VALID_RATE: 0.3            // ⚡ Arrêt si <30% des résultats sont valides
};

// ============================================
// 🚨 CONTROLLER AVEC INTERRUPTION INTELLIGENTE
// ============================================
class SmartScrapingController {
  private entreprises: EntrepriseScraped[] = [];
  private siretsSeen = new Set<string>();
  private objectif: number;
  private isGoalReached = false;
  private shouldStopAll = false; // ⚡ NOUVEAU : flag d'arrêt global

  constructor(objectif: number) {
    this.objectif = Math.min(objectif, CONFIG.OBJECTIF_MAX);
  }

  // ⚡ Vérification rapide avant toute opération
  shouldContinue(): boolean {
    return !this.isGoalReached && !this.shouldStopAll;
  }

  addEntreprise(entreprise: EntrepriseScraped): { added: boolean; goalReached: boolean } {
    // ⚡ Vérification ultra-rapide
    if (!this.shouldContinue()) {
      return { added: false, goalReached: this.isGoalReached };
    }

    // Déduplication rapide
    if (entreprise.siret && this.siretsSeen.has(entreprise.siret)) {
      return { added: false, goalReached: false };
    }

    if (entreprise.siret) this.siretsSeen.add(entreprise.siret);

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
  forceStop(): void {
    this.shouldStopAll = true;
    console.log('🛑 Arrêt forcé déclenché');
  }

  isStopped(): boolean {
    return this.shouldStopAll;
  }

  getEntreprises(): EntrepriseScraped[] {
    return this.entreprises.slice(0, this.objectif);
  }

  getCount(): number {
    return this.entreprises.length;
  }

  getGoal(): number {
    return this.objectif;
  }

  getRemainingCount(): number {
    return Math.max(0, this.objectif - this.entreprises.length);
  }
}

// ============================================
// ⚡ ENRICHISSEMENT SUPER-RAPIDE (avec cache)
// ============================================
const emailCache = new Map<string, string | undefined>();
const gerantCache = new Map<string, string | undefined>();
const siretCache = new Map<string, any>();

async function enrichEntrepriseUltraRapide(
  gmResult: any,
  query: ScraperQuery
): Promise<EntrepriseScraped | null> {
  // ⚡ Validation ultra-rapide
  if (!gmResult.nom_societe || gmResult.nom_societe.length < 2) {
    return null;
  }

  const cpMatch = gmResult.adresse?.match(/\b\d{5}\b/);
  const code_postal = cpMatch ? cpMatch[0] : '';
  const departement = code_postal ? code_postal.substring(0, 2) : '';

  const entreprise: EntrepriseScraped = {
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
    const promises: Promise<any>[] = [];

    // Email (avec cache)
    if (gmResult.site_web && !emailCache.has(gmResult.site_web)) {
      promises.push(
        scrapeEmailFromWebsite(gmResult.site_web)
          .then(email => emailCache.set(gmResult.site_web!, email))
          .catch(() => emailCache.set(gmResult.site_web!, undefined))
      );
    }

    // Gérant (avec cache)
    if (gmResult.site_web && !gerantCache.has(gmResult.site_web)) {
      promises.push(
        scrapeGerantFromWebsite(gmResult.site_web)
          .then(gerant => gerantCache.set(gmResult.site_web!, gerant))
          .catch(() => gerantCache.set(gmResult.site_web!, undefined))
      );
    }

    // SIRET (avec cache)
    if (!siretCache.has(gmResult.nom_societe)) {
      promises.push(
        getSiretFromInsee(gmResult.nom_societe)
          .then(data => siretCache.set(gmResult.nom_societe, data))
          .catch(() => siretCache.set(gmResult.nom_societe, null))
      );
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

  } catch (error) {
    // Silencieux
  }

  // ⚡ Validation finale RAPIDE
  const hasValidData = 
    entreprise.telephone || 
    entreprise.email || 
    entreprise.siret ||
    (entreprise.nom_societe && entreprise.nom_societe.length > 3);

  return hasValidData ? entreprise : null;
}

// ============================================
// ⚡ SCRAPER VILLE AVEC ARRÊT INTELLIGENT
// ============================================
async function scraperVilleIntelligent(
  ville: string,
  query: ScraperQuery,
  controller: SmartScrapingController
): Promise<{ success: boolean; count: number; reason?: string }> {
  console.log(`🏙️  Début: ${ville}`);

  let browser;
  try {
    browser = await chromium.launch({
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
        const scraped = await scrapeGoogleMapsWithOffset(
          queryVille,
          offset,
          batchSize,
          browser,
          undefined
        );
        results = scraped.results;
      } catch (error) {
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
        const enrichPromises = chunk.map(gmResult =>
          enrichEntrepriseUltraRapide(gmResult, queryVille)
        );

        const enriched = await Promise.allSettled(enrichPromises);

        // ⚡ TRAITEMENT RAPIDE DES RÉSULTATS
        for (const result of enriched) {
          if (!controller.shouldContinue()) break;

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
      } else {
        offset += batchSize;
        consecutiveEmptyBatches++;
      }
    }

    console.log(`🏁 ${ville}: Terminé avec ${entreprisesVille} entreprises`);
    return { success: true, count: entreprisesVille };

  } catch (error: any) {
    console.error(`❌ ${ville}: Erreur - ${error.message}`);
    return { success: false, count: 0 };
  } finally {
    if (browser) await browser.close();
  }
}

// ============================================
// 🚀 ORCHESTRATEUR HYPER-INTELLIGENT
// ============================================
export async function orchestrateScrapingOptimized(query: ScraperQuery): Promise<{
  entreprises: EntrepriseScraped[];
  stats: ScraperStats;
}> {
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
  let villesToScrape: string[] = [];
  if (query.ville) {
    villesToScrape = Array.isArray(query.ville) ? query.ville : [query.ville];
  }
  
  // ⚡ LIMITATION INTELLIGENTE : Moins de villes si petit objectif
  const parallelLimit = Math.min(
    CONFIG.MAX_PARALLEL_VILLES,
    Math.ceil(controller.getGoal() / 10) // 1 ville pour 10 résultats max
  );
  
  villesToScrape = villesToScrape.slice(0, parallelLimit);
  console.log(`📍 ${villesToScrape.length} villes sélectionnées (objectif: ${controller.getGoal()})`);

  // ⚡ EXÉCUTION AVEC SURVEILLANCE EN TEMPS RÉEL
  const scrapingPromises = villesToScrape.map(ville =>
    scraperVilleIntelligent(ville, query, controller)
  );

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

  } catch (error) {
    console.error('💥 Erreur globale:', error);
  } finally {
    clearInterval(progressInterval);
    // ⚡ FORCER L'ARRÊT AU CAS OÙ
    controller.forceStop();
  }

  // ⚡ NETTOYAGE URGENT
  await closeBrowserPool();

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

  const stats: ScraperStats = {
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
function createEmptyStats(message: string): ScraperStats {
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