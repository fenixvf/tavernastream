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
  autoPlayPlayerFlix?: boolean; // Auto-selecionar Player 1 (para continuar assistindo)
  resumeTime?: number; // Tempo em segundos para começar
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
  autoPlayPlayerFlix = false,
  resumeTime,
}: PlayerOverlayProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerType | null>(null);
  const [showAdWarning, setShowAdWarning] = useState(false);
  const [showOverloadWarning, setShowOverloadWarning] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const { saveProgress } = useWatchProgress();

  // Auto-selecionar PlayerFlix quando autoPlayPlayerFlix é true
  useEffect(() => {
    if (isOpen && autoPlayPlayerFlix && !selectedPlayer) {
      handlePlayerSelect('playerflix');
    }
  }, [isOpen, autoPlayPlayerFlix]);

  const saveCurrentProgress = useCallback((forceCurrentTime?: number) => {
    if (watchStartTime && selectedPlayer === 'playerflix') {
      const watchDuration = Date.now() - watchStartTime;
      const watchedSeconds = watchDuration / 1000;
      
      // Usar tempo fornecido ou calcular baseado na duração da sessão
      const currentTime = forceCurrentTime !== undefined ? forceCurrentTime : Math.floor(watchedSeconds);
      
      // Salvar progresso se assistiu pelo menos 30 segundos
      if (currentTime >= 30 || forceCurrentTime !== undefined) {
        // Estimar duração total baseado no tipo de mídia
        const estimatedDuration = mediaType === 'movie' ? 7200 : 2400; // 2h para filmes, 40min para episódios
        const progressPercent = Math.min(95, (currentTime / estimatedDuration) * 100);
        const isCompleted = progressPercent >= 90;
        
        saveProgress({
          tmdbId,
          mediaType,
          title,
          posterPath: posterPath || null,
          backdropPath: backdropPath || null,
          progress: isCompleted ? 100 : progressPercent,
          currentTime: currentTime, // Tempo real do vídeo em segundos
          totalDuration: estimatedDuration, // Duração estimada em segundos
          duration: watchDuration, // Duração da sessão em ms (compatibilidade)
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

  // Salvar progresso periodicamente (a cada 30 segundos)
  useEffect(() => {
    if (!isOpen || !selectedPlayer) return;
    
    const interval = setInterval(() => {
      if (watchStartTime) {
        const elapsed = (Date.now() - watchStartTime) / 1000;
        const estimatedTime = resumeTime ? resumeTime + elapsed : elapsed;
        saveCurrentProgress(Math.floor(estimatedTime));
      }
    }, 30000); // Salvar a cada 30 segundos
    
    return () => clearInterval(interval);
  }, [isOpen, selectedPlayer, watchStartTime, resumeTime, saveCurrentProgress]);

  useEffect(() => {
    if (!isOpen) {
      // Salvar progresso final ao fechar
      if (watchStartTime) {
        const elapsed = (Date.now() - watchStartTime) / 1000;
        const estimatedTime = resumeTime ? resumeTime + elapsed : elapsed;
        saveCurrentProgress(Math.floor(estimatedTime));
      }
      // Resetar estados ao fechar para permitir nova seleção
      setSelectedPlayer(null);
      setWatchStartTime(null);
    }
  }, [isOpen, watchStartTime, resumeTime, saveCurrentProgress]);

  const handleDriveError = () => {
    setShowOverloadWarning(true);
    setTimeout(() => setShowOverloadWarning(false), 5000);
  };

  const getPlayerFlixUrl = () => {
    let baseUrl = '';
    if (mediaType === 'movie') {
      const movieId = imdbId || tmdbId;
      baseUrl = `https://playerflixapi.com/filme/${movieId}`;
    } else if (seasonNumber && episodeNumber) {
      baseUrl = `https://playerflixapi.com/serie/${tmdbId}/${seasonNumber}/${episodeNumber}`;
    }
    
    // Adicionar tempo de retomada se fornecido
    // PlayerFlix suporta múltiplos formatos de tempo: ?t=, #t=, &start=
    if (baseUrl && resumeTime && resumeTime > 10) {
      const timeInSeconds = Math.floor(resumeTime);
      // Tentar múltiplos formatos para maximizar compatibilidade
      baseUrl += `?start=${timeInSeconds}&t=${timeInSeconds}#t=${timeInSeconds}`;
    }
    
    return baseUrl;
  };

  const episodeTitle = seasonNumber && episodeNumber
    ? `${title} - T${seasonNumber}:E${episodeNumber}`
    : title;

  const handlePreviousEpisode = () => {
    if (episodeNumber && episodeNumber > 1 && onEpisodeChange) {
      if (watchStartTime) {
        const elapsed = (Date.now() - watchStartTime) / 1000;
        const estimatedTime = resumeTime ? resumeTime + elapsed : elapsed;
        saveCurrentProgress(Math.floor(estimatedTime));
      }
      setSelectedPlayer(null);
      setWatchStartTime(null);
      onEpisodeChange(episodeNumber - 1);
    }
  };

  const handleNextEpisode = () => {
    if (episodeNumber && episodeNumber < totalEpisodes && onEpisodeChange) {
      if (watchStartTime) {
        const elapsed = (Date.now() - watchStartTime) / 1000;
        const estimatedTime = resumeTime ? resumeTime + elapsed : elapsed;
        saveCurrentProgress(Math.floor(estimatedTime));
      }
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
        
        {/* Alerts - Melhorado para mobile */}
        <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md px-2">
          {showAdWarning && (
            <Alert className="bg-yellow-500/95 text-black border-2 border-yellow-600 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription className="font-bold text-base sm:text-lg">
                Este player contém anúncios
              </AlertDescription>
            </Alert>
          )}
          {showOverloadWarning && (
            <Alert className="bg-red-600/95 text-white border-2 border-red-700 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription className="font-bold text-base sm:text-lg">
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
                {/* PlayerFlix Option - Sempre disponível */}
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

                {/* Google Drive Option - Sempre visível, mas desabilitada se não houver URL */}
                <button
                  onClick={() => driveUrl && handlePlayerSelect('drive')}
                  disabled={!driveUrl}
                  className={`p-6 rounded-lg bg-card border-2 transition-all ${
                    driveUrl 
                      ? 'border-card-border hover:border-primary hover-elevate active-elevate-2 cursor-pointer' 
                      : 'border-card-border/30 cursor-not-allowed opacity-50'
                  } group`}
                  data-testid="button-player-option-2"
                >
                  <div className="space-y-2">
                    <h3 className={`text-xl font-bold transition-colors ${
                      driveUrl ? 'group-hover:text-primary' : 'text-muted-foreground'
                    }`}>
                      Opção 2
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {driveUrl ? 'Sem Anúncios' : 'Indisponível'}
                    </p>
                    <div className={`flex items-center justify-center gap-2 ${
                      driveUrl ? 'text-green-500' : 'text-muted-foreground/50'
                    }`}>
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
