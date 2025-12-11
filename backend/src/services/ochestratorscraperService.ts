
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

import { EntrepriseScraped, ScraperQuery, ScraperStats } from '../types/scraper';
import { scrapeGoogleMapsWithOffset} from './googleMapSevices';
import { getSiretFromInsee } from './inseeService';
import {
  scrapeEmailFromWebsite,
  scrapeGerantFromWebsite,
  closeBrowserPool
} from './websideScraperServices';
import { chromium } from 'playwright';

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
  MAX_PARALLEL_VILLES: 10,        // ✅ 10 villes (optimal pour 7GB)
  MAX_CONCURRENT_ENRICH: 8,       // ✅ 8 au lieu de 5 (tu as la RAM)
  ENRICH_TIMEOUT_MS: 8000,        // ✅ 8 secondes
  BATCH_SIZE: 20,                 // ✅ 20 entreprises par batch Google Maps
  OBJECTIF_MAX: 500               // ✅ Limite de sécurité
};

// ============================================
// 🛡️ CONTROLLER SÉCURISÉ (pas besoin de p-limit)
// ============================================
class ScrapingController {
  private entreprises: EntrepriseScraped[] = [];
  private siretsSeen = new Set<string>();
  private objectif: number;
  private isGoalReached = false;

  constructor(objectif: number) {
    this.objectif = Math.min(objectif, CONFIG.OBJECTIF_MAX);
  }

  // 🎯 Ajout thread-safe
  addEntreprise(entreprise: EntrepriseScraped): { added: boolean; goalReached: boolean } {
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

  isCompleted(): boolean {
    return this.isGoalReached;
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
}

// ============================================
// 🚀 ENRICHISSEMENT (inchangé)
// ============================================
async function enrichEntrepriseRapide(
  gmResult: any,
  query: ScraperQuery
): Promise<EntrepriseScraped | null> {
  const cpMatch = gmResult.adresse.match(/\b\d{5}\b/);
  const code_postal = cpMatch ? cpMatch[0] : '';
  const departement = code_postal ? code_postal.substring(0, 2) : '';

  const entreprise: EntrepriseScraped = {
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
          gmResult.site_web ? scrapeEmailFromWebsite(gmResult.site_web) : undefined,
          gmResult.site_web ? scrapeGerantFromWebsite(gmResult.site_web) : undefined,
          getSiretFromInsee(gmResult.nom_societe)
        ]);

        if (email) entreprise.email = email;
        if (gerant) entreprise.nom_gerant = gerant;

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
  } catch (error) {
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
async function scraperVille(
  ville: string,
  query: ScraperQuery,
  controller: ScrapingController
): Promise<{ success: boolean; count: number }> {
  console.log(`🏙️  Début: ${ville}`);
  
  const browser = await chromium.launch({
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
      
      const { results } = await scrapeGoogleMapsWithOffset(
        queryVille,
        offset,
        CONFIG.BATCH_SIZE,
        browser,
        undefined
      );
      
      if (!results || results.length === 0) {
        console.log(`ℹ️  ${ville}: Aucun résultat (batch ${batchNumber})`);
        break;
      }

      console.log(`📊 ${ville}: ${results.length} résultats (batch ${batchNumber})`);

      // 🎯 ENRICHIR AVEC LIMITATION MANUELLE (pas de p-limit)
      const enrichPromises = results.map(gmResult => 
        enrichEntrepriseRapide(gmResult, queryVille)
      );

      // Limiter manuellement à 5 enrichissements "actifs"
      const chunkSize = CONFIG.MAX_CONCURRENT_ENRICH;
      let addedInBatch = 0;
      
      for (let i = 0; i < enrichPromises.length; i += chunkSize) {
        if (controller.isCompleted()) break;
        
        const chunk = enrichPromises.slice(i, i + chunkSize);
        const enriched = await Promise.allSettled(chunk);
        
        for (const result of enriched) {
          if (controller.isCompleted()) break;
          
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

  } catch (error: any) {
    console.error(`❌ ${ville}: Erreur - ${error.message}`);
    return { success: false, count: 0 };
  } finally {
    await browser.close();
  }
}

// ============================================
// 🚀 ORCHESTRATEUR OPTIMISÉ POUR FRONTEND
// ============================================
export async function orchestrateScrapingOptimized(query: ScraperQuery): Promise<{
  entreprises: EntrepriseScraped[];
  stats: ScraperStats;
}> {
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
  let villesToScrape: string[] = [];

  if (query.ville) {
    // ⚠️ Frontend a déjà trié par population !
    villesToScrape = Array.isArray(query.ville) ? query.ville : [query.ville];
    console.log(`📍 ${villesToScrape.length} villes (triées par frontend)`);
  } else if (query.departement?.length) {
    // Fallback si pas de villes spécifiées
    // const villesData = await getVillesFromMultipleDepartements(query.departement);
    // villesData.sort((a, b) => (b.population || 0) - (a.population || 0));
    // villesToScrape = villesData.map(v => v.nom);
    console.log(`📍 ${villesToScrape.length} villes triées par population`);
  } else {
    return {
      entreprises: [],
      stats: createEmptyStats('⚠️ Au moins un département ou une ville requis')
    };
  }

  // 🎯 LIMITER LE PARALLÉLISME
  villesToScrape = villesToScrape.slice(0, CONFIG.MAX_PARALLEL_VILLES);
  console.log(`⚙️  Configuration: ${villesToScrape.length} villes en parallèle`);

  // 🎯 LANCER LE SCRAPING EN PARALLÈLE MAIS AVEC SURVEILLANCE
  const scrapingPromises = villesToScrape.map(ville => 
    scraperVille(ville, query, controller)
  );

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
  } catch (error) {
    console.error('💥 Erreur globale:', error);
  } finally {
    clearInterval(progressInterval);
  }

  // 🎯 NETTOYAGE
  await closeBrowserPool();

  // 📊 STATISTIQUES FINALES
  const entreprisesFinales = controller.getEntreprises();
  const dureeSecondes = Math.round((Date.now() - startTime) / 1000);
  
  console.log(`\n✨ SCRAPING TERMINÉ`);
  console.log(`📊 Résultats: ${entreprisesFinales.length}/${controller.getGoal()}`);
  console.log(`⏱️ Durée: ${dureeSecondes}s`);

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
// 🛠️ FONCTIONS UTILITAIRES
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