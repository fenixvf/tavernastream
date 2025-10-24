# TavernaStream

## Overview

TavernaStream is a full-stack web application designed for streaming movies and series. It integrates data from The Movie Database (TMDB) with video URLs stored in Firebase Realtime Database, providing a comprehensive streaming experience. The platform features a rich media catalog, a versatile video player, progress tracking, a "New Releases" section, user-specific watchlists, and real-time search capabilities, all presented through a responsive user interface. The project aims to deliver a seamless and engaging streaming service.

## Recent Changes (October 2025)

### Firebase Integration Migration
- **Date**: October 23, 2025
- **Change**: Migrated from JSONBin to Firebase Realtime Database for unlimited access
- **Implementation**:
  - Created `server/firebase.ts` to replace `server/jsonbin.ts`
  - Uses two separate Firebase databases:
    - Movies Database: `filmes-series-tavernastream`
    - Series Database: `series-tavernastream`
  - Real-time cache invalidation using Firebase `onValue` listeners
  - 30-second cache TTL for optimal performance
  - Hero banner updated to show 5 most recent items (instead of 4)

### UI & UX Improvements (October 24, 2025)
- **PlayerOverlay Enhancement**: PlayerFlix is now always shown as Option 1, even when Google Drive URLs are unavailable
- **Mobile Navigation Fix**: My List page now correctly handles search and browse button clicks
- **Mobile Search Improvement**: Added dedicated input field in SearchOverlay with autofocus for better mobile experience
- **Continue Watching Details**: Now displays episode information (T1:E2 - Episode Name) or movie timestamps where playback stopped
- **Content Ordering**: Firebase IDs are now reversed to show most recent content first (via `.reverse()` on getAllMovieIds and getAllSeriesIds)
- **Watch Button Always Available**: Movie "Assistir" button now appears regardless of Drive URL availability (always offers PlayerFlix option)
- **Novidades Section Balance**: Shows balanced mix of 5 recent movies and 5 recent series, intercalated for variety
- **Hero Banner Update**: Displays the most recent additions from Firebase (3 movies + 2 series)
- **Release Countdown Enhancement**: Improved visual design with:
  - Gradient backgrounds with blur effects
  - Animated pulse indicator on clock icon
  - Better responsive sizing for desktop (w-96) and mobile
  - Enhanced expanded view with larger countdown display
  - Added seconds counter in the detailed breakdown
  - Improved border styles and shadows for premium feel

## User Preferences

I prefer detailed explanations and an iterative development approach. Please ask before making major changes.

## System Architecture

The application is built with a clear separation between frontend and backend.

### Frontend
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS for utility-first styling, complemented by Radix UI for accessible and unstyled components (e.g., Dialog, Tabs).
- **Routing**: Wouter for lightweight client-side routing.
- **State Management & Data Fetching**: TanStack Query (React Query) for efficient data caching, synchronization, and server state management.
- **UI/UX Decisions**: Mobile-first design philosophy, responsive layouts, 16:9 aspect ratio for the video player, and adaptive navigation. Visual elements include dynamic hero banners, categorized media rows, and visual progress indicators for watched content.

### Backend
- **Framework**: Express.js with TypeScript, running on Node.js using `tsx` for execution.
- **External API Integration**: Primarily TMDB API for media metadata.
- **Data Storage**:
    - PostgreSQL (Neon) for user-specific data like "My List."
    - **Firebase Realtime Database** for storing video URLs with real-time updates:
      - Movies: Structured as `catalogo-filmes-tavernastream/filmes/{TMDB_ID}` -> Drive URL
      - Series: Structured as `{TMDB_ID}/temporadas/{season_number}` -> Array of episode URLs
      - Intelligent caching system with 30-second TTL
      - Real-time cache invalidation on database updates
      - No access limits unlike JSONBin
    - In-memory storage for development purposes.

### Core Features
- **Media Catalog**: Displays movies and series, categorized by genre, with automatic updates and TMDB metadata.
- **Video Player**: Supports two options: PlayerFlix (with ads, using IMDB ID for movies and TMDB ID for series) and direct Google Drive URLs (ad-free). Includes responsive design, episode navigation, and player switching.
- **Continue Watching**: Tracks viewing progress (PlayerFlix only), stores history in localStorage, and allows users to resume playback.
- **New Releases**: Highlights recently added content from Firebase, updated automatically in real-time.
- **My List**: Allows users to add/remove media, persisted in PostgreSQL.
- **Search**: Real-time search integrated with TMDB Search API, filtered by availability in Firebase.
- **Responsiveness**: Fully adaptive interface for various devices, including episode thumbnails from TMDB.

### System Design Choices
- **Firebase Real-time Updates**: Implements automatic cache invalidation when database content changes, ensuring users always see the latest content without manual refresh.
- **Shared State Architecture**: `useWatchProgress` hook is elevated to parent components (Home, MyListPage) to ensure progress state is consistently shared and updated across all `MediaCard` instances, improving data consistency and reducing redundant fetches.
- **Dynamic Content Ordering**: Catalog display prioritizes recently added items by inverting the order within each Firebase database.
- **Rotating Hero Banner**: Displays up to five recent items (movies and series) with automatic rotation, manual navigation, and smooth transitions.

## External Dependencies

- **TMDB API**: Used for fetching comprehensive movie and series metadata, including titles, synopses, posters, external IDs (like IMDB), and search capabilities.
- **Firebase Realtime Database**: Serves as the primary storage for actual video URLs for both movies and series, with real-time synchronization capabilities.
- **PlayerFlix API**:
    - Movie Playback: `https://playerflixapi.com/filme/{imdb_id}`
    - Series Playback: `https://playerflixapi.com/serie/{tmdb_id}/{season}/{episode}`
- **PostgreSQL (Neon)**: Utilized for persistent storage of user-specific data, specifically the "My List" feature.
- **Google Drive**: Supports direct Google Drive URLs for ad-free video playback.

## Environment Variables

All sensitive credentials are stored securely in Replit Secrets:

### Firebase Movies Database
- FIREBASE_MOVIES_API_KEY
- FIREBASE_MOVIES_AUTH_DOMAIN
- FIREBASE_MOVIES_DATABASE_URL
- FIREBASE_MOVIES_PROJECT_ID
- FIREBASE_MOVIES_STORAGE_BUCKET
- FIREBASE_MOVIES_MESSAGING_SENDER_ID
- FIREBASE_MOVIES_APP_ID
- FIREBASE_MOVIES_MEASUREMENT_ID

### Firebase Series Database
- FIREBASE_SERIES_API_KEY
- FIREBASE_SERIES_AUTH_DOMAIN
- FIREBASE_SERIES_DATABASE_URL
- FIREBASE_SERIES_PROJECT_ID
- FIREBASE_SERIES_STORAGE_BUCKET
- FIREBASE_SERIES_MESSAGING_SENDER_ID
- FIREBASE_SERIES_APP_ID
- FIREBASE_SERIES_MEASUREMENT_ID

### TMDB API
- TMDB_API_KEY

## Deployment

The application is configured for Replit deployment with autoscale:
- Build: `npm run build`
- Start: `npm start`
- Development: `npm run dev` (port 5000)
