import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Play, Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TMDBDetails, TMDBEpisode, SeriesBinData } from '@shared/schema';
import { useWatchProgress } from '@/hooks/use-watch-progress';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: TMDBDetails | null;
  seriesData?: SeriesBinData[string];
  mediaType: 'movie' | 'tv';
  onPlayMovie?: () => void;
  onPlayEpisode?: (seasonNumber: number, episodeNumber: number) => void;
  onAddToList: () => void;
  isInList: boolean;
}

export function MediaModal({
  isOpen,
  onClose,
  details,
  seriesData,
  mediaType,
  onPlayMovie,
  onPlayEpisode,
  onAddToList,
  isInList,
}: MediaModalProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>('1');
  const { getProgress } = useWatchProgress();

  const { data: seasonDetails } = useQuery<{ episodes: TMDBEpisode[] }>({
    queryKey: ['/api/media/tv', details?.id, 'season', selectedSeason],
    enabled: mediaType === 'tv' && isOpen && !!seriesData && !!details,
  });

  const backdropUrl = details?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
    : null;

  const title = details?.title || details?.name || '';
  const year = details?.release_date
    ? new Date(details.release_date).getFullYear()
    : details?.first_air_date
    ? new Date(details.first_air_date).getFullYear()
    : '';

  if (!details) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-card border-card-border">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {details.overview || 'Detalhes do conteúdo'}
        </DialogDescription>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 rounded-full p-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
          data-testid="button-close-modal"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Banner Section */}
        {backdropUrl && (
          <div className="relative w-full aspect-video">
            <img
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          </div>
        )}

        {/* Info Section */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Title and Metadata */}
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-modal-title">
              {title}
            </h2>

            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold" data-testid="badge-modal-rating">
                ★ {details.vote_average.toFixed(1)}
              </Badge>
              {year && <span className="text-muted-foreground">{year}</span>}
              {details.runtime && (
                <span className="text-muted-foreground">{details.runtime} min</span>
              )}
              {details.number_of_seasons && (
                <span className="text-muted-foreground">
                  {details.number_of_seasons} {details.number_of_seasons === 1 ? 'Temporada' : 'Temporadas'}
                </span>
              )}
            </div>

            {/* Genres */}
            {details.genres && details.genres.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {details.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary" className="text-xs">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Sinopse</h3>
            <p className="text-muted-foreground leading-relaxed">{details.overview}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {mediaType === 'movie' && onPlayMovie && (
              <Button size="lg" className="gap-2" onClick={onPlayMovie} data-testid="button-modal-play">
                <Play className="w-5 h-5 fill-current" />
                Assistir Agora
              </Button>
            )}
            <Button
              size="lg"
              variant={isInList ? 'default' : 'outline'}
              className="gap-2"
              onClick={onAddToList}
              data-testid="button-modal-add-list"
            >
              <Heart className={`w-5 h-5 ${isInList ? 'fill-current' : ''}`} />
              {isInList ? 'Na Minha Lista' : 'Adicionar à Lista'}
            </Button>
          </div>

          {/* Episodes (Series Only) */}
          {mediaType === 'tv' && seriesData && seriesData.temporadas && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Episódios</h3>
              <Tabs value={selectedSeason} onValueChange={setSelectedSeason} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                  {seriesData.temporadas.map((_: any, seasonIndex: number) => {
                    if (seasonIndex === 0 || !seriesData.temporadas[seasonIndex]) return null;
                    return (
                      <TabsTrigger key={seasonIndex} value={String(seasonIndex)} data-testid={`tab-season-${seasonIndex}`}>
                        Temporada {seasonIndex}
                      </TabsTrigger>
                    );
                  }).filter(Boolean)}
                </TabsList>
                {seriesData.temporadas.map((episodes: any, seasonIndex: number) => {
                  if (seasonIndex === 0 || !episodes) return null;
                  const tmdbEpisodes = seasonDetails?.episodes || [];
                  
                  return (
                    <TabsContent key={seasonIndex} value={String(seasonIndex)} className="space-y-3 mt-4">
                      {episodes.map((_: any, index: number) => {
                        const episodeData = tmdbEpisodes[index];
                        const progress = getProgress(details.id, 'tv', seasonIndex, index + 1);
                        const isWatched = progress?.completed || false;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => onPlayEpisode?.(seasonIndex, index + 1)}
                            className="w-full rounded-lg overflow-hidden bg-secondary hover-elevate active-elevate-2 transition-all group"
                            data-testid={`button-episode-${seasonIndex}-${index + 1}`}
                          >
                            <div className="flex gap-4 p-3">
                              {/* Thumbnail */}
                              <div className="relative w-40 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                {episodeData?.still_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w300${episodeData.still_path}`}
                                    alt={episodeData.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                                    {index + 1}
                                  </div>
                                )}
                                {isWatched && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="bg-primary rounded-full p-2">
                                      <Check className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                  </div>
                                )}
                                {!isWatched && progress && progress.progress > 0 && (
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                                    <div 
                                      className="h-full bg-primary"
                                      style={{ width: `${progress.progress}%` }}
                                    />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                  <Play className="w-10 h-10 text-white fill-white" />
                                </div>
                              </div>
                              
                              {/* Info */}
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-semibold text-muted-foreground">
                                        {index + 1}
                                      </span>
                                      <h4 className="font-semibold truncate">
                                        {episodeData?.name || `Episódio ${index + 1}`}
                                      </h4>
                                    </div>
                                    {episodeData?.overview && (
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        {episodeData.overview}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
