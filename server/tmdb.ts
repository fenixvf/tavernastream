import type {
  TMDBMovie,
  TMDBSeries,
  TMDBDetails,
  TMDBEpisode,
} from '@shared/schema';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.warn('Warning: TMDB_API_KEY not found in environment variables');
}

async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}&language=pt-BR`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getMovieDetails(movieId: number): Promise<TMDBDetails> {
  return tmdbFetch<TMDBDetails>(`/movie/${movieId}`);
}

export async function getMovieExternalIds(movieId: number): Promise<{ imdb_id?: string }> {
  return tmdbFetch<{ imdb_id?: string }>(`/movie/${movieId}/external_ids`);
}

export async function getTVDetails(tvId: number): Promise<TMDBDetails> {
  return tmdbFetch<TMDBDetails>(`/tv/${tvId}`);
}

export async function getSeasonDetails(
  tvId: number,
  seasonNumber: number
): Promise<{ episodes: TMDBEpisode[] }> {
  return tmdbFetch<{ episodes: TMDBEpisode[] }>(
    `/tv/${tvId}/season/${seasonNumber}`
  );
}

export async function searchMulti(
  query: string
): Promise<{ results: (TMDBMovie | TMDBSeries)[] }> {
  return tmdbFetch<{ results: (TMDBMovie | TMDBSeries)[] }>(
    `/search/multi?query=${encodeURIComponent(query)}&include_adult=false`
  );
}

export async function getTrending(
  mediaType: 'movie' | 'tv' | 'all' = 'all',
  timeWindow: 'day' | 'week' = 'week'
): Promise<{ results: (TMDBMovie | TMDBSeries)[] }> {
  return tmdbFetch<{ results: (TMDBMovie | TMDBSeries)[] }>(
    `/trending/${mediaType}/${timeWindow}`
  );
}

export async function getPopularMovies(): Promise<{ results: TMDBMovie[] }> {
  return tmdbFetch<{ results: TMDBMovie[] }>('/movie/popular');
}

export async function getPopularTV(): Promise<{ results: TMDBSeries[] }> {
  return tmdbFetch<{ results: TMDBSeries[] }>('/tv/popular');
}
