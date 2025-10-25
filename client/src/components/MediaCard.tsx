import { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { MediaItem, WatchProgress } from '@shared/schema';

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
  onAddToList: () => void;
  isInList: boolean;
  allProgress?: WatchProgress[];
  showProgress?: boolean;
  onRemove?: () => void;
}

export function MediaCard({ media, onClick, onAddToList, isInList, allProgress = [], showProgress = false, onRemove }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const posterUrl = media.posterPath
    ? `https://image.tmdb.org/t/p/w500${media.posterPath}`
    : 'https://via.placeholder.com/300x450/1a1a1a/666666?text=No+Image';

  // For TV shows, find the most recent episode progress
  // For movies, find exact match
  const watchProgress = media.mediaType === 'tv'
    ? allProgress
        .filter(p => p.tmdbId === media.tmdbId && p.mediaType === 'tv')
        .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())[0]
    : allProgress.find(p => p.tmdbId === media.tmdbId && p.mediaType === 'movie');

  const isCompleted = watchProgress?.completed;

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      data-testid={`card-media-${media.tmdbId}`}
    >
      {/* Card Container */}
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-card transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
        {/* Poster Image */}
        <img
          src={posterUrl}
          alt={media.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Rating Badge or Completed Badge */}
        <div className="absolute top-2 right-2 z-10">
          {isCompleted ? (
            <Badge
              className="bg-green-600/90 backdrop-blur-sm text-white border-0 rounded-full px-2 py-1 text-xs font-semibold flex items-center gap-1"
              data-testid={`badge-completed-${media.tmdbId}`}
            >
              <Check className="w-3 h-3" />
              Já Visto
            </Badge>
          ) : (
            <Badge
              className="bg-black/70 backdrop-blur-sm text-white border-0 rounded-full px-2 py-1 text-xs font-semibold"
              data-testid={`badge-rating-${media.tmdbId}`}
            >
              ★ {media.rating.toFixed(1)}
            </Badge>
          )}
        </div>

        {/* Botão X para remover - canto superior esquerdo */}
        {onRemove && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 left-2 z-20 rounded-full w-8 h-8 bg-black/80 backdrop-blur-sm text-white hover:bg-red-600/90 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            data-testid={`button-remove-${media.tmdbId}`}
          >
            <span className="text-sm font-bold">✕</span>
          </Button>
        )}

        {/* Add to List Button */}
        <Button
          size="icon"
          variant="ghost"
          className={`absolute ${onRemove ? 'top-12' : 'top-2'} left-2 z-10 rounded-full w-8 h-8 backdrop-blur-sm transition-opacity ${
            isHovered || isInList ? 'opacity-100' : 'opacity-0'
          } ${isInList ? 'bg-primary/20 text-primary' : 'bg-black/50 text-white hover:bg-black/70'}`}
          onClick={(e) => {
            e.stopPropagation();
            onAddToList();
          }}
          data-testid={`button-add-list-${media.tmdbId}`}
        >
          <Heart className={`w-4 h-4 ${isInList ? 'fill-current' : ''}`} />
        </Button>

        {/* Progress Bar e Informação de progresso - apenas em Continue Assistindo */}
        {showProgress && watchProgress && !isCompleted && watchProgress.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-10 px-2 pb-2 bg-gradient-to-t from-black/90 to-transparent pt-6">
            {watchProgress.episodeName && watchProgress.seasonNumber && watchProgress.episodeNumber && (
              <p className="text-xs text-white/90 font-semibold mb-1 truncate">
                T{watchProgress.seasonNumber}:E{watchProgress.episodeNumber} - {watchProgress.episodeName}
              </p>
            )}
            <Progress value={watchProgress.progress} className="h-1" />
          </div>
        )}

        {/* Hover Overlay with Title */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
              {media.title}
            </h3>
            {media.hasVideo && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* Title Below Card (visible on mobile) */}
      <div className="md:hidden mt-2">
        <h3 className="text-sm font-semibold line-clamp-2" data-testid={`text-title-${media.tmdbId}`}>
          {media.title}
        </h3>
      </div>
    </div>
  );
}
