import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaCard } from './MediaCard';
import type { MediaItem, WatchProgress } from '@shared/schema';

interface CategoryRowProps {
  title: string;
  media: MediaItem[];
  onMediaClick: (media: MediaItem) => void;
  onAddToList: (media: MediaItem) => void;
  myListIds: number[];
  allProgress?: WatchProgress[];
}

export function CategoryRow({ title, media, onMediaClick, onAddToList, myListIds, allProgress }: CategoryRowProps) {
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
    <div className="relative group/row mb-8 md:mb-12">
      {/* Category Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 px-4" data-testid={`text-category-${title}`}>
        {title}
      </h2>

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

        {/* Cards Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {media.map((item) => (
            <div key={item.tmdbId} className="flex-none w-[140px] md:w-[200px] snap-start">
              <MediaCard
                media={item}
                onClick={() => onMediaClick(item)}
                onAddToList={() => onAddToList(item)}
                isInList={myListIds.includes(item.tmdbId)}
                allProgress={allProgress}
              />
            </div>
          ))}
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
