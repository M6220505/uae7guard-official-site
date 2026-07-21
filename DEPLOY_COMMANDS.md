# UAE7Guard Non-Vercel Deployment Commands

This project does **not** require Vercel. Use these commands for Render, Railway, Docker, DigitalOcean, AWS, or a VPS.

## Step 1: Verify locally

```bash
npm ci
npm run test:unit
npm run test:e2e
npm run lint
npm run build
```

## Step 2: Push the correct branch

```bash
git status
git log --oneline -n 5
git push origin HEAD
```

## Step 3: Production environment variables

Add these in your platform dashboard or `.env.production` file:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ALCHEMY_API_KEY=your_public_alchemy_key
ALCHEMY_API_KEY=your_server_side_alchemy_key
ETHERSCAN_API_KEY=your_etherscan_key
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX=30
```

Do not set `UAE7GUARD_API_KEY` for the first public frontend MVP unless your frontend/API clients send `x-api-key`.

## Option A: Render or Railway

Build command:

```bash
npm ci && npm run build
```

Start command:

```bash
npm run start
```

Then add the environment variables above and connect your custom domain.

## Option B: Docker

On macOS, use Docker Desktop. Do not run `apt-get`; it is Linux-only.

```bash
cp .env.example .env.production
open -e .env.production
docker build -t uae7guard-official-site:test .
docker rm -f uae7guard 2>/dev/null || true
docker run -d --name uae7guard --restart unless-stopped \
  --env-file .env.production \
  -p 3000:3000 \
  uae7guard-official-site:test
```

Then open `http://localhost:3000`.

## Option C: Docker Compose

Use Compose only if `docker compose version` works. If your Docker install says `unknown command` or `unknown shorthand flag: 'f'`, use Option B instead.

```bash
cp .env.example .env.production
open -e .env.production
docker compose -f docker-compose.example.yml up -d --build
```

## Option D: PM2 on a VPS

```bash
npm ci
npm run build
npm install -g pm2
pm2 start npm --name uae7guard -- run start
pm2 save
pm2 startup
```

Put Nginx, Caddy, Cloudflare Tunnel, or your cloud load balancer in front of port `3000` for HTTPS.

## Smoke tests after deployment

```bash
curl -I https://your-domain.com/
curl -X POST https://your-domain.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"address":"0x000000000000000000000000000000000000dEaD","chainId":1}'
curl -X POST https://your-domain.com/api/scam-detect \
  -H "Content-Type: application/json" \
  -d '{"text":"urgent claim verify wallet seed phrase telegram","url":"https://wallet-airdrop-verify.example"}'
```

## Detailed guide

See [`docs/non-vercel-deployment.md`](./docs/non-vercel-deployment.md).
