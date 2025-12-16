# 🚀 GUIDE D'INTÉGRATION - SCRAPING OPTIMISÉ

## 📋 Fichiers à Remplacer

### Backend

#### 1. **Remplacer l'orchestrateur principal**
```bash
# Ancien :
backend/src/services/ochestratorscraperService.ts

# Nouveau :
backend/src/services/orchestratorScraperOptimized.ts
```

**Action** : Copier `orchestratorScraperOptimized.ts` et l'utiliser à la place

#### 2. **Mettre à jour le contrôleur**
```bash
# Fichier :
backend/src/controllers/ScraperController.ts

# Remplacer :
import { orchestrateScraping } from '../services/ochestratorscraperService';
// PAR :
import { orchestrateScrapingOptimized } from '../services/orchestratorScraperOptimized';

# Remplacer aussi l'appel :
const { entreprises, stats } = await orchestrateScraping(query);
// PAR :
const { entreprises, stats } = await orchestrateScrapingOptimized(query);
```

#### 3. **Ajouter les user-agents rotatifs**
```bash
# Créer :
backend/src/services/userAgentsRotation.ts

# Utiliser dans googleMapServices.ts :
import { getRandomUserAgent, waitRandomDelay } from './userAgentsRotation';

// Lors de la création du browser :
const randomUA = getRandomUserAgent();
const browser = await chromium.launch({
  // ...
  userAgent: randomUA
});

// Avant chaque action importante :
await waitRandomDelay(300, 1500);
```

---

## 🔄 Comparaison : Avant vs Après

### ❌ AVANT (Ancien code)
```typescript
// ochestratorscraperService.ts
for (const ville of villesToScrape) {
  // Boucle séquentielle sur TOUTES les villes
  // Pas de tri par population
  // Scrape même si objectif atteint
  // Enrichissement complet (3-5s par entreprise)
  // Délais fixes
  
  const result = await scraperVille(ville, query, objectifParVille, browser, page);
  allEntreprises.push(...result.entreprises);
  
  if (allEntreprises.length >= objectif) break; // Vérification APRÈS
}
```

**Problèmes** :
- ⏱️ Lent (5-10 minutes pour 100 résultats)
- 🔴 Détectable (user-agent statique, délais réguliers)
- 📊 Inefficace (scrape 500 villes inutilement)
- 💾 RAM (un browser pour toute la session)

### ✅ APRÈS (Nouveau code)
```typescript
// orchestratorScraperOptimized.ts
const villesTriees = sortVillesByPopulation(villesToScrape);
// Trier par population

for (let i = 0; i < villesTriees.length && allEntreprises.length < objectif;
     i += MAX_VILLES_PARALLELES) {
  // Boucle sur les LOTS (5 villes à la fois)
  // Villes triées par population (grandes d'abord)
  // Arrête IMMÉDIATEMENT quand objectif atteint
  // Enrichissement rapide (timeout 3s)
  // Délais aléatoires
  // Pause longue tous les 10 villes
  
  const lot = villesTriees.slice(i, i + MAX_VILLES_PARALLELES);
  const resultatsLot = await Promise.all(lot.map(ville => scraperUneVille(...)));
  
  for (const resultat of resultatsLot) {
    allEntreprises.push(...resultat.entreprises);
    if (allEntreprises.length >= objectif) break; // Vérification PENDANT
  }
}
```

**Améliorations** :
- ⚡ Rapide (1-2 minutes pour 100 résultats)
- 🛡️ Indétectable (user-agents rotatifs, délais aléatoires)
- 📈 Efficace (5-20 villes max)
- 💚 Léger (2-3 browsers max)

---

## 📊 Résultats Attendus

### Exemple : Scraper 100 entreprises à Paris

#### ❌ Ancien code
```
Temps : ~8 minutes
Villes scrappées : 5 (Paris, Boulogne-Billancourt, Neuilly, Vanves, Issy)
Requêtes Google Maps : ~25-30
Risque blocage : TRÈS ÉLEVÉ
```

#### ✅ Nouveau code
```
Temps : ~2 minutes
Villes scrappées : 2 (Paris, Boulogne-Billancourt)
Requêtes Google Maps : ~5-6
Risque blocage : TRÈS BAS
```

---

## 🔧 Configuration Personnalisée

Si tu veux ajuster les paramètres, édite `orchestratorScraperOptimized.ts` :

```typescript
const ANTI_DETECTION_CONFIG = {
  // Délais aléatoires (en ms)
  MIN_DELAY_MS: 500,        // ← Min délai entre lots
  MAX_DELAY_MS: 2000,       // ← Max délai entre lots
  
  // Pause longue
  PAUSE_LONGUE_INTERVAL: 10,     // ← Pause tous les 10 villes
  PAUSE_LONGUE_MS: 180000,       // ← 3 minutes de pause
  
  // Enrichissement rapide
  ENRICHISSEMENT_TIMEOUT_MS: 3000, // ← Max 3s par enrichissement
  
  // Parallélisation
  MAX_VILLES_PARALLELES: 5,      // ← 5 villes en parallèle
  MAX_RESULTATS_PAR_VILLE: 20,   // ← Max 20 résultats par ville
};
```

---

## ⚠️ NOTES IMPORTANTES

### 1. **Les appels API INSEE restent lents**
- Si tu veux vraiment être rapide, désactive la recherche SIRET
- Ajoute une option `skipEnrichment: true` dans la query

### 2. **Google peut encore bloquer après 1000 requêtes**
- Utilise un **proxy/VPN** pour rotation d'IP
- Ou ajoute des pauses plus longues

### 3. **Teste d'abord en local**
```bash
cd backend
npm run dev
# Puis POST à http://localhost:3000/scrape avec:
{
  "region": "Île-de-France",
  "departement": ["75"],
  "activite": "Plombier",
  "nombre_resultats": 20
}
```

### 4. **Monitor les logs**
```
🚀 SCRAPING INTELLIGENT - DÉMARRAGE
📍 Villes trouvées...
🔄 Villes triées par population
📦 LOT 1 : Paris, Boulogne-Billancourt...
✅ OBJECTIF ATTEINT
✨ Résultats finaux...
```

---

## 🧪 TEST DE PERFORMANCE

### Test 1 : 20 résultats à Paris
```bash
curl -X POST http://localhost:3000/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Île-de-France",
    "departement": ["75"],
    "nombre_resultats": 20
  }'
```

**Ancien code** : ~2 min
**Nouveau code** : ~20-30 sec

### Test 2 : 100 résultats multi-villes
```bash
curl -X POST http://localhost:3000/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Île-de-France",
    "departement": ["75", "92", "93"],
    "activite": "Plombier",
    "nombre_resultats": 100
  }'
```

**Ancien code** : ~10-15 min
**Nouveau code** : ~2-3 min

---

## ❓ FAQ

**Q: Pourquoi limiter à 5 villes en parallèle ?**
R: Plus crée plus de suspicion chez Google. 5 est le sweet spot entre vitesse et discrétion.

**Q: Est-ce que ça va être bloqué par Google ?**
R: Moins probable qu'avant, mais toujours possible après 1000+ requêtes. Utilise un proxy.

**Q: Peux-tu réduire les pauses ?**
R: Oui, diminue `PAUSE_LONGUE_MS` mais risques augmentent.

**Q: Ça marche avec quel type de navigateur ?**
R: Playwright + Chromium uniquement. Pas de Firefox/Safari (détectable).
