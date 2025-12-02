
// src/services/ochestratorscraperService.ts

import { EntrepriseScraped, ScraperQuery, ScraperStats } from '../types/scraper';
import { scrapeGoogleMapsWithOffset, closeBrowser } from './googleMapSevices';
import { getSiretFromInsee } from './inseeService';
import {
  scrapeEmailFromWebsite,
  scrapeGerantFromWebsite,
  closeBrowserPool
} from './websideScraperServices';
import { parallelLimit } from './parralel';
import { Browser, Page } from 'playwright';
import { getVillesFromMultipleDepartements } from '../helpers/geoHelpers';



// ENRICHIR UNE ENTREPRISE

async function enrichEntreprise(
  gmResult: any,
  query: ScraperQuery,
  index: number,
  total: number
): Promise<EntrepriseScraped | null> {
  console.log(`[${index + 1}/${total}] 🔄 ${gmResult.nom_societe}`);

  const cpMatch = gmResult.adresse.match(/\b\d{5}\b/);
  const code_postal = cpMatch ? cpMatch[0] : '';
  const departement = code_postal ? code_postal.substring(0, 2) : '';

  const entreprise: EntrepriseScraped = {
    id: `${Date.now()}-${index}-${Math.random()}`,
    nom_societe: gmResult.nom_societe,
    telephone: gmResult.telephone,
    adresse: gmResult.adresse,
    code_postal,
    ville: gmResult.ville || '',
    departement,
    activite: gmResult.activite || query.activite || '',
    site_web: gmResult.site_web,
    note: gmResult.note ?? undefined,
    nombre_avis: gmResult.nombre_avis ?? undefined,
    scraped_at: new Date()
  };

  const [email, gerant, inseeData] = await Promise.all([
    gmResult.site_web ? scrapeEmailFromWebsite(gmResult.site_web) : Promise.resolve(undefined),
    gmResult.site_web ? scrapeGerantFromWebsite(gmResult.site_web) : Promise.resolve(undefined),
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

  if (entreprise.siret || entreprise.email) {
    console.log(`[${index + 1}/${total}] Valide`);
    return entreprise;
  } else {
    console.log(`[${index + 1}/${total}] Ignorée`);
    return null;
  }
}


// SCRAPER UNE SEULE VILLE

async function scraperVille(
  ville: string,
  query: ScraperQuery,
  objectifParVille: number,
  browser?: Browser,
  page?: Page
): Promise<{ entreprises: EntrepriseScraped[], browser?: Browser, page?: Page }> {
  console.log(`\n🏙️ Scraping ville: ${ville}`);

  const entreprisesVille: EntrepriseScraped[] = [];
  let offset = 0;
  let attempts = 0;
  const max_attempts = 5;

  let currentBrowser = browser;
  let currentPage = page;

  while (entreprisesVille.length < objectifParVille && attempts < max_attempts) {
    attempts++;

    const queryVille = { ...query, ville };

    const { results, browser: gmBrowser, page: gmPage } = await scrapeGoogleMapsWithOffset(
      queryVille,
      offset,
      15,
      currentBrowser,
      currentPage
    );

    currentBrowser = gmBrowser;
    currentPage = gmPage;

    if (results.length === 0) {
      console.log(` Aucun résultat pour ${ville}`);
      break;
    }

    const enriched = await parallelLimit(
      results,
      (gmResult, index) => enrichEntreprise(gmResult, queryVille, index, results.length),
      5
    );

    const valides = enriched.filter(e => e !== null) as EntrepriseScraped[];
    entreprisesVille.push(...valides);

    console.log(`${ville}: ${entreprisesVille.length}/${objectifParVille} entreprises`);

    if (entreprisesVille.length >= objectifParVille) break;

    offset += 15;
  }

  return {
    entreprises: entreprisesVille.slice(0, objectifParVille),
    browser: currentBrowser,
    page: currentPage
  };
}


// DÉDUPLICATION PAR SIRET

function deduplicateBySiret(entreprises: EntrepriseScraped[]): EntrepriseScraped[] {
  const seen = new Set<string>();
  return entreprises.filter(e => {
    if (!e.siret) return true;
    if (seen.has(e.siret)) return false;
    seen.add(e.siret);
    return true;
  });
}


// ORCHESTRER SCRAPING (MULTI-VILLES)


export async function orchestrateScraping(query: ScraperQuery): Promise<{
  entreprises: EntrepriseScraped[];
  stats: ScraperStats;
}> {
  const startTime = Date.now();
  const MAX_DURATION = 180000;
  let timeoutReached = false;

  console.log('\n🚀 SCRAPING MULTI-VILLES...');
  console.log('📋 Paramètres:', query);

  if (!query.region) {
    return {
      entreprises: [],
      stats: {
        total_vise: 0,
        total_trouve: 0,
        avec_telephone: 0,
        avec_email: 0,
        avec_siret: 0,
        avec_gerant: 0,
        duree_secondes: 0,
        message: '⚠️ La région est obligatoire'
      }
    };
  }

  const objectif = query.nombre_resultats || 20;

  let villesToScrape: string[] = [];

  // : Vérifier le type de query.ville
  if (query.ville) {
    if (Array.isArray(query.ville)) {
      villesToScrape = query.ville;
    } else {
      villesToScrape = [query.ville];
    }
    console.log(` ${villesToScrape.length} villes spécifiées`);
  } 
  else if (query.departement && query.departement.length > 0) {
    console.log(` Récupération villes de ${query.departement.length} départements...`);
    const villesData = await getVillesFromMultipleDepartements(query.departement);
    villesToScrape = villesData.map(v => v.nom);
    console.log(` ${villesToScrape.length} villes trouvées`);
  } 
  else {
    return {
      entreprises: [],
      stats: {
        total_vise: 0,
        total_trouve: 0,
        avec_telephone: 0,
        avec_email: 0,
        avec_siret: 0,
        avec_gerant: 0,
        duree_secondes: 0,
        message: '⚠️ Au moins un département ou une ville est requis'
      }
    };
  }

  if (villesToScrape.length > 20) {
    console.log(`⚠️ Limitation à 20 villes`);
    villesToScrape = villesToScrape.slice(0, 20);
  }

  const allEntreprises: EntrepriseScraped[] = [];
  const villesScrappees: string[] = [];
  const objectifParVille = Math.ceil(objectif / villesToScrape.length);

  console.log(`📊 Objectif : ${objectifParVille} entreprises par ville`);

  let browser: Browser | undefined;
  let page: Page | undefined;

  const timeout = setTimeout(() => {
    timeoutReached = true;
    console.warn('⏱️ TIMEOUT 3 MINUTES');
  }, MAX_DURATION);

  try {
    for (const ville of villesToScrape) {
      if (timeoutReached) break;

      const result = await scraperVille(ville, query, objectifParVille, browser, page);

      browser = result.browser;
      page = result.page;

      allEntreprises.push(...result.entreprises);
      villesScrappees.push(ville);

      console.log(`📊 Total : ${allEntreprises.length}/${objectif}`);

      if (allEntreprises.length >= objectif) break;
    }

    clearTimeout(timeout);

    const entreprisesUniques = deduplicateBySiret(allEntreprises);
    const entreprisesFinales = entreprisesUniques.slice(0, objectif);

    console.log(` ${entreprisesFinales.length} entreprises uniques`);

    if (entreprisesFinales.length === 0) {
      return {
        entreprises: [],
        stats: {
          total_vise: objectif,
          total_trouve: 0,
          avec_telephone: 0,
          avec_email: 0,
          avec_siret: 0,
          avec_gerant: 0,
          duree_secondes: Math.round((Date.now() - startTime) / 1000),
          message: '❌ Aucune entreprise trouvée',
          villes_scrappees: villesScrappees
        }
      };
    }

    const stats: ScraperStats = {
      total_vise: objectif,
      total_trouve: entreprisesFinales.length,
      avec_telephone: entreprisesFinales.filter(e => e.telephone).length,
      avec_email: entreprisesFinales.filter(e => e.email).length,
      avec_siret: entreprisesFinales.filter(e => e.siret).length,
      avec_gerant: entreprisesFinales.filter(e => e.nom_gerant).length,
      duree_secondes: Math.round((Date.now() - startTime) / 1000),
      villes_scrappees: villesScrappees,
      message: timeoutReached ? '⏱️ Timeout - Résultats partiels' : undefined
    };

    return { entreprises: entreprisesFinales, stats };

  } finally {
    clearTimeout(timeout);
    if (browser) await closeBrowser(browser);
    await closeBrowserPool();
  }
}