export interface ReleaseConfig {
  enabled: boolean;
  targetTmdbId: number;
  targetMediaType: 'movie' | 'tv';
  targetTitle: string;
  releaseTimestamp: number;
  backdropPath?: string | null;
}

export const releaseConfig: ReleaseConfig = {
  enabled: true,
  targetTmdbId: 1175942,
  targetMediaType: 'movie',
  targetTitle: 'Os caras malvados 2',
  releaseTimestamp: Date.now() + (24 * 60 * 60 * 1000),
  backdropPath: null,
};
