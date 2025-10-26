import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Info, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: details } = useQuery<TMDBDetails>({
    queryKey: ['/api/media/details', tmdbId, mediaType],
    staleTime: 60000,
  });

  const { data: videosData } = useQuery<{ results: { key: string; type: string; site: string; official: boolean }[] }>({
    queryKey: ['/api/media/videos', tmdbId, mediaType],
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

  // Pegar o vídeo mais recente (primeiro da lista que já vem ordenado)
  const latestVideo = videosData?.results?.[0];
  const trailerUrl = latestVideo?.site === 'YouTube' 
    ? `https://www.youtube.com/embed/${latestVideo.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${latestVideo.key}&playsinline=1&modestbranding=1&rel=0&showinfo=0`
    : null;

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
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              // Layout normal (collapsed)
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
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
                    {/* Poster - clicável */}
                    {posterUrl && (
                      <motion.div
                        className="flex-shrink-0 cursor-pointer group relative"
                        onClick={() => trailerUrl && setIsExpanded(true)}
                        whileHover={{ scale: trailerUrl ? 1.05 : 1 }}
                        whileTap={{ scale: trailerUrl ? 0.95 : 1 }}
                        data-testid="button-expand-trailer"
                      >
                        <img
                          src={posterUrl}
                          alt={title}
                          className="w-40 h-60 md:w-52 md:h-80 lg:w-64 lg:h-96 object-cover rounded-xl shadow-2xl ring-2 ring-primary/50"
                        />
                        {trailerUrl && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                            <div className="bg-white/90 rounded-full p-4">
                              <Play className="w-8 h-8 text-black fill-current" />
                            </div>
                          </div>
                        )}
                      </motion.div>
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
              </motion.div>
            ) : (
              // Layout expandido com trailer
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative bg-black"
                style={{ height: '600px' }}
              >
                {/* Botão fechar */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 z-30 h-10 w-10 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full"
                  onClick={() => setIsExpanded(false)}
                  data-testid="button-close-trailer"
                >
                  <X className="w-5 h-5 text-white" />
                </Button>

                <div className="flex flex-col md:flex-row h-full">
                  {/* Poster à esquerda */}
                  <motion.div
                    className="w-full md:w-2/5 lg:w-1/3 bg-black p-4 md:p-6 lg:p-8 flex flex-col justify-center items-center overflow-y-auto"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {posterUrl && (
                      <img
                        src={posterUrl}
                        alt={title}
                        className="w-full max-w-[300px] rounded-lg shadow-2xl object-cover mb-4"
                      />
                    )}

                    <div className="space-y-3 w-full max-w-[300px] text-center">
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        {title}
                      </h3>

                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        {rating !== 'N/A' && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-sm">
                            ★ {rating}%
                          </Badge>
                        )}
                        {releaseYear && (
                          <span className="text-sm text-white/80">{releaseYear}</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <Button
                          size="sm"
                          className="rounded-md gap-2 w-full"
                          onClick={onPlay}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Assistir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-md gap-2 w-full bg-white/10 border-white/20 hover:bg-white/20"
                          onClick={onMoreInfo}
                        >
                          <Info className="w-4 h-4" />
                          Mais Info
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Trailer à direita */}
                  {trailerUrl && (
                    <motion.div
                      className="flex-1 relative"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <iframe
                        src={trailerUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title={`${title} Trailer`}
                        data-testid="iframe-trailer"
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
