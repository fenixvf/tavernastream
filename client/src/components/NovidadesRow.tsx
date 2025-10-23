import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MediaItem, WatchProgress } from '@shared/schema';

interface NovidadesRowProps {
  title: string;
  media: MediaItem[];
  onMediaClick: (media: MediaItem) => void;
  allProgress?: WatchProgress[];
}

export function NovidadesRow({ title, media, onMediaClick, allProgress = [] }: NovidadesRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (media.length === 0) return null;

  return (
    <div className="relative group/row mb-10 md:mb-14">
      {/* Category Title com estilo aprimorado */}
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-transparent px-4 py-2 rounded-lg">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-bold text-primary" data-testid={`text-category-${title}`}>
            {title}
          </h2>
        </div>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
      </div>

      {/* Scroll Container */}
      <div className="relative px-4">
        {/* Left Arrow */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 bg-black/80 backdrop-blur-md hover:bg-black/95 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:scale-110 hidden md:flex"
          onClick={() => scroll('left')}
          data-testid={`button-scroll-left-${title}`}
        >
          <ChevronLeft className="w-7 h-7" />
        </Button>

        {/* Thumbnails Container - Layout horizontal com imagens maiores e melhoradas */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {media.map((item) => {
            const backdropUrl = item.backdropPath
              ? `https://image.tmdb.org/t/p/w780${item.backdropPath}`
              : 'https://via.placeholder.com/780x440/1a1a1a/666666?text=No+Image';

            const watchProgress = item.mediaType === 'tv'
              ? allProgress
                  .filter(p => p.tmdbId === item.tmdbId && p.mediaType === 'tv')
                  .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())[0]
              : allProgress.find(p => p.tmdbId === item.tmdbId && p.mediaType === 'movie');

            const isCompleted = watchProgress?.completed;

            return (
              <div
                key={item.tmdbId}
                className="flex-none w-[240px] md:w-[300px] snap-start cursor-pointer group/card"
                onClick={() => onMediaClick(item)}
                data-testid={`novidade-${item.tmdbId}`}
              >
                {/* Thumbnail horizontal melhorado */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-card transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 ring-2 ring-transparent hover:ring-primary/30">
                  <img
                    src={backdropUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Badge de novidade aprimorado */}
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 backdrop-blur-sm text-primary-foreground border-0 rounded-full px-3 py-1 text-xs font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      NOVO
                    </Badge>
                  </div>

                  {/* Badge de completo */}
                  {isCompleted && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="w-7 h-7 rounded-full bg-green-600/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    </div>
                  )}

                  {/* Overlay com gradiente aprimorado */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover/card:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3.5 md:p-4">
                      <p className="text-white text-sm md:text-base font-bold line-clamp-2 mb-2 drop-shadow-lg">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                            <span className="text-xs md:text-sm text-yellow-400">★</span>
                            <span className="text-xs md:text-sm text-white font-semibold">{item.rating.toFixed(1)}</span>
                          </div>
                          <Badge variant="outline" className="text-xs border-white/30 text-white bg-black/40 backdrop-blur-sm">
                            {item.mediaType === 'movie' ? 'Filme' : 'Série'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Year */}
                      {item.releaseDate && (
                        <div className="mt-1.5">
                          <span className="text-xs text-white/70">
                            {new Date(item.releaseDate).getFullYear()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover/card:border-primary/50 rounded-xl transition-all duration-300 pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 bg-black/80 backdrop-blur-md hover:bg-black/95 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:scale-110 hidden md:flex"
          onClick={() => scroll('right')}
          data-testid={`button-scroll-right-${title}`}
        >
          <ChevronRight className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
}
