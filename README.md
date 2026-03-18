# Mission Control

Linear-inspired local dashboard for OpenClaw operations.

## What changed in v3

- Real **OpenClaw status** via `app/api/openclaw/route.ts`, backed by `openclaw gateway status`
- Real **calendar agenda** via `app/api/calendar/agenda/route.ts`, backed by `gog calendar events primary --from YYYY-MM-DD --to YYYY-MM-DD`
- New **Gmail inbox panel** via `app/api/gmail/inbox/route.ts`, backed by local `gog gmail search` in read-only mode
- Better **empty/error states** for Gmail so the UI is still useful when Google or auth gets moody
- New **quick actions** panel with safe local actions and copyable commands instead of risky write buttons
- Upgraded **command palette** with Gmail/API jumps and command copy support
- Kept **localhost-only assumptions** intact

## Run locally

```bash
npm install
npm run dev
```

Then open <http://127.0.0.1:3000>.

## Validate

```bash
npm run lint
npm run build
```

## Docker

This repo includes separate Docker setups for development and production.

### Docker dev

Best for active UI work with live reload.

```bash
docker compose -f compose.dev.yml up --build
```

Then open <http://127.0.0.1:3000>.

Notes:
- mounts the repo into the container for live editing
- mounts local `openclaw` + `gog` binaries read-only
- mounts `~/.openclaw` read-only so the app can read local OpenClaw state
- uses `GOG_ACCOUNT` from the compose environment
- dev mode uses webpack instead of Turbopack to avoid CPU instruction compatibility issues on some hosts

Stop it with:

```bash
docker compose -f compose.dev.yml down
```

### Docker prod

Best for a cleaner long-running local instance.

```bash
docker compose -f compose.prod.yml up --build -d
```

Then open <http://127.0.0.1:3001>.

Stop it with:

```bash
docker compose -f compose.prod.yml down
```

View logs with:

```bash
docker compose -f compose.prod.yml logs -f
```

## Environment knobs

These are supported by the app and Docker compose files:

- `GOG_ACCOUNT` — Google account used for Gmail/calendar reads
- `OPENCLAW_PATH` — path to the `openclaw` binary (default: `openclaw`)
- `GOG_PATH` — path to the `gog` binary (default: `gog`)

## Local dependencies

This dashboard expects:

- `openclaw` installed and the local gateway service available
- `gog` installed at `$HOME/go/bin/gog` or otherwise on `PATH`
- `GOG_ACCOUNT` set, or it falls back to `tonybigclawbowski@gmail.com`

## API routes

- `GET /api/openclaw`
- `GET /api/calendar/agenda`
- `GET /api/gmail/inbox`

All are intentionally local-first and suitable for localhost use.
