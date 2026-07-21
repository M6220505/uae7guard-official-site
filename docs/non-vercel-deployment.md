# Non-Vercel Production Deployment Guide

Use this guide when you want UAE7Guard live on Render, Railway, DigitalOcean, AWS, a VPS, or any Docker host instead of Vercel.

## Recommended first launch path

For the fastest non-Vercel launch, use **Render Web Service** or **Railway** with the normal Node.js commands:

```bash
npm ci
npm run build
npm run start
```

Set the service port to `3000` or use the platform-provided `PORT` variable.

## Required Phase 1 environment variables

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ALCHEMY_API_KEY=your_public_alchemy_key
ALCHEMY_API_KEY=your_server_side_alchemy_key
ETHERSCAN_API_KEY=your_etherscan_key
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX=30
```

For the public website MVP, do **not** set `UAE7GUARD_API_KEY` unless your frontend or API clients are ready to send an `x-api-key` header.

## Option A: Render

1. Create a new **Web Service** from the GitHub repository.
2. Runtime: **Node**.
3. Build command:
   ```bash
   npm ci && npm run build
   ```
4. Start command:
   ```bash
   npm run start
   ```
5. Add the Phase 1 environment variables above.
6. Add your custom domain in Render and update `NEXT_PUBLIC_APP_URL` to that domain.

## Option B: Railway

1. Create a new Railway project from the GitHub repository.
2. Set build command:
   ```bash
   npm ci && npm run build
   ```
3. Set start command:
   ```bash
   npm run start
   ```
4. Add the Phase 1 environment variables.
5. Generate or attach a custom domain and update `NEXT_PUBLIC_APP_URL`.

## Option C: Docker host / VPS / DigitalOcean Droplet

> macOS note: `apt-get` is Linux-only. On a Mac, install/start Docker Desktop first, then run the Docker commands below from the project folder.

1. Copy `.env.example` to `.env.production` and fill the Phase 1 variables.
   ```bash
   cp .env.example .env.production
   open -e .env.production
   ```
2. Build the image. The `:test` tag matches the run command below.
   ```bash
   docker build -t uae7guard-official-site:test .
   ```
3. Run it.
   ```bash
   docker rm -f uae7guard 2>/dev/null || true
   docker run -d --name uae7guard --restart unless-stopped \
     --env-file .env.production \
     -p 3000:3000 \
     uae7guard-official-site:test
   ```
4. Open `http://localhost:3000` locally, or put Nginx, Caddy, or Cloudflare Tunnel in front of port `3000` for HTTPS.

### Docker Compose

Some Docker installs include the Compose v2 plugin (`docker compose`). Older installs only include the legacy binary (`docker-compose`). Check first:

```bash
docker compose version
```

If that works, run:

```bash
cp .env.example .env.production
open -e .env.production
docker compose -f docker-compose.example.yml up -d --build
```

If `docker compose` prints `unknown command` or `unknown shorthand flag: 'f'`, use the plain `docker build`/`docker run` commands above, or install/enable Docker Compose in Docker Desktop.

## Option D: PM2 on a VPS

```bash
npm ci
npm run build
npm install -g pm2
pm2 start npm --name uae7guard -- run start
pm2 save
pm2 startup
```

Use Nginx or Caddy as a reverse proxy to `http://127.0.0.1:3000`.

## Post-deploy smoke tests

Replace `https://your-domain.com` with your live domain:

```bash
curl -I https://your-domain.com/
curl -X POST https://your-domain.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"address":"0x000000000000000000000000000000000000dEaD","chainId":1}'
curl -X POST https://your-domain.com/api/scam-detect \
  -H "Content-Type: application/json" \
  -d '{"text":"urgent claim verify wallet seed phrase telegram","url":"https://wallet-airdrop-verify.example"}'
```

## Production notes

- Use HTTPS before sharing the site publicly.
- Keep private server-side keys out of client-side variables.
- Add `UAE7GUARD_API_KEY` only for protected API/customer access, not for the first public frontend-only MVP.
- If you run multiple Node instances, replace in-memory rate limiting with Redis or a managed rate-limiting service.
