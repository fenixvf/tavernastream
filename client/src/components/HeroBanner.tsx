import { useState, useEffect } from 'react';
import { Info, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MediaItem } from '@shared/schema';

interface HeroBannerProps {
  mediaItems: MediaItem[];
  onPlay: (media: MediaItem) => void;
  onMoreInfo: (media: MediaItem) => void;
}

export function HeroBanner({ mediaItems, onPlay, onMoreInfo }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset currentIndex if it exceeds the array length
  useEffect(() => {
    if (currentIndex >= mediaItems.length && mediaItems.length > 0) {
      setCurrentIndex(0);
    }
  }, [mediaItems.length, currentIndex]);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (mediaItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [mediaItems.length]);

  if (!mediaItems || mediaItems.length === 0) return null;

  const currentMedia = mediaItems[currentIndex];
  const backdropUrl = currentMedia.backdropPath
    ? `https://image.tmdb.org/t/p/original${currentMedia.backdropPath}`
    : null;

  const year = currentMedia.releaseDate ? new Date(currentMedia.releaseDate).getFullYear() : '';

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      {backdropUrl && (
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={currentMedia.title}
            className="w-full h-full object-cover transition-opacity duration-700"
            key={currentMedia.tmdbId}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </div>
      )}

      {/* Navigation Arrows (only show if more than 1 item) */}
      {mediaItems.length > 1 && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full transition-all duration-300 shadow-lg hover:scale-110"
            onClick={handlePrevious}
            data-testid="button-hero-prev"
          >
            <ChevronLeft className="w-7 h-7" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full transition-all duration-300 shadow-lg hover:scale-110"
            onClick={handleNext}
            data-testid="button-hero-next"
          >
            <ChevronRight className="w-7 h-7" />
          </Button>
        </>
      )}

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12 md:pb-20 pt-24">
        <div className="max-w-2xl space-y-4">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight animate-fade-in" data-testid="text-hero-title" key={`title-${currentMedia.tmdbId}`}>
            {currentMedia.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-sm font-semibold" data-testid="badge-hero-rating">
              ★ {currentMedia.rating.toFixed(1)}
            </Badge>
            {year && (
              <span className="text-sm text-muted-foreground">{year}</span>
            )}
            <span className="text-sm text-muted-foreground uppercase tracking-wide">
              {currentMedia.mediaType === 'movie' ? 'Filme' : 'Série'}
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-base md:text-lg text-foreground/90 line-clamp-3 max-w-lg">
            {currentMedia.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              size="lg"
              className="rounded-md gap-2"
              onClick={() => onPlay(currentMedia)}
              data-testid="button-hero-play"
            >
              <Play className="w-5 h-5 fill-current" />
              <span className="font-semibold">Assistir</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-md gap-2 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
              onClick={() => onMoreInfo(currentMedia)}
              data-testid="button-hero-info"
            >
              <Info className="w-5 h-5" />
              <span className="font-semibold">Mais Informações</span>
            </Button>
          </div>

          {/* Indicators (dots) */}
          {mediaItems.length > 1 && (
            <div className="flex items-center gap-2 pt-4">
              {mediaItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-8 bg-primary' 
                      : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                  data-testid={`hero-indicator-${index}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
