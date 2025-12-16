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

// import { Browser } from 'playwright';
// import { EntrepriseScraped, ScraperQuery, ScraperStats } from '../types/scraper';
// import { scrapeGoogleMapsWithOffset, closeBrowser, initBrowser } from './googleMapServices';
// import { getSiretFromInsee } from './inseeService';
// import {
//   scrapeEmailFromWebsite,
//   closeBrowserPool
// } from './websideScraperServices';
// import { getVillesFromMultipleDepartements } from '../helpers/geoHelpers';

// // Interface pour une ville
// interface Ville {
//   nom: string;
//   population?: number;
// }

// // ============================================
// // 🎯 CONFIGURATION ANTI-DÉTECTION
// // ============================================
// const ANTI_DETECTION_CONFIG = {
//   // Délais aléatoires
//   MIN_DELAY_MS: 500,
//   MAX_DELAY_MS: 2000,
  
//   // Pause longue tous les N villes
//   PAUSE_LONGUE_INTERVAL: 10,
//   PAUSE_LONGUE_MS: 180000, // 3 minutes
  
//   // Timeout enrichissement rapide (augmenté pour réduire échecs)
//   // 🔥 AUGMENTÉ : 5000 → 12000 (12s)
//   // Raison : EMAIL scraping prend 2-5s, INSEE API prend 1-3s, SIRET retries jusqu'à 3s
//   // Total possible : ~10s. Timeout de 5s était trop court et coupait les enrichissements.
//   ENRICHISSEMENT_TIMEOUT_MS: 12000,
  
//   // Parallélisation
//   MAX_VILLES_PARALLELES: 5,
//   // 🔥 AUGMENTÉ : 100→150 pour compenser stagnation Google Maps à 34 résultats
//   // Avec 47% taux extraction et 100% validation, besoin de 64 résultats pour 30 entreprises
//   // Demander 150 assure qu'on charge le maximum possible avant stagnation
//   MAX_RESULTATS_PAR_VILLE: 150,
  
//   // Pools
//   MAX_BROWSERS: 2,
//   RESET_CONTEXT_TOUS_LES_N: 5
// };

// // ============================================
// // 🔧 UTILITAIRES
// // ============================================

// /**
//  * Délai aléatoire pour éviter la détection
//  */
// async function randomDelay(): Promise<void> {
//   const delay = Math.random() * (ANTI_DETECTION_CONFIG.MAX_DELAY_MS - ANTI_DETECTION_CONFIG.MIN_DELAY_MS) + ANTI_DETECTION_CONFIG.MIN_DELAY_MS;
//   await new Promise(resolve => setTimeout(resolve, delay));
// }

// /**
//  * Trier les villes par population (grandes d'abord)
//  */
// function sortVillesByPopulation(villes: Ville[]): Ville[] {
//   return [...villes].sort((a, b) => (b.population || 0) - (a.population || 0));
// }

// /**
//  * Nettoyer le nom de l'entreprise avant recherche INSEE
//  * Supprime : emojis, horaires, descriptions, caractères spéciaux
//  * Exemple: "💊 PHARMACIE DU SOLEIL 2 7J/7 | Paris 10ème | Le dimanche selon calendrier"
//  *        → "PHARMACIE DU SOLEIL"
//  */
// function nettoyerNomPourInsee(nom: string): string {
//   if (!nom) return '';
  
//   // Supprimer les emojis
//   let cleaned = nom.replace(/[\p{Emoji}]/gu, ' ');
  
//   // Supprimer tout après "|" (horaires, descriptions)
//   cleaned = cleaned.split('|')[0];
  
//   // Supprimer les horaires (7J/7, matin, soir, etc.)
//   cleaned = cleaned.replace(/\d+J\/\d+/gi, ' ');
//   cleaned = cleaned.replace(/\d+h\d*|matin|soir|jour|nuit|selon|calendrier|dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi/gi, ' ');
  
//   // Supprimer les numéros seuls ou avec "ème" (Paris 10ème → Paris)
//   cleaned = cleaned.replace(/(\d+)\s*(?:ème|ère|e|er)\b/gi, ' ');
  
//   // Supprimer les codes postaux en fin (75, 92, etc.)
//   cleaned = cleaned.replace(/\b\d{5}\b|\b\d{2}\b$/g, ' ');
  
//   // Cleanup final : espaces multiples, trim
//   cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
//   // Si le nom nettoyé est vide ou très court, retourner original
//   if (cleaned.length < 3) {
//     return nom;
//   }
  
//   return cleaned;
// }

// /**
//  * 🔥 GÉNÉRER VARIANTES DE RECHERCHE pour multiplier les résultats
//  * Exemple: "Maçon" → ["Maçon", "Rénovation", "Bâtiment", "Construction"]
//  * Chaque variante = nouvelle requête Google Maps avec +30-50 résultats
//  */
// function genererVariantesActivite(activite: string): string[] {
//   const variantes: { [key: string]: string[] } = {
//     'maçon': ['Maçon', 'Rénovation', 'Bâtiment', 'Construction'],
//     'plombier': ['Plombier', 'Sanitaire', 'Dépannage plomberie', 'Robinetterie'],
//     'électricien': ['Électricien', 'Installation électrique', 'Dépannage électrique', 'Courant fort'],
//     'peintre': ['Peintre', 'Peinture intérieur', 'Décoration', 'Papier peint'],
//     'chauffagiste': ['Chauffagiste', 'Installation chauffage', 'Climatisation', 'Pompe à chaleur'],
//     'couvreur': ['Couvreur', 'Toiture', 'Zinguerie', 'Étanchéité'],
//     'pharmacie': ['Pharmacie', 'Pharmacien', 'Médicament', 'Santé'],
//     'restaurant': ['Restaurant', 'Café', 'Bistrot', 'Cuisine'],
//     'hôtel': ['Hôtel', 'Hébergement', 'Chambre d\'hôte', 'Location'],
//   };

//   const normalizedActivite = activite.toLowerCase().trim();
  
//   // Chercher une correspondance
//   for (const [key, variantsForKey] of Object.entries(variantes)) {
//     if (normalizedActivite.includes(key) || key.includes(normalizedActivite)) {
//       return variantsForKey;
//     }
//   }

//   // Fallback : retourner l'activité originale + 3 variantes génériques
//   return [activite, `${activite} professionnel`, `Entreprise ${activite}`, `Service ${activite}`];
// }

// /**
//  * Enrichissement RAPIDE : max 5 secondes
//  * Accepte optionnellement browser/context/page pour éviter créations supplémentaires
//  */
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

//   // 🔥 Enrichissement : SIRET + EMAIL (en parallèle rapide)
//   try {
//     await Promise.race([
//       (async () => {
//         // 🎯 Deux appels en parallèle :
//         // 1. SIRET via INSEE API (fiable)
//         // 2. EMAIL via site web (timeout court 2s)
        
//         // ✨ NETTOYAGE DU NOM : éliminer emojis, horaires, descriptions pour INSEE
//         const nomNettoyé = nettoyerNomPourInsee(gmResult.nom_societe);
        
//         // Lancer EMAIL en parallèle (timeout court)
//         const emailPromise = gmResult.site_web 
//           ? scrapeEmailFromWebsite(gmResult.site_web).catch(() => undefined)
//           : Promise.resolve(undefined);
        
//         // Lancer SIRET
//         const inseePromise = getSiretFromInsee(nomNettoyé);
        
//         // Attendre les deux en parallèle
//         const [email, inseeData] = await Promise.all([
//           emailPromise,
//           inseePromise
//         ]);

//         // Ajouter email si trouvé
//         if (email) {
//           console.log(`  📧 ${gmResult.nom_societe}: email = ${email}`);
//           entreprise.email = email;
//         }

//         // Ajouter SIRET si trouvé
//         if (inseeData.siret) {
//           console.log(`  🆔 ${gmResult.nom_societe}: SIRET = ${inseeData.siret}`);
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
//       new Promise((_, reject) => 
//         setTimeout(() => reject(new Error('Timeout')), ANTI_DETECTION_CONFIG.ENRICHISSEMENT_TIMEOUT_MS)
//       )
//     ]);
//   } catch (_error) {
//     // Timeout ou erreur : on garde l'entreprise avec juste téléphone
//   }

//   // ✅ Validation FLEXIBLE : téléphone OU email OU SIRET
//   if (entreprise.telephone || entreprise.email || entreprise.siret) {
//     return entreprise;
//   }

//   return null;
// }

// // ============================================
// // 🏙️ SCRAPER UNE SEULE VILLE AVEC VARIANTES
// // ============================================
// async function scraperUneVille(
//   ville: Ville,
//   query: ScraperQuery,
//   limiteParVille: number,
//   browser: Browser,
//   villesTraitees: number
// ): Promise<{
//   entreprises: EntrepriseScraped[];
//   villesTraitees: number;
// }> {
//   console.log(`🏙️ [${villesTraitees + 1}] Scraping ${ville.nom} (pop: ${ville.population})`);

//   try {
//     // 🔥 GÉNÉRER VARIANTES : "Maçon" → ["Maçon", "Rénovation", "Bâtiment", "Construction"]
//     const variantes = genererVariantesActivite(query.activite || '');
//     console.log(`   📌 Cherchant avec ${variantes.length} variantes: ${variantes.join(', ')}`);

//     // 🔥 SCRAPER AVEC CHAQUE VARIANTE EN PARALLÈLE (4 requêtes Google Maps)
//     const variantsResults = await Promise.all(
//       variantes.map(variante =>
//         scrapeGoogleMapsWithOffset(
//           { ...query, activite: variante, ville: ville.nom },
//           0,
//           ANTI_DETECTION_CONFIG.MAX_RESULTATS_PAR_VILLE,
//           browser
//         ).catch(() => ({ results: [] })) // Erreur ? retourner vide
//       )
//     );

//     // 🔄 FUSIONNER TOUS LES RÉSULTATS ET DÉDUPLIQUER PAR NOM+ADRESSE
//     const allResults = variantsResults.flatMap(v => v.results);
//     const seen = new Set<string>();
//     const deduplicatedResults = allResults.filter(result => {
//       const key = `${result.nom_societe}_${result.adresse}`;
//       if (seen.has(key)) return false;
//       seen.add(key);
//       return true;
//     });

//     console.log(`   📦 Total avec variantes: ${deduplicatedResults.length} (avant dédup: ${allResults.length})`);

//     if (deduplicatedResults.length === 0) {
//       console.log(`  ⚠️ Aucun résultat pour ${ville.nom}`);
//       return { entreprises: [], villesTraitees: villesTraitees + 1 };
//     }

//     // 🔥 Enrichir en parallèle
//     const enrichPromises = deduplicatedResults.map(gmResult => 
//       enrichEntrepriseRapide(gmResult, query)
//     );
//     const enriched = await Promise.all(enrichPromises);

//     // Filtrer les null
//     const valides = enriched.filter((e): e is EntrepriseScraped => e !== null);

//     console.log(`  ✅ ${ville.nom}: ${valides.length}/${deduplicatedResults.length} entreprises valides`);

//     return {
//       entreprises: valides.slice(0, limiteParVille),
//       villesTraitees: villesTraitees + 1
//     };

//   } catch (error) {
//     console.error(`  ❌ Erreur ${ville.nom}:`, error instanceof Error ? error.message : String(error));
//     return { entreprises: [], villesTraitees: villesTraitees + 1 };
//   }
// }

// // ============================================
// // 🚀 ORCHESTRATEUR INTELLIGENT
// // ============================================
// export async function orchestrateScrapingOptimized(query: ScraperQuery): Promise<{
//   entreprises: EntrepriseScraped[];
//   stats: ScraperStats;
// }> {
//   const startTime = Date.now();
//   console.log('\n🚀 SCRAPING INTELLIGENT - DÉMARRAGE');
//   console.log('📋 Config anti-détection:', ANTI_DETECTION_CONFIG);

//   // ✅ Validation
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
//   console.log(`🎯 Objectif : ${objectif} entreprises`);

//   // ============================================
//   // ÉTAPE 1 : RÉCUPÉRER LES VILLES
//   // ============================================
//   let villesToScrape: Ville[] = [];

//   if (query.ville && Array.isArray(query.ville)) {
//     // Villes spécifiées
//     villesToScrape = query.ville.map(nom => ({ nom, population: 0 }));
//     console.log(`📍 ${villesToScrape.length} villes spécifiées`);
//   } else if (query.departement && query.departement.length > 0) {
//     // Villes des départements
//     try {
//       const villes = await getVillesFromMultipleDepartements(query.departement);
//       villesToScrape = villes;
//       console.log(`📍 ${villesToScrape.length} villes trouvées`);
//     } catch (error) {
//       console.error('Erreur récupération villes:', error);
//       return {
//         entreprises: [],
//         stats: {
//           total_vise: objectif,
//           total_trouve: 0,
//           avec_telephone: 0,
//           avec_email: 0,
//           avec_siret: 0,
//           avec_gerant: 0,
//           duree_secondes: 0,
//           message: '❌ Erreur récupération villes'
//         }
//       };
//     }
//   } else {
//     return {
//       entreprises: [],
//       stats: {
//         total_vise: objectif,
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

//   // ============================================
//   // ÉTAPE 2 : TRIER PAR POPULATION (GRANDES D'ABORD)
//   // ============================================
//   const villesTriees = sortVillesByPopulation(villesToScrape);
//   console.log(`🔄 Villes triées par population (plus grandes d'abord)`);
//   console.log(`   Top 5 : ${villesTriees.slice(0, 5).map(v => `${v.nom} (${v.population})`).join(', ')}`);

//   // ============================================
//   // ÉTAPE 3 : SCRAPING EN PARALLÈLE (5 VILLES À LA FOIS)
//   // ============================================
//   const allEntreprises: EntrepriseScraped[] = [];
//   const villesScrappees: string[] = [];
//   let browser: Browser | null = null;
//   let villesTraitees = 0;

//   try {
//     // Créer le browser une fois
//     browser = await initBrowser();

//     // Batcher les villes (5 à la fois)
//     for (let i = 0; i < villesTriees.length && allEntreprises.length < objectif; i += ANTI_DETECTION_CONFIG.MAX_VILLES_PARALLELES) {
      
//       // 🎯 PAUSE LONGUE TOUS LES 10 VILLES (anti-détection)
//       if (i > 0 && i % (ANTI_DETECTION_CONFIG.PAUSE_LONGUE_INTERVAL * ANTI_DETECTION_CONFIG.MAX_VILLES_PARALLELES) === 0) {
//         console.log(`⏸️ Pause anti-détection de ${ANTI_DETECTION_CONFIG.PAUSE_LONGUE_MS / 1000}s...`);
//         await new Promise(resolve => setTimeout(resolve, ANTI_DETECTION_CONFIG.PAUSE_LONGUE_MS));
//       }

//       const lot = villesTriees.slice(i, i + ANTI_DETECTION_CONFIG.MAX_VILLES_PARALLELES);
      
//       console.log(`\n📦 LOT ${Math.floor(i / ANTI_DETECTION_CONFIG.MAX_VILLES_PARALLELES) + 1} : ${lot.map(v => v.nom).join(', ')}`);

//       // 🔥 SCRAPER 5 VILLES EN PARALLÈLE
//       const promesses = lot.map(ville => 
//         scraperUneVille(
//           ville,
//           query,
//           Math.ceil((objectif - allEntreprises.length) / lot.length),
//           browser!,
//           villesTraitees
//         )
//       );

//       const resultatsLot = await Promise.all(promesses);

//       // Ajouter les résultats
//       for (const resultat of resultatsLot) {
//         allEntreprises.push(...resultat.entreprises);
//         villesTraitees = resultat.villesTraitees;

//         if (allEntreprises.length >= objectif) {
//           console.log(`\n✅ OBJECTIF ATTEINT : ${allEntreprises.length}/${objectif}`);
//           break;
//         }
//       }

//       // Ajouter les villes scrappées
//       villesScrappees.push(...lot.map(v => v.nom));

//       // 🎯 DÉLAI ALÉATOIRE ENTRE LOTS
//       if (allEntreprises.length < objectif) {
//         await randomDelay();
//       }
//     }

//     // ============================================
//     // ÉTAPE 4 : DÉDUPLICATION & RÉSULTAT FINAL
//     // ============================================
//     const entreprisesUniques = deduplicateBySiret(allEntreprises);
//     const entreprisesFinales = entreprisesUniques.slice(0, objectif);

//     console.log(`\n✨ Résultats finaux :`);
//     console.log(`   - Trouvées : ${entreprisesFinales.length}/${objectif}`);
//     console.log(`   - Avec téléphone : ${entreprisesFinales.filter(e => e.telephone).length}`);
//     console.log(`   - Avec email : ${entreprisesFinales.filter(e => e.email).length}`);
//     console.log(`   - Avec SIRET : ${entreprisesFinales.filter(e => e.siret).length}`);
//     console.log(`   - Avec gérant : ${entreprisesFinales.filter(e => e.nom_gerant).length}`);

//     const stats: ScraperStats = {
//       total_vise: objectif,
//       total_trouve: entreprisesFinales.length,
//       avec_telephone: entreprisesFinales.filter(e => e.telephone).length,
//       avec_email: entreprisesFinales.filter(e => e.email).length,
//       avec_siret: entreprisesFinales.filter(e => e.siret).length,
//       avec_gerant: entreprisesFinales.filter(e => e.nom_gerant).length,
//       duree_secondes: Math.round((Date.now() - startTime) / 1000),
//       villes_scrappees: villesScrappees,
//       message: entreprisesFinales.length === 0 
//         ? '❌ Aucune entreprise trouvée'
//         : '✅ Scraping réussi'
//     };

//     return { entreprises: entreprisesFinales, stats };

//   } catch (error) {
//     console.error('❌ Erreur orchestration:', error);
    
//     const duree = Math.round((Date.now() - startTime) / 1000);
    
//     return {
//       entreprises: allEntreprises.slice(0, objectif),
//       stats: {
//         total_vise: objectif,
//         total_trouve: allEntreprises.length,
//         avec_telephone: allEntreprises.filter(e => e.telephone).length,
//         avec_email: allEntreprises.filter(e => e.email).length,
//         avec_siret: allEntreprises.filter(e => e.siret).length,
//         avec_gerant: allEntreprises.filter(e => e.nom_gerant).length,
//         duree_secondes: duree,
//         villes_scrappees: villesScrappees,
//         message: `⚠️ Erreur : ${error instanceof Error ? error.message : 'Erreur inconnue'}`
//       }
//     };

//   } finally {
//     // Fermer les ressources
//     if (browser) {
//       await closeBrowser(browser);
//     }
//     await closeBrowserPool();
//   }
// }

// // ============================================
// // 🎯 UTILITAIRE : DÉDUPLICATION
// // ============================================
// function deduplicateBySiret(entreprises: EntrepriseScraped[]): EntrepriseScraped[] {
//   const seen = new Set<string>();
//   return entreprises.filter(e => {
//     if (!e.siret) return true;
//     if (seen.has(e.siret)) return false;
//     seen.add(e.siret);
//     return true;
//   });
// }


import { Browser, Page } from 'playwright';
import { EntrepriseScraped, InseeResult, ScraperQuery, ScraperStats, GoogleMapsResult } from '../types/scraper';
import { scrapeGoogleMapsWithOffset, closeBrowser } from './googleMapServices';
import { getSiretFromInsee } from './inseeService';
import { scrapeEmailFromWebsite, closeBrowserPool } from './websideScraperServices';
import { getVillesFromMultipleDepartements } from '../helpers/geoHelpers';
import { waitRandomDelay } from './userAgentsRotation';
// import { getRandomUserAgent, waitRandomDelay } from './userAgentRotation';

// Interface pour une ville
interface Ville {
  nom: string;
  population?: number;
}

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
  MAX_CITIES_PARALLEL: 3,   // Réduit pour éviter blocage
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
async function intelligentDelay(): Promise<void> {
  await waitRandomDelay(OPTIMIZED_CONFIG.MIN_DELAY_MS, OPTIMIZED_CONFIG.MAX_DELAY_MS);
}

/**
 * Trier les villes par population (grandes d'abord)
 */
function sortVillesByPopulation(villes: Ville[]): Ville[] {
  return [...villes].sort((a, b) => (b.population || 0) - (a.population || 0));
}

/**
 * Nettoyer le nom pour INSEE - OPTIMISÉ
 */
function nettoyerNomPourInsee(nom: string): string {
  if (!nom) return '';
  
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
function generateActivityVariants(activite: string): string[] {
  const base = activite.toLowerCase().trim();

  const variants: string[] = [];

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

/**
 * Enrichissement RAPIDE et INTELLIGENT
 */
// async function enrichEntrepriseIntelligent(
//   gmResult: any,
//   query: ScraperQuery
// ): Promise<EntrepriseScraped | null> {
//   const cpMatch = gmResult.adresse?.match(/\b\d{5}\b/);
//   const code_postal = cpMatch ? cpMatch[0] : '';
//   const departement = code_postal ? code_postal.substring(0, 2) : '';

//   const entreprise: EntrepriseScraped = {
//     id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//     nom_societe: gmResult.nom_societe || '',
//     telephone: gmResult.telephone || '',
//     adresse: gmResult.adresse || '',
//     code_postal,
//     ville: gmResult.ville || '',
//     departement,
//     activite: gmResult.activite || query.activite || '',
//     site_web: gmResult.site_web,
//     note: gmResult.note,
//     nombre_avis: gmResult.nombre_avis,
//     scraped_at: new Date()
//   };

//   // Vérification basique
//   if (!entreprise.telephone) {
//     return null;
//   }

//   // 🔥 Enrichissement PARALLELE avec timeout intelligent
//   try {
//     await Promise.race([
//       (async () => {
//         const promises = [];
        
//         // 1. EMAIL (si site web)
//         if (entreprise.site_web) {
//           promises.push(
//             scrapeEmailFromWebsite(entreprise.site_web).catch(() => undefined)
//           );
//         }
        
//         // 2. SIRET (si nom valide)
//         if (entreprise.nom_societe && entreprise.nom_societe.length > 3) {
//           const nomNettoye = nettoyerNomPourInsee(entreprise.nom_societe);
//           promises.push(
//             getSiretFromInsee(nomNettoye).catch(() => ({}))
//           );
//         }
        
//         // Exécuter en parallèle
//         if (promises.length > 0) {
//           const [email, inseeData] = await Promise.all(promises);
          
//           if (email) {
//             entreprise.email = email;
//           }
          
//           if (inseeData?.siret) {
//             entreprise.siret = inseeData.siret;
//             entreprise.siren = inseeData.siren;
//             entreprise.etat_administratif = inseeData.etat_administratif;
//             entreprise.adresse_etablissement = inseeData.adresse_etablissement;
//             entreprise.code_postal_etablissement = inseeData.code_postal_etablissement;
//             entreprise.ville_etablissement = inseeData.ville_etablissement;
//             entreprise.nom_gerant = inseeData.nom_gerant || entreprise.nom_gerant;
//           }
//         }
//       })(),
//       new Promise((_, reject) => 
//         setTimeout(() => reject(new Error('Timeout enrichissement')), OPTIMIZED_CONFIG.ENRICHMENT_TIMEOUT_MS)
//       )
//     ]);
//   } catch (error) {
//     // Timeout acceptable, on garde ce qu'on a
//   }

//   return entreprise;
// }


// Dans orchestratorScraperOptimized.ts - CORRIGÉ

/**
 * Enrichissement RAPIDE et INTELLIGENT - VERSION CORRIGÉE
 */
interface EnrichmentOptions {
  skipEmail?: boolean;
}

async function enrichEntrepriseIntelligent(
  gmResult: any,
  query: ScraperQuery,
  options: EnrichmentOptions = {}
): Promise<EntrepriseScraped | null> {
  const cpMatch = gmResult.adresse?.match(/\b\d{5}\b/);
  const code_postal = cpMatch ? cpMatch[0] : '';
  const departement = code_postal ? code_postal.substring(0, 2) : '';

  const entreprise: EntrepriseScraped = {
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
        const enrichmentPromises: Promise<any>[] = [];
        
        // 1. EMAIL (si site web) - promesse qui retourne string | undefined
        if (!options.skipEmail) {
          if (entreprise.site_web) {
            enrichmentPromises.push(
              scrapeEmailFromWebsite(entreprise.site_web).catch(() => undefined)
            );
          } else {
            enrichmentPromises.push(Promise.resolve(undefined));
          }
        } else {
          // Mode "light" : on ne scrape pas les emails pour alléger la RAM / Playwright
          enrichmentPromises.push(Promise.resolve(undefined));
        }
        
        // 2. SIRET (si nom valide) - promesse qui retourne InseeResult
        if (entreprise.nom_societe && entreprise.nom_societe.length > 3) {
          const nomNettoye = nettoyerNomPourInsee(entreprise.nom_societe);
          enrichmentPromises.push(
            getSiretFromInsee(nomNettoye).catch(() => ({} as InseeResult))
          );
        } else {
          // Si nom trop court, on push une promesse résolue avec objet vide
          enrichmentPromises.push(Promise.resolve({} as InseeResult));
        }
        
        // Exécuter en parallèle - Maintenant les types sont cohérents
        const results = await Promise.all(enrichmentPromises);
        
        // 🔥 CORRECTION ICI : results[0] est email, results[1] est inseeData
        // TypeScript sait maintenant que results[0] peut être string | undefined
        // et results[1] est InseeResult
        const emailResult = results[0] as string | undefined;
        const inseeData = results[1] as InseeResult;
        
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
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout enrichissement')), OPTIMIZED_CONFIG.ENRICHMENT_TIMEOUT_MS)
      )
    ]);
  } catch (error) {
    // Timeout acceptable, on garde ce qu'on a
    console.log(`⚠️ Timeout enrichissement pour ${entreprise.nom_societe}`);
  }

  return entreprise;
}

/**
 * Scraper une ville OPTIMISÉ
 */
async function scraperVilleOptimized(
  ville: Ville,
  query: ScraperQuery,
  resultsNeeded: number,
  browser: Browser | null,
  page: Page | null,
  isSingleCityMode: boolean,
  skipEmail: boolean
): Promise<{ entreprises: EntrepriseScraped[]; browser: Browser; page: Page }> {
  console.log(`🏙️ Scraping ${ville.nom} (objectif: ${resultsNeeded})`);

  try {
    // 🔥 REQUÊTE PRINCIPALE bien formulée
    const baseSearchQuery = `${query.activite || ''} ${ville.nom}`.trim();

    let allGoogleResults: GoogleMapsResult[] = [];

    // Appel principal à Google Maps en réutilisant navigateur/page si dispo
    const baseCall = await scrapeGoogleMapsWithOffset(
      { 
        ...query, 
        activite: baseSearchQuery,
        ville: [ville.nom]
      },
      0,
      Math.min(resultsNeeded * 2, OPTIMIZED_CONFIG.MAX_RESULTS_PER_CITY), // Demander 2x plus
      browser || undefined,
      page || undefined
    ).catch(() => ({ results: [] as GoogleMapsResult[], browser: browser!, page: page! }));

    browser = baseCall.browser;
    page = baseCall.page;
    allGoogleResults.push(...baseCall.results);

    // 🔁 MODE "MONO-VILLE" : tester quelques variantes proches de l'activité
    // Utile quand Google ne renvoie que ~20 résultats pour la requête principale
    if (
      isSingleCityMode &&
      query.activite &&
      allGoogleResults.length < resultsNeeded &&
      resultsNeeded > 20 // on ne déclenche les variantes que pour des besoins "gros"
    ) {
      const variants = generateActivityVariants(query.activite);
      console.log(`   🔍 Mono-ville: ${variants.length} variantes d'activité pour enrichir (${variants.join(', ')})`);

      for (const variant of variants) {
        // Arrêt si on a déjà suffisamment de matière brute
        if (allGoogleResults.length >= resultsNeeded * 2) break;

        const variantCall: { results: GoogleMapsResult[]; browser: Browser; page: Page } = await scrapeGoogleMapsWithOffset(
          {
            ...query,
            activite: `${variant} ${ville.nom}`.trim(),
            ville: [ville.nom]
          },
          0,
          Math.min(resultsNeeded * 2, OPTIMIZED_CONFIG.MAX_RESULTS_PER_CITY),
          browser || undefined,
          page || undefined
        ).catch(() => ({ results: [] as GoogleMapsResult[], browser: browser!, page: page! }));

        browser = variantCall.browser;
        page = variantCall.page;

        if (variantCall.results.length > 0) {
          console.log(`   ➕ Variante "${variant}": +${variantCall.results.length} résultats bruts`);
          allGoogleResults.push(...variantCall.results);
        }

        // Petite pause entre variantes pour éviter d'enchaîner trop vite
        await waitRandomDelay(600, 1500);
      }
    }

    // Déduplication des résultats Google Maps (nom + adresse)
    if (allGoogleResults.length === 0) {
      console.log(`  ⚠️ Aucun résultat pour ${ville.nom}`);
      // On retourne quand même le browser/page pour réutilisation potentielle
      return { entreprises: [], browser: browser!, page: page! };
    }

    const seenKey = new Set<string>();
    const dedupedGoogleResults = allGoogleResults.filter(result => {
      const key = `${(result.nom_societe || '').trim()}_${(result.adresse || '').trim()}`;
      if (!key.trim()) return false;
      if (seenKey.has(key)) return false;
      seenKey.add(key);
      return true;
    });

    console.log(`  📊 ${dedupedGoogleResults.length} résultats bruts (après déduplication nom+adresse sur ${allGoogleResults.length} bruts)`);

    // Enrichissement par lots de 3
    const entreprises: EntrepriseScraped[] = [];
    const seenSirets = new Set<string>();
    
    const ENRICH_BATCH_SIZE = 5; // petit parallèle raisonnable vers INSEE / emails

    for (let i = 0; i < dedupedGoogleResults.length; i += ENRICH_BATCH_SIZE) {
      const batch = dedupedGoogleResults.slice(i, i + ENRICH_BATCH_SIZE);
      
      const enrichedBatch = await Promise.all(
        batch.map(result => enrichEntrepriseIntelligent(result, query, { skipEmail }))
      );
      
      // Filtrer et dédupliquer
      const validBatch = enrichedBatch.filter((e): e is EntrepriseScraped => {
        if (!e) return false;
        
        // Éviter doublons SIRET
        if (e.siret && seenSirets.has(e.siret)) return false;
        if (e.siret) seenSirets.add(e.siret);
        
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
        await waitRandomDelay(300, 800);
      }
    }

    console.log(`  ✅ ${ville.nom}: ${entreprises.length} entreprises valides`);
    return { entreprises: entreprises.slice(0, resultsNeeded), browser: browser!, page: page! };

  } catch (error) {
    console.error(`  ❌ Erreur ${ville.nom}:`, error);
    return { entreprises: [], browser: browser!, page: page! };
  }
}

// ============================================
// 🚀 ORCHESTRATEUR PRINCIPAL - ULTRA OPTIMISÉ
// ============================================
export async function orchestrateScrapingOptimized(query: ScraperQuery): Promise<{
  entreprises: EntrepriseScraped[];
  stats: ScraperStats;
}> {
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
  let villesToScrape: Ville[] = [];

  if (query.ville && Array.isArray(query.ville)) {
    villesToScrape = query.ville.map(nom => ({ nom, population: 0 }));
  } else if (query.departement && query.departement.length > 0) {
    try {
      const villes = await getVillesFromMultipleDepartements(query.departement);
      villesToScrape = villes;
    } catch (error) {
      console.error('Erreur récupération villes:', error);
      return {
        entreprises: [],
        stats: createStats(target, 0, 0, 0, 0, 0, 0, '❌ Erreur récupération villes')
      };
    }
  } else {
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
  const allEntreprises: EntrepriseScraped[] = [];
  const villesScrappees: string[] = [];
  let browser: Browser | null = null;
  let page: Page | null = null;
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
      if (remainingGlobal <= 0) break;

      // Pause stratégique tous les N requêtes (par ville)
      requestCount += batch.length;
      if (requestCount > 0 && requestCount % OPTIMIZED_CONFIG.PAUSE_AFTER_REQUESTS === 0) {
        console.log(`⏸️ Pause anti-détection: ${OPTIMIZED_CONFIG.PAUSE_DURATION_MS / 1000}s`);
        await new Promise(resolve => setTimeout(resolve, OPTIMIZED_CONFIG.PAUSE_DURATION_MS));
      }

      console.log(`\n📦 Batch ${Math.floor(i / parallelCities) + 1}: ${batch.map(v => v.nom).join(', ')} | Progression: ${allEntreprises.length}/${target}`);

      const perCityTarget = Math.min(Math.ceil(remainingGlobal / batch.length) + 5, 30);

      const promises = batch.map(ville =>
        scraperVilleOptimized(
          ville,
          query,
          perCityTarget,
          browser,
          page,
          villesTriees.length === 1, // mono-ville => variantes permises
          isHugeRun // si énorme run, pas d'emails
        )
      );

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
        } else {
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
    
    const stats = createStats(
      target,
      finalResults.length,
      finalResults.filter(e => e.telephone).length,
      finalResults.filter(e => e.email).length,
      finalResults.filter(e => e.siret).length,
      finalResults.filter(e => e.nom_gerant).length,
      Math.round((Date.now() - startTime) / 1000),
      successRate >= OPTIMIZED_CONFIG.MIN_SUCCESS_RATE 
        ? `✅ Scraping réussi (${(successRate * 100).toFixed(0)}%)` 
        : `⚠️ Objectif partiel (${(successRate * 100).toFixed(0)}%)`
    );
    
    stats.villes_scrappees = villesScrappees;
    
    console.log(`\n✨ SCRAPING TERMINÉ`);
    console.log(`📊 ${finalResults.length}/${target} entreprises`);
    console.log(`⏱️ ${stats.duree_secondes}s (${(finalResults.length / stats.duree_secondes).toFixed(1)}/sec)`);
    console.log(`📞 ${stats.avec_telephone} avec téléphone`);
    console.log(`📧 ${stats.avec_email} avec email`);
    console.log(`🆔 ${stats.avec_siret} avec SIRET`);
    
    return { entreprises: finalResults, stats };

  } catch (error) {
    console.error('❌ Erreur orchestration:', error);
    
    const partialResults = deduplicateEntreprises(allEntreprises).slice(0, target);
    const duree = Math.round((Date.now() - startTime) / 1000);
    
    return {
      entreprises: partialResults,
      stats: createStats(
        target,
        partialResults.length,
        partialResults.filter(e => e.telephone).length,
        partialResults.filter(e => e.email).length,
        partialResults.filter(e => e.siret).length,
        partialResults.filter(e => e.nom_gerant).length,
        duree,
        `⚠️ Erreur partielle: ${error instanceof Error ? error.message : 'Inconnue'}`
      )
    };
  } finally {
    if (browser) {
      await closeBrowser(browser);
    }
    await closeBrowserPool();
  }
}

// ============================================
// 🛠️ FONCTIONS UTILITAIRES
// ============================================

function deduplicateEntreprises(entreprises: EntrepriseScraped[]): EntrepriseScraped[] {
  const seen = new Set<string>();
  return entreprises.filter(e => {
    const key = e.siret || `${e.nom_societe}_${e.adresse}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createStats(
  total_vise: number,
  total_trouve: number,
  avec_telephone: number,
  avec_email: number,
  avec_siret: number,
  avec_gerant: number,
  duree_secondes: number,
  message: string
): ScraperStats {
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