'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

type Section = 'overview' | 'analyze' | 'analyze-web3' | 'response' | 'chains';

const CODE_ANALYZE = `// POST /api/analyze
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x742d35Cc6634C0532925a3b8D4C9C5E3C1e9C9E8',
    transactionValue: 1.5,          // optional – ETH value being sent
    historicalAddresses: [           // optional – previously interacted addresses
      '0xabc...',
      '0xdef...',
    ],
  }),
});

const risk = await response.json();
console.log(risk.riskScore);   // 0–100
console.log(risk.riskLevel);   // 'low' | 'moderate' | 'high' | 'critical'`;

const CODE_ANALYZE_WEB3 = `// POST /api/analyze-web3
const response = await fetch('/api/analyze-web3', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x742d35Cc6634C0532925a3b8D4C9C5E3C1e9C9E8',
    balance: '3.2',     // optional – wallet balance in native currency
    chainId: 1,         // optional – defaults to Ethereum mainnet (1)
    historicalAddresses: [],
  }),
});

const risk = await response.json();`;

const RESPONSE_EXAMPLE = `{
  "riskScore": 23,
  "riskLevel": "low",
  "decision": "SAFE TO PROCEED",
  "recommendation": "This address shows no signs of malicious activity.",
  "confidence": 87,
  "threatType": "none",
  "breakdown": {
    "blacklistComponent": 0,
    "behaviorComponent": 8,
    "ageComponent": 5,
    "contractComponent": 10
  },
  "detectionModules": {
    "addressPoisoning": {
      "similarity": 0.02,
      "isPoisoningAttempt": false
    },
    "contractSafety": {
      "overallRisk": 12,
      "isSafe": true
    }
  },
  "web3Metadata": {
    "chainId": 1,
    "timestamp": "2026-02-19T10:00:00.000Z"
  }
}`;

export default function Developers() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [copied, setCopied] = useState('');

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const navItems: { id: Section; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'analyze', label: 'POST /api/analyze' },
    { id: 'analyze-web3', label: 'POST /api/analyze-web3' },
    { id: 'response', label: 'Response Schema' },
    { id: 'chains', label: 'Supported Chains' },
  ];

  const chains = [
    { name: 'Ethereum', id: 1, symbol: 'ETH', status: 'Live' },
    { name: 'Polygon', id: 137, symbol: 'MATIC', status: 'Live' },
    { name: 'Optimism', id: 10, symbol: 'ETH', status: 'Live' },
    { name: 'Arbitrum One', id: 42161, symbol: 'ETH', status: 'Live' },
    { name: 'Base', id: 8453, symbol: 'ETH', status: 'Live' },
    { name: 'BNB Chain', id: 56, symbol: 'BNB', status: 'Live' },
    { name: 'Sepolia (Testnet)', id: 11155111, symbol: 'ETH', status: 'Testnet' },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 pt-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            API v1 — Production Ready
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Developer Documentation</h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Integrate UAE7Guard&apos;s AI-powered risk engine into your dApp, wallet, or security tooling.
            Sub-100ms threat detection across 7 chains.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar nav */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 min-w-0 space-y-8"
          >
            {activeSection === 'overview' && (
              <>
                <Section title="Getting Started" id="overview">
                  <p className="text-zinc-400 mb-6">
                    UAE7Guard exposes two REST API endpoints that analyse Ethereum-compatible wallet addresses
                    for fraud, scam, and threat indicators. No API key is required for self-hosted usage.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {[
                      { label: 'Base Scan', endpoint: 'POST /api/analyze', desc: 'Full risk analysis using wallet history, blacklist data, and smart contract inspection.' },
                      { label: 'Web3 Scan', endpoint: 'POST /api/analyze-web3', desc: 'Connected-wallet analysis including on-chain balance and chain metadata.' },
                    ].map((ep) => (
                      <div key={ep.label} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
                        <div className="text-xs text-emerald-400 font-mono mb-2">{ep.endpoint}</div>
                        <div className="text-sm font-semibold text-white mb-1">{ep.label}</div>
                        <div className="text-xs text-zinc-500">{ep.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <h4 className="text-sm font-semibold text-amber-400 mb-1">Risk Score Reference</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {[
                        { range: '0 – 24', level: 'low', color: 'text-emerald-400' },
                        { range: '25 – 49', level: 'moderate', color: 'text-yellow-400' },
                        { range: '50 – 74', level: 'high', color: 'text-orange-400' },
                        { range: '75 – 100', level: 'critical', color: 'text-red-400' },
                      ].map((r) => (
                        <div key={r.level} className="text-center p-3 rounded-lg bg-zinc-900">
                          <div className={`text-sm font-bold ${r.color}`}>{r.range}</div>
                          <div className="text-xs text-zinc-500 capitalize mt-0.5">{r.level}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>
              </>
            )}

            {activeSection === 'analyze' && (
              <Section title="POST /api/analyze" id="analyze">
                <p className="text-zinc-400 mb-4">
                  Performs a full risk analysis on any Ethereum-compatible wallet address.
                  Uses wallet age, transaction history, blacklist associations, and smart contract inspection.
                </p>

                <h3 className="text-sm font-semibold text-zinc-300 mb-2 uppercase tracking-wide">Request Body</h3>
                <div className="mb-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left text-zinc-400 font-medium py-2 pr-4">Field</th>
                        <th className="text-left text-zinc-400 font-medium py-2 pr-4">Type</th>
                        <th className="text-left text-zinc-400 font-medium py-2 pr-4">Required</th>
                        <th className="text-left text-zinc-400 font-medium py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {[
                        { field: 'address', type: 'string', req: 'Yes', desc: 'Ethereum address (0x + 40 hex chars)' },
                        { field: 'transactionValue', type: 'number', req: 'No', desc: 'ETH value of the pending transaction' },
                        { field: 'historicalAddresses', type: 'string[]', req: 'No', desc: 'Previous interaction addresses for pattern analysis' },
                      ].map((row) => (
                        <tr key={row.field}>
                          <td className="py-2 pr-4 font-mono text-emerald-400">{row.field}</td>
                          <td className="py-2 pr-4 font-mono text-cyan-400">{row.type}</td>
                          <td className="py-2 pr-4 text-zinc-400">{row.req}</td>
                          <td className="py-2 text-zinc-500">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <CodeBlock code={CODE_ANALYZE} id="analyze-code" copied={copied} onCopy={copyCode} />
              </Section>
            )}

            {activeSection === 'analyze-web3' && (
              <Section title="POST /api/analyze-web3" id="analyze-web3">
                <p className="text-zinc-400 mb-4">
                  Designed for connected-wallet contexts. Accepts on-chain balance and chain ID from the user&apos;s active session.
                </p>

                <h3 className="text-sm font-semibold text-zinc-300 mb-2 uppercase tracking-wide">Request Body</h3>
                <div className="mb-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left text-zinc-400 font-medium py-2 pr-4">Field</th>
                        <th className="text-left text-zinc-400 font-medium py-2 pr-4">Type</th>
                        <th className="text-left text-zinc-400 font-medium py-2 pr-4">Required</th>
                        <th className="text-left text-zinc-400 font-medium py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {[
                        { field: 'address', type: 'string', req: 'Yes', desc: 'Ethereum-compatible wallet address' },
                        { field: 'balance', type: 'string', req: 'No', desc: 'Native token balance (e.g. "3.2")' },
                        { field: 'chainId', type: 'number', req: 'No', desc: 'EVM chain ID (defaults to 1 = Ethereum mainnet)' },
                        { field: 'historicalAddresses', type: 'string[]', req: 'No', desc: 'Previously interacted addresses' },
                      ].map((row) => (
                        <tr key={row.field}>
                          <td className="py-2 pr-4 font-mono text-emerald-400">{row.field}</td>
                          <td className="py-2 pr-4 font-mono text-cyan-400">{row.type}</td>
                          <td className="py-2 pr-4 text-zinc-400">{row.req}</td>
                          <td className="py-2 text-zinc-500">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <CodeBlock code={CODE_ANALYZE_WEB3} id="analyze-web3-code" copied={copied} onCopy={copyCode} />
              </Section>
            )}

            {activeSection === 'response' && (
              <Section title="Response Schema" id="response">
                <p className="text-zinc-400 mb-6">Both endpoints return the same JSON structure:</p>

                <div className="mb-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left text-zinc-400 font-medium py-2 pr-4">Field</th>
                        <th className="text-left text-zinc-400 font-medium py-2 pr-4">Type</th>
                        <th className="text-left text-zinc-400 font-medium py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {[
                        { field: 'riskScore', type: 'number', desc: 'Overall risk score from 0 (safe) to 100 (critical)' },
                        { field: 'riskLevel', type: 'string', desc: '"low" | "moderate" | "high" | "critical"' },
                        { field: 'decision', type: 'string', desc: 'Human-readable verdict (e.g. "SAFE TO PROCEED")' },
                        { field: 'recommendation', type: 'string', desc: 'Detailed advisory message' },
                        { field: 'confidence', type: 'number', desc: 'Engine confidence percentage (0–100)' },
                        { field: 'threatType', type: 'string', desc: 'Category of threat detected, or "none"' },
                        { field: 'breakdown', type: 'object', desc: 'Per-category sub-scores (blacklist, behavior, age, contract)' },
                        { field: 'detectionModules', type: 'object', desc: 'Address poisoning and contract safety module outputs' },
                        { field: 'web3Metadata', type: 'object', desc: 'Chain ID and analysis timestamp (analyze-web3 only)' },
                      ].map((row) => (
                        <tr key={row.field}>
                          <td className="py-2 pr-4 font-mono text-emerald-400">{row.field}</td>
                          <td className="py-2 pr-4 font-mono text-cyan-400">{row.type}</td>
                          <td className="py-2 text-zinc-500">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">Example Response</h3>
                <CodeBlock code={RESPONSE_EXAMPLE} id="response-code" copied={copied} onCopy={copyCode} language="json" />
              </Section>
            )}

            {activeSection === 'chains' && (
              <Section title="Supported Chains" id="chains">
                <p className="text-zinc-400 mb-6">
                  UAE7Guard supports all major EVM-compatible networks. Pass the chain ID in the <code className="text-emerald-400 text-sm">chainId</code> field of the analyze-web3 endpoint.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left text-zinc-400 font-medium py-3 pr-4">Network</th>
                        <th className="text-left text-zinc-400 font-medium py-3 pr-4">Chain ID</th>
                        <th className="text-left text-zinc-400 font-medium py-3 pr-4">Currency</th>
                        <th className="text-left text-zinc-400 font-medium py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {chains.map((chain) => (
                        <tr key={chain.id}>
                          <td className="py-3 pr-4 text-white font-medium">{chain.name}</td>
                          <td className="py-3 pr-4 font-mono text-cyan-400">{chain.id}</td>
                          <td className="py-3 pr-4 text-zinc-400">{chain.symbol}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              chain.status === 'Live'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                chain.status === 'Live' ? 'bg-emerald-400' : 'bg-yellow-400'
                              }`} />
                              {chain.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <div id={id}>
      <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-zinc-800">{title}</h2>
      {children}
    </div>
  );
}

function CodeBlock({
  code,
  id,
  copied,
  onCopy,
  language = 'typescript',
}: {
  code: string;
  id: string;
  copied: string;
  onCopy: (code: string, id: string) => void;
  language?: string;
}) {
  return (
    <div className="relative rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <span className="text-xs text-zinc-500 font-mono">{language}</span>
        <button
          onClick={() => onCopy(code, id)}
          className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-800"
        >
          {copied === id ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-zinc-300 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
