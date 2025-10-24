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
        isExpanded ? 'w-80' : 'w-auto'
      }`}
      data-testid="release-countdown"
    >
      <div className="bg-gradient-to-br from-primary/20 to-purple-600/20 backdrop-blur-md border-2 border-primary/50 rounded-lg shadow-2xl overflow-hidden">
        {!isExpanded ? (
          <Button
            variant="ghost"
            className="flex items-center gap-2 p-3 hover:bg-white/10 w-full"
            onClick={() => setIsExpanded(true)}
            data-testid="button-expand-countdown"
          >
            <Clock className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-bold text-sm">{formatTime(timeRemaining)}</span>
            <ChevronUp className="w-4 h-4" />
          </Button>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary animate-pulse shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Em breve</p>
                  <h3 className="font-bold text-sm line-clamp-1">{targetTitle}</h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setIsExpanded(false)}
                data-testid="button-collapse-countdown"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {backdropUrl && (
              <div className="relative w-full h-32 rounded-md overflow-hidden">
                <img
                  src={backdropUrl}
                  alt={targetTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            )}

            <div className="bg-black/40 rounded-md p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Libera em:</p>
              <p className="text-2xl font-bold text-primary">{formatTime(timeRemaining)}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-black/30 rounded-md p-2">
                <p className="text-muted-foreground">Dias</p>
                <p className="font-bold">{Math.floor(timeRemaining / (24 * 60 * 60 * 1000))}</p>
              </div>
              <div className="bg-black/30 rounded-md p-2">
                <p className="text-muted-foreground">Horas</p>
                <p className="font-bold">{Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))}</p>
              </div>
              <div className="bg-black/30 rounded-md p-2">
                <p className="text-muted-foreground">Min</p>
                <p className="font-bold">{Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
