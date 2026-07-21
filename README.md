# UAE7Guard Official Website

🛡️ **Enterprise-grade Web3 Security Platform V2.5**

Production-ready official website for UAE7Guard featuring real-time blockchain transaction risk analysis with transparent risk scoring, live blockchain context, and pre-sign transaction warnings.

> 🚀 **Non-Vercel launch path**: Use the [Non-Vercel Production Deployment Guide](./docs/non-vercel-deployment.md) for Render, Railway, Docker, DigitalOcean, AWS, or a VPS.

## 🚀 V2.5 NEW FEATURES

1. **Web3 Wallet Integration** - RainbowKit/Wagmi for MetaMask, Phantom, and 100+ wallets
2. **Automated Notification Engine** - Telegram/Discord webhooks for real-time threat alerts
3. **Live Threat Database** - External API integration (Forta, Chainalysis, Etherscan)
4. **Professional Arabic i18n** - Full RTL support with comprehensive localization
5. **Transaction Simulator** - Pre-sign analysis with plain-language explanations

📖 **[Read the Complete V2.5 Upgrade Guide](./V2.5_UPGRADE_GUIDE.md)**

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to view the site.

## ✨ Features

### Core V2.5 Features
- **Web3 Wallet Integration**: Connect MetaMask, Phantom, and 100+ wallets via RainbowKit
- **Notification Engine**: Real-time Telegram/Discord webhook alerts
- **Transaction Simulator**: Pre-sign transaction analysis with risk detection
- **Live Threat Feed**: Real-time threat intelligence from external APIs
- **External API Integration**: Forta Network, Chainalysis, Etherscan intelligence
- **Full Arabic i18n**: Professional localization with RTL layout support
- **Multi-language Support**: Seamless English ↔ Arabic switching

### Hero Section
- High-impact landing with animated gradients
- Evidence-based performance metrics with transparent confidence and data-quality limits
- Responsive CTAs and scroll indicators

### Security Scanner Portal
- **Live Risk Analysis**: Instant Ethereum address scanning
- **Interactive UI**: Real-time results with detailed breakdowns
- **Multi-layer Detection**: Address poisoning, contract safety, threat scoring
- **Transparent Metrics**: Confidence levels and risk component visualization

### Service Modules
1. **Address Poisoning Defense**
   - Levenshtein distance algorithm
   - Explainable similarity scoring with tunable thresholds
   - Prefix/suffix similarity detection

2. **Smart Contract Auditing**
   - Bytecode analysis for dangerous opcodes
   - Reentrancy vulnerability scanning
   - explainable detection for known high-risk patterns

3. **Real-time Risk Scoring**
   - 5 threat category classification
   - Dynamic weight adjustment
   - Multi-vector threat intelligence

### Technical Architecture
- Visual pipeline diagrams
- Performance metrics dashboard
- Integration code examples
- Full tech stack breakdown

## 🏗️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Web3**: RainbowKit + Wagmi + Viem
- **i18n**: next-intl with RTL support
- **Risk Engine**: Custom optimized JavaScript engine with external API integration

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── analyze/route.ts         # Core risk analysis API endpoint
│   │   └── analyze-web3/route.ts    # Connected wallet analysis endpoint
│   ├── dashboard/page.tsx           # Security dashboard
│   ├── developers/page.tsx          # Developer portal
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout (Navigation + app providers)
│   └── page.tsx                     # Homepage
├── components/
│   ├── sections/                    # Page sections (Hero, Scanner, etc.)
│   ├── Navigation.tsx               # Main navigation + wallet connect
│   ├── Web3WalletAnalyzer.tsx       # Wallet risk analysis UI
│   ├── TransactionSimulator.tsx     # Pre-sign analysis
│   └── NotificationSettings.tsx     # Telegram/Discord config
├── lib/
│   ├── optimized_risk_engine.js     # Risk engine + detection modules
│   ├── web3-provider.tsx            # RainbowKit/Wagmi provider
│   ├── wagmi.ts                     # Wagmi config helper
│   └── language-context.tsx         # Language/RTL context
├── messages/
│   ├── en.json                      # English translations
│   └── ar.json                      # Arabic translations
├── V2.5_UPGRADE_GUIDE.md
└── PRODUCTION_GUIDE.md
```

## 🔧 Risk Engine

The core security engine (`lib/optimized_risk_engine.js`) provides:

- **Transparent risk scoring** across supported threat categories
- **Provider-dependent latency** for live RPC/explorer assessment
- **External API Integration**: Forta Network, Chainalysis, Etherscan
- **Intelligent Caching**: 1-hour TTL for external API responses
- **5 threat types**: Direct Blacklist, Smart Contract, Address Poisoning, Flash Loan, Standard
- **Multi-vector analysis**: Age, Activity, Value, Pattern, Threat, External Intelligence
- **Confidence scoring**: Transparent reliability metrics
- **Graceful Degradation**: Continues functioning if external APIs fail

### API Usage

```typescript
POST /api/analyze
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "transactionValue": 1.5,
  "historicalAddresses": [...]
}

// Response
{
  "riskScore": 25,
  "riskLevel": "low",
  "decision": "✅ ALLOW",
  "confidence": 85,
  "threatType": "STANDARD",
  "breakdown": {...},
  "detectionModules": {...}
}
```

## 🌐 Deployment

### Recommended non-Vercel launch

Use [docs/non-vercel-deployment.md](./docs/non-vercel-deployment.md) for Render, Railway, Docker, DigitalOcean/VPS, AWS-style, and PM2 deployment steps.

### Docker quick start

```bash
cp .env.example .env.production
open -e .env.production
docker build -t uae7guard-official-site:test .
docker rm -f uae7guard 2>/dev/null || true
docker run -d --name uae7guard --restart unless-stopped --env-file .env.production -p 3000:3000 uae7guard-official-site:test
```

### Node host quick start

```bash
npm ci
npm run build
npm run start
```

### Environment Variables

Required and optional production variables (add in your host dashboard, Docker env file, or `.env.local`):
```env
# Required for wallet connection
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Recommended for live chain reads
NEXT_PUBLIC_ALCHEMY_API_KEY=your_public_api_key
ALCHEMY_API_KEY=your_server_api_key
ETHERSCAN_API_KEY=your_etherscan_key

# Public MVP rate limit
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX=30
```

Do not set `UAE7GUARD_API_KEY` for the first public frontend MVP unless your frontend/API clients send `x-api-key`.

See `.env.example` for all available options.

### Custom Domain
1. Deploy to Render/Railway/Docker/VPS.
2. Add your custom domain (e.g., `uae7guard.com`).
3. Update DNS records as instructed by your host or reverse proxy.
4. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS domain.

For detailed deployment instructions, see [DEPLOY_COMMANDS.md](./DEPLOY_COMMANDS.md), [docs/non-vercel-deployment.md](./docs/non-vercel-deployment.md), and [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md).

## 🎨 Design System

- **Dark Theme**: Zinc-950 base with emerald/cyan accents
- **Animations**: Framer Motion with optimized performance
- **Responsive**: Mobile-first design with breakpoints
- **Accessibility**: WCAG 2.1 AA compliant

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: <1s
- **Time to Interactive**: <2s
- **Total Bundle Size**: <200KB (gzipped)

## 🔒 Security

- HTTPS enforced (via hosting platform)
- Security headers configured
- Input sanitization
- Rate limiting ready
- CORS configuration

## 📖 Documentation

- [V2.5_UPGRADE_GUIDE.md](./V2.5_UPGRADE_GUIDE.md) - Complete V2.5 feature documentation
- [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) - Deployment and maintenance guide
- `/api/analyze` - Risk analysis endpoint
- Risk engine in `lib/optimized_risk_engine.js`

## 🤝 Contributing

This is a production website. For issues or improvements:

1. Test changes locally
2. Run `npm run build` to verify
3. Submit detailed pull requests

## 📄 License

Proprietary - UAE7Guard © 2025. All rights reserved.

## 🎯 Production Checklist

- [x] Next.js 15+ with TypeScript
- [x] Tailwind CSS v4 configured
- [x] Framer Motion animations
- [x] Risk engine integrated
- [x] API routes functional
- [x] Responsive design
- [x] Production build tested
- [x] Dev server running on port 3000
- [x] Documentation complete
- [x] **V2.5: Web3 wallet integration (RainbowKit/Wagmi)**
- [x] **V2.5: Notification engine (Telegram/Discord)**
- [x] **V2.5: Transaction simulator**
- [x] **V2.5: External threat APIs (Forta/Chainalysis/Etherscan)**
- [x] **V2.5: Full Arabic i18n with RTL support**
- [x] **V2.5: Live threat feed**
- [x] **V2.5: Enhanced dashboard**

## 🚀 Ready for Deployment

This website is production-ready and can be deployed to:
- **Domain**: uae7guard.com (or any custom domain)
- **Platforms**: Render, Railway, Netlify, AWS, Docker, VPS

---

**Built with precision. Secured with excellence.**
