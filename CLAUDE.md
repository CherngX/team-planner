# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Collaborative team Gantt chart dashboard — no login required, all team members share one URL. React + Vite frontend, PHP REST API, MariaDB backend.

## Key Paths

| What | Where |
|------|-------|
| Git repo (source of truth) | `~/team-planner/` |
| PHP API — symlinked, edits are instantly live | `~/team-planner/api/` → `/var/www/html/planner/api` |
| Local DB credentials (gitignored) | `~/team-planner/api/.env.php` |
| Built frontend (updated via `npm run deploy`) | `/var/www/html/planner/` |

## Daily Workflow

```bash
cd ~/team-planner

npm run dev          # hot-reload dev server at http://194.233.93.231:5173/planner/
npm run deploy       # build React + copy dist/* to /var/www/html/planner/

git add -p
git commit -m "..."
git push             # syncs to https://github.com/CherngX/team-planner
```

**PHP files** — just save, live instantly via symlink. No deploy needed.
**React files** — `npm run deploy` when ready to go live.

## Test API

```bash
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
                                                                  ├── .env.php  (gitignored, DB password)
                                                                  ├── config.php
                                                                  ├── rows.php
                                                                  ├── tasks.php
                                                                  └── sync.php
```

ACLs grant `www-data` traversal rights to `/root` and `/root/team-planner` so Apache can follow the symlink (`setfacl` — if reprovisioning, re-run these):

```bash
setfacl -m u:www-data:x /root
setfacl -m u:www-data:rx /root/team-planner
setfacl -R -m u:www-data:rx /root/team-planner/api
```

Dev server proxies `/planner/api/*` → `localhost:8080` so HMR and the live PHP API work together without CORS issues.

## Frontend Components (`src/components/`)

- `GanttChart.jsx` — top-level layout: toolbar (Today / Prev / Next / Week / Month toggle), sidebar + scrollable grid
- `GanttHeader.jsx` — sticky header: month label row + day label row, today/weekend highlights
- `GanttRow.jsx` — one grid row: day-column cells (double-click → create task) + absolutely-positioned TaskBars
- `TaskBar.jsx` — drag bar body to move (keeps duration), drag right edge to resize end date
- `Sidebar.jsx` — drag to reorder rows, double-click to rename, add/delete with color picker
- `TaskPopup.jsx` — floating editor: title, dates, color picker, type (task/leave), save/delete

## Hooks & Utils

- `hooks/useGanttData.js` — fetches rows+tasks on mount, polls `sync.php` every 5s, exposes CRUD callbacks
- `utils/api.js` — thin fetch wrappers for all three PHP endpoints
- `utils/dates.js` — `addDays`, `diffDays`, `toISO`, `parseDate` (parses YYYY-MM-DD as local, not UTC), `isToday`, `isWeekend`

## PHP API Conventions

- All files call `cors()` first (JSON + CORS headers, handles OPTIONS preflight)
- DB via `getDB()` PDO singleton in `config.php`
- `rows` is a reserved word in MariaDB — always use backtick-quoted `` `rows` `` in SQL
- `sync.php` returns full rows list + only tasks with `updated_at > since_datetime`

## Database

- Host: `127.0.0.1:3306`, DB: `team_planner`, user: `root`
- Tables: `` `rows` `` (id, name, color, position) and `tasks` (id, row_id, title, start_date, end_date, color, task_type ENUM('task','leave'), updated_at)

## Vite Config

`base: '/planner/'` roots all asset URLs at `/planner/`. The `.htaccess` at `/var/www/html/planner/` rewrites all non-API, non-file requests to `index.html`.
