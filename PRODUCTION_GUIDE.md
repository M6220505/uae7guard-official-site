# Production Guide

## Build and Start

```bash
npm ci
npm run selfhost:check
npm run build
npm run lint:ci
npm run typecheck
npm run test:security-smoke
npm start
```

## Required Environment Variables

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_ALCHEMY_API_KEY`
- `ANALYZE_API_KEY` (set for protected deployments)
- `ANALYZE_ADMIN_KEY` (required for protected usage/admin metadata)
- `ANALYZE_REQUIRE_ADMIN_KEY_IN_PRODUCTION=true`

## Optional Threat Intelligence Keys

- `FORTA_API_KEY`
- `FORTA_API_URL`
- `FORTA_TIMEOUT_MS`
- `FORTA_ALERT_LIMIT`
- `CHAINALYSIS_API_KEY`
- `ETHERSCAN_API_KEY`
- `THREAT_INTEL_URL`
- `THREAT_INTEL_BEARER_TOKEN`

## Optional Simulation Runtime Keys

- `SIM_RPC_URL` (global fallback RPC)
- `SIM_RPC_URL_<CHAIN_ID>` (for example `SIM_RPC_URL_1`, `SIM_RPC_URL_8453`)
- `SIM_RPC_TIMEOUT_MS`
- `SIM_TRACE_TIMEOUT_SECONDS`
- `ANALYZE_ALLOW_CLIENT_SIMULATION` (keep `false` in production unless explicitly needed)

## Optional Multi-tenant Keys

- `ANALYZE_TENANTS_JSON` (array of tenant API configs)
- `ANALYZE_DEFAULT_DAILY_QUOTA`
- `ANALYZE_RATE_LIMIT_PREFIX`
- `ANALYZE_QUOTA_PREFIX`
- `ANALYZE_REDIS_REST_URL` + `ANALYZE_REDIS_REST_TOKEN` (recommended for multi-instance)
- `ANALYZE_ALERT_WEBHOOK_URL` (+ optional `ANALYZE_ALERT_WEBHOOK_BEARER_TOKEN`)
- `ANALYZE_ALERT_TIMEOUT_MS`
- `ANALYZE_ALERT_RATE_LIMIT_SAMPLE`
- `ANALYZE_ALERT_SUPPRESS_WINDOW_MS`
- `ANALYZE_ALERT_SERVICE_NAME`
- `ANALYZE_ALLOW_UNAUTH_TENANT_HEADER=false` (recommended)
- `ANALYZE_EXPOSE_SERVER_ERRORS=false` (recommended)
- `ANALYZE_ADMIN_SESSION_MAX_AGE_SECONDS`

## Security Checklist

- Enable HTTPS on your hosting provider.
- Restrict secrets to server-side environments.
- Add request-rate limits to `/api/analyze` at edge/proxy layer.
- Keep in-app API rate limits enabled as a second guardrail (use Redis backend in production clusters).
- Keep server-side simulation enabled on trusted RPCs for pre-sign decisions.
- Enforce tenant quotas and keep `/api/usage` and `GET /api/analyze` admin-protected.
- Route security alerts to SIEM/webhook for `auth_error`, `rate_limited`, `quota_blocked`, and `server_error`.
- Enable observability (logs + alerting) for API failures.
- Monitor `GET /api/health` from your container platform or load balancer.
- Rotate keys periodically.

## Branch Protection

- In GitHub repository settings, enable branch protection for `main`.
- Require pull requests before merge.
- Require status checks before merge.
- Add required status check: `security-and-dataset`.
- Add required status check: `lint-and-typecheck`.

## Monitoring

Track:

- API error rate (`/api/analyze`)
- Health status (`/api/health`)
- p95 latency for risk analysis
- build and runtime warnings
- wallet connection success rate

## Recommended Headers

The app already sets baseline security headers in `next.config.ts`.
Optionally enforce stricter values on hosting/CDN:

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` tuned for your deployed domains
