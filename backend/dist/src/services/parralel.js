"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parallelLimit = parallelLimit;
exports.retryAsync = retryAsync;
/**
 * Exécute des promesses en parallèle avec limite de concurrence
 */
async function parallelLimit(items, asyncFn, concurrencyLimit) {
    const results = new Array(items.length);
    let currentIndex = 0;
    async function executeNext() {
        const index = currentIndex++;
        if (index >= items.length)
            return;
        try {
            results[index] = await asyncFn(items[index], index);
        }
        catch (error) {
            console.error(`❌ Erreur index ${index}:`, error);
            results[index] = null;
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
async function retryAsync(fn, maxRetries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            if (attempt === maxRetries) {
                console.error(`Échec après ${maxRetries} tentatives`);
                return undefined; // ← CHANGÉ : null → undefined
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return undefined; // ← CHANGÉ : null → undefined
}
//# sourceMappingURL=parralel.js.map