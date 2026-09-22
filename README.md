# SonicLight

A web application for drawing on a canvas, saving the drawing, finding it again later, and turning it into sound. Simplified version built as a technical exercise.

## Running the project

### With Docker

```bash
cp .env.example .env
docker compose up --build
```

The application will be accessible via [http://localhost:8080](http://localhost:8080)

### Without Docker (dev mode)

Open two terminals:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

The application is available at the URL printed by Vite (`http://localhost:5173`). Vite's dev server automatically proxies `/api` calls to the backend at `http://localhost:3000`.

### Tests

```bash
cd backend
npm test
```

## Technical choices

- **Node.js + Express** for the API: lightweight and sufficient for a small REST API, for this exercise we won't need a heavier framework.
- **SQLite** (`better-sqlite3`) for storage: a database contained in a single file, with no server to install or maintain, more than enough for this amount of data.
- **Vue 3** for the frontend, the technology given priority in the brief.
- **Drawing stored as JSON strokes** (`{ color, width, points }`) rather than as an image: lighter than a PNG, and directly reusable for sonification (iterating over points makes sense for JSON, not for pixels).
- **Username-only identification, no password**: explicitly requested by the brief, which states that a full authentication system is not expected.
- **Docker** with two separate images: a Node image for the API, and an nginx image serving the compiled Vue build and proxying `/api` to the backend. In production, the Vue code is never executed, it's compiled once and served as static files.

## How it works

### Identification

The client sends its username in the `X-Username` header on every request about its drawing. The server creates the user if it doesn't exist yet. There is no password: finding your drawing again only requires re-entering the same username (case-insensitive).

### One drawing per user

Each user has only one saved drawing at a time. A new save replaces the previous one. This rule is enforced at the database level: in the `drawings` table, `user_id` is the primary key, which makes it impossible for the same user to have two drawings. Saving is a SQL *upsert* (`INSERT ... ON CONFLICT DO UPDATE`).

### Administration

A `GET /api/admin/drawings` route, restricted to a user whose username matches `ADMIN_USERNAME` (environment variable, `admin` by default), lists every saved drawing. The frontend's `/admin` page displays this list as a gallery of thumbnails.

### Sonification (Web Audio API)

A "Listen" button, on both the drawing page and the admin page, turns a drawing into sound:

- a point's horizontal position becomes a moment in time (the drawing is swept from left to right over 8 seconds);
- its vertical position becomes a pitch, on an exponential scale from 110 Hz to 1760 Hz (4 octaves), to match the ear's logarithmic perception of pitch;
- the stroke's width becomes the volume;
- the color becomes the timbre (hue mapped to one of four waveforms: sine, triangle, square, or sawtooth);
- each stroke plays as an independent voice; strokes that overlap in time sound together.


## Known limitations and possible improvements

- **No real auth**: anyone can use someone else's username and access their drawing. This is an intentional choice, explicitly allowed by the brief for this exercise.
- **No warning before leaving** the drawing page with unsaved changes.
- **No automated frontend tests**, only backend ones (API: login, upsert, validation, admin access).
- **Simplified sonification**: a stroke's points are sorted by horizontal position before being played, so a stroke that loops back to the left is read as a left-to-right sweep rather than replayed in drawing order.
- **No drawing history**: only each user's latest drawing is kept, as requested by the brief; there is therefore no history of previous versions.
- **Plain/Ugly interface**: I enjoy polished UI/UX, but given the time available I prioritized functionality over visual polish.
