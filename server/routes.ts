import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMyListItemSchema } from "@shared/schema";
import type { MediaItem } from "@shared/schema";
import {
  getMovieDetails,
  getMovieExternalIds,
  getTVDetails,
  searchMulti,
  getSeasonDetails,
  getVideos,
} from "./tmdb";
import {
  getAllMovieIds,
  getAllSeriesIds,
  getMovieUrl,
  getSeriesData,
} from "./github-data";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get hero media (primeiros itens dos bancos Firebase que são os mais recentes + fandubs recentes)
  app.get("/api/media/hero", async (req, res) => {
    try {
      const [movieIds, seriesIds] = await Promise.all([
        getAllMovieIds(),
        getAllSeriesIds()
      ]);
      
      const { fanDubConfig } = await import('../client/src/lib/fanDubConfig.js');
      const fandubIds = fanDubConfig.slice(0, 2);
      
      const lastMovieIds = movieIds.slice(0, 2);
      const lastSeriesIds = seriesIds.slice(0, 2);
      
      const movies: MediaItem[] = [];
      const series: MediaItem[] = [];
      const fandubs: MediaItem[] = [];
      
      for (const movieId of lastMovieIds) {
        try {
          const [details, externalIds, hasVideo] = await Promise.all([
            getMovieDetails(movieId),
            getMovieExternalIds(movieId).catch(() => ({ imdb_id: undefined })),
            getMovieUrl(movieId)
          ]);
          movies.push({
            tmdbId: movieId,
            imdbId: externalIds.imdb_id,
            title: details.title || '',
            posterPath: details.poster_path,
            backdropPath: details.backdrop_path,
            overview: details.overview || '',
            rating: details.vote_average || 0,
            releaseDate: details.release_date || '',
            mediaType: 'movie',
            genres: details.genres?.map((g: any) => g.id) || [],
            hasVideo: !!hasVideo,
          });
        } catch (error) {
          console.error(`Error fetching movie ${movieId}:`, error);
        }
      }
      
      for (const seriesId of lastSeriesIds) {
        try {
          const [details, hasVideo] = await Promise.all([
            getTVDetails(seriesId),
            getSeriesData(seriesId)
          ]);
          series.push({
            tmdbId: seriesId,
            title: details.name || '',
            posterPath: details.poster_path,
            backdropPath: details.backdrop_path,
            overview: details.overview || '',
            rating: details.vote_average || 0,
            releaseDate: details.first_air_date || '',
            mediaType: 'tv',
            genres: details.genres?.map((g: any) => g.id) || [],
            hasVideo: !!hasVideo,
          });
        } catch (error) {
          console.error(`Error fetching series ${seriesId}:`, error);
        }
      }
      
      for (const fandubItem of fandubIds) {
        try {
          const details = fandubItem.mediaType === 'movie'
            ? await getMovieDetails(fandubItem.tmdbId)
            : await getTVDetails(fandubItem.tmdbId);
          
          const title = fandubItem.mediaType === 'movie'
            ? (details as any).title
            : (details as any).name;
          
          fandubs.push({
            tmdbId: fandubItem.tmdbId,
            title: title || '',
            posterPath: details.poster_path,
            backdropPath: details.backdrop_path,
            overview: details.overview || '',
            rating: details.vote_average || 0,
            releaseDate: fandubItem.mediaType === 'movie'
              ? (details as any).release_date || ''
              : (details as any).first_air_date || '',
            mediaType: fandubItem.mediaType,
            genres: [...(details.genres?.map((g: any) => g.id) || []), -1],
            hasVideo: true,
          });
        } catch (error) {
          console.error(`Error fetching fandub ${fandubItem.tmdbId}:`, error);
        }
      }
      
      const candidates: MediaItem[] = [];
      const maxItems = Math.max(movies.length, series.length, fandubs.length);
      for (let i = 0; i < maxItems; i++) {
        if (movies[i]) candidates.push(movies[i]);
        if (series[i]) candidates.push(series[i]);
        if (fandubs[i]) candidates.push(fandubs[i]);
      }
      
      res.json(candidates.slice(0, 6));
    } catch (error) {
      console.error('Error fetching hero media:', error);
      res.status(500).json({ error: 'Failed to fetch hero media' });
    }
  });
  
  // Check if media exists in catalog
  app.get("/api/media/check/:id/:type", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.id);
      const mediaType = req.params.type as 'movie' | 'tv';
      
      const { releaseConfig } = await import('../client/src/lib/releaseConfig.js');
      const scheduledItem = releaseConfig.items.find(
        item => item.tmdbId === tmdbId && item.mediaType === mediaType
      );
      
      if (mediaType === 'movie') {
        const movieIds = await getAllMovieIds();
        const exists = movieIds.includes(tmdbId);
        res.json({ 
          exists,
          isScheduled: !!scheduledItem,
          releaseTimestamp: scheduledItem?.releaseTimestamp
        });
      } else {
        const seriesIds = await getAllSeriesIds();
        const exists = seriesIds.includes(tmdbId);
        res.json({ 
          exists,
          isScheduled: !!scheduledItem,
          releaseTimestamp: scheduledItem?.releaseTimestamp
        });
      }
    } catch (error) {
      console.error('Error checking media existence:', error);
      res.status(500).json({ error: 'Failed to check media existence' });
    }
  });

  // Get all media (movies + series) with TMDB data
  app.get("/api/media/all", async (req, res) => {
    try {
      const [movieIds, seriesIds] = await Promise.all([
        getAllMovieIds(),
        getAllSeriesIds()
      ]);
      
      const allMedia: MediaItem[] = [];
      
      // Fetch all movies
      for (const tmdbId of movieIds) {
        try {
          const [details, externalIds, hasVideo] = await Promise.all([
            getMovieDetails(tmdbId),
            getMovieExternalIds(tmdbId).catch(() => ({ imdb_id: undefined })),
            getMovieUrl(tmdbId)
          ]);
          allMedia.push({
            tmdbId,
            imdbId: externalIds.imdb_id,
            title: details.title || '',
            posterPath: details.poster_path,
            backdropPath: details.backdrop_path,
            overview: details.overview || '',
            rating: details.vote_average || 0,
            releaseDate: details.release_date || '',
            mediaType: 'movie',
            genres: details.genres?.map((g: any) => g.id) || [],
            hasVideo: !!hasVideo,
          });
        } catch (error) {
          console.error(`Error fetching movie ${tmdbId}:`, error);
        }
      }
      
      // Fetch all series
      for (const tmdbId of seriesIds) {
        try {
          const [details, hasVideo] = await Promise.all([
            getTVDetails(tmdbId),
            getSeriesData(tmdbId)
          ]);
          allMedia.push({
            tmdbId,
            title: details.name || '',
            posterPath: details.poster_path,
            backdropPath: details.backdrop_path,
            overview: details.overview || '',
            rating: details.vote_average || 0,
            releaseDate: details.first_air_date || '',
            mediaType: 'tv',
            genres: details.genres?.map((g: any) => g.id) || [],
            hasVideo: !!hasVideo,
          });
        } catch (error) {
          console.error(`Error fetching series ${tmdbId}:`, error);
        }
      }
      
      res.json(allMedia);
    } catch (error) {
      console.error('Error fetching all media:', error);
      res.status(500).json({ error: 'Failed to fetch media' });
    }
  });

  // Get media details
  app.get("/api/media/details/:id/:type", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.id);
      const mediaType = req.params.type as 'movie' | 'tv';
      
      if (isNaN(tmdbId)) {
        return res.status(400).json({ error: 'Invalid TMDB ID' });
      }
      
      const details = mediaType === 'movie'
        ? await getMovieDetails(tmdbId)
        : await getTVDetails(tmdbId);
      
      res.json(details);
    } catch (error) {
      console.error('Error fetching media details:', error);
      res.status(500).json({ error: 'Failed to fetch details' });
    }
  });

  // Get videos (trailers, teasers, etc.)
  app.get("/api/media/videos/:id/:type", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.id);
      const mediaType = req.params.type as 'movie' | 'tv';
      
      if (isNaN(tmdbId)) {
        return res.status(400).json({ error: 'Invalid TMDB ID' });
      }
      
      const videos = await getVideos(tmdbId, mediaType);
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  // Get series data from bin
  app.get("/api/media/series/:id", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.id);
      
      if (isNaN(tmdbId)) {
        return res.status(400).json({ error: 'Invalid TMDB ID' });
      }
      
      const seriesData = await getSeriesData(tmdbId);
      
      if (!seriesData) {
        return res.status(404).json({ error: 'Series not found in bin' });
      }
      
      res.json(seriesData);
    } catch (error) {
      console.error('Error fetching series data:', error);
      res.status(500).json({ error: 'Failed to fetch series data' });
    }
  });

  // Search media
  app.get("/api/media/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 3) {
        return res.json([]);
      }
      
      const [movieIds, seriesIds, searchResults] = await Promise.all([
        getAllMovieIds(),
        getAllSeriesIds(),
        searchMulti(query)
      ]);
      
      const results: MediaItem[] = [];
      
      for (const item of searchResults.results) {
        if ('title' in item) {
          if (movieIds.includes(item.id)) {
            results.push({
              tmdbId: item.id,
              title: item.title,
              posterPath: item.poster_path,
              backdropPath: item.backdrop_path,
              overview: item.overview || '',
              rating: item.vote_average || 0,
              releaseDate: item.release_date || '',
              mediaType: 'movie',
              genres: item.genre_ids || [],
              hasVideo: true,
            });
          }
        } else if ('name' in item) {
          if (seriesIds.includes(item.id)) {
            results.push({
              tmdbId: item.id,
              title: item.name,
              posterPath: item.poster_path,
              backdropPath: item.backdrop_path,
              overview: item.overview || '',
              rating: item.vote_average || 0,
              releaseDate: item.first_air_date || '',
              mediaType: 'tv',
              genres: item.genre_ids || [],
              hasVideo: true,
            });
          }
        }
      }
      
      res.json(results);
    } catch (error) {
      console.error('Error searching media:', error);
      res.status(500).json({ error: 'Failed to search' });
    }
  });

  // Get my list
  app.get("/api/mylist", async (req, res) => {
    try {
      const myList = await storage.getMyList();
      res.json(myList);
    } catch (error) {
      console.error('Error fetching my list:', error);
      res.status(500).json({ error: 'Failed to fetch my list' });
    }
  });

  // Add to my list
  app.post("/api/mylist", async (req, res) => {
    try {
      const validated = insertMyListItemSchema.parse(req.body);
      
      const existing = await storage.getMyListItem(validated.tmdbId);
      if (existing) {
        return res.status(409).json({ error: 'Already in list' });
      }
      
      const item = await storage.addToMyList(validated);
      res.status(201).json(item);
    } catch (error) {
      console.error('Error adding to my list:', error);
      res.status(500).json({ error: 'Failed to add to my list' });
    }
  });

  // Remove from my list
  app.delete("/api/mylist/:tmdbId", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.tmdbId);
      
      if (isNaN(tmdbId)) {
        return res.status(400).json({ error: 'Invalid TMDB ID' });
      }
      
      const removed = await storage.removeFromMyList(tmdbId);
      
      if (!removed) {
        return res.status(404).json({ error: 'Item not found in list' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error removing from my list:', error);
      res.status(500).json({ error: 'Failed to remove from my list' });
    }
  });

  // Get season episodes
  app.get("/api/media/tv/:id/season/:seasonNumber", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.id);
      const seasonNumber = parseInt(req.params.seasonNumber);
      
      if (isNaN(tmdbId) || isNaN(seasonNumber)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      
      const seasonData = await getSeasonDetails(tmdbId, seasonNumber);
      res.json(seasonData);
    } catch (error) {
      console.error('Error fetching season details:', error);
      res.status(500).json({ error: 'Failed to fetch season details' });
    }
  });

  // Get movie URL from bin
  app.get("/api/media/movie/:id/url", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.id);
      
      if (isNaN(tmdbId)) {
        return res.status(400).json({ error: 'Invalid TMDB ID' });
      }
      
      const url = await getMovieUrl(tmdbId);
      
      if (!url) {
        return res.status(404).json({ error: 'Movie URL not found' });
      }
      
      res.json({ url });
    } catch (error) {
      console.error('Error fetching movie URL:', error);
      res.status(500).json({ error: 'Failed to fetch movie URL' });
    }
  });

  // Fan Dub routes - Projetos feitos por fãs
  app.get("/api/media/fandub", async (req, res) => {
    try {
      const { fanDubConfig } = await import('../client/src/lib/fanDubConfig.js');
      
      if (!fanDubConfig || fanDubConfig.length === 0) {
        return res.json([]);
      }

      const fanDubItems: MediaItem[] = [];

      for (const item of fanDubConfig) {
        try {
          if (item.mediaType === 'movie') {
            const [details, externalIds] = await Promise.all([
              getMovieDetails(item.tmdbId),
              getMovieExternalIds(item.tmdbId).catch(() => ({ imdb_id: undefined }))
            ]);
            
            fanDubItems.push({
              tmdbId: item.tmdbId,
              imdbId: externalIds.imdb_id,
              title: details.title || '',
              posterPath: details.poster_path,
              backdropPath: details.backdrop_path,
              overview: details.overview || '',
              rating: details.vote_average || 0,
              releaseDate: details.release_date || '',
              mediaType: 'movie',
              genres: [-1, ...(details.genres?.map((g: any) => g.id) || [])],
              hasVideo: true,
            });
          } else if (item.mediaType === 'tv') {
            const details = await getTVDetails(item.tmdbId);
            
            fanDubItems.push({
              tmdbId: item.tmdbId,
              title: details.name || '',
              posterPath: details.poster_path,
              backdropPath: details.backdrop_path,
              overview: details.overview || '',
              rating: details.vote_average || 0,
              releaseDate: details.first_air_date || '',
              mediaType: 'tv',
              genres: [-1, ...(details.genres?.map((g: any) => g.id) || [])],
              hasVideo: true,
            });
          }
        } catch (error) {
          console.error(`Error fetching fandub item ${item.tmdbId}:`, error);
        }
      }

      res.json(fanDubItems);
    } catch (error) {
      console.error('Error fetching fandub media:', error);
      res.status(500).json({ error: 'Failed to fetch fandub media' });
    }
  });

  app.get("/api/fan-dub/config", async (req, res) => {
    try {
      res.json({
        moviesUrl: process.env.FANDUB_MOVIES_GITHUB_URL || '',
        seriesUrl: process.env.FANDUB_SERIES_GITHUB_URL || ''
      });
    } catch (error) {
      console.error('Error fetching fan dub config:', error);
      res.status(500).json({ error: 'Failed to fetch fan dub config' });
    }
  });

  app.get("/api/fan-dub/:mediaType/:id/url", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.id);
      const mediaType = req.params.mediaType as 'movie' | 'tv';
      
      if (isNaN(tmdbId)) {
        return res.status(400).json({ error: 'Invalid TMDB ID' });
      }
      
      if (mediaType !== 'movie' && mediaType !== 'tv') {
        return res.status(400).json({ error: 'Invalid media type' });
      }

      const { FANDUB_MOVIES_GITHUB_URL, FANDUB_SERIES_GITHUB_URL } = await import('../client/src/lib/fanDubConfig.js');

      if (!FANDUB_MOVIES_GITHUB_URL || !FANDUB_SERIES_GITHUB_URL) {
        return res.status(404).json({ 
          error: 'Fandub GitHub URLs not configured in fanDubConfig.ts' 
        });
      }

      const { getFanDubUrl } = await import('./fandub-data.js');
      const url = await getFanDubUrl(tmdbId, mediaType, FANDUB_MOVIES_GITHUB_URL, FANDUB_SERIES_GITHUB_URL);
      
      if (!url) {
        return res.status(404).json({ error: 'Fandub URL not found for this media' });
      }
      
      res.json({ url });
    } catch (error) {
      console.error('Error fetching fandub URL:', error);
      res.status(500).json({ error: 'Failed to fetch fandub URL' });
    }
  });

  app.get("/api/fan-dub/tv/:id/episodes", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.id);
      
      if (isNaN(tmdbId)) {
        return res.status(400).json({ error: 'Invalid TMDB ID' });
      }
      
      const { FANDUB_SERIES_GITHUB_URL } = await import('../client/src/lib/fanDubConfig.js');
      const { getFanDubSeries } = await import('./fandub-data.js');
      const seriesData = await getFanDubSeries(FANDUB_SERIES_GITHUB_URL);
      
      const entry = seriesData[tmdbId.toString()];
      
      if (!entry) {
        return res.status(404).json({ error: 'Fandub series not found' });
      }
      
      if (typeof entry === 'object' && (entry as any).temporadas) {
        res.json(entry);
      } else {
        res.status(404).json({ error: 'Series data structure not found' });
      }
    } catch (error) {
      console.error('Error fetching fandub series episodes:', error);
      res.status(500).json({ error: 'Failed to fetch fandub series episodes' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}