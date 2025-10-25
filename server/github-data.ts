import type { MovieBinData, SeriesBinData } from '@shared/schema';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

const CACHE_TTL = 30000; // 30 segundos
const POLL_INTERVAL = 60000; // 1 minuto - verificar atualizações

let moviesCacheData: CacheEntry<MovieBinData> | null = null;
let seriesCacheData: CacheEntry<SeriesBinData> | null = null;

// URLs dos arquivos raw no GitHub
const MOVIES_RAW_URL = 'https://raw.githubusercontent.com/fenixvf/server-json/refs/heads/main/filmes-series-tavernastream-default-rtdb-export.json';
const SERIES_RAW_URL = 'https://raw.githubusercontent.com/fenixvf/server-json/refs/heads/main/series-tavernastream-default-rtdb-export.json';

async function fetchFromGitHub<T>(url: string, cache: CacheEntry<T> | null): Promise<CacheEntry<T>> {
  const headers: HeadersInit = {};
  
  // Use ETag para verificar se houve mudanças
  if (cache?.etag) {
    headers['If-None-Match'] = cache.etag;
  }

  const response = await fetch(url, { headers });
  
  // Se retornar 304, significa que não houve mudanças
  if (response.status === 304 && cache) {
    return {
      ...cache,
      timestamp: Date.now()
    };
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch from GitHub: ${response.statusText}`);
  }

  const data = await response.json() as T;
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

  // Retornar do cache se ainda válido
  if (cache && now - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  // Buscar do GitHub
  const newCache = await fetchFromGitHub(url, cache);
  setCacheData(newCache);
  return newCache.data;
}

export async function getMovieBin(): Promise<MovieBinData> {
  return getCachedOrFetch(
    MOVIES_RAW_URL,
    moviesCacheData,
    (data) => { moviesCacheData = data; }
  );
}

export async function getSeriesBin(): Promise<SeriesBinData> {
  return getCachedOrFetch(
    SERIES_RAW_URL,
    seriesCacheData,
    (data) => { seriesCacheData = data; }
  );
}

export async function getMovieUrl(tmdbId: number): Promise<string | undefined> {
  const moviesBin = await getMovieBin();
  if (moviesBin?.['catalogo-filmes-tavernastream']?.filmes) {
    const value = moviesBin['catalogo-filmes-tavernastream'].filmes[tmdbId.toString()];
    // Retorna apenas se for uma string válida (URL do Drive)
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

export async function getSeriesData(tmdbId: number): Promise<SeriesBinData[string] | undefined> {
  const seriesBin = await getSeriesBin();
  return seriesBin[tmdbId.toString()];
}

export async function getAllMovieIds(): Promise<number[]> {
  const moviesBin = await getMovieBin();
  if (!moviesBin || typeof moviesBin !== 'object') {
    return [];
  }
  
  const filmes = moviesBin['catalogo-filmes-tavernastream']?.filmes;
  if (!filmes || typeof filmes !== 'object') {
    return [];
  }
  
  return Object.keys(filmes)
    .map(Number)
    .filter(id => !isNaN(id) && id > 0)
    .reverse();
}

export async function getAllSeriesIds(): Promise<number[]> {
  const seriesBin = await getSeriesBin();
  if (!seriesBin || typeof seriesBin !== 'object') {
    return [];
  }
  
  return Object.keys(seriesBin)
    .map(Number)
    .filter(id => !isNaN(id) && id > 0)
    .reverse();
}

// Polling para invalidar cache e buscar atualizações automaticamente
function startPolling() {
  setInterval(async () => {
    try {
      // Invalida o cache para forçar atualização na próxima requisição
      const [newMoviesCache, newSeriesCache] = await Promise.all([
        fetchFromGitHub(MOVIES_RAW_URL, moviesCacheData),
        fetchFromGitHub(SERIES_RAW_URL, seriesCacheData)
      ]);
      
      if (newMoviesCache.data !== moviesCacheData?.data) {
        moviesCacheData = newMoviesCache;
        console.log('Movies catalog updated from GitHub');
      }
      
      if (newSeriesCache.data !== seriesCacheData?.data) {
        seriesCacheData = newSeriesCache;
        console.log('Series catalog updated from GitHub');
      }
    } catch (error) {
      console.error('Error polling GitHub for updates:', error);
    }
  }, POLL_INTERVAL);
}

// Iniciar polling quando o módulo for carregado
startPolling();
console.log('GitHub data polling started - checking for updates every 60 seconds');
