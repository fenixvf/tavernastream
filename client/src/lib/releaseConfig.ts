export interface ReleaseConfig {
  enabled: boolean;
  targetTmdbId: number;
  targetMediaType: 'movie' | 'tv';
  targetTitle: string;
  releaseTimestamp: number;
  backdropPath?: string | null;
}

export const releaseConfig: ReleaseConfig = {
  enabled: false,
  targetTmdbId: 0,
  targetMediaType: 'movie',
  targetTitle: '',
  releaseTimestamp: Date.now() + (24 * 60 * 60 * 1000),
  backdropPath: null,
};
