# CLAUDE.md — UAE7Guard Official Site

This file provides guidance for AI assistants working in this codebase.

---

## Project Overview

UAE7Guard is an enterprise Web3 security platform. This repository is its official marketing and product website built with Next.js 15. It showcases features including AI-powered wallet monitoring, risk analysis, transaction simulation, multi-chain support, and NFT risk analysis. The site is bilingual (English/Arabic) with full RTL layout support.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js ^15.1.0 (App Router) |
| Language | TypeScript ^5.9.3 |
| UI Library | React ^18.3.1 |
| Styling | Tailwind CSS ^4.1.18 + tailwindcss-rtl |
| Animations | Framer Motion ^12.34.0 |
| Web3 | RainbowKit ^2.2.10, Wagmi ^2.19.5, Viem ^2.46.1 |
| i18n | next-intl ^4.8.2 |
| Data fetching | TanStack React Query ^5.90.21 |
| Fonts | Geist Sans, Geist Mono (Google Fonts via next/font) |

---

## Repository Structure

```
/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── analyze/route.ts        # Wallet risk analysis API
│   │   └── analyze-web3/route.ts   # Web3-specific analysis API
│   ├── dashboard/page.tsx          # Security dashboard page
│   ├── developers/page.tsx         # Developer API docs page
│   ├── globals.css                 # Global styles, RTL support
│   ├── layout.tsx                  # Root layout (providers + nav)
│   └── page.tsx                    # Homepage (section composition)
│
├── components/
│   ├── ConnectWalletButton.tsx     # RainbowKit wallet UI
│   ├── LanguageSwitcher.tsx        # EN/AR toggle
│   ├── Navigation.tsx              # Top nav bar
│   ├── NotificationSettings.tsx    # Telegram/Discord config
│   ├── Providers.tsx               # Client-side provider wrapper
│   ├── TransactionSimulator.tsx    # Pre-sign transaction analyzer
│   ├── Web3WalletAnalyzer.tsx      # Connected wallet risk analyzer
│   └── sections/                   # Homepage section components
│       ├── AIScamDetection.tsx
│       ├── Footer.tsx
│       ├── Hero.tsx
│       ├── MultiChainSupport.tsx
│       ├── NFTRiskAnalysis.tsx
│       ├── SecureEscrow.tsx
│       ├── SecurityScanner.tsx
│       ├── ServiceModules.tsx
│       ├── TechnicalArchitecture.tsx
│       └── WalletMonitoring.tsx
│
├── lib/
│   ├── language-context.tsx        # Language context provider (EN/AR)
│   ├── optimized_risk_engine.js    # Core risk scoring engine (~30KB)
│   ├── wagmi.ts                    # Wagmi client configuration
│   └── web3-provider.tsx           # RainbowKit + Wagmi provider setup
│
├── messages/
│   ├── en.json                     # English translations
│   └── ar.json                     # Arabic translations
│
├── public/                         # Static assets (SVGs)
├── .env.example                    # Required environment variables
├── eslint.config.mjs               # ESLint flat config
├── next.config.mjs                 # Next.js config (security headers)
├── postcss.config.mjs              # PostCSS config
├── tailwind.config.mjs             # Tailwind config (custom theme)
└── tsconfig.json                   # TypeScript config
```

---

## Development Workflow

### Prerequisites

- Node.js (LTS recommended)
- npm

### Setup

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with real API keys (see Environment Variables below)
```

### Available Scripts

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

There are no test scripts configured. `npm run build` is the primary verification step — always run it after making changes.

---

## Environment Variables

Defined in `.env.example`. Create `.env.local` locally (never commit it).

```env
# Web3 Providers
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=  # WalletConnect project ID (required)
NEXT_PUBLIC_ALCHEMY_API_KEY=          # Alchemy API key for RPC transports (optional)

# Notification Engine
TELEGRAM_BOT_TOKEN=                   # Telegram bot token
TELEGRAM_CHAT_ID=                     # Telegram chat/channel ID

# Threat Intelligence
FORTA_API_KEY=                        # Forta threat intelligence API key

# App Settings
NEXT_PUBLIC_APP_URL=https://uae7guard.com
```

`NEXT_PUBLIC_*` variables are exposed to the browser. All others are server-side only.

---

## Key Conventions

### TypeScript

- Strict mode is enabled (`"strict": true` in tsconfig.json).
- Path alias `@/*` maps to the project root — use `@/components/...`, `@/lib/...`, etc.
- `allowJs: true` — `lib/optimized_risk_engine.js` is plain JS and intentionally not converted.

### Component Architecture

- **App Router only** — no Pages Router. All routes live under `app/`.
- **Client components** that use hooks, browser APIs, or Web3 must be marked `"use client"`.
- **`Providers.tsx`** wraps all client-side context providers and is imported in `app/layout.tsx`.
- **Section components** in `components/sections/` are composed in `app/page.tsx` for the homepage.

### Styling

- **Tailwind CSS v4** — use utility classes. No CSS Modules or styled-components.
- **Custom design tokens** (defined in `tailwind.config.mjs`):
  - Colors: `uae-gold`, `uae-red`, `cyber-blue`, `cyber-purple`, `dark-bg`, `dark-surface`, `dark-elevated`
  - Animations: `pulse-slow`, `glow`, `scan`
  - Background: `cyber-grid` radial gradient
- **RTL support** via `tailwindcss-rtl` — use `ms-*`/`me-*` (margin-start/end) and `ps-*`/`pe-*` (padding-start/end) for directional spacing instead of `ml-*`/`mr-*`.
- Dark theme is the default visual style.

### Internationalization (i18n)

- Translations live in `messages/en.json` and `messages/ar.json`.
- `lib/language-context.tsx` provides `useLanguage()` hook with `{ language, setLanguage, t }`.
- `t('key')` resolves translation strings from the active locale.
- When adding new UI text, add corresponding keys to **both** `en.json` and `ar.json`.
- RTL layout is toggled dynamically based on the active language (`dir="rtl"` for Arabic).

### Web3 Integration

- Wallet connection is handled by **RainbowKit** + **Wagmi** configured in `lib/web3-provider.tsx` and `lib/wagmi.ts`.
- Supported chains and transport providers are configured in `lib/wagmi.ts`.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` must be set for wallet connection; `NEXT_PUBLIC_ALCHEMY_API_KEY` is optional and enables Alchemy-backed RPC transports for supported chains.

### API Routes

- `app/api/analyze/route.ts` — accepts a wallet address and returns a risk assessment using `lib/optimized_risk_engine.js`.
- `app/api/analyze-web3/route.ts` — Web3-specific variant of the analysis endpoint.
- Both are Next.js Route Handlers (not Pages API routes).

### Risk Engine

- `lib/optimized_risk_engine.js` is the core threat analysis module (~30KB plain JS).
- It includes `ExternalThreatAPIManager` which integrates with Forta, Chainalysis, and Etherscan APIs.
- Results are cached with a 1-hour TTL.
- Handles address poisoning detection, smart contract safety analysis, and multi-vector threat scoring.

### Security Headers

Configured in `next.config.mjs` and applied to all routes (`/:path*`):
- `Strict-Transport-Security` (HSTS, 2-year max-age)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

Do not remove or weaken these headers.

---

## Adding New Features

### New Page

1. Create `app/<route>/page.tsx`.
2. If the page uses client APIs, add `"use client"` or extract client logic into a child component.
3. Add translations for any new text in both `messages/en.json` and `messages/ar.json`.

### New Section Component

1. Create `components/sections/MySection.tsx`.
2. Import and add it to `app/page.tsx` in the appropriate position.
3. Use existing custom color tokens and RTL-safe spacing utilities.

### New Translation Key

1. Add the key/value to `messages/en.json`.
2. Add the Arabic translation to `messages/ar.json`.
3. Access it in components via `const { t } = useLanguage(); t('my.key')`.

### New API Route

1. Create `app/api/<name>/route.ts` using Next.js Route Handler conventions.
2. Export named functions `GET`, `POST`, etc.
3. Server-only env vars (no `NEXT_PUBLIC_` prefix) are safe to use here.

---

## Deployment

The application targets **Vercel** as the primary deployment platform. It can also be deployed to Netlify, Docker, AWS, or a VPS.

- Run `npm run build` locally to verify the build before pushing.
- All 11 pages should generate statically during the build.
- Set all environment variables from `.env.example` in the hosting platform's environment settings.
- Never commit `.env.local` or any file containing real secrets.

---

## Git Branches

- `main` / `master` — production branch
- `claude/*` — AI-assistant working branches (follow naming convention `claude/<session-id>`)

When working as an AI assistant, develop on the designated `claude/` branch and push there. Never push directly to `main`.
