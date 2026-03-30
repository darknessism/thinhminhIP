# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thinh Minh Eco-Industrial Park — a web app for browsing industrial park lots on an interactive SVG map, submitting inquiries, and managing lots via an admin panel. Vietnamese-language project.

## Commands

```bash
npm install          # Install dependencies
npm run seed         # Seed SQLite DB from lots-data.json + create default admin (admin/admin123)
npm start            # Production server (port 3000)
npm run dev          # Dev server with --watch auto-restart
```

After `npm install`, run `npm run seed` to populate the database. The DB file (`server/data/thinhminh.db`) is auto-created.

No test framework is configured.

## Architecture

**Two-tier app:** public lot browser + protected admin panel.

- **Frontend** (`public/`): Static HTML served by Express. React 18 + Tailwind CSS + Babel loaded via CDN — no build step. `layout.html` is the interactive map page; `index.html` is the landing page.
- **Backend** (`server/server.js`): Express app with layered structure:
  - `routes/` — api.js (public), auth.js (login/session), admin.js (protected CRUD)
  - `services/` — lotService, inquiryService, authService (business logic)
  - `middleware/auth.js` — `requireAuth` session guard for admin routes
  - `db/database.js` — sql.js (SQLite in-memory, persisted to file)
  - `db/sessionStore.js` — custom SQLite-backed express-session store

**Key data flow:** React app fetches `GET /api/lots` → lots rendered on SVG map → user clicks lot → detail popup → inquiry form → `POST /api/request-info`.

**SVG-to-data mapping:** Each lot has a `svgGroupId` (e.g., `POLYLINE-21`) matching a `<g id="...">` in `public/layout-vector.svg`. Lot data lives in `server/lots-data.json` and is seeded into SQLite.

## Database

SQLite via sql.js. Tables: `lots`, `inquiries`, `admins`, `sessions`. Schema created in `db/database.js`. Seeding script: `db/seed.js` reads `lots-data.json`.

## Environment Variables

- `PORT` — server port (default 3000)
- `SESSION_SECRET` — session key (has insecure default, change in production)
- `GOOGLE_SHEET_ID` — optional Google Sheets integration for inquiries

## SVG Zone Color Map

| CSS class | Zoning | Color |
|-----------|--------|-------|
| cls-3 | Very Large (>10 ha) | #4805d5 |
| cls-2 | Large (5-10 ha) | #5d2969 |
| cls-6 | Medium (2-5 ha) | #af02f8 |
| cls-5 | Small (<2 ha) | #df02f6 |

## URLs

- Landing: `/index.html`
- Interactive map: `/layout.html`
- Admin login: `/admin/login`
- Admin dashboard: `/admin`
- Public API: `/api/lots`
