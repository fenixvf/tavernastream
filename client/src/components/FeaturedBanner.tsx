import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Info, Star, Calendar, Sparkles } from 'lucide-react';
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

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!details) {
    return null;
  }

  const title = customTitle || details.title || details.name || '';
  const description = customDescription || details.overview || '';
  const backdropUrl = details.backdrop_path
    ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
    : null;
  const posterUrl = details.poster_path
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
    : null;

  const rating = details.vote_average ? (details.vote_average * 10).toFixed(0) : 'N/A';
  const releaseYear = details.release_date
    ? new Date(details.release_date).getFullYear()
    : details.first_air_date
    ? new Date(details.first_air_date).getFullYear()
    : '';

  const genres = details.genres?.slice(0, 3).map((g) => g.name).join(' • ') || '';

  return (
    <div className="relative w-full mb-8 md:mb-12">
      <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl mx-4 shadow-2xl">
        {/* Background Images with Parallax Effect */}
        {backdropUrl && (
          <div className="absolute inset-0">
            <img
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover scale-105 transition-transform duration-1000"
              style={{
                transform: `scale(${1.05 + currentImageIndex * 0.02})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
        )}

        {/* Content Container */}
        <div className="relative h-full container mx-auto px-6 md:px-8 flex items-center">
          <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-6xl">
            {/* Poster */}
            {posterUrl && (
              <div className="flex-shrink-0 hidden md:block">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
                  <img
                    src={posterUrl}
                    alt={title}
                    className="relative w-64 h-96 object-cover rounded-xl shadow-2xl ring-2 ring-primary/50"
                  />
                </div>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 space-y-6 text-center md:text-left">
              {/* Badge */}
              <div className="flex justify-center md:justify-start">
                <Badge className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 border-0 text-white px-4 py-2 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Destaque do Mês
                </Badge>
              </div>

              {/* Title */}
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl"
                style={{
                  textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)',
                }}
                data-testid="text-featured-title"
              >
                {title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/90">
                {rating !== 'N/A' && (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold">{rating}%</span>
                  </div>
                )}
                {releaseYear && (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold">{releaseYear}</span>
                  </div>
                )}
                {mediaType === 'tv' && (
                  <Badge className="bg-primary/80 backdrop-blur-sm border-0 text-white px-3 py-1">
                    Série
                  </Badge>
                )}
                {mediaType === 'movie' && (
                  <Badge className="bg-primary/80 backdrop-blur-sm border-0 text-white px-3 py-1">
                    Filme
                  </Badge>
                )}
              </div>

              {/* Genres */}
              {genres && (
                <p className="text-sm md:text-base text-white/80 font-medium">
                  {genres}
                </p>
              )}

              {/* Description */}
              <p className="text-sm md:text-lg text-white/90 leading-relaxed line-clamp-3 md:line-clamp-4 max-w-2xl">
                {description}
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-3 group"
                  onClick={onPlay}
                  data-testid="button-featured-play"
                >
                  <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
                  Assistir Agora
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold text-lg px-8 py-6 rounded-full backdrop-blur-sm shadow-lg hover:scale-105 transition-all flex items-center gap-3"
                  onClick={onMoreInfo}
                  data-testid="button-featured-info"
                >
                  <Info className="w-6 h-6" />
                  Mais Informações
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
