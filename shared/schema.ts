import { z } from "zod";

// TMDB Movie/Series Data Structures
export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export interface TMDBSeries {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  first_air_date: string;
  genre_ids: number[];
}

export interface TMDBDetails {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  seasons?: TMDBSeason[];
}

export interface TMDBSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  overview: string;
  still_path: string | null;
  air_date: string;
}

// Firebase Data Structures
export interface MovieBinData {
  'catalogo-filmes-tavernastream'?: {
    filmes: {
      [tmdbId: string]: string; // tmdbId -> Google Drive embed URL
    };
  };
}

export interface SeriesBinData {
  [tmdbId: string]: {
    titulo: string;
    temporadas: {
      [seasonNumber: string]: string[]; // Array of episode URLs
    };
  };
}

// My List
export interface MyListItem {
  id: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  addedAt: string;
}

export const insertMyListItemSchema = z.object({
  tmdbId: z.number(),
  mediaType: z.enum(['movie', 'tv']),
});

export type InsertMyListItem = z.infer<typeof insertMyListItemSchema>;

// Combined Media Item (for display)
export interface MediaItem {
  tmdbId: number;
  imdbId?: string;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  rating: number;
  releaseDate: string;
  mediaType: 'movie' | 'tv';
  genres: number[];
  hasVideo?: boolean; // If video exists in JSONBin
}

// Player Types
export type PlayerType = 'playerflix' | 'drive';

export interface PlayerConfig {
  type: PlayerType;
  url: string;
  title: string;
  episodeNumber?: number;
  seasonNumber?: number;
}

// Search Results
export interface SearchResult {
  movies: TMDBMovie[];
  series: TMDBSeries[];
}

// Continue Watching (Continuar Assistindo)
export interface WatchProgress {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  lastWatchedAt: string;
  progress: number;
  duration?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeName?: string;
  completed?: boolean;
}

// Genre mapping
export const GENRE_MAP: { [key: number]: string } = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  10770: 'TV Movie',
  53: 'Suspense',
  10752: 'Guerra',
  37: 'Faroeste',
  10759: 'Ação & Aventura',
  10762: 'Kids',
  10763: 'Notícias',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasia',
  10766: 'Novela',
  10767: 'Talk Show',
  10768: 'Guerra & Política',
};
