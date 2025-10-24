import { X, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MediaCard } from './MediaCard';
import type { MediaItem, WatchProgress } from '@shared/schema';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange?: (query: string) => void;
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
  onQueryChange,
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
      <div className="container mx-auto px-4 py-20 md:py-24">
        {/* Header com campo de busca */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <h2 className="text-xl md:text-3xl font-bold mb-4">Buscar</h2>
            
            {/* Campo de busca mobile */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Buscar filmes, séries, animes..."
                value={query}
                onChange={(e) => onQueryChange?.(e.target.value)}
                className="pl-10 pr-4 bg-secondary/50 border-white/10 rounded-full focus:bg-secondary focus:border-primary/50 transition-colors"
                autoFocus
                data-testid="input-search-overlay"
              />
            </div>
            
            {!isLoading && query.length > 2 && (
              <p className="text-muted-foreground mt-3 text-sm">
                {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full shrink-0"
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
        {!isLoading && query.length <= 2 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Digite para buscar</h3>
            <p className="text-muted-foreground">
              Busque por filmes, séries ou animes
            </p>
          </div>
        )}
        
        {!isLoading && query.length > 2 && results.length === 0 && (
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
