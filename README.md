# Team Planner — Collaborative Gantt Chart

A real-time collaborative team planning dashboard. All team members open the same URL to plan and track work — no login required.

## Features

- **Gantt chart** with scrollable date axis and per-person/project rows
- **Drag to move** tasks left/right; **drag right edge** to resize duration
- **Click** a task to edit title, dates, color; **double-click** empty cell to create; **right-click** to delete
- **Leave tracking** — distinct orange color for leave tasks so the team sees who's absent
- **Week / Month view** toggle with Today button and prev/next navigation
- **Real-time sync** — polls every 5 seconds, merges changes without a full reload
- **Sidebar** — drag rows to reorder, double-click to rename, add/delete with color picker

## Stack

- **Frontend:** React 19 + Vite, no external Gantt library — built with CSS Grid and mouse event handlers
- **Backend:** PHP 8.1 REST API (PDO + MariaDB)
- **Database:** MariaDB / MySQL

## Project Structure

```
src/                        # React source
  components/
    GanttChart.jsx          # Top-level layout, toolbar, view state
    GanttHeader.jsx         # Sticky date header (month + day rows)
    GanttRow.jsx            # One grid row with task bars
    TaskBar.jsx             # Draggable/resizable task bar
    Sidebar.jsx             # Left panel — rows management
    TaskPopup.jsx           # Floating task editor
  hooks/
    useGanttData.js         # Server state, polling, CRUD callbacks
  utils/
    api.js                  # fetch wrappers for all PHP endpoints
    dates.js                # Date arithmetic helpers
api/                        # PHP REST API (deploy to web server)
  config.php                # DB connection (update credentials here)
  rows.php                  # GET/POST/PUT/DELETE rows
  tasks.php                 # GET/POST/PUT/DELETE tasks
  tasks.php                 # GET ?since=unix_ts  (real-time sync)
  sync.php
```

## Setup

### Database

```sql
CREATE DATABASE IF NOT EXISTS team_planner CHARACTER SET utf8mb4;
USE team_planner;

CREATE TABLE `rows` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#4A90D9',
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  row_id INT NOT NULL,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  color VARCHAR(7) DEFAULT '#4A90D9',
  task_type ENUM('task','leave') DEFAULT 'task',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (row_id) REFERENCES `rows`(id) ON DELETE CASCADE
);
```

### API

1. Copy `api/` to your web server (e.g. `/var/www/html/planner/api/`)
2. Edit `api/config.php` with your DB credentials
3. Add `.htaccess` to rewrite non-API requests to `index.html`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/planner/api/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ /planner/index.html [L]
```

### Frontend

```bash
npm install

# Development (proxies /planner/api to localhost:8080)
npm run dev -- --host 0.0.0.0 --port 5173

# Production build
npm run build
# Copy dist/* to your web server's /planner/ directory
```

Update `vite.config.js` `base` and the proxy target to match your server setup.
