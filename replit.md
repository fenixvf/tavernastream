# TavernaStream

## Overview

TavernaStream is a full-stack web application for streaming movies and series. It integrates data from The Movie Database (TMDB) with video URLs stored in Firebase Realtime Database. The platform offers a rich media catalog, a versatile video player, progress tracking, "New Releases," user-specific watchlists, and real-time search, all within a responsive UI. The project aims to deliver a seamless and engaging streaming service, including unique features like an automatic fan dubbing system and persistent release countdowns.

## Recent Changes

### Release Countdown & Fan Dubbing System Fixes (October 28, 2025)

**Cronômetro Corrigido (ATUALIZAÇÃO FINAL):**
- ✅ Resolvido problema definitivo de reset ao atualizar página
- Mudado de `Date.now() + 24h` para timestamp fixo em `releaseConfig.ts`
- Agora usa `new Date('2025-10-29T15:00:00').getTime()` como exemplo
- Timer nunca mais reinicia, continua contando corretamente após qualquer reload
- Estados `isReleased` e `showAvailableMessage` funcionam corretamente
- Para adicionar novos countdowns, basta adicionar itens no array `releaseConfig.items`

**Sistema de Fandub Corrigido (ATUALIZAÇÃO FINAL):**
- ✅ Integração completa com sistema de navegação e categorias
- Itens de fandub agora recebem genre ID `-1` no backend (`/api/media/fandub`)
- Criada categoria "Fã Dublagem" na página inicial que exibe todos os itens do `fanDubConfig`
- Filtro "Fã Dublagem" no Browse funciona corretamente (genreIds: [-1])
- Implementado `allMediaCombined` que mescla `allMedia` + `fanDubMedia` sem duplicatas
- Todos os componentes (Continue Watching, New Releases, Featured Banner, Browse) usam dados combinados
- Sistema funcionando: busca metadados do TMDB e valida URLs do GitHub
- Backend importa URLs do `fanDubConfig.ts` dinamicamente

**TMDB API Key:**
- Configurada chave de API do TMDB como secret do Replit
- Disponível como variável de ambiente `TMDB_API_KEY`

## User Preferences

I prefer detailed explanations and an iterative development approach. Please ask before making major changes.

## System Architecture

The application employs a clear separation between frontend and backend components.

### Frontend
- **Framework**: React 18 with TypeScript, built using Vite.
- **Styling**: Tailwind CSS for utility-first styling and Radix UI for accessible components.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management & Data Fetching**: TanStack Query (React Query) for data caching and server state management.
- **UI/UX Decisions**:
    - Mobile-first design with responsive layouts.
    - 16:9 aspect ratio for the video player.
    - Dynamic hero banners, categorized media rows, and visual progress indicators.
    - Featured Banner redesign inspired by Netflix, with click-to-play trailer interaction and Framer Motion for smooth animations.
    - Optimized for various screen sizes, including custom Tailwind breakpoints for Smart TV, 2k, and 4k displays with dynamic font scaling.
    - Persistent release countdown with local storage for state management.
    - Dedicated "Fã Dublagem" category on the home page.
    - Improved "Continue Watching" section with 16:9 thumbnails and quick removal options.

### Backend
- **Framework**: Express.js with TypeScript, running on Node.js using `tsx`.
- **External API Integration**: Primarily TMDB API for media metadata.
- **Data Storage**:
    - PostgreSQL (Neon) for user-specific data ("My List").
    - Firebase Realtime Database for video URLs with real-time updates and an intelligent caching system (30-second TTL). Uses separate databases for movies and series.
- **API Endpoints**:
    - `GET /api/media/fandub`: Fetches all fan dub metadata.
    - `GET /api/fan-dub/movie/:id/url`: Fetches movie Drive URL from GitHub.
    - `GET /api/fan-dub/tv/:id/url`: Fetches series Drive URL from GitHub.
    - `GET /api/media/check/:id/:type`: Verifies content existence in GitHub catalogs.
    - `GET /api/media/videos/:id/:type`: Fetches trailers and videos from TMDB.

### Core Features
- **Media Catalog**: Displays movies and series with TMDB metadata, categorized by genre.
- **Video Player**: Supports PlayerFlix (with ads) and direct Google Drive URLs (ad-free), with responsive design and episode navigation.
- **Continue Watching**: Tracks viewing progress (completion threshold at 80%), stored in localStorage, with quick removal functionality.
- **New Releases**: Highlights recently added content from Firebase.
- **My List**: Allows users to add/remove media, persisted in PostgreSQL.
- **Search**: Real-time search using TMDB API, filtered by content availability in Firebase.
- **Automatic Fan Dubbing System**: Integrates with GitHub to fetch Drive URLs for fan-dubbed content, supporting seamless playback.
- **Release Countdown**: Displays upcoming content, blocks access until release time, and provides "Available Now!" messaging.
- **Featured Content Banner**: Premium-quality banner below "Novidades" for manually configured featured items.

### System Design Choices
- **Firebase Real-time Updates**: Automatic cache invalidation on database changes ensures up-to-date content.
- **Shared State Architecture**: `useWatchProgress` hook ensures consistent progress state across components.
- **Dynamic Content Ordering**: Catalog and hero banner prioritize recently added items.
- **Rotating Hero Banner**: Displays up to five recent items with navigation and smooth transitions.

## External Dependencies

- **TMDB API**: Fetches movie and series metadata, including titles, synopses, posters, and external IDs.
- **Firebase Realtime Database**: Stores and synchronizes video URLs for movies and series.
- **PlayerFlix API**: Provides movie and series playback options.
    - Movie Playback: `https://playerflixapi.com/filme/{imdb_id}`
    - Series Playback: `https://playerflixapi.com/serie/{tmdb_id}/{season}/{episode}`
- **PostgreSQL (Neon)**: Persists user-specific data for the "My List" feature.
- **Google Drive**: Supports direct URLs for ad-free video playback.
- **GitHub**: Used by the automatic fan dubbing system to fetch Drive URLs.