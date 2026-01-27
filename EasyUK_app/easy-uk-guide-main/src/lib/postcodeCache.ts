/**
 * Postcode geocoding cache to reduce external API calls
 * Caches postcode lookups in localStorage with 30-day expiry
 */

const CACHE_KEY = 'postcode_geocoding_cache';
const CACHE_TTL_DAYS = 30;

export interface CachedPostcode {
  postcode_normalized: string;
  latitude: number;
  longitude: number;
  displayName: string;
  precision: 'exact' | 'approximate';
  fetched_at: string; // ISO date string
}

interface PostcodeCache {
  [postcode: string]: CachedPostcode;
}

/**
 * Normalize a postcode for consistent cache keys
 */
export function normalizePostcode(postcode: string): string {
  return postcode.trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * Check if a cached entry is still valid (within TTL)
 */
function isCacheValid(entry: CachedPostcode): boolean {
  const fetchedAt = new Date(entry.fetched_at);
  const now = new Date();
  const diffDays = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays < CACHE_TTL_DAYS;
}

/**
 * Get the entire cache from localStorage
 */
function getCache(): PostcodeCache {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Failed to read postcode cache:', error);
  }
  return {};
}

/**
 * Save the cache to localStorage
 */
function saveCache(cache: PostcodeCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to save postcode cache:', error);
  }
}

/**
 * Get a cached postcode lookup result
 * Returns null if not cached or expired
 */
export function getCachedPostcode(postcode: string): CachedPostcode | null {
  const normalized = normalizePostcode(postcode);
  const cache = getCache();
  const entry = cache[normalized];
  
  if (entry && isCacheValid(entry)) {
    return entry;
  }
  
  // Clean up expired entry if found
  if (entry && !isCacheValid(entry)) {
    delete cache[normalized];
    saveCache(cache);
  }
  
  return null;
}

/**
 * Cache a postcode lookup result
 */
export function cachePostcode(
  postcode: string,
  latitude: number,
  longitude: number,
  displayName: string,
  precision: 'exact' | 'approximate' = 'exact'
): CachedPostcode {
  const normalized = normalizePostcode(postcode);
  const cache = getCache();
  
  const entry: CachedPostcode = {
    postcode_normalized: normalized,
    latitude,
    longitude,
    displayName,
    precision,
    fetched_at: new Date().toISOString(),
  };
  
  cache[normalized] = entry;
  saveCache(cache);
  
  return entry;
}

/**
 * Clear expired entries from the cache
 */
export function cleanupCache(): void {
  const cache = getCache();
  let hasChanges = false;
  
  for (const key in cache) {
    if (!isCacheValid(cache[key])) {
      delete cache[key];
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    saveCache(cache);
  }
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear postcode cache:', error);
  }
}
