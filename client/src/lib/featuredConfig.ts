export interface FeaturedConfig {
  enabled: boolean;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  description: string;
}

export const featuredConfig: FeaturedConfig = {
  enabled: false,
  tmdbId: 0,
  mediaType: 'movie',
  title: '',
  description: '',
};
