interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

interface FanDubGitHubData {
  [tmdbId: string]: string;
}

const CACHE_TTL = 5 * 60 * 1000;

let moviesFanDubCache: CacheEntry<FanDubGitHubData> | null = null;
let seriesFanDubCache: CacheEntry<FanDubGitHubData> | null = null;

async function fetchFromGitHub<T>(url: string, cache: CacheEntry<T> | null): Promise<CacheEntry<T>> {
  const headers: HeadersInit = {};
  
  if (cache?.etag) {
    headers['If-None-Match'] = cache.etag;
  }

  const response = await fetch(url, { headers });
  
  if (response.status === 304 && cache) {
    return {
      ...cache,
      timestamp: Date.now()
    };
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch fandub data from GitHub: ${response.statusText}`);
  }

  let data: T;
  try {
    data = await response.json() as T;
  } catch (error) {
    console.error('❌ JSON Parse Error in fandub GitHub file:', error);
    throw new Error(`Invalid JSON in fandub GitHub file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const etag = response.headers.get('etag') || undefined;

  return {
    data,
    timestamp: Date.now(),
    etag
  };
}

async function getCachedOrFetch<T>(
  url: string,
  cache: CacheEntry<T> | null,
  setCacheData: (data: CacheEntry<T>) => void
): Promise<T> {
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  try {
    const newCache = await fetchFromGitHub(url, cache);
    setCacheData(newCache);
    return newCache.data;
  } catch (error) {
    if (cache) {
      console.warn('⚠️ Using cached fandub data due to fetch error');
      return cache.data;
    }
    throw error;
  }
}

export async function getFanDubMovies(githubUrl: string): Promise<FanDubGitHubData> {
  return getCachedOrFetch(
    githubUrl,
    moviesFanDubCache,
    (data) => { moviesFanDubCache = data; }
  );
}

export async function getFanDubSeries(githubUrl: string): Promise<FanDubGitHubData> {
  return getCachedOrFetch(
    githubUrl,
    seriesFanDubCache,
    (data) => { seriesFanDubCache = data; }
  );
}

export async function getFanDubUrl(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  moviesGithubUrl: string,
  seriesGithubUrl: string
): Promise<string | null> {
  try {
    const data = mediaType === 'movie'
      ? await getFanDubMovies(moviesGithubUrl)
      : await getFanDubSeries(seriesGithubUrl);
    
    return data[tmdbId.toString()] || null;
  } catch (error) {
    console.error(`Error fetching fandub URL for ${mediaType} ${tmdbId}:`, error);
    return null;
  }
}
