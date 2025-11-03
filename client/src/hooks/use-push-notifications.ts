import { useState, useEffect, useCallback } from 'react';

interface NotificationContent {
  id: number;
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;
  data: {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    url: string;
  };
}

const NOTIFICATION_CHECK_INTERVAL = 15 * 60 * 1000;
const LAST_NOTIFIED_IDS_KEY = 'taverna_last_notified_ids';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsSupported(supported);
      
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };
    
    checkSupport();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !isMobile) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      return false;
    }
  }, [isSupported, isMobile]);

  const getLastNotifiedIds = (): number[] => {
    try {
      const stored = localStorage.getItem(LAST_NOTIFIED_IDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLastNotifiedIds = (ids: number[]) => {
    try {
      localStorage.setItem(LAST_NOTIFIED_IDS_KEY, JSON.stringify(ids.slice(-50)));
    } catch (error) {
      console.error('Erro ao salvar IDs notificados:', error);
    }
  };

  const checkForNewContent = useCallback(async () => {
    if (permission !== 'granted' || !isMobile) {
      return;
    }

    try {
      const response = await fetch('/api/media/recent?limit=10');
      if (!response.ok) return;

      const recentContent = await response.json();
      const lastNotifiedIds = getLastNotifiedIds();
      
      const newContent = recentContent.filter((item: any) => 
        !lastNotifiedIds.includes(item.tmdbId)
      );

      if (newContent.length === 0) {
        return;
      }

      const itemToNotify = newContent[0];
      
      const tmdbDetails = await fetch(`/api/media/details/${itemToNotify.tmdbId}/${itemToNotify.mediaType}`);
      if (!tmdbDetails.ok) return;
      
      const details = await tmdbDetails.json();

      const notification: NotificationContent = {
        id: itemToNotify.tmdbId,
        title: `🎬 Novo ${itemToNotify.mediaType === 'movie' ? 'Filme' : 'Série'} Disponível!`,
        body: `${details.title || details.name} está disponível agora na Taverna Stream`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `new-content-${itemToNotify.tmdbId}`,
        data: {
          tmdbId: itemToNotify.tmdbId,
          mediaType: itemToNotify.mediaType,
          url: `/?open=${itemToNotify.tmdbId}&type=${itemToNotify.mediaType}`
        }
      };

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          notification
        });
      } else {
        new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon,
          badge: notification.badge,
          tag: notification.tag,
          data: notification.data,
          requireInteraction: false
        });
      }

      saveLastNotifiedIds([...lastNotifiedIds, itemToNotify.tmdbId]);
    } catch (error) {
      console.error('Erro ao verificar novos conteúdos:', error);
    }
  }, [permission, isMobile]);

  useEffect(() => {
    if (permission !== 'granted' || !isMobile) {
      return;
    }

    checkForNewContent();
    const interval = setInterval(checkForNewContent, NOTIFICATION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [permission, isMobile, checkForNewContent]);

  return {
    permission,
    isSupported: isSupported && isMobile,
    isMobile,
    requestPermission,
    checkForNewContent
  };
}
