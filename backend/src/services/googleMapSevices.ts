// // src/services/googlemaps.scraper.service.ts

import { chromium, Browser, Page } from 'playwright';
import { GoogleMapsResult, ScraperQuery } from '../types/scraper';

export async function initBrowser(): Promise<Browser> {
  console.log('Initialisation du navigateur...');
  
  const browser = await chromium.launch({
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

async function checkIfBlocked(page: Page): Promise<boolean> {
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

async function scrollToLoadResults(page: Page, targetCount: number): Promise<void> {
  const feedSelector = 'div[role="feed"]';
  let scrollAttempts = 0;
  let previousCount = 0;
  const maxScrollAttempts = 30;
  
  console.log(`Scroll pour charger ${targetCount} résultats...`);
  
  while (scrollAttempts < maxScrollAttempts) {
    const currentCount = await page.evaluate((selector) => {
      const feed = document.querySelector(selector);
      return feed ? feed.querySelectorAll('div[jsaction]').length : 0;
    }, feedSelector);
    
    console.log(`Résultats chargés: ${currentCount}/${targetCount}`);
    
    if (currentCount >= targetCount || currentCount === previousCount) {
      break;
    }
    
    await page.evaluate((selector) => {
      const feed = document.querySelector(selector);
      if (feed) feed.scrollTo(0, feed.scrollHeight);
    }, feedSelector);
    
    await page.waitForTimeout(2000);
    
    previousCount = currentCount;
    scrollAttempts++;
  }
  
  console.log(`Scroll terminé: ${previousCount} résultats chargés`);
}

async function extractGoogleMapsDataWithOffset(
  page: Page,
  offset: number,
  limit: number
): Promise<GoogleMapsResult[]> {
  console.log(`🕷️ Extraction ${offset}-${offset + limit}...`);
  
  const results = await page.evaluate(({ offset, limit }: { offset: number, limit: number }) => {
    const businesses: Array<{
      nom_societe: string;
      telephone?: string;
      adresse: string;
      site_web?: string;
      activite: string;
      note?: number;
      nombre_avis?: number;
    }> = [];
    
    const cards = document.querySelectorAll('div[role="feed"] > div > div[jsaction]');
    const slicedCards = Array.from(cards).slice(offset, offset + limit);
    
    slicedCards.forEach((card) => {
      try {
        const nameElement = card.querySelector('div.fontHeadlineSmall');
        const nom_societe = nameElement?.textContent?.trim() || '';
        
        if (!nom_societe) return;
        
        const ratingElement = card.querySelector('span[role="img"][aria-label*="étoiles"]');
        const ariaLabel = ratingElement?.getAttribute('aria-label') || '';
        
        let note: number | undefined;
        let nombre_avis: number | undefined;
        
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
        const adresseElement = addressElements.find((el) => 
          el.textContent?.includes(',') || el.textContent?.match(/\d{5}/)
        );
        const adresse = adresseElement?.textContent?.trim() || '';
        
        const phoneElements = Array.from(card.querySelectorAll('span'));
        const phoneElement = phoneElements.find((el) => 
          el.textContent?.match(/[\+\d\s\*\-\(\)]{10,}/)
        );
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
        
      } catch (error) {
        console.error('Erreur extraction carte:', error);
      }
    });
    
    return businesses;
  }, { offset, limit });
  
  console.log(`${results.length} entreprises extraites (offset ${offset})`);
  return results;
}

export async function scrapeGoogleMapsWithOffset(
  query: ScraperQuery,
  offset: number,
  limit: number,
  existingBrowser?: Browser,
  existingPage?: Page
): Promise<{ results: GoogleMapsResult[], browser: Browser, page: Page }> {
  
  let browser = existingBrowser;
  let page = existingPage;
  
  if (!browser || !page) {
    browser = await initBrowser();
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
      locale: 'fr-FR',
      viewport: { width: 1920, height: 1080 }
    });
    
    page = await context.newPage();
    
    // Gérer query.ville qui peut être string | string[] | undefined
    let villeValue: string = '';
    
    if (Array.isArray(query.ville)) {
      villeValue = query.ville[0] || '';  // Prendre la première ville
    } else if (typeof query.ville === 'string') {
      villeValue = query.ville;
    }
    
    let searchQuery = query.activite 
      ? `${query.activite} ${villeValue}` 
      : villeValue;
    
    // Gérer query.departement qui peut être string[]
    if (query.departement && query.departement.length > 0) {
      searchQuery += ` ${query.departement[0]}`;  // Prendre le premier département
    }
    
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    
    console.log('🌐 Navigation vers Google Maps:', url);
    
    const response = await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const status = response?.status();
    console.log(`📡 Status HTTP: ${status}`);
    
    if (status === 403 || status === 429) {
      throw new Error(`Bloqué par Google (Status ${status})`);
    }
    
    await page.waitForSelector('div[role="feed"]', { timeout: 15000 });
    console.log('Résultats chargés');
    
    const isBlocked = await checkIfBlocked(page);
    if (isBlocked) {
      throw new Error('IP bloquée par Google');
    }
  }
  
  await scrollToLoadResults(page, offset + limit);
  
  const results = await extractGoogleMapsDataWithOffset(page, offset, limit);
  
  if (results.length === 0) {
    console.log('⚠️ Aucun résultat Google Maps pour ce batch');
  }
  
  return { results, browser, page };
}

export async function closeBrowser(browser: Browser): Promise<void> {
  await browser.close();
  console.log('🔒 Navigateur fermé');
}