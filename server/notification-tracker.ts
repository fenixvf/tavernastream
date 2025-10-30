import { storage } from "./storage";
import { getAllMovieIds, getAllSeriesIds } from "./github-data";
import { getMovieDetails, getTVDetails } from "./tmdb";
import { fanDubConfig } from "../client/src/lib/fanDubConfig";
import { releaseConfig } from "../client/src/lib/releaseConfig";

let notifiedContentIds = new Set<string>();
let previousMovieIds: number[] = [];
let previousSeriesIds: number[] = [];
let previousFandubIds: number[] = [];
let releasedItems = new Set<string>();
let isInitialized = false;

const POLL_INTERVAL = 30000;

function createContentKey(tmdbId: number, mediaType: 'movie' | 'tv'): string {
  return `${mediaType}-${tmdbId}`;
}

async function checkScheduledReleases() {
  if (!releaseConfig.enabled || releaseConfig.items.length === 0) {
    return;
  }

  const now = Date.now();
  
  for (const item of releaseConfig.items) {
    const releaseKey = `release-${item.tmdbId}-${item.mediaType}`;
    
    if (item.releaseTimestamp <= now && !releasedItems.has(releaseKey)) {
      const [currentMovieIds, currentSeriesIds] = await Promise.all([
        getAllMovieIds(),
        getAllSeriesIds()
      ]);
      
      const isInCatalog = item.mediaType === 'movie' 
        ? currentMovieIds.includes(item.tmdbId)
        : currentSeriesIds.includes(item.tmdbId);
      
      if (isInCatalog) {
        try {
          const details = item.mediaType === 'movie'
            ? await getMovieDetails(item.tmdbId)
            : await getTVDetails(item.tmdbId);
          
          const title = item.mediaType === 'movie'
            ? (details as any).title
            : (details as any).name;
          
          await storage.createNotification({
            title: `🎉 ${title} foi liberado!`,
            message: `${title} já está disponível no catálogo!`,
            tmdbId: item.tmdbId,
            mediaType: item.mediaType,
            posterPath: details.poster_path,
            type: 'auto',
          });
          
          releasedItems.add(releaseKey);
          console.log(`[Release Notification] Notificação criada para: ${title}`);
        } catch (error) {
          console.error(`Error creating release notification for ${item.tmdbId}:`, error);
        }
      }
    }
  }
}

async function detectNewContent() {
  try {
    const [currentMovieIds, currentSeriesIds] = await Promise.all([
      getAllMovieIds(),
      getAllSeriesIds()
    ]);
    
    const currentFandubIds = fanDubConfig.map(item => item.tmdbId);
    
    if (!isInitialized) {
      previousMovieIds = currentMovieIds;
      previousSeriesIds = currentSeriesIds;
      previousFandubIds = currentFandubIds;
      
      currentMovieIds.forEach(id => {
        notifiedContentIds.add(createContentKey(id, 'movie'));
      });
      currentSeriesIds.forEach(id => {
        notifiedContentIds.add(createContentKey(id, 'tv'));
      });
      currentFandubIds.forEach(id => {
        const fandubItem = fanDubConfig.find(item => item.tmdbId === id);
        if (fandubItem) {
          notifiedContentIds.add(createContentKey(id, fandubItem.mediaType));
        }
      });
      
      isInitialized = true;
      console.log('[Notification Tracker] Initialized with existing content');
      return;
    }
    
    const newMovies = currentMovieIds.filter(id => !previousMovieIds.includes(id));
    const newSeries = currentSeriesIds.filter(id => !previousSeriesIds.includes(id));
    
    const newFandubs = currentFandubIds.filter(id => !previousFandubIds.includes(id));
    
    for (const movieId of newMovies) {
      const contentKey = createContentKey(movieId, 'movie');
      if (!notifiedContentIds.has(contentKey)) {
        try {
          const details = await getMovieDetails(movieId);
          await storage.createNotification({
            title: `Novo Filme: ${details.title}`,
            message: `${details.title} foi adicionado ao catálogo!`,
            tmdbId: movieId,
            mediaType: 'movie',
            posterPath: details.poster_path,
            type: 'auto',
          });
          notifiedContentIds.add(contentKey);
          console.log(`[Notification] Auto-notificação criada para filme: ${details.title}`);
        } catch (error) {
          console.error(`Error creating notification for movie ${movieId}:`, error);
        }
      }
    }
    
    for (const seriesId of newSeries) {
      const contentKey = createContentKey(seriesId, 'tv');
      if (!notifiedContentIds.has(contentKey)) {
        try {
          const details = await getTVDetails(seriesId);
          await storage.createNotification({
            title: `Nova Série: ${details.name}`,
            message: `${details.name} foi adicionada ao catálogo!`,
            tmdbId: seriesId,
            mediaType: 'tv',
            posterPath: details.poster_path,
            type: 'auto',
          });
          notifiedContentIds.add(contentKey);
          console.log(`[Notification] Auto-notificação criada para série: ${details.name}`);
        } catch (error) {
          console.error(`Error creating notification for series ${seriesId}:`, error);
        }
      }
    }
    
    for (const fandubId of newFandubs) {
      const fandubItem = fanDubConfig.find(item => item.tmdbId === fandubId);
      if (!fandubItem) continue;
      
      const contentKey = createContentKey(fandubId, fandubItem.mediaType);
      if (!notifiedContentIds.has(contentKey)) {
        try {
          const details = fandubItem.mediaType === 'movie'
            ? await getMovieDetails(fandubId)
            : await getTVDetails(fandubId);
          
          const title = fandubItem.mediaType === 'movie'
            ? (details as any).title
            : (details as any).name;
          
          await storage.createNotification({
            title: `Novo Fandub: ${title}`,
            message: `${title} (${fandubItem.studioName}) foi adicionado ao catálogo de fandubs!`,
            tmdbId: fandubId,
            mediaType: fandubItem.mediaType,
            posterPath: details.poster_path,
            type: 'auto',
          });
          notifiedContentIds.add(contentKey);
          console.log(`[Notification] Auto-notificação criada para fandub: ${title}`);
        } catch (error) {
          console.error(`Error creating notification for fandub ${fandubId}:`, error);
        }
      }
    }
    
    previousMovieIds = currentMovieIds;
    previousSeriesIds = currentSeriesIds;
    previousFandubIds = currentFandubIds;
    
  } catch (error) {
    console.error('[Notification Tracker] Error detecting new content:', error);
  }
}

export function startNotificationTracking() {
  detectNewContent();
  checkScheduledReleases();
  
  setInterval(() => {
    detectNewContent();
    checkScheduledReleases();
  }, POLL_INTERVAL);
  
  console.log(`[Notification Tracker] Started - checking for new content and releases every ${POLL_INTERVAL/1000} seconds`);
}
