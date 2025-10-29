import { storage } from "./storage";
import { getAllMovieIds, getAllSeriesIds } from "./github-data";
import { getMovieDetails, getTVDetails } from "./tmdb";
import { fanDubConfig } from "../client/src/lib/fanDubConfig";

let notifiedContentIds = new Set<string>();
let previousMovieIds: number[] = [];
let previousSeriesIds: number[] = [];
let previousFandubIds: number[] = [];
let isInitialized = false;

const POLL_INTERVAL = 30000;

function createContentKey(tmdbId: number, mediaType: 'movie' | 'tv'): string {
  return `${mediaType}-${tmdbId}`;
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
  
  setInterval(detectNewContent, POLL_INTERVAL);
  
  console.log(`[Notification Tracker] Started - checking for new content every ${POLL_INTERVAL/1000} seconds`);
}
