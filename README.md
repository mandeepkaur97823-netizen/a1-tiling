# A1 Tiling Pty Ltd — Localhost Development

Professional tiling web application with 3D architectural visualizer, interactive quote estimator, and local backend API.

---

## Quick Start (Localhost)

### 1. Start Server
Run the local development server:
```bash
npm run dev
```
*(or run `bun run dev` or double-click `start-localhost.bat` on Windows)*

### 2. View in Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express + Vite development server with HMR at `http://localhost:3000` |
| `npm run build` | Compiles production assets into `dist/` |
| `npm run start` | Runs the server in production mode |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Cross-platform cleanup of build outputs |

---

## Configuration & Environment Variables

Environment variables are managed in `.env` and `.env.local`:

- `PORT`: Server port (default: `3000`)
- `APP_URL`: Base application URL (default: `http://localhost:3000`)
- `GEMINI_API_KEY`: (Optional) API key for server-side Gemini features
- `ENQUIRIES_FILE`: (Optional) Path for saving quote submissions (defaults to system temporary directory)

---

## API Endpoints

- `GET /api/health` — Returns server health status `{ ok: true, service: "A1 Tiling Pty Ltd" }`
- `POST /api/enquiries` — Records quote requests and generates a tracking reference (`A1-XXXXXX`)
