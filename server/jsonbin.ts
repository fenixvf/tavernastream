import type { MovieBinData, SeriesBinData } from '@shared/schema';

interface CacheEntry<T> {
  data: T;
  etag?: string;
  timestamp: number;
  binCreatedAt?: string;
}

const CACHE_TTL = 30000; // 30 segundos
const moviesCache: CacheEntry<MovieBinData> | null = null;
const seriesCache: CacheEntry<SeriesBinData> | null = null;

let moviesCacheData: CacheEntry<MovieBinData> | null = null;
let seriesCacheData: CacheEntry<SeriesBinData> | null = null;

const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_MOVIES_ID = process.env.JSONBIN_MOVIES_ID;
const JSONBIN_SERIES_ID = process.env.JSONBIN_SERIES_ID;

async function fetchFromJSONBin<T>(binId: string, currentEtag?: string): Promise<{ data: T; etag?: string; createdAt?: string }> {
  if (!JSONBIN_API_KEY) {
    throw new Error('JSONBIN_API_KEY not configured');
  }

  const headers: Record<string, string> = {
    'X-Master-Key': JSONBIN_API_KEY,
  };

  if (currentEtag) {
    headers['If-None-Match'] = currentEtag;
  }

  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers,
  });

  if (response.status === 304) {
    throw new Error('NOT_MODIFIED');
  }

  if (!response.ok) {
    throw new Error(`JSONBin API error: ${response.status}`);
  }

  const result = await response.json();
  const etag = response.headers.get('etag') || undefined;

  return {
    data: result.record,
    etag,
    createdAt: result.metadata?.createdAt,
  };
}

async function getCachedOrFetch<T>(
  binId: string,
  cache: CacheEntry<T> | null,
  setCacheData: (data: CacheEntry<T>) => void
): Promise<T> {
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  try {
    const result = await fetchFromJSONBin<T>(binId, cache?.etag);
    const newCache: CacheEntry<T> = {
      data: result.data,
      etag: result.etag,
      timestamp: now,
      binCreatedAt: result.createdAt,
    };
    setCacheData(newCache);
    return result.data;
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_MODIFIED' && cache) {
      const updatedCache: CacheEntry<T> = {
        ...cache,
        timestamp: now,
      };
      setCacheData(updatedCache);
      return cache.data;
    }

    if (cache) {
      console.error('JSONBin fetch error, using stale cache:', error);
      return cache.data;
    }

    throw error;
  }
}

export async function getMovieBin(): Promise<MovieBinData> {
  if (!JSONBIN_MOVIES_ID) {
    throw new Error('JSONBIN_MOVIES_ID not configured');
  }

  return getCachedOrFetch(
    JSONBIN_MOVIES_ID,
    moviesCacheData,
    (data) => { moviesCacheData = data; }
  );
}

export async function getSeriesBin(): Promise<SeriesBinData> {
  if (!JSONBIN_SERIES_ID) {
    throw new Error('JSONBIN_SERIES_ID not configured');
  }

  return getCachedOrFetch(
    JSONBIN_SERIES_ID,
    seriesCacheData,
    (data) => { seriesCacheData = data; }
  );
}

export async function getMovieUrl(tmdbId: number): Promise<string | undefined> {
  const moviesBin = await getMovieBin();
  return moviesBin[tmdbId.toString()];
}

export async function getSeriesData(tmdbId: number): Promise<SeriesBinData[string] | undefined> {
  const seriesBin = await getSeriesBin();
  return seriesBin[tmdbId.toString()];
}

export async function getAllMovieIds(): Promise<number[]> {
  const moviesBin = await getMovieBin();
  return Object.keys(moviesBin).map(Number);
}

export async function getAllSeriesIds(): Promise<number[]> {
  const seriesBin = await getSeriesBin();
  return Object.keys(seriesBin).map(Number);
}
