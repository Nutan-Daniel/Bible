# Bible Reader PWA

An offline-first Bible reader PWA built with React, TypeScript, Vite, Tailwind CSS, and Dexie (IndexedDB).

## Features

- **Read offline**: World English Bible (WEB) and King James Version (KJV) bundled locally
- **Multi-translation**: Switch between WEB and KJV; bookmarks, notes, and progress are scoped per translation
- **Reading plans**: Built-in plans (New Testament in 90 days, Gospels in 30 days, Whole Bible in 1 year) with progress tracking and streaks
- **Cross-references**: Tap verse markers to jump to related verses
- **Bookmarks & notes**: Save and annotate verses per translation
- **Search**: Full-text search grouped by book
- **Devotionals**: Daily devotional readings
- **Prayer journal**: Create, track, and answer prayers
- **Settings**: Font size, font family, theme (light/dark/system), line spacing, default translation
- **Daily notifications**: Verse-of-the-day reminders (browser Notification API)
- **Audio**: Chapter playback via external audio URLs (user-provided)
- **Backup/export**: JSON export/import of all user data
- **PWA**: Installable offline-first progressive web app

## Tech Stack

- React 19 + TypeScript (strict)
- Vite 8 + Tailwind CSS v4
- React Router 7
- Dexie 4 (IndexedDB)
- Vitest + Testing Library + jsdom
- oxlint + Prettier
- vite-plugin-pwa (Workbox)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Typecheck
npx tsc --noEmit

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  components/   Layout, AudioPlayer, InstallPrompt
  db/           Dexie schema + instance
  hooks/        useBookmarks, useNotes, useSettings, usePosition,
                useReadingPlan, useDevotionals, usePrayers,
                useAudio, useNotifications, useInstallPrompt
  lib/          bible, translation, crossrefs, audio, sync, notifications
  pages/        Home, Reader, Search, Bookmarks, Notes, Settings,
                Plans, Plan, Devotionals, Prayer, Sync
  types/        bible, crossref, devotional, prayer, plan, sync, audio
  data/         web.json, kjv.json, plans.json, crossrefs.json,
                devotionals.json
```

## Data

- **WEB** (World English Bible) — public domain, bundled (~4.6 MB)
- **KJV** (King James Version) — public domain, bundled (~4.7 MB)
- Both translations are lazy-loaded to keep the initial bundle under 8 MB

## PWA

The app is a installable PWA:
- Service worker precaches app shell + scripture data
- Works offline after first visit
- Install via browser "Add to Home Screen" (Chrome/Edge) or Safari share menu (iOS)
- Requires HTTPS for installation on non-localhost domains

## License

World English Bible and King James Version are public domain.
