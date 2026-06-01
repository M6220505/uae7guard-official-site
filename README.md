# UAE7Guard Official Website

Enterprise-grade Web3 Security Platform V2.5.

Production-ready website for UAE7Guard featuring real-time blockchain transaction risk analysis with deterministic scoring, transparent confidence, and low-latency API responses.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fuae7guard-official-site&env=NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,NEXT_PUBLIC_ALCHEMY_API_KEY&envDescription=Required%20API%20keys%20for%20Web3%20functionality&envLink=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fuae7guard-official-site%2Fblob%2Fmain%2F.env.example&project-name=uae7guard-official-site&repository-name=uae7guard-official-site)

> Note: Replace `YOUR_USERNAME` in the Deploy button URL after creating your GitHub repository.

## V2.5 Features

- Web3 wallet integration via Wagmi (browser-injected wallets)
- Transaction simulator with pre-sign risk analysis
- Notification settings for Telegram/Discord webhook flows
- Live threat feed surface on dashboard
- External threat intelligence hooks (Forta, Chainalysis, Etherscan)
- Arabic localization with RTL support
- `/api/analyze` endpoint backed by optimized risk engine
- Phase-1 API hardening (payload validation, rate limiting, optional API key, telemetry)
- Phase-2 server-side pre-sign simulation (`eth_call` + `debug_traceCall`)
- Phase-3 tenant API keys, daily quotas, usage dashboard, and Forta ingestion
- Phase-4 admin session hardening for usage surfaces and metadata endpoints
- Optional distributed Redis-backed rate limiting and quota controls
- Optional SIEM/webhook security alerts for auth/rate-limit/server failures

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm start        # Run production server
npm run lint     # Biome lint
npm run typecheck # TypeScript check
npm run test:security-smoke # End-to-end API security smoke tests
npm run dataset:validate  # Validate NDJSON labels
npm run dataset:evaluate  # Compute precision/recall/FPR from labels
```

## CI

- GitHub Actions workflow: `.github/workflows/security-smoke.yml`
- GitHub Actions workflow: `.github/workflows/lint-typecheck.yml`
- Runs on every pull request and on pushes to `main`
- Executes `npm run build`
- Executes `npm run test:security-smoke`
- Executes `npm run dataset:validate`
- Executes `node scripts/evaluate_labels.mjs` and uploads `dataset-evaluation` artifact
- Executes `npm run lint:ci`
- Executes `npm run typecheck`
- Recommended branch protection: require status check `security-and-dataset`
- Recommended branch protection: require status check `lint-and-typecheck`

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Wagmi + Viem
- next-intl (English + Arabic, RTL)

## Project Structure

```text
app/
  [locale]/
    page.tsx
    dashboard/page.tsx
    developers/page.tsx
    layout.tsx
  api/analyze/route.ts
  globals.css
  layout.tsx
components/
  sections/
  ConnectWalletButton.tsx
  LanguageSwitcher.tsx
  Navigation.tsx
  NotificationSettings.tsx
  TransactionSimulator.tsx
  Web3WalletAnalyzer.tsx
lib/
  optimized_risk_engine.js
  wagmi.ts
  web3-provider.tsx
messages/
  en.json
  ar.json
middleware.ts
i18n.ts
```

## Risk Engine Output

`POST /api/analyze`

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "from": "0x1111111111111111111111111111111111111111",
  "chainId": 1,
  "data": "0x095ea7b3000000000000000000000000...",
  "transactionValue": 1.5,
  "historicalAddresses": ["0x1111111111111111111111111111111111111111"],
  "externalSignals": [
    {"source": "forta-bot-123", "severity": "high", "id": "alert-7781"}
  ]
}
```

Response example:

```json
{
  "riskScore": 25,
  "riskLevel": "low",
  "decision": "ALLOW",
  "confidence": 87,
  "threatType": "STANDARD",
  "latencyMs": 32,
  "breakdown": {},
  "evidence": [],
  "simulation": {
    "status": "ok",
    "source": "server",
    "summary": {
      "reverted": false,
      "delegateCallDetected": false
    }
  },
  "requestId": "req_..."
}
```

`GET /api/analyze` returns health metadata including policy version, simulation runtime, tenant runtime, and telemetry (admin-protected).

`GET /api/usage` returns detailed tenant usage + evaluation metrics (admin-protected in production).

`POST /api/admin/session` accepts `{ "adminKey": "..." }` and creates an HttpOnly admin session cookie for protected UI routes.

When `ANALYZE_ALERT_WEBHOOK_URL` is configured, `/api/analyze` sends security alerts for:
- `auth_error`
- `rate_limited` (sampled to reduce noise)
- `quota_blocked`
- `server_error`

## Environment Variables

Copy `.env.example` to `.env.local` and set values:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEXT_PUBLIC_ALCHEMY_API_KEY=...
ANALYZE_API_KEY=
ANALYZE_ADMIN_KEY=
ANALYZE_REQUIRE_ADMIN_KEY_IN_PRODUCTION=true
ANALYZE_ADMIN_SESSION_MAX_AGE_SECONDS=28800
ANALYZE_TENANTS_JSON=
ANALYZE_RATE_LIMIT_WINDOW_MS=60000
ANALYZE_RATE_LIMIT_MAX_REQUESTS=60
ANALYZE_RATE_LIMIT_PREFIX=analyze:rl
ANALYZE_DEFAULT_DAILY_QUOTA=10000
ANALYZE_QUOTA_PREFIX=analyze:quota
ANALYZE_ALLOW_UNAUTH_TENANT_HEADER=false
ANALYZE_EXPOSE_SERVER_ERRORS=false
ANALYZE_MAX_BODY_BYTES=32768
ANALYZE_ALLOW_CLIENT_SIMULATION=false
ANALYZE_REDIS_REST_URL=
ANALYZE_REDIS_REST_TOKEN=
ANALYZE_ALERT_WEBHOOK_URL=
ANALYZE_ALERT_WEBHOOK_BEARER_TOKEN=
ANALYZE_ALERT_TIMEOUT_MS=1200
ANALYZE_ALERT_RATE_LIMIT_SAMPLE=0.2
ANALYZE_ALERT_SUPPRESS_WINDOW_MS=30000
ANALYZE_ALERT_SERVICE_NAME=uae7guard-analyze-api
SIM_RPC_URL=
SIM_RPC_URL_1=
SIM_RPC_URL_42161=
SIM_RPC_URL_8453=
SIM_RPC_TIMEOUT_MS=3000
SIM_TRACE_TIMEOUT_SECONDS=2
FORTA_API_KEY=
FORTA_API_URL=https://api.forta.network/graphql
FORTA_TIMEOUT_MS=1800
FORTA_ALERT_LIMIT=15
CHAINALYSIS_API_KEY=
ETHERSCAN_API_KEY=
THREAT_INTEL_URL=
THREAT_INTEL_BEARER_TOKEN=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
DISCORD_WEBHOOK_URL=
```

## Deployment

See:

- `DEPLOY_COMMANDS.md`
- `PRODUCTION_GUIDE.md`
- `V2.5_UPGRADE_GUIDE.md`

## License

Proprietary - UAE7Guard © 2025. All rights reserved.
