# Bible Reader PWA — Agent Context

## Project Overview

Offline-first Bible reader PWA built with React 19, TypeScript (strict), Vite 8, Tailwind CSS v4, React Router 7, and Dexie 4 (IndexedDB).

## Tech Stack

| Layer | Tech |
|-------|------|
| UI | React 19 + TypeScript strict |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router 7 |
| Persistence | Dexie 4 (IndexedDB) |
| Testing | Vitest 5 + jsdom + React Testing Library |
| Lint | oxlint |
| Format | Prettier |
| PWA | vite-plugin-pwa (Workbox) |

## Project Structure

```
src/
  components/   Layout, AudioPlayer, InstallPrompt
  db/           Dexie schema v5 + instance
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

## Data Files

- `src/data/web.json` — World English Bible (public domain, ~4.6 MB)
- `src/data/kjv.json` — King James Version (public domain, ~4.7 MB)
- `src/data/plans.json` — 3 reading plans
- `src/data/crossrefs.json` — ~70+ cross-reference entries across 19 books
- `src/data/devotionals.json` — 10 devotional entries

Translations are lazy-loaded via dynamic import to keep initial bundle under 8 MB.

## Key Patterns

- **Dexie tables**: bookmarks, notes, settings, position, plans, prayers, audioPosition, highlights
- **Settings fields**: fontSize, fontFamily, theme, lineSpacing, defaultTranslation, activePlanId, notificationsEnabled, notificationTime, lastNotificationDate, ariaLiveEnabled
- **Translation scoping**: All user data (bookmarks, notes, position, highlights) is scoped by `translationId` (`web` or `kjv`)
- **Shared state**: `useSettings` uses module-level listeners so settings changes propagate to all components instantly

## Available Scripts

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build (tsc -b && vite build)
npm run preview  # Preview production build
npm run test     # Vitest test suite
npm run lint     # oxlint
npm run format   # Prettier check
npx tsc --noEmit # TypeScript strict typecheck
```

## Testing

9 test files, 29 tests total. Tests use vitest + jsdom + React Testing Library with mocked `lib/bible`, `lib/translation`, `lib/crossrefs`, `lib/audio`, `lib/sync`, and `db`.

## PWA

- Service worker precaches app shell + scripture data (12 entries, ~9.6 MB total precache including lazy chunks)
- Installable via browser "Add to Home Screen"
- Requires HTTPS for installation on non-localhost domains
- iOS: Safari "Add to Home Screen" via share menu

## License

World English Bible and King James Version are public domain.
