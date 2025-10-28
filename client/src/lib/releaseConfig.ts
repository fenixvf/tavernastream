export interface ReleaseItem {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  releaseTimestamp: number;
  backdropPath?: string | null;
}

export interface ReleaseConfig {
  enabled: boolean;
  items: ReleaseItem[];
}

export const releaseConfig: ReleaseConfig = {
  enabled: true,
  items: [
    {
      tmdbId: 1175942,
      mediaType: 'movie',
      title: 'Os caras malvados 2',
      releaseTimestamp: Date.now() + (24 * 60 * 60 * 1000),
      backdropPath: null,
    },
  ],
};
