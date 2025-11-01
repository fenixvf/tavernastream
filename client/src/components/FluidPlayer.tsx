import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import fluidPlayer from 'fluid-player';

interface FluidPlayerProps {
  driveUrl: string;
  title: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  resumeTime?: number;
}

interface StreamData {
  streamUrl: string;
  fallback: boolean;
  fileId: string;
}

export function FluidPlayer({ driveUrl, title, onTimeUpdate, resumeTime = 0 }: FluidPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoIdRef = useRef<string>(`fluid-player-${Date.now()}`);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  const handleTimeUpdate = useCallback(() => {
    const videoElement = videoRef.current;
    if (onTimeUpdateRef.current && videoElement && videoElement.duration) {
      onTimeUpdateRef.current(videoElement.currentTime, videoElement.duration);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchStreamUrl = async () => {
      try {
        setIsLoading(true);
        setError(false);

        const response = await fetch('/api/drive/get-stream-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ driveUrl }),
        });

        if (!response.ok) {
          throw new Error('Failed to get stream URL');
        }

        const data = await response.json();
        
        if (!cancelled) {
          setStreamData(data);
        }
      } catch (err) {
        console.error('Error fetching stream URL:', err);
        if (!cancelled) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    fetchStreamUrl();

    return () => {
      cancelled = true;
    };
  }, [driveUrl]);

  useEffect(() => {
    if (!streamData || streamData.fallback) {
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const videoId = videoIdRef.current;
    let mounted = true;

    const initPlayer = () => {
      try {
        if (playerInstanceRef.current) {
          try {
            playerInstanceRef.current.destroy();
          } catch (e) {
            console.warn('Error destroying old player:', e);
          }
          playerInstanceRef.current = null;
        }

        playerInstanceRef.current = fluidPlayer(videoId, {
          layoutControls: {
            fillToContainer: true,
            autoPlay: false,
            mute: false,
            loop: false,
            playbackRateEnabled: true,
            allowDownload: false,
            playPauseAnimation: true,
            persistentSettings: {
              volume: true,
              quality: true,
              speed: true,
              theatre: true
            }
          }
        });

        const handleLoadedMetadata = () => {
          if (mounted) {
            setIsLoading(false);
            setError(false);
            
            if (resumeTime && resumeTime > 0 && videoElement.duration) {
              videoElement.currentTime = resumeTime;
            }
          }
        };

        const handleError = () => {
          if (mounted) {
            setIsLoading(false);
            setError(true);
          }
        };

        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('error', handleError);
        videoElement.addEventListener('timeupdate', handleTimeUpdate);

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = setInterval(() => {
          if (mounted && videoElement.duration && !videoElement.paused) {
            handleTimeUpdate();
          }
        }, 5000);
      } catch (err) {
        console.error('Error initializing Fluid Player:', err);
        if (mounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    const timeout = setTimeout(initPlayer, 100);

    return () => {
      mounted = false;
      clearTimeout(timeout);

      if (videoElement) {
        videoElement.removeEventListener('loadedmetadata', () => {});
        videoElement.removeEventListener('error', () => {});
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying player on cleanup:', e);
        }
        playerInstanceRef.current = null;
      }
    };
  }, [streamData, resumeTime, handleTimeUpdate]);

  useEffect(() => {
    if (!streamData || !streamData.fallback) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      setError(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setError(true);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
      }
    };
  }, [streamData]);

  return (
    <div className="relative w-full h-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-white text-sm">Carregando vídeo...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
          <div className="text-center space-y-4 p-6">
            <p className="text-red-500 text-lg font-semibold">Erro ao carregar o vídeo</p>
            <p className="text-white text-sm">O vídeo pode estar temporariamente indisponível ou protegido</p>
          </div>
        </div>
      )}
      
      {streamData && !streamData.fallback && (
        <video
          ref={videoRef}
          id={videoIdRef.current}
          className="w-full h-full"
          controls
          data-testid="video-fluid-player"
        >
          <source src={streamData.streamUrl} type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
      )}

      {streamData && streamData.fallback && (
        <iframe
          ref={iframeRef}
          src={streamData.streamUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          data-testid="iframe-fluid-player"
        />
      )}
    </div>
  );
}
