import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Info, Star, Calendar, Sparkles, Volume2, VolumeX } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  const { data: details } = useQuery<TMDBDetails>({
    queryKey: ['/api/media/details', tmdbId, mediaType],
    staleTime: 60000,
  });

  const { data: videosData } = useQuery<{ results: { key: string; type: string; site: string; official: boolean }[] }>({
    queryKey: ['/api/media/videos', tmdbId, mediaType],
    staleTime: 60000,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const trailer = videosData?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official
  ) || videosData?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailer.key}&playsinline=1&modestbranding=1&rel=0&showinfo=0` : null;

  return (
    <div className="relative w-full mb-8 md:mb-12 px-4 md:px-6 lg:px-8">
      <div className="relative max-w-[1400px] mx-auto">
        <div className="flex justify-center mb-4">
          <Badge className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 border-0 text-white px-4 py-2 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Destaque do Mês
          </Badge>
        </div>

        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] 2xl:h-[700px] overflow-hidden rounded-2xl shadow-2xl">
          {trailerUrl && showVideo ? (
            <div className="absolute inset-0 z-0">
              <iframe
                key={`trailer-${isMuted}`}
                src={trailerUrl}
                className="w-full h-full scale-150 md:scale-125"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ pointerEvents: 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : backdropUrl ? (
            <div className="absolute inset-0 z-0">
              <img
                src={backdropUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </div>
          ) : null}

          {trailer && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 z-20 h-10 w-10 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full"
              onClick={() => setIsMuted(!isMuted)}
              data-testid="button-toggle-sound"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          )}

          <div className="relative h-full container mx-auto px-4 md:px-6 flex items-center">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 lg:gap-12 w-full max-w-6xl">
              {posterUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={posterUrl}
                    alt={title}
                    className="w-40 h-60 md:w-52 md:h-80 lg:w-64 lg:h-96 2xl:w-72 2xl:h-[432px] object-cover rounded-xl shadow-2xl ring-2 ring-primary/50"
                  />
                </div>
              )}

              <div className="flex-1 space-y-3 md:space-y-4 text-center md:text-left pb-4 md:pb-8">
                <h2 
                  className="text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-white leading-tight"
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

                <p className="text-sm md:text-base text-white/90 leading-relaxed line-clamp-2 md:line-clamp-3 max-w-2xl">
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
