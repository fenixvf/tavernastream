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
      releaseTimestamp: new Date('2025-10-29T15:00:00').getTime(),
      backdropPath: null,
    },
  ],
};
