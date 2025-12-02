

/**
 * Exécute des promesses en parallèle avec limite de concurrence
 */
export async function parallelLimit<T, R>(
  items: T[],
  asyncFn: (item: T, index: number) => Promise<R>,
  concurrencyLimit: number
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function executeNext(): Promise<void> {
    const index = currentIndex++;
    if (index >= items.length) return;

    try {
      results[index] = await asyncFn(items[index], index);
    } catch (error) {
      console.error(`❌ Erreur index ${index}:`, error);
      results[index] = null as any;
    }

    await executeNext();
  }

  // Lancer N workers en parallèle
  const workers = Array(Math.min(concurrencyLimit, items.length))
    .fill(null)
    .map(() => executeNext());

  await Promise.all(workers);

  return results;
}

/**
 * Retry une fonction en cas d'erreur
 */

export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T | undefined> {  // ← CHANGÉ : null → undefined
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === maxRetries) {
        console.error(`Échec après ${maxRetries} tentatives`);
        return undefined;  // ← CHANGÉ : null → undefined
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return undefined;  // ← CHANGÉ : null → undefined
}