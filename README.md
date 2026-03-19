# Mission Control

Linear-inspired local dashboard for OpenClaw operations.

## What changed in v3

- Real **OpenClaw status** via `app/api/openclaw/route.ts`, backed by `openclaw gateway status`
- Real **calendar agenda** via `app/api/calendar/agenda/route.ts`, backed by `gog calendar events primary --from YYYY-MM-DD --to YYYY-MM-DD`
- Real **read-only Gmail inbox** via `app/api/gmail/inbox/route.ts`, backed by local `gog`
- Lightweight **command palette** shell with `Ctrl+K`
- **Quick Actions** panel with safe local actions and copyable commands
- **Tools launcher** wired to local sections and local routes
- Kept **localhost-only assumptions** intact

## Run locally

```bash
npm install
npm run dev
```

Then open <http://127.0.0.1:3000>.

Notes:
- Development mode is pinned to `next dev --webpack` instead of Turbopack for broader CPU compatibility.

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
- mounts `~/.config/gogcli` read-only so `gog` can see its OAuth client config inside the container
- installs standard `ca-certificates` in the image so local `gog` HTTPS calls can validate normal TLS chains
- mounts the host CA trust store read-only so container HTTPS trust can match the host more closely when local network trust differs
- uses `GOG_ACCOUNT` from the compose environment
- dev mode uses webpack instead of Turbopack to avoid CPU instruction compatibility issues on some hosts
- compose runs as host UID/GID `1000:1000` on this machine so mounted local binaries/config remain executable/readable inside the container
- dev compose uses `/workspace` as the app root and a dedicated Docker volume for `/workspace/.next` so Next.js can write logs/cache without bind-mount permission issues

To reset dev state fully:

```bash
docker compose -f compose.dev.yml down -v --remove-orphans
sudo rm -rf .next
```

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

- `GOG_ACCOUNT` — Google account used for calendar/Gmail reads
- `GOG_KEYRING_PASSWORD` — password for the gog file keyring when running non-interactively in Docker
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
