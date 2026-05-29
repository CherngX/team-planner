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

- **Frontend:** React 19 + Vite — Gantt grid built with CSS Grid and mouse event handlers (no external Gantt library)
- **Backend:** PHP 8.1 REST API using PDO
- **Database:** MariaDB / MySQL

## Project Structure

```
src/
  components/
    GanttChart.jsx     # Top-level layout: toolbar, view toggle, sidebar + grid
    GanttHeader.jsx    # Sticky date header (month row + day row)
    GanttRow.jsx       # One grid row with background day cells + task bars
    TaskBar.jsx        # Draggable/resizable task bar
    Sidebar.jsx        # Left panel: add/rename/delete/reorder rows
    TaskPopup.jsx      # Floating task editor (title, dates, color, type)
  hooks/
    useGanttData.js    # All server state: initial load + 5s polling + CRUD
  utils/
    api.js             # fetch wrappers for all PHP endpoints
    dates.js           # Date arithmetic (addDays, diffDays, toISO, parseDate…)
api/
  config.php           # PDO singleton, CORS helper, credential loading
  rows.php             # GET / POST / PUT / DELETE
  tasks.php            # GET / POST / PUT / DELETE  (?from=&to= for date range)
  sync.php             # GET ?since=unix_ts → changed tasks + full rows list
```

## Setup

### 1. Database

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

> **Note:** `rows` is a reserved word in MariaDB — always quote it as `` `rows` `` in SQL.

### 2. API credentials

Copy `api/` to your web server. Create `api/.env.php` (not committed to git) with your DB password:

```php
<?php
putenv('DB_PASS=your_password_here');
```

`config.php` loads this file automatically if it exists, then falls back to `DB_*` environment variables.

### 3. Apache / .htaccess

Place this `.htaccess` in your web root (e.g. `/var/www/html/planner/`):

```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/planner/api/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ /planner/index.html [L]
```

Apache must have `AllowOverride All` and `FollowSymLinks` enabled for the web root directory.

### 4. Frontend

```bash
npm install

# Dev server with hot reload (proxies /planner/api → localhost:8080)
npm run dev

# Build + deploy to /var/www/html/planner/ in one step
npm run deploy
```

`vite.config.js` sets `base: '/planner/'` and proxies API calls to `localhost:8080` during development.
