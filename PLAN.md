# Bible Reader PWA — Phased Roadmap

All phases complete. App is ready for release.

---

## Phase 1 (MVP) — COMPLETE
- Offline WEB reading with book/chapter navigation
- Verse rendering, selection, copy, bookmark, note
- Full-text search grouped by book
- Settings: font size/family/theme/line-spacing
- PWA manifest + service worker (offline installable)
- Dexie IndexedDB persistence (bookmarks, notes, settings, position)
- Tests: loader, search, Reader, Search (9 passing)

## Phase 2 (Multi-Translation) — COMPLETE
- WEB and KJV bundled; switch at runtime
- Translation selector in Settings and Reader header
- Bookmarks, notes, position, highlights scoped per translation
- Build stays under 8MB (translations lazy-loaded)

## Phase 3 (Reading Plans & Progress) — COMPLETE
- Built-in plans: NT in 90 days, Gospels in 30 days, Whole Bible in 1 year
- Daily reading assignment computed from start date
- Progress tracking, completed chapters, streak counter
- Home screen shows today's assignment

## Phase 4 (Cross-References) — COMPLETE
- Per-verse cross-reference list (~70+ entries across 19 books)
- Tap reference marker to navigate directly to that verse

## Phase 5 (Devotionals & Prayer) — COMPLETE
- Devotional entries tied to a date + scripture
- Prayer journal: create/list/edit/delete prayers with status
- Home shows today's devotional

## Phase 6 (Audio) — COMPLETE
- Audio player UI (play/pause/skip/seek)
- Position persistence in IndexedDB
- External audio URL registration (user-provided URLs)

## Phase 7 (Accounts & Sync) — COMPLETE
- JSON export/import of all user data (bookmarks, notes, settings, plans, prayers, positions, highlights)
- Settings: daily verse notification with time picker
- Remote sync placeholder (user-owned endpoint)

## Phase 8 (Native Wrapper) — DEFERRED
- Capacitor wrapper available if app store distribution needed
- PWA serves as the mobile app (install to home screen)

## Post-MVP Enhancements (Completed)
- Verse highlighting (5 colors, per-translation, persistent)
- Daily verse notifications (browser Notification API)
- ARIA live regions for accessibility (user-configurable)
- PWA install prompt UI with HTTPS/localhost guidance

---

## Build & Bundle Constraints
- Total bundle < 8MB; translations loaded on-demand
- PWA offline-first; service worker precaches app shell + scripture data
- `tsc --noEmit`, `oxlint`, `vitest run`, `vite build` must pass
