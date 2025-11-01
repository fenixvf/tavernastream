import { useState, useEffect, useCallback } from 'react';
import type { MediaItem } from '@shared/schema';

const STORAGE_KEY = 'tavernastream_seen_content';
const NEW_CONTENT_DAYS = 7;

interface SeenContent {
  movieIds: number[];
  seriesIds: number[];
  lastUpdate: string;
}

export function useNewContent() {
  const [seenContent, setSeenContent] = useState<SeenContent>({
    movieIds: [],
    seriesIds: [],
    lastUpdate: new Date().toISOString(),
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSeenContent(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing seen content:', error);
      }
    }
  }, []);

  const updateSeenContent = useCallback((media: MediaItem[]) => {
    setSeenContent((prev) => {
      const movieIds = new Set(prev.movieIds);
      const seriesIds = new Set(prev.seriesIds);
      
      media.forEach((item) => {
        if (item.mediaType === 'movie') {
          movieIds.add(item.tmdbId);
        } else {
          seriesIds.add(item.tmdbId);
        }
      });

      const updated: SeenContent = {
        movieIds: Array.from(movieIds),
        seriesIds: Array.from(seriesIds),
        lastUpdate: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getNewContent = useCallback((media: MediaItem[]): MediaItem[] => {
    if (!media || media.length === 0) return [];

    const newItems: MediaItem[] = [];
    const sevenDaysAgo = Date.now() - NEW_CONTENT_DAYS * 24 * 60 * 60 * 1000;
    const lastUpdateTime = new Date(seenContent.lastUpdate).getTime();
    
    const isRecentlyAdded = lastUpdateTime > sevenDaysAgo;

    media.forEach((item) => {
      const isNew = item.mediaType === 'movie'
        ? !seenContent.movieIds.includes(item.tmdbId)
        : !seenContent.seriesIds.includes(item.tmdbId);

      if (isNew && isRecentlyAdded) {
        newItems.push(item);
      }
    });

    return newItems;
  }, [seenContent]);

  const markAsViewed = useCallback((media: MediaItem) => {
    setSeenContent((prev) => {
      const updated = { ...prev };
      
      if (media.mediaType === 'movie') {
        if (!updated.movieIds.includes(media.tmdbId)) {
          updated.movieIds.push(media.tmdbId);
        }
      } else {
        if (!updated.seriesIds.includes(media.tmdbId)) {
          updated.seriesIds.push(media.tmdbId);
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isNewContent = useCallback((item: MediaItem): boolean => {
    const sevenDaysAgo = Date.now() - NEW_CONTENT_DAYS * 24 * 60 * 60 * 1000;
    const lastUpdateTime = new Date(seenContent.lastUpdate).getTime();
    
    if (lastUpdateTime <= sevenDaysAgo) {
      return false;
    }

    return item.mediaType === 'movie'
      ? !seenContent.movieIds.includes(item.tmdbId)
      : !seenContent.seriesIds.includes(item.tmdbId);
  }, [seenContent]);

  return {
    updateSeenContent,
    getNewContent,
    markAsViewed,
    isNewContent,
    seenContent,
  };
}
