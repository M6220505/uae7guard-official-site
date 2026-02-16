'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function DevelopersPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const codeExamples = {
    javascript: `// Install UAE7Guard SDK
npm install @uae7guard/security-api

// Initialize the client
import { UAE7Guard } from '@uae7guard/security-api';

const guard = new UAE7Guard({
  apiKey: process.env.UAE7GUARD_API_KEY,
  network: 'ethereum' // ethereum, solana, polygon, bnb
});

// Analyze an address
async function checkAddress(address: string) {
  try {
    const analysis = await guard.analyze.address(address);

    console.log(\`Risk Score: \${analysis.riskScore}\`);
    console.log(\`Risk Level: \${analysis.riskLevel}\`);

    if (analysis.riskLevel === 'critical' || analysis.riskLevel === 'high') {
      console.warn('⚠️ High risk detected!');
      // Block transaction or show warning
    }

    return analysis;
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

// Monitor a wallet
const monitor = guard.monitor.wallet(walletAddress, {
  alerts: ['suspicious_approval', 'high_risk_interaction'],
  callback: (alert) => {
    console.log('🚨 Alert:', alert);
    // Send notification to user
  }
});

// Check NFT collection
const nftAnalysis = await guard.analyze.nftCollection({
  address: collectionAddress,
  network: 'ethereum'
});`,
    python: `# Install UAE7Guard SDK
pip install uae7guard

# Initialize the client
from uae7guard import UAE7Guard

guard = UAE7Guard(
    api_key=os.environ['UAE7GUARD_API_KEY'],
    network='ethereum'
)

# Analyze an address
def check_address(address: str):
    try:
        analysis = guard.analyze.address(address)

        print(f"Risk Score: {analysis.risk_score}")
        print(f"Risk Level: {analysis.risk_level}")

        if analysis.risk_level in ['critical', 'high']:
            print('⚠️ High risk detected!')
            # Block transaction or show warning

        return analysis
    except Exception as e:
        print(f'Analysis failed: {e}')

# Monitor a wallet
monitor = guard.monitor.wallet(
    wallet_address,
    alerts=['suspicious_approval', 'high_risk_interaction'],
    callback=lambda alert: print(f'🚨 Alert: {alert}')
)

# Check NFT collection
nft_analysis = guard.analyze.nft_collection(
    address=collection_address,
    network='ethereum'
)`,
    curl: `# Analyze an address
curl -X POST https://api.uae7guard.com/v2/analyze/address \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "network": "ethereum",
    "options": {
      "includeHistory": true,
      "checkNFTs": true
    }
  }'

# Response (sub-100ms)
{
  "riskScore": 25,
  "riskLevel": "low",
  "confidence": 85,
  "threatType": "STANDARD",
  "decision": "ALLOW",
  "recommendation": "LOW RISK - Proceed with standard protocols",
  "breakdown": {
    "ageComponent": 5,
    "activityComponent": 8,
    "valueComponent": 3,
    "patternComponent": 6,
    "threatComponent": 3
  },
  "detectionModules": {
    "addressPoisoning": { "risk": "low" },
    "contractSafety": { "risk": "low" }
  },
  "processingTime": "87ms"
}`
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm">
              <span className="text-cyan-400 text-sm font-medium">⚡ Sub-100ms Response Time</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-600">
              Security API for Developers
            </h1>

            <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-12">
              Integrate enterprise-grade Web3 security into your application with our high-performance API.
              Production-ready, battle-tested, and trusted by leading protocols.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#quickstart"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold text-black hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transition-all duration-300"
              >
                Get Started
              </a>
              <a
                href="#docs"
                className="px-8 py-4 bg-zinc-800 border border-zinc-700 rounded-lg font-semibold text-white hover:bg-zinc-700 transition-all duration-300"
              >
                View Documentation
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {[
              { value: '<100ms', label: 'Average Response' },
              { value: '99.99%', label: 'Uptime SLA' },
              { value: '10M+', label: 'API Calls/Day' },
              { value: '24/7', label: 'Support' }
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">{stat.value}</div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quickstart" className="py-24 px-6 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Quick Start Guide
            </h2>
            <p className="text-xl text-zinc-400">
              Get up and running in less than 5 minutes
            </p>
          </motion.div>

          {/* Language selector */}
          <div className="flex justify-center gap-4 mb-8">
            {['javascript', 'python', 'curl'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  selectedLanguage === lang
                    ? 'bg-cyan-500 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>

          {/* Code example */}
          <motion.div
            key={selectedLanguage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="absolute top-4 right-4 z-10">
              <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-400 transition-colors">
                Copy Code
              </button>
            </div>
            <pre className="p-8 rounded-2xl bg-zinc-950 border border-cyan-500/20 overflow-x-auto">
              <code className="text-sm text-cyan-400 font-mono">
                {codeExamples[selectedLanguage as keyof typeof codeExamples]}
              </code>
            </pre>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              API Capabilities
            </h2>
            <p className="text-xl text-zinc-400">
              Everything you need to secure your Web3 application
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔍',
                title: 'Address Analysis',
                description: 'Real-time risk assessment for any blockchain address',
                endpoint: '/v2/analyze/address'
              },
              {
                icon: '📋',
                title: 'Smart Contract Audit',
                description: 'Automated security audit for contract bytecode',
                endpoint: '/v2/analyze/contract'
              },
              {
                icon: '🎨',
                title: 'NFT Collection Scan',
                description: 'Rug-pull detection and authenticity verification',
                endpoint: '/v2/analyze/nft'
              },
              {
                icon: '🔔',
                title: 'Wallet Monitoring',
                description: 'Real-time alerts for suspicious activities',
                endpoint: '/v2/monitor/wallet'
              },
              {
                icon: '🔄',
                title: 'Transaction Screening',
                description: 'Pre-transaction risk assessment',
                endpoint: '/v2/screen/transaction'
              },
              {
                icon: '🌐',
                title: 'Multi-Chain Support',
                description: 'Works across Ethereum, Solana, Polygon, BNB',
                endpoint: '/v2/*'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 mb-4">{feature.description}</p>
                <code className="text-xs text-cyan-400 bg-zinc-950 px-3 py-1 rounded font-mono">
                  {feature.endpoint}
                </code>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-zinc-400">
              Start free, scale as you grow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Developer',
                price: 'Free',
                description: 'Perfect for testing and small projects',
                features: [
                  '10,000 API calls/month',
                  'All analysis endpoints',
                  'Community support',
                  '99.9% uptime SLA'
                ],
                cta: 'Start Free',
                highlight: false
              },
              {
                name: 'Production',
                price: '$299',
                period: '/month',
                description: 'For production applications',
                features: [
                  '1M API calls/month',
                  'Priority support',
                  '99.99% uptime SLA',
                  'Advanced monitoring',
                  'Custom rate limits'
                ],
                cta: 'Get Started',
                highlight: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large-scale operations',
                features: [
                  'Unlimited API calls',
                  'Dedicated support',
                  '99.995% uptime SLA',
                  'Custom integration',
                  'On-premise deployment'
                ],
                cta: 'Contact Sales',
                highlight: false
              }
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className={`p-8 rounded-2xl ${
                  plan.highlight
                    ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/50'
                    : 'bg-zinc-950 border border-zinc-800'
                } relative`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-cyan-500 text-black text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-cyan-400">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500">{plan.period}</span>}
                </div>
                <p className="text-zinc-400 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                      <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:shadow-[0_0_40px_rgba(34,211,238,0.5)]'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
