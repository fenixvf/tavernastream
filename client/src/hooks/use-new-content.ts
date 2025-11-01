import { useState, useEffect, useCallback } from 'react';
import type { MediaItem } from '@shared/schema';

const STORAGE_KEY = 'tavernastream_seen_content';
const NEW_CONTENT_DAYS = 7;

interface ContentItem {
  tmdbId: number;
  firstSeenAt: string;
}

interface SeenContent {
  movies: ContentItem[];
  series: ContentItem[];
}

export function useNewContent() {
  const [seenContent, setSeenContent] = useState<SeenContent>({
    movies: [],
    series: [],
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

  const getNewContent = useCallback((media: MediaItem[]): MediaItem[] => {
    if (!media || media.length === 0) return [];

    const now = Date.now();
    const sevenDaysAgo = now - NEW_CONTENT_DAYS * 24 * 60 * 60 * 1000;
    const newItems: MediaItem[] = [];

    media.forEach((item) => {
      const contentList = item.mediaType === 'movie' ? seenContent.movies : seenContent.series;
      const existingItem = contentList.find(c => c.tmdbId === item.tmdbId);

      if (!existingItem) {
        newItems.push(item);
      } else {
        const firstSeenTime = new Date(existingItem.firstSeenAt).getTime();
        if (firstSeenTime > sevenDaysAgo) {
          newItems.push(item);
        }
      }
    });

    return newItems;
  }, [seenContent]);

  const recordNewContent = useCallback((media: MediaItem[]) => {
    if (!media || media.length === 0) return;

    setSeenContent((prev) => {
      const updated = { ...prev };
      let hasChanges = false;
      const now = new Date().toISOString();

      media.forEach((item) => {
        const contentList = item.mediaType === 'movie' ? updated.movies : updated.series;
        const exists = contentList.find(c => c.tmdbId === item.tmdbId);

        if (!exists) {
          if (item.mediaType === 'movie') {
            updated.movies = [...updated.movies, { tmdbId: item.tmdbId, firstSeenAt: now }];
          } else {
            updated.series = [...updated.series, { tmdbId: item.tmdbId, firstSeenAt: now }];
          }
          hasChanges = true;
        }
      });

      if (hasChanges) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const isNewContent = useCallback((item: MediaItem): boolean => {
    const sevenDaysAgo = Date.now() - NEW_CONTENT_DAYS * 24 * 60 * 60 * 1000;
    const contentList = item.mediaType === 'movie' ? seenContent.movies : seenContent.series;
    const existingItem = contentList.find(c => c.tmdbId === item.tmdbId);

    if (!existingItem) {
      return true;
    }

    const firstSeenTime = new Date(existingItem.firstSeenAt).getTime();
    return firstSeenTime > sevenDaysAgo;
  }, [seenContent]);

  return {
    getNewContent,
    recordNewContent,
    isNewContent,
    seenContent,
  };
}
