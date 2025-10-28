import { useQuery } from '@tanstack/react-query';
import { Play, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TMDBDetails } from '@shared/schema';

interface FeaturedBannerProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title?: string;
  description?: string;
  onPlay: () => void;
  onMoreInfo: () => void;
}

export function FeaturedBanner({
  tmdbId,
  mediaType,
  title: customTitle,
  description: customDescription,
  onPlay,
  onMoreInfo,
}: FeaturedBannerProps) {
  const { data: details } = useQuery<TMDBDetails>({
    queryKey: ['/api/media/details', tmdbId, mediaType],
    staleTime: 60000,
  });

  if (!details) {
    return null;
  }

  const title = customTitle || details.title || details.name || '';
  const description = customDescription || details.overview || '';
  const posterUrl = details.poster_path
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
    : null;
  const backdropUrl = details.backdrop_path
    ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
    : null;

  const rating = details.vote_average ? (details.vote_average * 10).toFixed(0) : 'N/A';
  const releaseYear = details.release_date
    ? new Date(details.release_date).getFullYear()
    : details.first_air_date
    ? new Date(details.first_air_date).getFullYear()
    : '';

  const genres = details.genres?.slice(0, 3).map((g) => g.name).join(' • ') || '';

  return (
    <div className="w-full mb-8 md:mb-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-4">
          <Badge className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 border-0 text-white px-4 py-2 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Destaque do Mês
          </Badge>
        </div>

        {/* Container principal */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-black">
          {/* Background */}
          {backdropUrl && (
            <div className="absolute inset-0">
              <img
                src={backdropUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </div>
          )}

          {/* Conteúdo */}
          <div className="relative min-h-[400px] md:min-h-[500px] flex items-center px-6 md:px-8 lg:px-12 py-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 lg:gap-12 w-full max-w-6xl">
              {/* Poster */}
              {posterUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={posterUrl}
                    alt={title}
                    className="w-40 h-60 md:w-52 md:h-80 lg:w-64 lg:h-96 object-cover rounded-xl shadow-2xl ring-2 ring-primary/50"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 space-y-3 md:space-y-4 text-center md:text-left max-w-2xl">
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
                  style={{
                    textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)',
                  }}
                  data-testid="text-featured-title"
                >
                  {title}
                </h2>

                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                  {rating !== 'N/A' && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-sm font-semibold">
                      ★ {rating}%
                    </Badge>
                  )}
                  {releaseYear && (
                    <span className="text-sm text-white/80 font-medium">{releaseYear}</span>
                  )}
                  <span className="text-sm text-white/80 font-medium uppercase">
                    {mediaType === 'movie' ? 'Filme' : 'Série'}
                  </span>
                </div>

                {genres && (
                  <p className="text-sm md:text-base text-white/70 font-medium">
                    {genres}
                  </p>
                )}

                <p className="text-sm md:text-base text-white/90 leading-relaxed line-clamp-2 md:line-clamp-3">
                  {description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
                  <Button
                    size="lg"
                    className="rounded-md gap-2"
                    onClick={onPlay}
                    data-testid="button-featured-play"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span className="font-semibold">Assistir</span>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-md gap-2 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                    onClick={onMoreInfo}
                    data-testid="button-featured-info"
                  >
                    <Info className="w-5 h-5" />
                    <span className="font-semibold">Mais Informações</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
