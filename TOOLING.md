# Bible Reader PWA — Tooling & Helpers

This file defines the skills, npm packages, and MCP servers used to build the application with consistent standards. Install each package one at a time (restricted shell: single command per call, no pipes/chaining).

## Skills (load via Kilo `skill` tool)

| Skill | Purpose |
|-------|---------|
| `kilo-config` | Kilo configuration: config paths, kilo.json fields, commands, agents, skills, permissions, MCPs, providers, TUI settings, Agent Manager worktree setup/run scripts. Use when changing Kilo config or setting up managed sessions. |

## npm Packages

Already installed (package.json):
- `react`, `react-dom` — UI framework
- `vite` — build/dev server
- `@vitejs/plugin-react` — React plugin
- `typescript` — typechecking
- `tailwindcss`, `@tailwindcss/vite` — styling
- `react-router-dom` — routing
- `dexie` — IndexedDB persistence
- `lucide-react` — icons
- `clsx` — conditional classes
- `vite-plugin-pwa`, `workbox-window` — PWA/service worker
- `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` — testing
- `oxlint` — linting

To install (helpers for speed/standards):
| Package | Type | Purpose |
|---------|------|---------|
| `prettier` | dev | Code formatting for consistent standards across phases |
| `eslint` | dev | Optional secondary lint (oxlint is primary; ESLint for TS-aware rules if needed) |

## MCP Servers

None configured by default. Add to `kilo.json` / `.kilo/commands` only when a specific capability (e.g., web search, file indexing) is needed beyond built-in tools. Do not guess MCP URLs.

## Standards Enforced

- TypeScript strict (`tsc --noEmit` clean)
- Lint: `npm run lint` (oxlint) clean or warnings-only
- Tests: `npm test` (vitest) all passing
- Build: `npm run build` succeeds; bundle < 8MB; PWA precaches `web.json`
- Formatting: `prettier --check` (after `prettier` installed)

## Installation Order (one command per shell call)

1. `npm install --save-dev prettier`
2. (optional) `npm install --save-dev eslint`

## Verification After Install

- `npx prettier --check "src/**/*.{ts,tsx}"`
- `npm run build`
- `npm test`
- `npm run lint`
