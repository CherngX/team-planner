# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collaborative team Gantt chart dashboard. All team members open the same URL — no login required. Built with React + Vite (frontend) and PHP REST API + MariaDB (backend).

## Key Paths

| What | Where |
|------|-------|
| Git repo (source of truth) | `~/team-planner/` |
| PHP API — symlinked, edits are instantly live | `~/team-planner/api/` → `/var/www/html/planner/api` |
| Local DB credentials (gitignored) | `~/team-planner/api/.env.php` |
| Built frontend (copy after `npm run deploy`) | `/var/www/html/planner/` |

## Commands

```bash
# Dev server (hot reload on :5173, proxies /planner/api → Apache:8080)
cd ~/team-planner && npm run dev

# Build + deploy frontend to Apache web root
cd ~/team-planner && npm run deploy

# Test API directly
curl http://localhost:8080/planner/api/rows.php
curl http://localhost:8080/planner/api/tasks.php
curl "http://localhost:8080/planner/api/sync.php?since=0"
```

## Architecture

```
Browser → Nginx (443) → Apache (8080) → /var/www/html/planner/
                                         ├── index.html        (built React SPA)
                                         ├── assets/           (built JS/CSS)
                                         ├── .htaccess         (SPA rewrite rule)
                                         └── api/ ──symlink──► ~/team-planner/api/
                                                                  ├── .env.php  (gitignored, has DB pass)
                                                                  ├── config.php
                                                                  ├── rows.php
                                                                  ├── tasks.php
                                                                  └── sync.php
```

The `api/` symlink means PHP edits in the repo are live immediately — no copy step needed.
The frontend requires `npm run deploy` after changes (Vite build step).

ACLs grant `www-data` traversal rights to `/root` and `/root/team-planner` so Apache can follow the symlink.

Dev: Vite dev server on :5173 proxies `/planner/api/*` to `localhost:8080` so HMR and the PHP API work together.

## Frontend Source Layout (`~/team-planner/src/`)

- `App.jsx` — root; renders `<GanttChart>` after data loads
- `hooks/useGanttData.js` — all server state: fetches rows+tasks on mount, polls `sync.php` every 5 s, exposes add/update/delete callbacks
- `utils/api.js` — thin `fetch` wrappers for all 3 PHP endpoints
- `utils/dates.js` — date arithmetic helpers (`addDays`, `diffDays`, `toISO`, `parseDate`, etc.)
- `components/GanttChart.jsx` — top-level layout: toolbar (Today / Prev / Next / Week / Month), sidebar + scrollable grid
- `components/GanttHeader.jsx` — sticky header: month label row + day label row with today/weekend highlights
- `components/GanttRow.jsx` — one grid row: day-column cells (double-click → create task) + absolutely-positioned TaskBars
- `components/TaskBar.jsx` — draggable/resizable task bar; mouse-drag on bar = move, drag right edge = resize end date
- `components/Sidebar.jsx` — left panel: drag-to-reorder rows, inline rename on double-click, add/delete row
- `components/TaskPopup.jsx` — floating editor: title, dates, color picker, type (task/leave), save/delete

## API Conventions (PHP)

All PHP files call `cors()` first (sets JSON + CORS headers, handles OPTIONS preflight). DB access via `getDB()` singleton returning a PDO. `rows` is a reserved word in MariaDB — always quote it as `` `rows` ``. Sync endpoint returns full rows list + only tasks with `updated_at > since_datetime`.

## Database

- Host: `127.0.0.1:3306`, DB: `team_planner`, user: `root`
- Tables: `` `rows` `` (id, name, color, position) and `tasks` (id, row_id, title, start_date, end_date, color, task_type ENUM('task','leave'), updated_at)

## Vite Base Path

`vite.config.js` sets `base: '/planner/'` so all asset URLs and the router are rooted at `/planner/`. The `.htaccess` at `/var/www/html/planner/` rewrites non-API, non-file requests to `index.html`.
