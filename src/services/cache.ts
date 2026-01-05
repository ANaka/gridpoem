import { LRUCache } from 'lru-cache';

// Cache for probability results with context + word as key
const probabilityCache = new LRUCache<string, number>({
  max: 1000,
  ttl: 1000 * 60 * 5 // 5 minute TTL
});

/**
 * Creates a cache key from context words and the target word
 */
export function createCacheKey(context: string[], word: string): string {
  const contextKey = context.join('|');
  return `${contextKey}::${word.toLowerCase().trim()}`;
}

/**
 * Get a cached probability result
 * @param context - The context string (words before the target)
 * @param word - The target word
 * @returns The cached probability or null if not found
 */
export function getCached(context: string, word: string): number | null {
  const key = `${context}::${word.toLowerCase().trim()}`;
  const cached = probabilityCache.get(key);
  return cached !== undefined ? cached : null;
}

/**
 * Store a probability result in the cache
 * @param context - The context string (words before the target)
 * @param word - The target word
 * @param probability - The probability to cache
 */
export function setCache(context: string, word: string, probability: number): void {
  const key = `${context}::${word.toLowerCase().trim()}`;
  probabilityCache.set(key, probability);
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  probabilityCache.clear();
}

/**
 * Get the current size of the cache
 */
export function getCacheSize(): number {
  return probabilityCache.size;
}
