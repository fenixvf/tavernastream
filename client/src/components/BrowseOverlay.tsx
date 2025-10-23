import { useState } from 'react';
import { X, Loader2, Film, Tv, Swords, Laugh, Ghost, Heart, Drama, Sparkles, Rocket, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaCard } from './MediaCard';
import { CategoryRow } from './CategoryRow';
import type { MediaItem, WatchProgress } from '@shared/schema';

interface BrowseOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  allMedia: MediaItem[] | undefined;
  isLoading: boolean;
  onMediaClick: (media: MediaItem) => void;
  onAddToList: (media: MediaItem) => void;
  myListIds: number[];
  allProgress?: WatchProgress[];
}

interface GenreButton {
  id: string;
  label: string;
  icon: React.ElementType;
  genreIds: number[];
  color: string;
}

export function BrowseOverlay({
  isOpen,
  onClose,
  allMedia,
  isLoading,
  onMediaClick,
  onAddToList,
  myListIds,
  allProgress,
}: BrowseOverlayProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const genreButtons: GenreButton[] = [
    { id: 'all', label: 'Todos', icon: Sparkles, genreIds: [], color: 'from-purple-500 to-pink-500' },
    { id: 'anime', label: 'Animes', icon: Tv, genreIds: [16], color: 'from-blue-500 to-cyan-500' },
    { id: 'action', label: 'Ação', icon: Swords, genreIds: [28, 10759], color: 'from-red-500 to-orange-500' },
    { id: 'comedy', label: 'Comédia', icon: Laugh, genreIds: [35], color: 'from-yellow-500 to-amber-500' },
    { id: 'horror', label: 'Terror', icon: Ghost, genreIds: [27], color: 'from-gray-700 to-black' },
    { id: 'romance', label: 'Romance', icon: Heart, genreIds: [10749], color: 'from-pink-500 to-rose-500' },
    { id: 'drama', label: 'Drama', icon: Drama, genreIds: [18], color: 'from-indigo-500 to-purple-500' },
    { id: 'scifi', label: 'Ficção Científica', icon: Rocket, genreIds: [878], color: 'from-teal-500 to-emerald-500' },
    { id: 'thriller', label: 'Suspense', icon: Eye, genreIds: [53], color: 'from-slate-600 to-gray-700' },
  ];

  const categorizeMedia = () => {
    if (!allMedia) return {};
    
    const categories: { [key: string]: MediaItem[] } = {
      'Filmes': allMedia.filter(m => m.mediaType === 'movie'),
      'Séries e Animes': allMedia.filter(m => m.mediaType === 'tv'),
    };

    // Group by primary genre
    allMedia.forEach(media => {
      if (media.genres && media.genres.length > 0) {
        const genreId = media.genres[0];
        const genreName = getGenreName(genreId);
        if (genreName) {
          if (!categories[genreName]) {
            categories[genreName] = [];
          }
          categories[genreName].push(media);
        }
      }
    });

    return categories;
  };

  const getGenreName = (genreId: number): string | null => {
    const genreMap: { [key: number]: string } = {
      28: 'Ação',
      12: 'Aventura',
      16: 'Animação',
      35: 'Comédia',
      80: 'Crime',
      18: 'Drama',
      14: 'Fantasia',
      27: 'Terror',
      878: 'Ficção Científica',
      53: 'Suspense',
      10749: 'Romance',
      10759: 'Ação & Aventura',
    };
    return genreMap[genreId] || null;
  };

  const getFilteredMedia = () => {
    if (!allMedia) return [];
    if (!selectedGenre || selectedGenre === 'all') return allMedia;
    
    const genre = genreButtons.find(g => g.id === selectedGenre);
    if (!genre) return allMedia;
    
    return allMedia.filter(media => {
      if (!media.genres) return false;
      return media.genres.some(genreId => genre.genreIds.includes(genreId));
    });
  };

  const categories = categorizeMedia();
  const filteredMedia = getFilteredMedia();

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="sticky top-0 z-[60] bg-background/95 backdrop-blur-xl border-b border-border pb-4">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Navegar</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
              data-testid="button-close-browse"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          
          {/* Genre Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {genreButtons.map((genre) => {
              const Icon = genre.icon;
              const isSelected = selectedGenre === genre.id || (!selectedGenre && genre.id === 'all');
              
              return (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`flex-none snap-start group relative overflow-hidden rounded-lg px-4 py-2.5 transition-all duration-300 ${
                    isSelected 
                      ? 'scale-105 shadow-lg' 
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  data-testid={`button-genre-${genre.id}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${genre.color} ${isSelected ? 'opacity-100' : 'opacity-70'} transition-opacity`} />
                  <div className="relative flex items-center gap-2 text-white font-semibold whitespace-nowrap">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{genre.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
          
          {!isLoading && filteredMedia && (
            <p className="text-muted-foreground mt-3 text-sm">
              {filteredMedia.length} {filteredMedia.length === 1 ? 'título disponível' : 'títulos disponíveis'}
            </p>
          )}
        </div>
      </div>

      <div className="pb-20 pt-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Filtered Media Grid */}
        {!isLoading && filteredMedia && filteredMedia.length > 0 && (
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredMedia.map((item) => (
                <MediaCard
                  key={item.tmdbId}
                  media={item}
                  onClick={() => onMediaClick(item)}
                  onAddToList={() => onAddToList(item)}
                  isInList={myListIds.includes(item.tmdbId)}
                  allProgress={allProgress}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredMedia && filteredMedia.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground text-lg">Nenhum título encontrado neste gênero</p>
          </div>
        )}
      </div>
    </div>
  );
}
