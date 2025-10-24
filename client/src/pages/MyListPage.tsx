import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { MediaCard } from '@/components/MediaCard';
import { MediaModal } from '@/components/MediaModal';
import { PlayerOverlay } from '@/components/PlayerOverlay';
import { SearchOverlay } from '@/components/SearchOverlay';
import { MobileNav } from '@/components/MobileNav';
import { Loader2, Heart } from 'lucide-react';
import type { MediaItem, TMDBDetails, SeriesBinData } from '@shared/schema';
import { useLocation } from 'wouter';
import { useWatchProgress } from '@/hooks/use-watch-progress';

export default function MyListPage() {
  const [, setLocation] = useLocation();
  const { watchProgress } = useWatchProgress();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playerConfig, setPlayerConfig] = useState<{
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    seasonNumber?: number;
    episodeNumber?: number;
    driveUrl?: string;
  } | null>(null);

  // Fetch all media
  const { data: allMedia, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ['/api/media/all'],
  });

  // Fetch my list
  const { data: myList = [], isLoading: isLoadingList } = useQuery<{ tmdbId: number }[]>({
    queryKey: ['/api/mylist'],
  });

  // Fetch media details when modal opens
  const { data: mediaDetails } = useQuery<TMDBDetails>({
    queryKey: ['/api/media/details', selectedMedia?.tmdbId, selectedMedia?.mediaType],
    enabled: !!selectedMedia && isModalOpen,
  });

  // Fetch series data if it's a TV show
  const { data: seriesData } = useQuery<SeriesBinData[string]>({
    queryKey: ['/api/media/series', selectedMedia?.tmdbId],
    enabled: !!selectedMedia && selectedMedia.mediaType === 'tv' && isModalOpen,
  });

  // Search results
  const { data: searchResults = [], isLoading: isSearching } = useQuery<MediaItem[]>({
    queryKey: ['/api/media/search?q=' + encodeURIComponent(searchQuery)],
    enabled: searchQuery.length > 2 && isSearchOpen,
  });

  const myListIds = myList.map(item => item.tmdbId);
  const myListMedia = allMedia?.filter(m => myListIds.includes(m.tmdbId)) || [];

  const handleMediaClick = (media: MediaItem) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  const handleAddToList = async (media: MediaItem) => {
    try {
      const isInList = myListIds.includes(media.tmdbId);
      const { apiRequest } = await import('@/lib/queryClient');
      const { queryClient } = await import('@/lib/queryClient');
      
      if (isInList) {
        await apiRequest('DELETE', `/api/mylist/${media.tmdbId}`);
      } else {
        await apiRequest('POST', '/api/mylist', {
          tmdbId: media.tmdbId,
          mediaType: media.mediaType,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/mylist'] });
    } catch (error) {
      console.error('Error updating my list:', error);
    }
  };

  const handlePlayMovie = async () => {
    if (!selectedMedia) return;
    
    let driveUrl: string | undefined;
    try {
      const response = await fetch(`/api/media/movie/${selectedMedia.tmdbId}/url`);
      if (response.ok) {
        const data = await response.json();
        driveUrl = data.url;
      }
    } catch (error) {
      console.error('Error fetching movie URL:', error);
    }
    
    setPlayerConfig({
      tmdbId: selectedMedia.tmdbId,
      mediaType: 'movie',
      title: selectedMedia.title,
      driveUrl,
    });
    setIsPlayerOpen(true);
  };

  const handlePlayEpisode = (seasonNumber: number, episodeNumber: number) => {
    if (!selectedMedia || !seriesData) return;
    
    const seasonKey = seasonNumber.toString();
    const seasonEpisodes = seriesData.temporadas[seasonKey as keyof typeof seriesData.temporadas] as string[] | undefined;
    const driveUrl = seasonEpisodes?.[episodeNumber - 1];
    
    setPlayerConfig({
      tmdbId: selectedMedia.tmdbId,
      mediaType: 'tv',
      title: selectedMedia.title,
      seasonNumber,
      episodeNumber,
      driveUrl,
    });
    setIsPlayerOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(true);
  };

  const handleLogoClick = () => {
    setLocation('/');
  };

  const isLoading = isLoadingMedia || isLoadingList;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando sua lista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <Header
        onSearch={handleSearch}
        onLogoClick={handleLogoClick}
      />

      {/* Main Content */}
      <main className="pt-24 md:pt-28 px-4 container mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Minha Lista</h1>
          </div>
          <p className="text-muted-foreground">
            {myListMedia.length === 0 
              ? 'Sua lista está vazia. Adicione filmes e séries que você quer assistir!' 
              : `${myListMedia.length} ${myListMedia.length === 1 ? 'título' : 'títulos'} na sua lista`
            }
          </p>
        </div>

        {/* Empty State */}
        {myListMedia.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-24 h-24 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-2">Sua lista está vazia</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Navegue pelo catálogo e adicione seus filmes e séries favoritos para assistir depois
            </p>
            <button
              onClick={handleLogoClick}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2 font-semibold"
              data-testid="button-browse-catalog"
            >
              Explorar Catálogo
            </button>
          </div>
        )}

        {/* Media Grid */}
        {myListMedia.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {myListMedia.map((media) => (
              <MediaCard
                key={media.tmdbId}
                media={media}
                onClick={() => handleMediaClick(media)}
                onAddToList={() => handleAddToList(media)}
                isInList={true}
                allProgress={watchProgress}
              />
            ))}
          </div>
        )}
      </main>

      {/* Media Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        details={mediaDetails || null}
        seriesData={seriesData}
        mediaType={selectedMedia?.mediaType || 'movie'}
        onPlayMovie={handlePlayMovie}
        onPlayEpisode={handlePlayEpisode}
        onAddToList={() => selectedMedia && handleAddToList(selectedMedia)}
        isInList={selectedMedia ? myListIds.includes(selectedMedia.tmdbId) : false}
      />

      {/* Player Overlay */}
      {playerConfig && (
        <PlayerOverlay
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          {...playerConfig}
        />
      )}

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
        }}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        results={searchResults}
        isLoading={isSearching}
        onMediaClick={handleMediaClick}
        onAddToList={handleAddToList}
        myListIds={myListIds}
        allProgress={watchProgress}
      />

      {/* Mobile Navigation */}
      <MobileNav
        activeTab="mylist"
        onTabChange={(tab) => {
          if (tab === 'home') {
            setLocation('/');
          } else if (tab === 'search') {
            setIsSearchOpen(true);
          } else if (tab === 'browse') {
            setLocation('/');
          }
        }}
      />
    </div>
  );
}
