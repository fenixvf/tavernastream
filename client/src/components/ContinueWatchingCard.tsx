import { Play, MoreVertical, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MediaItem, WatchProgress } from '@shared/schema';

interface ContinueWatchingCardProps {
  media: MediaItem;
  onClick: () => void;
  onRemove: () => void;
  onShowDetails: () => void;
  watchProgress: WatchProgress;
}

export function ContinueWatchingCard({ 
  media, 
  onClick, 
  onRemove,
  onShowDetails,
  watchProgress,
}: ContinueWatchingCardProps) {
  const isMovie = media.mediaType === 'movie';
  const isTVShow = media.mediaType === 'tv';

  const thumbnailUrl = isMovie
    ? media.backdropPath
      ? `https://image.tmdb.org/t/p/w500${media.backdropPath}`
      : media.posterPath
      ? `https://image.tmdb.org/t/p/w500${media.posterPath}`
      : 'https://via.placeholder.com/300x169/1a1a1a/666666?text=No+Image'
    : media.backdropPath
    ? `https://image.tmdb.org/t/p/w500${media.backdropPath}`
    : 'https://via.placeholder.com/300x169/1a1a1a/666666?text=No+Image';

  const episodeInfo = isTVShow && watchProgress.seasonNumber && watchProgress.episodeNumber
    ? `T${watchProgress.seasonNumber}:E${watchProgress.episodeNumber}`
    : '';

  const displayTitle = isTVShow && watchProgress.episodeName
    ? watchProgress.episodeName
    : media.title;

  return (
    <div
      className="relative group cursor-pointer flex-none w-[280px] md:w-[350px]"
      data-testid={`card-continue-watching-${media.tmdbId}`}
    >
      <div 
        className="relative aspect-video rounded-lg overflow-hidden bg-card transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:ring-2 hover:ring-primary/50"
        onClick={onClick}
      >
        <img
          src={thumbnailUrl}
          alt={displayTitle}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white font-bold text-sm line-clamp-1 flex-1">
              {media.title}
            </h3>
          </div>
          
          {isTVShow && episodeInfo && (
            <p className="text-primary text-xs font-semibold mb-1">{episodeInfo}</p>
          )}
          
          {watchProgress.episodeName && isTVShow && (
            <p className="text-white/80 text-xs line-clamp-1 mb-2">{watchProgress.episodeName}</p>
          )}

          <Progress 
            value={watchProgress.progress} 
            className="h-1 bg-white/20" 
            data-testid={`progress-${media.tmdbId}`}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-primary/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        <div className="absolute top-2 right-2 z-40" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-black/90 backdrop-blur-md hover:bg-primary/90 hover:scale-110 rounded-full transition-all duration-200 shadow-2xl border-2 border-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                data-testid={`button-menu-${media.tmdbId}`}
              >
                <MoreVertical className="w-6 h-6 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-card/95 backdrop-blur-md border-card-border"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowDetails();
                }}
                data-testid={`menu-details-${media.tmdbId}`}
              >
                <Info className="w-4 h-4 mr-2" />
                <span>Detalhes</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                data-testid={`menu-remove-${media.tmdbId}`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Remover da Fileira</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
