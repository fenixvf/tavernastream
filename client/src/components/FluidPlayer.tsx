import { useEffect, useRef } from 'react';

interface FluidPlayerProps {
  driveUrl: string;
  title: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  resumeTime?: number;
}

declare global {
  interface Window {
    fluidPlayer: any;
  }
}

export function FluidPlayer({ driveUrl, title, onTimeUpdate, resumeTime = 0 }: FluidPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);

  const convertDriveUrl = (url: string): string => {
    const fileIdMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
    }
    
    return url;
  };

  useEffect(() => {
    if (!videoRef.current || !window.fluidPlayer) return;

    const videoUrl = convertDriveUrl(driveUrl);

    const fluidPlayerConfig = {
      layoutControls: {
        fillToContainer: true,
        autoPlay: false,
        mute: false,
        primaryColor: '#dc2626',
        posterImage: false,
        persistentSettings: {
          volume: true,
          quality: true,
          speed: true,
        },
        controlBar: {
          autoHide: true,
          autoHideTimeout: 3,
          animated: true,
        },
        playbackRateEnabled: true,
        allowDownload: false,
        playPauseAnimation: true,
        allowTheatre: true,
        logo: {
          imageUrl: null,
          position: 'top left',
          clickUrl: null,
          opacity: 0,
        },
        title: title,
      },
    };

    try {
      playerInstanceRef.current = window.fluidPlayer(videoRef.current, fluidPlayerConfig);

      const video = videoRef.current;
      
      if (resumeTime > 0) {
        video.addEventListener('loadedmetadata', () => {
          video.currentTime = resumeTime;
        }, { once: true });
      }

      const handleTimeUpdate = () => {
        if (onTimeUpdate && video.duration) {
          onTimeUpdate(video.currentTime, video.duration);
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        if (playerInstanceRef.current && playerInstanceRef.current.destroy) {
          try {
            playerInstanceRef.current.destroy();
          } catch (e) {
            console.error('Error destroying fluid player:', e);
          }
        }
      };
    } catch (error) {
      console.error('Error initializing Fluid Player:', error);
    }
  }, [driveUrl, title, resumeTime]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full"
      controls
      data-testid="video-fluid-player"
    >
      <source src={convertDriveUrl(driveUrl)} type="video/mp4" />
      Seu navegador não suporta o elemento de vídeo.
    </video>
  );
}
