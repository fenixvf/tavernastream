# TavernaStream

## Overview

TavernaStream is a full-stack web application designed for streaming movies and series. It integrates data from The Movie Database (TMDB) with video URLs stored in JSONBin, providing a comprehensive streaming experience. The platform features a rich media catalog, a versatile video player, progress tracking, a "New Releases" section, user-specific watchlists, and real-time search capabilities, all presented through a responsive user interface. The project aims to deliver a seamless and engaging streaming service.

## User Preferences

I prefer detailed explanations and an iterative development approach. Please ask before making major changes. Do not make changes to the folder `Z` or the file `Y`.

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
    - JSONBin for storing video URLs, utilizing an intelligent caching system with TTL (30 seconds), ETag support, and stale-if-error strategy for high availability and performance.
    - In-memory storage for development purposes.

### Core Features
- **Media Catalog**: Displays movies and series, categorized by genre, with automatic updates and TMDB metadata.
- **Video Player**: Supports two options: PlayerFlix (with ads, using IMDB ID for movies and TMDB ID for series) and direct Google Drive URLs (ad-free). Includes responsive design, episode navigation, and player switching.
- **Continue Watching**: Tracks viewing progress (PlayerFlix only), stores history in localStorage, and allows users to resume playback.
- **New Releases**: Highlights recently added content from JSONBin, updated automatically.
- **My List**: Allows users to add/remove media, persisted in PostgreSQL.
- **Search**: Real-time search integrated with TMDB Search API, filtered by availability in JSONBin.
- **Responsiveness**: Fully adaptive interface for various devices, including episode thumbnails from TMDB.

### System Design Choices
- **JSONBin Caching**: Implements a robust caching mechanism for JSONBin data to optimize requests, ensure data freshness, and provide fault tolerance.
- **Shared State Architecture**: `useWatchProgress` hook is elevated to parent components (Home, MyListPage) to ensure progress state is consistently shared and updated across all `MediaCard` instances, improving data consistency and reducing redundant fetches.
- **Dynamic Content Ordering**: Catalog display prioritizes recently added items by inverting the order within each JSONBin.
- **Rotating Hero Banner**: Displays up to four recent items (movies and series) with automatic rotation, manual navigation, and smooth transitions.

## External Dependencies

- **TMDB API**: Used for fetching comprehensive movie and series metadata, including titles, synopses, posters, external IDs (like IMDB), and search capabilities.
- **JSONBin**: Serves as the primary storage for actual video URLs for both movies and series.
- **PlayerFlix API**:
    - Movie Playback: `https://playerflixapi.com/filme/{imdb_id}`
    - Series Playback: `https://playerflixapi.com/serie/{tmdb_id}/{season}/{episode}`
- **PostgreSQL (Neon)**: Utilized for persistent storage of user-specific data, specifically the "My List" feature.
- **Google Drive**: Supports direct Google Drive URLs for ad-free video playback.