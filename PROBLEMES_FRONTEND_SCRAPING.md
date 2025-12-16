# 🎯 PROBLÈMES FRONTEND - SCRAPING PAGE

## 📋 Analyse du fichier : ScrapingPage.tsx

---

## 🚨 PROBLÈME #1 : Pas de feedback en temps réel

### ❌ Code Actuel
```tsx
const [isLoading, setIsLoading] = useState(false);
const [scrapingProgress, setScrapingProgress] = useState<string>('');

// État jamais mis à jour pendant le scraping
setIsLoading(true);
const { entreprises, stats } = await scrapeGoogleMaps(filters);
setIsLoading(false);

// L'utilisateur voit "Chargement..." pendant 5 minutes
// Pas de progression, pas de savoir si ça marche
```

### ✅ Solution
```tsx
// Utiliser WebSocket ou Server-Sent Events
const [progress, setProgress] = useState<{
  ville: string;
  total: number;
  actuelle: number;
  pourcentage: number;
}>({ville: '', total: 0, actuelle: 0, pourcentage: 0});

useEffect(() => {
  const eventSource = new EventSource('/api/scrape-progress');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setProgress(data);
  };
  
  return () => eventSource.close();
}, []);

// Afficher dans l'UI :
// "Scraping Paris (2/5) : 40%"
// "Paris : 45 entreprises trouvées"
// "Pause anti-détection : 2 min 30s restants"
```

---

## 🚨 PROBLÈME #2 : Pas de possibilité d'arrêter

### ❌ Code Actuel
```tsx
const handleScrape = async () => {
  setIsLoading(true);
  // Lance le scraping... et ATTEND 5-10 minutes
  // Aucun moyen d'arrêter
  // Si erreur : perte de tous les résultats
  
  const { entreprises, stats } = await scrapeGoogleMaps(filters);
  setIsLoading(false);
};

// Aucun bouton "Stop"
// Aucune possibilité d'interrompre
```

### ✅ Solution
```tsx
const [abortController, setAbortController] = useState<AbortController | null>(null);

const handleScrape = async () => {
  const controller = new AbortController();
  setAbortController(controller);
  setIsLoading(true);
  
  try {
    const { entreprises, stats } = await scrapeGoogleMaps(filters, {
      signal: controller.signal
    });
    setEntreprises(entreprises);
    setStats(stats);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      setErrorMessage('Scraping arrêté par l\'utilisateur');
    }
  } finally {
    setIsLoading(false);
    setAbortController(null);
  }
};

const handleStop = () => {
  if (abortController) {
    abortController.abort();
    setScrapingProgress('Arrêt en cours...');
  }
};

// Dans le JSX :
{isLoading && (
  <button onClick={handleStop} className="btn-stop">
    ⏹️ Arrêter
  </button>
)}
```

---

## 🚨 PROBLÈME #3 : Pas de sauvegarde progressive

### ❌ Code Actuel
```tsx
const handleScrape = async () => {
  setIsLoading(true);
  // Scrape pendant 5 minutes...
  const { entreprises, stats } = await scrapeGoogleMaps(filters);
  
  // Si erreur après 4 minutes : perte de tout
  // Si déconnexion : perte de tout
  
  setEntreprises(entreprises);
  setStats(stats);
  setIsLoading(false);
  
  // Tout ou rien
};
```

### ✅ Solution
```tsx
const handleScrape = async () => {
  setIsLoading(true);
  
  try {
    // Sauvegarde INCRÉMENTALE dans la base
    const eventSource = new EventSource(
      `/api/scrape-stream?region=${filters.region}&...`
    );
    
    const tempEntreprises: EntrepriseScraped[] = [];
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'entreprise') {
        // Nouvelle entreprise trouvée
        tempEntreprises.push(data.entreprise);
        setEntreprises([...tempEntreprises]);
        
        // 💾 Sauvegarder en base (optionnel)
        saveEntrepriseToDatabase(data.entreprise);
      } else if (data.type === 'progress') {
        setProgress(data);
      } else if (data.type === 'complete') {
        setStats(data.stats);
        setIsLoading(false);
      }
    };
    
    eventSource.onerror = () => {
      setErrorMessage('Erreur serveur');
      setIsLoading(false);
    };
    
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
    setIsLoading(false);
  }
};
```

---

## 🚨 PROBLÈME #4 : Selection de trop de villes

### ❌ Code Actuel
```tsx
// ScrapingPage.tsx
const [filters, setFilters] = useState<ScrapingFilters>({
  region: '',
  departement: [],
  ville: [],  // ← Peut avoir 500+ villes
  activite: '',
  nombre_resultats: 0
});

// Si l'utilisateur sélectionne tous les 93 départements de France
// + toutes les 36000 communes
// Le scraping essaie de scraper 36000 villes ❌

// Pas de limite UI
// Pas d'avertissement
```

### ✅ Solution
```tsx
const MAX_VILLES_SELECT = 50;

const handleDepartementChange = (value: string | string[]) => {
  const depts = value as string[];
  
  if (depts.length > 10) {
    setErrorMessage('⚠️ Max 10 départements à la fois');
    return;
  }
  
  setFilters(prev => ({
    ...prev,
    departement: depts,
    ville: [] // Reset villes
  }));
};

const handleVilleChange = (value: string | string[]) => {
  const villes = value as string[];
  
  if (villes.length > MAX_VILLES_SELECT) {
    setErrorMessage(`⚠️ Max ${MAX_VILLES_SELECT} villes sélectionnées`);
    return;
  }
  
  setFilters(prev => ({
    ...prev,
    ville: villes
  }));
};

// Dans le JSX :
<div className="filter-warning">
  {filters.ville.length > 0 && (
    <p>
      ℹ️ {filters.ville.length} villes sélectionnées
      (Scraping sera ~{filters.ville.length * 5}s)
    </p>
  )}
</div>
```

---

## 🚨 PROBLÈME #5 : Affichage statique des résultats

### ❌ Code Actuel
```tsx
// Tout est affiché d'un coup à la fin
const [entreprises, setEntreprises] = useState<EntrepriseScraped[]>([]);

<table>
  <tbody>
    {entreprises.map(e => (
      <tr key={e.id}>
        <td>{e.nom_societe}</td>
        <td>{e.telephone}</td>
        <td>{e.email}</td>
      </tr>
    ))}
  </tbody>
</table>

// Si 1000 entreprises : très lourd pour le navigateur
// Pas de pagination
// Pas de virtualisation
```

### ✅ Solution
```tsx
// Ajouter virtualisation (react-window) ou pagination
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={entreprises.length}
  itemSize={35}
  width="100%"
>
  {({ index, style }) => (
    <div style={style} className="entreprise-row">
      <span>{entreprises[index].nom_societe}</span>
      <span>{entreprises[index].telephone}</span>
      <span>{entreprises[index].email}</span>
    </div>
  )}
</List>

// Ou pagination simple
const [page, setPage] = useState(1);
const itemsPerPage = 50;
const paginatedEntreprises = entreprises.slice(
  (page - 1) * itemsPerPage,
  page * itemsPerPage
);

<div className="pagination">
  <button onClick={() => setPage(p => p - 1)}>← Précédent</button>
  <span>Page {page} / {Math.ceil(entreprises.length / itemsPerPage)}</span>
  <button onClick={() => setPage(p => p + 1)}>Suivant →</button>
</div>
```

---

## 🚨 PROBLÈME #6 : Pas de cache/historique

### ❌ Code Actuel
```tsx
// Chaque fois qu'on clique, relance le scraping
// Pas de mémorisation des résultats
// Si on veut revoir les 100 plombiers de Paris : 5 min de scraping supplémentaire
```

### ✅ Solution
```tsx
const [cache, setCache] = useState<Map<string, EntrepriseScraped[]>>(new Map());

const getCacheKey = (filters: ScrapingFilters) => {
  return JSON.stringify({
    region: filters.region,
    departement: filters.departement.sort(),
    ville: filters.ville.sort(),
    activite: filters.activite,
    nombre_resultats: filters.nombre_resultats
  });
};

const handleScrape = async () => {
  const key = getCacheKey(filters);
  
  // Vérifier le cache
  if (cache.has(key)) {
    console.log('✅ Résultats depuis cache');
    setEntreprises(cache.get(key)!);
    return;
  }
  
  // Sinon scraper
  setIsLoading(true);
  const { entreprises, stats } = await scrapeGoogleMaps(filters);
  
  // Mettre en cache
  const newCache = new Map(cache);
  newCache.set(key, entreprises);
  setCache(newCache);
  
  setEntreprises(entreprises);
  setStats(stats);
  setIsLoading(false);
};
```

---

## 📊 RÉSUMÉ DES CORRECTIONS

| Problème | Impact | Solution |
|----------|--------|----------|
| Pas de feedback | UX mauvaise | WebSocket + progress real-time |
| Pas d'arrêt | Frustration | Bouton STOP + AbortController |
| Pas de sauvegarde | Perte de données | Streaming + sauvegarde DB incrémentale |
| Trop de villes | Scraping lent | Limiter à 50 villes max |
| Affichage statique | RAM élevée | Virtualisation/pagination |
| Pas de cache | Scraping dupliqué | Mémoriser les résultats |

---

## 🎯 INTÉGRATION AVEC LE NOUVEAU SCRAPER

```tsx
// ScrapingPage.tsx amélioré

import { EventSource } from 'eventsource'; // Node.js

const [progress, setProgress] = useState<ScrapingProgress | null>(null);
const [abortController, setAbortController] = useState<AbortController | null>(null);

const handleScrape = async () => {
  if (filters.nombre_resultats === 0) {
    setErrorMessage('Entrez le nombre de résultats');
    return;
  }

  const controller = new AbortController();
  setAbortController(controller);
  setIsLoading(true);
  setErrorMessage('');

  try {
    // Utiliser le nouveau endpoint avec streaming
    const response = await fetch('/api/scrape-optimized', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
      signal: controller.signal
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const tempEntreprises: EntrepriseScraped[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;

        const data = JSON.parse(line);
        
        if (data.type === 'entreprise') {
          tempEntreprises.push(data.data);
          setEntreprises([...tempEntreprises]);
        } else if (data.type === 'progress') {
          setProgress(data.data);
        } else if (data.type === 'complete') {
          setStats(data.stats);
        }
      }
    }

    setIsLoading(false);

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      setErrorMessage('✅ Scraping arrêté');
    } else {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur');
    }
    setIsLoading(false);
  }
};

return (
  <div className="scraping-page">
    {/* Progress */}
    {isLoading && progress && (
      <div className="progress-card">
        <p>🏙️ {progress.ville}</p>
        <p>📊 {progress.actuelle}/{progress.total}</p>
        <div className="progress-bar">
          <div style={{width: progress.pourcentage + '%'}}></div>
        </div>
        <button onClick={() => abortController?.abort()}>⏹️ Arrêter</button>
      </div>
    )}

    {/* Résultats */}
    {entreprises.length > 0 && (
      <div className="results">
        <h3>✅ {entreprises.length} entreprises trouvées</h3>
        <EntreprisesTable entreprises={entreprises} />
      </div>
    )}
  </div>
);
```

C'est beaucoup plus clean et efficace ! 🚀
