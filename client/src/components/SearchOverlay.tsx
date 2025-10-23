import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaCard } from './MediaCard';
import type { MediaItem, WatchProgress } from '@shared/schema';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  results: MediaItem[];
  isLoading: boolean;
  onMediaClick: (media: MediaItem) => void;
  onAddToList: (media: MediaItem) => void;
  myListIds: number[];
  allProgress?: WatchProgress[];
}

export function SearchOverlay({
  isOpen,
  onClose,
  query,
  results,
  isLoading,
  onMediaClick,
  onAddToList,
  myListIds,
  allProgress,
}: SearchOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Resultados para "{query}"
            </h2>
            {!isLoading && (
              <p className="text-muted-foreground mt-1">
                {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
            data-testid="button-close-search"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((media) => (
              <MediaCard
                key={media.tmdbId}
                media={media}
                onClick={() => onMediaClick(media)}
                onAddToList={() => onAddToList(media)}
                isInList={myListIds.includes(media.tmdbId)}
                allProgress={allProgress}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground">
              Tente buscar por outro título
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
