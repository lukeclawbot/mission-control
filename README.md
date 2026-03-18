# Mission Control

Linear-inspired local dashboard for OpenClaw operations.

## What changed in v2

- Real **OpenClaw status** via `app/api/openclaw/route.ts`, backed by `openclaw gateway status`
- Real **calendar agenda** via `app/api/calendar/agenda/route.ts`, backed by `gog calendar events primary --from YYYY-MM-DD --to YYYY-MM-DD`
- Lightweight **command palette** shell with `Ctrl+K`
- **Tools launcher** wired to local sections and local routes
- Kept **localhost-only assumptions** intact

## Run locally

```bash
npm install
npm run dev
```

Then open <http://127.0.0.1:3000>.

## Local dependencies

This dashboard expects:

- `openclaw` installed and the local gateway service available
- `gog` installed at `$HOME/go/bin/gog` or otherwise on `PATH`
- `GOG_ACCOUNT` set, or it falls back to `tonybigclawbowski@gmail.com`

## API routes

- `GET /api/openclaw`
- `GET /api/calendar/agenda`

Both are intentionally local-first and suitable for localhost use.
