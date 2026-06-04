# Deployment Commands

## Docker (recommended)

```bash
cp .env.example .env.local
docker compose up -d --build
```

## Direct (no Docker)

```bash
npm ci
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js
```

## Managed Platforms

Any container platform works (Railway, Render, Fly.io, DigitalOcean App Platform, Google Cloud Run, AWS):

1. Connect the GitHub repo.
2. Set env vars from `.env.example`.
3. Deploy (auto-detects Dockerfile).

## Custom Domain

Put Nginx/Caddy/Traefik in front for TLS and a domain.
