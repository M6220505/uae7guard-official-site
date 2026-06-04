# Self-Hosting Guide

UAE7Guards is a server-rendered Next.js 16 app with API routes (`/api/analyze`,
`/api/usage`, `/api/admin/session`) and `proxy.ts` i18n routing, so it needs a
**Node runtime** — not a static-only host. The project is configured with
`output: "standalone"`, which produces a self-contained `server.js` (~55 MB)
that runs the same way everywhere below.

## Option A — Docker (works on any host)

This is the portable path. Build once, run anywhere.

```bash
cp .env.example .env.local        # fill in production secrets
docker build -t uae7guards .
docker run -p 3000:3000 --env-file .env.local uae7guards
```

Or with Compose (adds a healthcheck + auto-restart):

```bash
docker compose up -d --build
docker compose ps
```

App is then on `http://localhost:3000`. Put a reverse proxy (Nginx / Caddy /
Traefik) in front for TLS and a domain. The included `Dockerfile` is a
multi-stage build that runs as a non-root user and ships only runtime files.

The Compose file will boot even if `.env.local` is missing. For production,
create `.env.local` from `.env.example` and set real secrets before exposing the
service to users.

## Option B — Run directly on a VPS (no Docker)

On any Linux box (Hetzner, DigitalOcean Droplet, AWS Lightsail, a UAE host,
etc.) with Node 20+:

```bash
npm ci
npm run build
# standalone output needs static assets copied next to server.js:
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js
```

Keep it alive with `pm2` or a systemd unit, and front it with Nginx/Caddy for
HTTPS. (Plain `npm run start` also works but ships a larger footprint.)

## Option C — Managed container platforms (closest to "git push and done")

Any of these take the Dockerfile (or autodetect Next.js) — pick one:

- **Railway** — connect the repo, set env vars, deploy. Detects the Dockerfile.
- **Render** — "New Web Service", Docker runtime, set env, deploy.
- **DigitalOcean App Platform** — points at the repo, builds the container.
- **Fly.io** — `fly launch` detects Next.js / the Dockerfile, then `fly deploy`.
- **Google Cloud Run** — push the image to Artifact Registry, deploy; great for
  scale-to-zero. (Set min instances > 0 if you want to avoid cold starts.)
- **AWS App Runner / ECS Fargate**, **Azure Container Apps** — same image.

For all of these: set the variables from `.env.example` as the platform's
secrets/env, and expose port **3000**.

## Required vs optional environment

Minimum to run: nothing — it boots and serves with no keys.

For production hardening, set these (see `.env.example` for the full list):

- `ANALYZE_ADMIN_KEY` — protects `/api/usage` and the analyze metadata endpoint.
- `ANALYZE_TENANTS_JSON` — per-tenant API keys + quotas (omit for single-tenant).
- `ANALYZE_REDIS_REST_URL` / `ANALYZE_REDIS_REST_TOKEN` — Upstash-style REST
  Redis for **distributed** rate limiting/quotas across multiple instances. If
  you run more than one container/replica, set these; otherwise each instance
  uses its own in-memory limiter.
- `SIM_RPC_URL` / `SIM_RPC_URL_<chainId>` — only needed if you want the live
  transaction simulator (requires an RPC that supports `debug_traceCall`).
  Without them the simulator gracefully skips.

## Notes

- Run `node server.js` (standalone), **not** `npm start`, inside containers.
- Health: `GET /api/health` returns 200 when the app runtime is healthy.
- This app does not use `next/image`, so `sharp` is not required. If you later
  add optimized images, install `sharp` in the runner stage of the Dockerfile.
- API metadata endpoints intentionally return 401/503 until an admin key is
  configured.

## Release checks

Run these before shipping a new archive:

```bash
npm ci
npm run selfhost:check
npm run lint:ci
npm run typecheck
npm run build
npm run test:security-smoke
```

If you are checking the package without network access, `npm run selfhost:check`,
`npm run dataset:validate`, and `npm run dataset:evaluate` still work offline.
