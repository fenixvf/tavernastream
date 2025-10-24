import { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isReleased, setIsReleased] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const remaining = releaseTimestamp - now;
      
      if (remaining <= 0) {
        setIsReleased(true);
        setTimeRemaining(0);
        
        if (!isReleased) {
          toast({
            title: "Novo conteúdo chegou!",
            description: `${targetTitle} já está disponível!`,
            duration: 10000,
          });
        }
        return;
      }
      
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [releaseTimestamp, targetTitle, isReleased, toast]);

  if (isReleased) {
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
    ? `https://image.tmdb.org/t/p/w500${backdropPath}`
    : null;

  return (
    <div
      className={`fixed bottom-20 md:bottom-4 right-4 z-40 transition-all duration-300 ${
        isExpanded ? 'w-80 md:w-96' : 'w-auto'
      }`}
      data-testid="release-countdown"
    >
      <div className="bg-gradient-to-br from-primary/30 via-purple-600/25 to-pink-600/20 backdrop-blur-xl border-2 border-primary/60 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden hover:shadow-[0_12px_48px_rgba(0,0,0,0.6)] transition-shadow">
        {!isExpanded ? (
          <Button
            variant="ghost"
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 w-full transition-all"
            onClick={() => setIsExpanded(true)}
            data-testid="button-expand-countdown"
          >
            <div className="relative">
              <Clock className="w-6 h-6 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground font-medium">Em breve</span>
              <span className="font-bold text-base text-primary">{formatTime(timeRemaining)}</span>
            </div>
            <ChevronUp className="w-5 h-5 ml-auto" />
          </Button>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Clock className="w-6 h-6 text-primary animate-pulse shrink-0" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Em breve</p>
                  <h3 className="font-bold text-base line-clamp-1 mt-0.5">{targetTitle}</h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 hover:bg-white/10 rounded-full"
                onClick={() => setIsExpanded(false)}
                data-testid="button-collapse-countdown"
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>

            {backdropUrl && (
              <div className="relative w-full h-36 md:h-40 rounded-lg overflow-hidden ring-2 ring-primary/30">
                <img
                  src={backdropUrl}
                  alt={targetTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              </div>
            )}

            <div className="bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg p-4 text-center border border-primary/30 shadow-lg">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Libera em</p>
              <p className="text-3xl md:text-4xl font-bold text-primary drop-shadow-lg">{formatTime(timeRemaining)}</p>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <p className="text-2xl md:text-3xl font-bold text-primary">{Math.floor(timeRemaining / (24 * 60 * 60 * 1000))}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Dias</p>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <p className="text-2xl md:text-3xl font-bold text-primary">{Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Horas</p>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <p className="text-2xl md:text-3xl font-bold text-primary">{Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Min</p>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <p className="text-2xl md:text-3xl font-bold text-primary">{Math.floor((timeRemaining % (60 * 1000)) / 1000)}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Seg</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
