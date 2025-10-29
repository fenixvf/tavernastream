import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { FeaturedBanner } from '@/components/FeaturedBanner';
import { CategoryRow } from '@/components/CategoryRow';
import { NovidadesRow } from '@/components/NovidadesRow';
import { MediaModal } from '@/components/MediaModal';
import { PlayerOverlay } from '@/components/PlayerOverlay';
import { SearchOverlay } from '@/components/SearchOverlay';
import { BrowseOverlay } from '@/components/BrowseOverlay';
import { MobileNav } from '@/components/MobileNav';
import { ReleaseCountdown } from '@/components/ReleaseCountdown';
import { Loader2 } from 'lucide-react';
import type { MediaItem, TMDBDetails, SeriesBinData, TMDBEpisode } from '@shared/schema';
import { useWatchProgress } from '@/hooks/use-watch-progress';
import { releaseConfig } from '@/lib/releaseConfig';
import { featuredConfig } from '@/lib/featuredConfig';
import { fanDubConfig } from '@/lib/fanDubConfig';

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileTab, setMobileTab] = useState('home');
  const [playerConfig, setPlayerConfig] = useState<{
    tmdbId: number;
    imdbId?: string;
    mediaType: 'movie' | 'tv';
    title: string;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeName?: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    driveUrl?: string;
    totalEpisodes?: number;
    autoPlayPlayerFlix?: boolean;
    resumeTime?: number;
  } | null>(null);

  const { getContinueWatching, watchProgress, getProgress, removeFromContinueWatching } = useWatchProgress();

  // Fetch all media (movies + series) - atualiza a cada 15 segundos
  const { data: allMedia, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ['/api/media/all'],
    refetchInterval: 15000,
    staleTime: 10000,
  });

  // Fetch hero media (últimos 4 itens rotacionados)
  const { data: heroMediaItems = [] } = useQuery<MediaItem[]>({
    queryKey: ['/api/media/hero'],
    refetchInterval: 15000,
    staleTime: 10000,
  });

  // Fetch my list
  const { data: myList = [] } = useQuery<{ tmdbId: number }[]>({
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

  // Fetch fandub media
  const fanDubMediaQuery = useQuery<MediaItem[]>({
    queryKey: ['/api/media/fandub'],
    enabled: fanDubConfig.length > 0,
  });

  const fanDubMedia = fanDubMediaQuery.data || [];

  // Create a map of tmdbId to studioName for fandub items
  const studioNameMap = fanDubConfig.reduce((acc, item) => {
    acc[item.tmdbId] = item.studioName;
    return acc;
  }, {} as Record<number, string>);

  // Merge fandub media with all media, avoiding duplicates
  const allMediaCombined = (() => {
    if (!allMedia) return fanDubMedia;
    if (fanDubMedia.length === 0) return allMedia;
    
    const combined = [...allMedia];
    const existingIds = new Set(allMedia.map(m => m.tmdbId));
    
    fanDubMedia.forEach(fandubItem => {
      if (!existingIds.has(fandubItem.tmdbId)) {
        combined.push(fandubItem);
      } else {
        // Replace existing item with fandub version (which has the -1 genre)
        const index = combined.findIndex(m => m.tmdbId === fandubItem.tmdbId);
        if (index !== -1) {
          combined[index] = fandubItem;
        }
      }
    });
    
    return combined;
  })();

  const myListIds = myList.map(item => item.tmdbId);

  // Get continue watching items
  const continueWatchingData = getContinueWatching();
  const continueWatching = continueWatchingData
    .map(progress => {
      const media = allMediaCombined?.find(m => m.tmdbId === progress.tmdbId);
      return media;
    })
    .filter(Boolean) as MediaItem[];

  // Get new releases - balanceado entre filmes e séries (5 de cada), excluindo fandubs
  const newReleases = (() => {
    if (!allMediaCombined) return [];
    
    const recentMovies = allMediaCombined
      .filter(m => m.mediaType === 'movie' && !m.genres?.includes(-1))
      .slice(0, 5);
    const recentSeries = allMediaCombined
      .filter(m => m.mediaType === 'tv' && !m.genres?.includes(-1))
      .slice(0, 5);
    
    // Intercalar filmes e séries
    const balanced: MediaItem[] = [];
    const maxLength = Math.max(recentMovies.length, recentSeries.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (recentMovies[i]) balanced.push(recentMovies[i]);
      if (recentSeries[i]) balanced.push(recentSeries[i]);
    }
    
    return balanced;
  })();

  // Categorize media by genre
  const categorizeMedia = () => {
    if (!allMediaCombined) return {};
    
    const categories: { [key: string]: MediaItem[] } = {
      'Filmes': allMediaCombined.filter(m => m.mediaType === 'movie' && !m.genres?.includes(-1)),
      'Séries e Animes': allMediaCombined.filter(m => m.mediaType === 'tv' && !m.genres?.includes(-1)),
    };

    // Group by primary genre (excluding fandub items)
    allMediaCombined.forEach(media => {
      if (media.genres && media.genres.length > 0) {
        const genreId = media.genres[0];
        if (genreId === -1) return;
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
      10759: 'Ação & Aventura',
    };
    return genreMap[genreId] || null;
  };

  const categories = categorizeMedia();

  const handleMediaClick = (media: MediaItem) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  const handleContinueWatching = async (media: MediaItem) => {
    const progress = watchProgress.find((p) => {
      if (media.mediaType === 'movie') {
        return p.tmdbId === media.tmdbId && p.mediaType === 'movie';
      } else {
        return p.tmdbId === media.tmdbId && p.mediaType === 'tv';
      }
    });

    if (!progress) {
      handleMediaClick(media);
      return;
    }

    setSelectedMedia(media);

    if (media.mediaType === 'movie') {
      await handlePlayMovie(media, true);
    } else if (progress.seasonNumber && progress.episodeNumber) {
      // Buscar dados da série para abrir o episódio correto
      try {
        const response = await fetch(`/api/media/series/${media.tmdbId}`);
        if (response.ok) {
          const data = await response.json();
          // Temporariamente definir seriesData
          const tempSeriesData = data;
          setSelectedMedia(media);
          
          // Esperar um pouco para garantir que o estado foi atualizado
          setTimeout(() => {
            handlePlayEpisode(progress.seasonNumber!, progress.episodeNumber!, true);
          }, 100);
        } else {
          // Se não tiver dados da série, abre direto o player
          handlePlayEpisode(progress.seasonNumber, progress.episodeNumber, true);
        }
      } catch (error) {
        console.error('Error fetching series data:', error);
        handlePlayEpisode(progress.seasonNumber, progress.episodeNumber, true);
      }
    }
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

  const handlePlayMovie = async (media?: MediaItem, continueWatching?: boolean) => {
    const mediaToPlay = media || selectedMedia;
    if (!mediaToPlay) return;
    
    let driveUrl: string | undefined;
    
    // Verificar se é um item de fandub
    const isFanDub = fanDubConfig.some(item => item.tmdbId === mediaToPlay.tmdbId && item.mediaType === 'movie');
    
    try {
      if (isFanDub) {
        // Buscar URL do endpoint de fandub
        const response = await fetch(`/api/fan-dub/movie/${mediaToPlay.tmdbId}/url`);
        if (response.ok) {
          const data = await response.json();
          driveUrl = data.url;
        }
      } else {
        // Buscar URL normal
        const response = await fetch(`/api/media/movie/${mediaToPlay.tmdbId}/url`);
        if (response.ok) {
          const data = await response.json();
          driveUrl = data.url;
        }
      }
    } catch (error) {
      console.error('Error fetching movie URL:', error);
    }
    
    // Buscar progresso se for "continuar assistindo"
    let resumeTime: number | undefined;
    if (continueWatching) {
      const progress = getProgress(mediaToPlay.tmdbId, 'movie');
      if (progress && progress.currentTime) {
        resumeTime = progress.currentTime;
      }
    }
    
    setPlayerConfig({
      tmdbId: mediaToPlay.tmdbId,
      imdbId: isFanDub ? undefined : mediaToPlay.imdbId,
      mediaType: 'movie',
      title: mediaToPlay.title,
      posterPath: mediaToPlay.posterPath,
      backdropPath: mediaToPlay.backdropPath,
      driveUrl,
      autoPlayPlayerFlix: isFanDub ? false : continueWatching,
      resumeTime,
    });
    setIsPlayerOpen(true);
  };

  const handlePlayEpisode = async (seasonNumber: number, episodeNumber: number, continueWatching?: boolean) => {
    if (!selectedMedia) return;
    
    // Verificar se é um item de fandub
    const isFanDub = fanDubConfig.some(item => item.tmdbId === selectedMedia.tmdbId && item.mediaType === 'tv');
    
    let seasonEpisodes: string[] | undefined;
    let driveUrl: string | undefined;
    
    if (isFanDub) {
      // Para fandub, buscar estrutura de episódios do GitHub
      try {
        const response = await fetch(`/api/fan-dub/tv/${selectedMedia.tmdbId}/episodes`);
        if (response.ok) {
          const data = await response.json();
          seasonEpisodes = data.temporadas?.[seasonNumber];
          driveUrl = seasonEpisodes?.[episodeNumber - 1];
        }
      } catch (error) {
        console.error('Error fetching fandub episodes:', error);
      }
    } else {
      // Buscar URL normal do seriesData
      const seasonKey = seasonNumber.toString();
      seasonEpisodes = seriesData?.temporadas?.[seasonKey as keyof typeof seriesData.temporadas] as string[] | undefined;
      driveUrl = seasonEpisodes?.[episodeNumber - 1];
    }
    
    let episodeName = `Episódio ${episodeNumber}`;
    let totalEpisodes = seasonEpisodes?.length || 1;
    
    try {
      const response = await fetch(`/api/media/tv/${selectedMedia.tmdbId}/season/${seasonNumber}`);
      if (response.ok) {
        const data: { episodes: TMDBEpisode[] } = await response.json();
        if (data.episodes && data.episodes.length > 0) {
          totalEpisodes = data.episodes.length;
        }
        const episode = data.episodes?.[episodeNumber - 1];
        if (episode) {
          episodeName = episode.name;
        }
      }
    } catch (error) {
      console.error('Error fetching episode data:', error);
    }
    
    // Buscar progresso se for "continuar assistindo"
    let resumeTime: number | undefined;
    if (continueWatching) {
      const progress = getProgress(selectedMedia.tmdbId, 'tv', seasonNumber, episodeNumber);
      if (progress && progress.currentTime) {
        resumeTime = progress.currentTime;
      }
    }
    
    setPlayerConfig({
      tmdbId: selectedMedia.tmdbId,
      imdbId: isFanDub ? undefined : selectedMedia.imdbId,
      mediaType: 'tv',
      title: selectedMedia.title,
      seasonNumber,
      episodeNumber,
      episodeName,
      posterPath: selectedMedia.posterPath,
      backdropPath: selectedMedia.backdropPath,
      driveUrl,
      totalEpisodes,
      autoPlayPlayerFlix: isFanDub ? false : continueWatching,
      resumeTime,
    });
    setIsPlayerOpen(true);
  };

  const handleEpisodeChange = async (newEpisodeNumber: number) => {
    if (!playerConfig || !playerConfig.seasonNumber) return;
    
    // Verificar se é um item de fandub
    const isFanDub = fanDubConfig.some(item => item.tmdbId === playerConfig.tmdbId && item.mediaType === 'tv');
    
    let seasonEpisodes: string[] | undefined;
    let driveUrl: string | undefined;
    
    if (isFanDub) {
      // Para fandub, buscar estrutura de episódios do GitHub
      try {
        const response = await fetch(`/api/fan-dub/tv/${playerConfig.tmdbId}/episodes`);
        if (response.ok) {
          const data = await response.json();
          seasonEpisodes = data.temporadas?.[playerConfig.seasonNumber];
          driveUrl = seasonEpisodes?.[newEpisodeNumber - 1];
        }
      } catch (error) {
        console.error('Error fetching fandub episodes:', error);
      }
    } else {
      // Buscar URL normal do seriesData
      const seasonKey = playerConfig.seasonNumber.toString();
      seasonEpisodes = seriesData?.temporadas?.[seasonKey as keyof typeof seriesData.temporadas] as string[] | undefined;
      driveUrl = seasonEpisodes?.[newEpisodeNumber - 1];
    }
    
    let episodeName = `Episódio ${newEpisodeNumber}`;
    let totalEpisodes = seasonEpisodes?.length || playerConfig.totalEpisodes || 1;
    
    try {
      const response = await fetch(`/api/media/tv/${playerConfig.tmdbId}/season/${playerConfig.seasonNumber}`);
      if (response.ok) {
        const data: { episodes: TMDBEpisode[] } = await response.json();
        if (data.episodes && data.episodes.length > 0) {
          totalEpisodes = data.episodes.length;
        }
        const episode = data.episodes?.[newEpisodeNumber - 1];
        if (episode) {
          episodeName = episode.name;
        }
      }
    } catch (error) {
      console.error('Error fetching episode data:', error);
    }
    
    setPlayerConfig({
      ...playerConfig,
      episodeNumber: newEpisodeNumber,
      episodeName,
      driveUrl,
      totalEpisodes,
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(true);
  };

  const handleLogoClick = () => {
    setMobileTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveFromContinueWatching = (media: MediaItem) => {
    const progress = continueWatchingData.find(p => p.tmdbId === media.tmdbId);
    if (!progress) return;
    
    if (media.mediaType === 'movie') {
      removeFromContinueWatching(media.tmdbId, 'movie');
    } else if (progress.seasonNumber && progress.episodeNumber) {
      removeFromContinueWatching(media.tmdbId, 'tv', progress.seasonNumber, progress.episodeNumber);
    }
  };

  useEffect(() => {
    if (mobileTab === 'search') {
      setIsSearchOpen(true);
      setIsBrowseOpen(false);
    } else if (mobileTab === 'mylist') {
      setLocation('/minha-lista');
    } else if (mobileTab === 'browse') {
      setIsBrowseOpen(true);
      setIsSearchOpen(false);
    } else if (mobileTab === 'home') {
      setIsSearchOpen(false);
      setIsBrowseOpen(false);
    }
  }, [mobileTab, setLocation]);

  if (isLoadingMedia) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando conteúdo...</p>
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
        onBrowseClick={() => setIsBrowseOpen(true)}
      />

      {/* Main Content */}
      <main className="pt-16 md:pt-20">
        {/* Hero Banner - Rotaciona entre os últimos itens */}
        {heroMediaItems.length > 0 && (
          <HeroBanner
            mediaItems={heroMediaItems}
            onPlay={(media) => {
              if (media.mediaType === 'movie') {
                handlePlayMovie(media);
              } else {
                handleMediaClick(media);
              }
            }}
            onMoreInfo={(media) => handleMediaClick(media)}
          />
        )}

        {/* Category Rows */}
        <div className="mt-8 md:mt-12 space-y-8">
          {/* Continue Watching - Logo após o banner */}
          {continueWatching.length > 0 && (
            <CategoryRow
              key="continue-watching"
              title="Continuar Assistindo"
              media={continueWatching}
              onMediaClick={handleContinueWatching}
              onAddToList={handleAddToList}
              myListIds={myListIds}
              allProgress={watchProgress}
              showProgress={true}
              onRemove={handleRemoveFromContinueWatching}
              studioNameMap={studioNameMap}
            />
          )}

          {/* New Releases / Novidades - Layout especial com thumbnails pequenas */}
          {newReleases.length > 0 && (
            <NovidadesRow
              key="novidades"
              title="Novidades"
              media={newReleases}
              onMediaClick={handleMediaClick}
              allProgress={watchProgress}
            />
          )}

          {/* Featured of the Month */}
          {featuredConfig.enabled && featuredConfig.tmdbId > 0 && (
            <FeaturedBanner
              tmdbId={featuredConfig.tmdbId}
              mediaType={featuredConfig.mediaType}
              title={featuredConfig.title}
              description={featuredConfig.description}
              onPlay={async () => {
                const media = allMediaCombined?.find(m => m.tmdbId === featuredConfig.tmdbId);
                if (media) {
                  if (media.mediaType === 'movie') {
                    await handlePlayMovie(media);
                  } else {
                    handleMediaClick(media);
                  }
                }
              }}
              onMoreInfo={() => {
                const media = allMediaCombined?.find(m => m.tmdbId === featuredConfig.tmdbId);
                if (media) {
                  handleMediaClick(media);
                }
              }}
            />
          )}

          {/* Fã Dublagem - Projetos de fã dublagem */}
          {fanDubMedia.length > 0 && (
            <CategoryRow
              key="fandub"
              title="Fã Dublagem"
              media={fanDubMedia.slice(0, 20)}
              onMediaClick={handleMediaClick}
              onAddToList={handleAddToList}
              myListIds={myListIds}
              allProgress={watchProgress}
              studioNameMap={studioNameMap}
            />
          )}

          {/* Categories */}
          {Object.entries(categories).map(([categoryName, items]) => (
            items.length > 0 && (
              <CategoryRow
                key={categoryName}
                title={categoryName}
                media={items.slice(0, 20)}
                onMediaClick={handleMediaClick}
                onAddToList={handleAddToList}
                myListIds={myListIds}
                allProgress={watchProgress}
                onBrowseClick={() => setIsBrowseOpen(true)}
                studioNameMap={studioNameMap}
              />
            )
          ))}
        </div>
      </main>

      {/* Media Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        details={mediaDetails || null}
        seriesData={seriesData}
        mediaType={selectedMedia?.mediaType || 'movie'}
        onPlayMovie={() => handlePlayMovie()}
        onPlayEpisode={handlePlayEpisode}
        onAddToList={() => selectedMedia && handleAddToList(selectedMedia)}
        isInList={selectedMedia ? myListIds.includes(selectedMedia.tmdbId) : false}
      />

      {/* Player Overlay */}
      {playerConfig && (
        <PlayerOverlay
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          onEpisodeChange={playerConfig.mediaType === 'tv' ? handleEpisodeChange : undefined}
          {...playerConfig}
        />
      )}

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
          setMobileTab('home');
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

      {/* Browse Overlay (Mobile) */}
      <BrowseOverlay
        isOpen={isBrowseOpen}
        onClose={() => {
          setIsBrowseOpen(false);
          setMobileTab('home');
        }}
        allMedia={allMediaCombined}
        isLoading={isLoadingMedia}
        onMediaClick={handleMediaClick}
        onAddToList={handleAddToList}
        myListIds={myListIds}
        allProgress={watchProgress}
      />

      {/* Mobile Navigation */}
      <MobileNav
        activeTab={mobileTab}
        onTabChange={setMobileTab}
      />

      {/* Release Countdown - Suporte para múltiplos itens */}
      {releaseConfig.enabled && releaseConfig.items.length > 0 && releaseConfig.items.map((item) => (
        <ReleaseCountdown
          key={`${item.tmdbId}-${item.mediaType}`}
          targetTmdbId={item.tmdbId}
          targetMediaType={item.mediaType}
          targetTitle={item.title}
          releaseTimestamp={item.releaseTimestamp}
          backdropPath={item.backdropPath}
        />
      ))}
    </div>
  );
}
