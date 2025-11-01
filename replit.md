# TavernaStream

## Overview

TavernaStream is a full-stack web application designed for streaming movies and series. It integrates data from The Movie Database (TMDB) with video URLs stored in Firebase Realtime Database. The platform offers a rich media catalog, a versatile video player, progress tracking, "New Releases," user-specific watchlists, and real-time search, all within a responsive UI. Key ambitions include delivering a seamless and engaging streaming experience with unique features like an automatic fan dubbing system, persistent release countdowns, and a focus on PWA capabilities for installability and offline access.

## User Preferences

I prefer detailed explanations and an iterative development approach. Please ask before making major changes.

## System Architecture

The application employs a clear separation between frontend and backend components, focusing on performance, responsiveness, and a rich user experience.

### Frontend
- **Framework**: React 18 with TypeScript, built using Vite.
- **Styling**: Tailwind CSS for utility-first styling and Radix UI for accessible components.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management & Data Fetching**: TanStack Query (React Query) for data caching and server state management.
- **UI/UX Decisions**:
    - Mobile-first, responsive design optimized for various screen sizes, including custom Tailwind breakpoints for Smart TV, 2k, and 4k displays.
    - 16:9 aspect ratio for the video player.
    - Dynamic hero banners, categorized media rows, and visual progress indicators.
    - Featured Banner redesign inspired by Netflix, with Framer Motion for smooth animations.
    - Persistent release countdown with local storage.
    - Dedicated "Fã Dublagem" category on the home page with studio name display and "FANDUB" badge.
    - Improved "Continue Watching" section with 16:9 thumbnails and quick removal options.
    - Official logos displayed in modals, prioritizing Portuguese.
    - PWA (Progressive Web App) enabled for installability and offline functionality with a network-first caching strategy.
    - Integrated Fluid Player for direct streaming with robust configuration (speed controls, volume persistence, quality, theatre mode) and progress tracking.

### Backend
- **Framework**: Express.js with TypeScript, running on Node.js using `tsx`.
- **External API Integration**: Primarily TMDB API for media metadata.
- **Data Storage**:
    - PostgreSQL (Neon) for user-specific data ("My List").
    - Firebase Realtime Database for video URLs with real-time updates and an intelligent caching system (30-second TTL), using separate databases for movies and series.
- **API Endpoints**: Key endpoints support fetching fan dub metadata, episode structures from GitHub, content existence verification, and TMDB video details. Includes specific endpoints for Google Drive URL conversion.

### Core Features
- **Media Catalog**: Displays movies and series with TMDB metadata, categorized by genre.
- **Video Player**: Supports Fluid Player for direct Google Drive URLs and PlayerFlix (with ads), with responsive design and episode navigation. Includes advanced player functionalities like progress tracking and resume playback.
- **Continue Watching**: Tracks viewing progress with a completion threshold at 80%, stored in localStorage, with quick removal functionality.
- **New Releases**: Highlights recently added content from Firebase.
- **My List**: Allows users to add/remove media, persisted in PostgreSQL.
- **Search**: Real-time search using TMDB API, filtered by content availability in Firebase.
- **Automatic Fan Dubbing System**: Integrates with GitHub to fetch Drive URLs for fan-dubbed content, supporting seamless playback exclusively via the Drive player. Fan-dub content is identified by a genre ID of -1 and integrated into navigation and categories without duplication.
- **Release Countdown**: Displays upcoming content, blocks access until release time, and provides "Available Now!" messaging with automatic content verification and in-app notifications (via toast).
- **Featured Content Banner**: Premium-quality banner below "Novidades" for manually configured featured items.

### System Design Choices
- **Firebase Real-time Updates**: Automatic cache invalidation on database changes ensures up-to-date content.
- **Shared State Architecture**: `useWatchProgress` hook ensures consistent progress state across components.
- **Dynamic Content Ordering**: Catalog and hero banner prioritize recently added items.
- **Rotating Hero Banner**: Displays up to five recent items with navigation and smooth transitions.
- **Intelligent Fallback**: For video playback, Fluid Player is prioritized, with an iframe fallback for Google Drive previews if the direct stream fails.

## External Dependencies

- **TMDB API**: Fetches movie and series metadata (titles, synopses, posters, external IDs).
- **Firebase Realtime Database**: Stores and synchronizes video URLs for movies and series.
- **PlayerFlix API**: Provides movie and series playback options.
- **PostgreSQL (Neon)**: Persists user-specific data for the "My List" feature.
- **Google Drive**: Supports direct URLs for ad-free video playback and content streaming.
- **GitHub**: Used by the automatic fan dubbing system to fetch Drive URLs for fan-dubbed content.
- **Fluid Player**: Open-source video player library for enhanced streaming capabilities.