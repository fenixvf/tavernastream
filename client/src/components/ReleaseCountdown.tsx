import { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReleaseCountdownProps {
  targetTmdbId: number;
  targetMediaType: 'movie' | 'tv';
  targetTitle: string;
  releaseTimestamp: number;
  backdropPath?: string | null;
}

export function ReleaseCountdown({
  targetTmdbId,
  targetMediaType,
  targetTitle,
  releaseTimestamp,
  backdropPath,
}: ReleaseCountdownProps) {
  const releaseKey = `release_${targetTmdbId}_${targetMediaType}`;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isReleased, setIsReleased] = useState(() => {
    const stored = localStorage.getItem(`${releaseKey}_isReleased`);
    return stored === 'true';
  });
  const [existsInCatalog, setExistsInCatalog] = useState(false);
  const [isCheckingCatalog, setIsCheckingCatalog] = useState(true);
  const [showAvailableMessage, setShowAvailableMessage] = useState(() => {
    const stored = localStorage.getItem(`${releaseKey}_showMessage`);
    const timestamp = localStorage.getItem(`${releaseKey}_timestamp`);
    if (stored === 'true' && timestamp) {
      const now = Date.now();
      const diff = now - parseInt(timestamp);
      return diff < 5 * 60 * 1000;
    }
    return false;
  });
  const [autoHideTimer, setAutoHideTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkCatalog = async () => {
      try {
        const response = await fetch(`/api/media/check/${targetTmdbId}/${targetMediaType}`);
        if (response.ok) {
          const data = await response.json();
          setExistsInCatalog(data.exists);
        }
      } catch (error) {
        console.error('Error checking catalog:', error);
      } finally {
        setIsCheckingCatalog(false);
      }
    };

    checkCatalog();
    const interval = setInterval(checkCatalog, 30000);
    return () => clearInterval(interval);
  }, [targetTmdbId, targetMediaType]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const remaining = releaseTimestamp - now;
      
      if (remaining <= 0) {
        if (!isReleased) {
          setIsReleased(true);
          setShowAvailableMessage(true);
          
          localStorage.setItem(`${releaseKey}_isReleased`, 'true');
          localStorage.setItem(`${releaseKey}_showMessage`, 'true');
          localStorage.setItem(`${releaseKey}_timestamp`, now.toString());
          
          toast({
            title: "🎉 Novo conteúdo liberado!",
            description: `${targetTitle} já está disponível no catálogo!`,
            duration: 10000,
          });

          const timer = setTimeout(() => {
            setShowAvailableMessage(false);
            localStorage.setItem(`${releaseKey}_showMessage`, 'false');
          }, 5 * 60 * 1000);
          setAutoHideTimer(timer);
        }
        setTimeRemaining(0);
        return;
      }
      
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => {
      clearInterval(interval);
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [releaseTimestamp, targetTitle, isReleased, toast, releaseKey]);

  if (isReleased && !showAvailableMessage) {
    return null;
  }

  if (isCheckingCatalog) {
    return null;
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const backdropUrl = backdropPath
    ? `https://image.tmdb.org/t/p/original${backdropPath}`
    : null;

  const isBlocked = !existsInCatalog && !isReleased;

  if (isReleased && showAvailableMessage) {
    return (
      <div
        className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 w-auto md:w-96"
        data-testid="release-available"
      >
        <div className="bg-gradient-to-br from-green-600/30 via-emerald-600/25 to-teal-600/20 backdrop-blur-xl border-2 border-green-500/60 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-4 md:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-500 rounded-full p-2">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base md:text-lg text-white">Disponível Agora!</h3>
              <p className="text-xs md:text-sm text-white/80 line-clamp-1">{targetTitle}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/10 rounded-full flex-shrink-0"
              onClick={() => {
                setShowAvailableMessage(false);
                localStorage.setItem(`${releaseKey}_showMessage`, 'false');
              }}
              data-testid="button-close-available"
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-white/90 text-xs md:text-sm">
            Este conteúdo já está disponível no catálogo! Aproveite!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 transition-all duration-300 ${
        isExpanded ? 'w-auto md:w-96' : 'w-auto'
      }`}
      data-testid="release-countdown"
    >
      <div className="relative bg-black/40 backdrop-blur-xl border-2 border-primary/60 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden hover:shadow-[0_12px_48px_rgba(0,0,0,0.6)] transition-shadow">
        {backdropUrl && isExpanded && (
          <div className="absolute inset-0 z-0">
            <img
              src={backdropUrl}
              alt={targetTitle}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
          </div>
        )}

        <div className="relative z-10">
          {!isExpanded ? (
            <Button
              variant="ghost"
              className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 hover:bg-white/10 w-full transition-all"
              onClick={() => setIsExpanded(true)}
              data-testid="button-expand-countdown"
            >
              <div className="relative flex-shrink-0">
                {isBlocked ? (
                  <Lock className="w-5 h-5 md:w-6 md:h-6 text-amber-400 animate-pulse" />
                ) : (
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
                )}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
              </div>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-xs text-muted-foreground font-medium">
                  {isBlocked ? 'Bloqueado' : 'Em breve'}
                </span>
                <span className="font-bold text-sm md:text-base text-primary truncate w-full">{formatTime(timeRemaining)}</span>
              </div>
              <ChevronUp className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            </Button>
          ) : (
            <div className="p-4 md:p-5 space-y-3 md:space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    {isBlocked ? (
                      <Lock className="w-5 h-5 md:w-6 md:h-6 text-amber-400 animate-pulse" />
                    ) : (
                      <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
                    )}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {isBlocked ? 'Acesso Bloqueado' : 'Lançamento em'}
                    </p>
                    <h3 className="font-bold text-sm md:text-base line-clamp-1 mt-0.5">{targetTitle}</h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0 hover:bg-white/10 rounded-full"
                  onClick={() => setIsExpanded(false)}
                  data-testid="button-collapse-countdown"
                >
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>

              {backdropUrl && (
                <div className="relative w-full h-32 md:h-40 rounded-lg overflow-hidden ring-2 ring-primary/30">
                  <img
                    src={backdropUrl}
                    alt={targetTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  {isBlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 md:p-4 border border-amber-400/50">
                        <Lock className="w-10 h-10 md:w-12 md:h-12 text-amber-400 mx-auto mb-2" />
                        <p className="text-xs text-center text-white font-semibold">Conteúdo Bloqueado</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isBlocked && (
                <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-2 md:p-3 text-center">
                  <p className="text-xs text-amber-200 font-medium">
                    ⚠️ Este conteúdo ainda não está disponível no catálogo
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg p-3 md:p-4 text-center border border-primary/30 shadow-lg">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                  {isBlocked ? 'Liberação em' : 'Disponível em'}
                </p>
                <p className="text-2xl md:text-4xl font-bold text-primary drop-shadow-lg">{formatTime(timeRemaining)}</p>
              </div>

              <div className="grid grid-cols-4 gap-1.5 md:gap-2 text-center">
                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/10">
                  <p className="text-xl md:text-3xl font-bold text-primary">{Math.floor(timeRemaining / (24 * 60 * 60 * 1000))}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Dias</p>
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/10">
                  <p className="text-xl md:text-3xl font-bold text-primary">{Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Horas</p>
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/10">
                  <p className="text-xl md:text-3xl font-bold text-primary">{Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Min</p>
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/10">
                  <p className="text-xl md:text-3xl font-bold text-primary">{Math.floor((timeRemaining % (60 * 1000)) / 1000)}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Seg</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
