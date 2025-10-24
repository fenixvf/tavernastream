import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, onValue, Database } from 'firebase/database';
import type { MovieBinData, SeriesBinData } from '@shared/schema';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 30000;

let moviesCacheData: CacheEntry<MovieBinData> | null = null;
let seriesCacheData: CacheEntry<SeriesBinData> | null = null;

const moviesConfig = {
  apiKey: process.env.FIREBASE_MOVIES_API_KEY,
  authDomain: process.env.FIREBASE_MOVIES_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_MOVIES_DATABASE_URL,
  projectId: process.env.FIREBASE_MOVIES_PROJECT_ID,
  storageBucket: process.env.FIREBASE_MOVIES_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MOVIES_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_MOVIES_APP_ID,
  measurementId: process.env.FIREBASE_MOVIES_MEASUREMENT_ID,
};

const seriesConfig = {
  apiKey: process.env.FIREBASE_SERIES_API_KEY,
  authDomain: process.env.FIREBASE_SERIES_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_SERIES_DATABASE_URL,
  projectId: process.env.FIREBASE_SERIES_PROJECT_ID,
  storageBucket: process.env.FIREBASE_SERIES_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_SERIES_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_SERIES_APP_ID,
  measurementId: process.env.FIREBASE_SERIES_MEASUREMENT_ID,
};

const moviesApp = initializeApp(moviesConfig, 'movies');
const seriesApp = initializeApp(seriesConfig, 'series');

const moviesDb: Database = getDatabase(moviesApp);
const seriesDb: Database = getDatabase(seriesApp);

onValue(ref(moviesDb, '/'), () => {
  moviesCacheData = null;
  console.log('Movies database updated - cache invalidated');
});

onValue(ref(seriesDb, '/'), () => {
  seriesCacheData = null;
  console.log('Series database updated - cache invalidated');
});

async function getCachedOrFetch<T>(
  db: Database,
  cache: CacheEntry<T> | null,
  setCacheData: (data: CacheEntry<T>) => void
): Promise<T> {
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  const snapshot = await get(ref(db, '/'));
  const data = snapshot.val() as T;

  const newCache: CacheEntry<T> = {
    data,
    timestamp: now,
  };
  
  setCacheData(newCache);
  return data;
}

export async function getMovieBin(): Promise<MovieBinData> {
  return getCachedOrFetch(
    moviesDb,
    moviesCacheData,
    (data) => { moviesCacheData = data; }
  );
}

export async function getSeriesBin(): Promise<SeriesBinData> {
  return getCachedOrFetch(
    seriesDb,
    seriesCacheData,
    (data) => { seriesCacheData = data; }
  );
}

export async function getMovieUrl(tmdbId: number): Promise<string | undefined> {
  const moviesBin = await getMovieBin();
  if (moviesBin?.['catalogo-filmes-tavernastream']?.filmes) {
    return moviesBin['catalogo-filmes-tavernastream'].filmes[tmdbId.toString()];
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
