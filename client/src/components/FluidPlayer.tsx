import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface FluidPlayerProps {
  driveUrl: string;
  title: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  resumeTime?: number;
}

export function FluidPlayer({ driveUrl, title, onTimeUpdate, resumeTime = 0 }: FluidPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const convertDriveUrlToEmbed = (url: string): string => {
    const fileIdMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
    
    if (url.includes('/preview')) {
      return url;
    }
    
    return url;
  };

  useEffect(() => {
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
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [driveUrl, onTimeUpdate, resumeTime]);

  const embedUrl = convertDriveUrlToEmbed(driveUrl);

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
            <p className="text-white text-sm">O vídeo pode estar temporariamente indisponível</p>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        data-testid="iframe-fluid-player"
      />
    </div>
  );
}
