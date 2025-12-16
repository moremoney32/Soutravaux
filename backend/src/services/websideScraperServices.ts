

// // src/services/websideScraperServices.ts

// import { chromium } from 'playwright';

// // Pool global de navigateurs (pour usage futur potentiel)
// let browserPool: any[] = [];

// /**
//  * Cache email par domaine pour éviter re-scraping
//  */
// const emailCache = new Map<string, string | undefined>();

// /**
//  * Fermer tous les navigateurs du pool
//  */
// export async function closeBrowserPool(): Promise<void> {
//   console.log(`🔒 Fermeture de ${browserPool.length} navigateurs...`);
//   await Promise.all(browserPool.map(b => b.close().catch(() => {})));
//   browserPool = [];
// }

// /**
//  * Scraper email depuis un site web
//  * ⚠️ OPTIMISÉ : timeout court (2s), cache, abandon rapide
//  * Retourne undefined si pas trouvé (pas d'erreur, juste timeout court)
//  */
// export async function scrapeEmailFromWebsite(
//   url?: string
// ): Promise<string | undefined> {
//   if (!url || url.length < 5) {
//     return undefined;
//   }

//   console.log(`📧 Recherche email: ${url}`);
  
//   try {
//     const urlObj = new URL(url);
//     const domain = urlObj.hostname;

//     // Vérifier cache
//     if (emailCache.has(domain)) {
//       const cached = emailCache.get(domain);
//       if (cached) {
//         console.log(`  ✅ Email trouvé (cache): ${cached}`);
//       }
//       return cached;
//     }

//     // ⚡ EXTRACTION RAPIDE : 2 secondes max
//     const browser = await chromium.launch({
//       headless: true,
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });

//     const context = await browser.newContext();
//     const page = await context.newPage();

//     try {
//       await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });

//       // Regex pour emails
//       const email = await page.evaluate(() => {
//         const text = document.body.innerText;
//         const emailRegex =
//           /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
//         const matches = text.match(emailRegex);

//         // Filtrer les emails de contact (pas noreply, no-reply, test, etc.)
//         if (matches) {
//           return matches.find(
//             (email) =>
//               !email.includes('noreply') &&
//               !email.includes('no-reply') &&
//               !email.includes('test@') &&
//               !email.includes('example')
//           );
//         }
//         return undefined;
//       });

//       // Cache le résultat
//       emailCache.set(domain, email);
//       if (email) {
//         console.log(`  ✅ Email trouvé: ${email}`);
//       } else {
//         console.log(`  ❌ Pas d'email trouvé`);
//       }
//       return email;
//     } finally {
//       await context.close();
//       await browser.close();
//     }
//   } catch (error) {
//     console.log(`  ⚠️ Erreur scraping email: ${error instanceof Error ? error.message : 'unknown'}`);
//     return undefined;
//   }
// }

// /**
//  * Scraper nom gérant depuis un site web
//  * ⚠️ DÉSACTIVÉ : Trop cher en ressources, très peu fiable (anti-scraping)
//  * Retourne undefined immédiatement pour économiser temps/navigateurs
//  */
// export async function scrapeGerantFromWebsite(): Promise<string | undefined> {
//   // ❌ SKIP GÉRANT SCRAPING (trop cher, peu fiable)
//   return undefined;
// }


import { chromium } from 'playwright';

// Cache email par domaine pour éviter re-scraping
const emailCache = new Map<string, { email?: string; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 heure

/**
 * Fermer tous les navigateurs du pool
 */
export async function closeBrowserPool(): Promise<void> {
  console.log(`🔒 Fermeture des navigateurs...`);
}

/**
 * Scraper email depuis un site web - OPTIMISÉ
 */
export async function scrapeEmailFromWebsite(
  url?: string
): Promise<string | undefined> {
  if (!url || url.length < 5) {
    return undefined;
  }

  console.log(`📧 Recherche email: ${url}`);
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Vérifier cache valide
    const cached = emailCache.get(domain);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (cached.email) {
        console.log(`  ✅ Email trouvé (cache): ${cached.email}`);
      }
      return cached.email;
    }

    // ⚡ EXTRACTION RAPIDE : 3 secondes max
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 3000 
      });

      // Regex pour emails - améliorée
      const email = await page.evaluate(() => {
        // Chercher dans les liens d'abord (plus rapide)
        const mailtoLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]'));
        if (mailtoLinks.length > 0) {
          const href = mailtoLinks[0].getAttribute('href');
          if (href) return href.replace('mailto:', '');
        }
        
        // Sinon chercher dans le texte
        const text = document.body.innerText;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = text.match(emailRegex);

        if (matches) {
          return matches.find(
            (email) =>
              !email.toLowerCase().includes('noreply') &&
              !email.toLowerCase().includes('no-reply') &&
              !email.toLowerCase().includes('test@') &&
              !email.toLowerCase().includes('example@') &&
              !email.toLowerCase().includes('contact@') // Priorité aux emails non génériques
          ) || matches[0]; // Fallback sur premier email trouvé
        }
        return undefined;
      });

      // Cache le résultat
      emailCache.set(domain, { email, timestamp: Date.now() });
      
      if (email) {
        console.log(`  ✅ Email trouvé: ${email}`);
      } else {
        console.log(`  ❌ Pas d'email trouvé`);
      }
      return email;
    } finally {
      await context.close();
      await browser.close();
    }
  } catch (error) {
    console.log(`  ⚠️ Erreur scraping email: ${error instanceof Error ? error.message : 'unknown'}`);
    return undefined;
  }
}

/**
 * Scraper nom gérant depuis un site web
 */
export async function scrapeGerantFromWebsite(): Promise<string | undefined> {
  return undefined;
}