import { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, SkipBack, SkipForward, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PlayerType } from '@shared/schema';
import { useWatchProgress } from '@/hooks/use-watch-progress';

interface PlayerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tmdbId: number;
  imdbId?: string;
  mediaType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  episodeName?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  driveUrl?: string;
  totalEpisodes?: number;
  onEpisodeChange?: (episodeNumber: number) => void;
}

export function PlayerOverlay({
  isOpen,
  onClose,
  title,
  tmdbId,
  imdbId,
  mediaType,
  seasonNumber,
  episodeNumber,
  episodeName,
  posterPath,
  backdropPath,
  driveUrl,
  totalEpisodes = 1,
  onEpisodeChange,
}: PlayerOverlayProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerType | null>(null);
  const [showAdWarning, setShowAdWarning] = useState(false);
  const [showOverloadWarning, setShowOverloadWarning] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const { saveProgress } = useWatchProgress();

  const saveCurrentProgress = useCallback(() => {
    if (watchStartTime && selectedPlayer === 'playerflix') {
      const watchDuration = Date.now() - watchStartTime;
      const watchedMinutes = watchDuration / 60000;
      
      if (watchedMinutes >= 2) {
        const isCompleted = watchedMinutes >= 15 || (mediaType === 'tv' && watchedMinutes >= 10);
        
        saveProgress({
          tmdbId,
          mediaType,
          title,
          posterPath: posterPath || null,
          backdropPath: backdropPath || null,
          progress: isCompleted ? 100 : Math.min(95, (watchedMinutes / 20) * 100),
          duration: watchDuration,
          seasonNumber,
          episodeNumber,
          episodeName,
          completed: isCompleted,
        });
      }
    }
  }, [watchStartTime, selectedPlayer, tmdbId, mediaType, title, posterPath, backdropPath, seasonNumber, episodeNumber, episodeName, saveProgress]);

  const handlePlayerSelect = (playerType: PlayerType) => {
    if (playerType === 'playerflix') {
      setShowAdWarning(true);
      setTimeout(() => setShowAdWarning(false), 5000);
      setWatchStartTime(Date.now());
    }
    setSelectedPlayer(playerType);
  };

  useEffect(() => {
    if (!isOpen) {
      saveCurrentProgress();
      setWatchStartTime(null);
    }
  }, [isOpen, saveCurrentProgress]);

  const handleDriveError = () => {
    setShowOverloadWarning(true);
    setTimeout(() => setShowOverloadWarning(false), 5000);
  };

  const getPlayerFlixUrl = () => {
    if (mediaType === 'movie') {
      const movieId = imdbId || tmdbId;
      return `https://playerflixapi.com/filme/${movieId}`;
    } else if (seasonNumber && episodeNumber) {
      return `https://playerflixapi.com/serie/${tmdbId}/${seasonNumber}/${episodeNumber}`;
    }
    return '';
  };

  const episodeTitle = seasonNumber && episodeNumber
    ? `${title} - T${seasonNumber}:E${episodeNumber}`
    : title;

  const handlePreviousEpisode = () => {
    if (episodeNumber && episodeNumber > 1 && onEpisodeChange) {
      saveCurrentProgress();
      setSelectedPlayer(null);
      setWatchStartTime(null);
      onEpisodeChange(episodeNumber - 1);
    }
  };

  const handleNextEpisode = () => {
    if (episodeNumber && episodeNumber < totalEpisodes && onEpisodeChange) {
      saveCurrentProgress();
      setSelectedPlayer(null);
      setWatchStartTime(null);
      onEpisodeChange(episodeNumber + 1);
    }
  };

  const handleChangePlayer = () => {
    setSelectedPlayer(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black border-0 overflow-hidden">
        <DialogTitle className="sr-only">{episodeTitle}</DialogTitle>
        <DialogDescription className="sr-only">
          Reproduzir {episodeTitle}
        </DialogDescription>
        
        {/* Alerts */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          {showAdWarning && (
            <Alert className="bg-yellow-500/90 text-black border-0 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-semibold">
                Este player contém anúncios
              </AlertDescription>
            </Alert>
          )}
          {showOverloadWarning && (
            <Alert className="bg-destructive/90 text-destructive-foreground border-0 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-semibold">
                O player está sobrecarregado. Volte mais tarde.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {selectedPlayer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleChangePlayer}
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full px-4 py-2 gap-2"
                data-testid="button-change-player"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Trocar Player</span>
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full px-4 py-2 gap-2"
            data-testid="button-close-player"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Fechar</span>
          </Button>
        </div>

        {/* Player Selection or Video */}
        <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6">
          {!selectedPlayer ? (
            <div className="max-w-2xl w-full space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white" data-testid="text-player-title">
                  {episodeTitle}
                </h2>
                <p className="text-muted-foreground">Escolha uma opção de player:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PlayerFlix Option */}
                <button
                  onClick={() => handlePlayerSelect('playerflix')}
                  className="p-6 rounded-lg bg-card border-2 border-card-border hover:border-primary transition-all hover-elevate active-elevate-2 group"
                  data-testid="button-player-option-1"
                >
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      Opção 1
                    </h3>
                    <p className="text-sm text-muted-foreground">PlayerFlix</p>
                    <div className="flex items-center justify-center gap-2 text-yellow-500">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs">Contém anúncios</span>
                    </div>
                  </div>
                </button>

                {/* Google Drive Option */}
                <button
                  onClick={() => handlePlayerSelect('drive')}
                  disabled={!driveUrl}
                  className="p-6 rounded-lg bg-card border-2 border-card-border hover:border-primary transition-all hover-elevate active-elevate-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-player-option-2"
                >
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      Opção 2
                    </h3>
                    <p className="text-sm text-muted-foreground">Sem Anúncios</p>
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <span className="text-xs">Google Drive</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              {/* Video Container - Responsivo perfeito */}
              <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6">
                <div className="w-full h-full max-w-7xl max-h-full">
                  <div className="relative w-full h-full">
                    {selectedPlayer === 'playerflix' && (
                      <iframe
                        src={getPlayerFlixUrl()}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        data-testid="iframe-playerflix"
                      />
                    )}
                    {selectedPlayer === 'drive' && driveUrl && (
                      <iframe
                        src={driveUrl}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        onError={handleDriveError}
                        data-testid="iframe-drive"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Episode Navigation (Only for TV Shows) */}
              {mediaType === 'tv' && seasonNumber && episodeNumber && (
                <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 p-3 sm:p-4">
                  <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousEpisode}
                      disabled={episodeNumber <= 1}
                      className="bg-white/10 border-white/20 hover:bg-white/20 text-white disabled:opacity-30 gap-2"
                      data-testid="button-previous-episode"
                    >
                      <SkipBack className="w-4 h-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </Button>
                    
                    <div className="text-center flex-1">
                      <p className="text-white text-sm font-semibold">
                        Episódio {episodeNumber} de {totalEpisodes}
                      </p>
                      <p className="text-white/60 text-xs hidden sm:block">
                        Temporada {seasonNumber}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextEpisode}
                      disabled={episodeNumber >= totalEpisodes}
                      className="bg-white/10 border-white/20 hover:bg-white/20 text-white disabled:opacity-30 gap-2"
                      data-testid="button-next-episode"
                    >
                      <span className="hidden sm:inline">Próximo</span>
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
