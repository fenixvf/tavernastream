export interface FeaturedConfig {
  enabled: boolean;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  description: string;
}

export const featuredConfig: FeaturedConfig = {
  enabled: true ,
  tmdbId: 66732,
  mediaType: 'tv',
  title: 'Stranger Things',
  description: '',
};
