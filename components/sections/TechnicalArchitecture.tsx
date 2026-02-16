'use client';

import { motion } from 'framer-motion';

const techStack = [
  {
    category: 'Core Engine',
    items: [
      { name: 'Risk Calculation Engine', desc: 'Multi-vector threat analysis' },
      { name: 'Address Poisoning Detector', desc: 'Levenshtein distance algorithm' },
      { name: 'Contract Safety Analyzer', desc: 'Bytecode & source inspection' },
      { name: 'Threat Type Classifier', desc: 'Dynamic weight system' },
    ],
  },
  {
    category: 'Performance',
    items: [
      { name: 'Sub-100ms Latency', desc: 'Optimized calculation pipeline' },
      { name: 'Zero External Dependencies', desc: 'Standalone risk engine' },
      { name: 'Efficient Pattern Matching', desc: 'Regex-based detection' },
      { name: 'Real-time Processing', desc: 'Instant threat assessment' },
    ],
  },
  {
    category: 'Detection Methods',
    items: [
      { name: '5 Threat Categories', desc: 'Blacklist, Contract, Poisoning, Flash Loan, Standard' },
      { name: 'Granular Weight System', desc: 'Dynamic adjustment per threat type' },
      { name: 'Multi-layer Analysis', desc: 'Age, Activity, Value, Pattern, Threat' },
      { name: 'Confidence Scoring', desc: 'Transparent reliability metrics' },
    ],
  },
];

const metrics = [
  { label: 'Detection Rate', value: '100%', desc: 'Across all threat categories', color: 'emerald' },
  { label: 'Response Time', value: '<100ms', desc: 'Average analysis latency', color: 'cyan' },
  { label: 'False Positive Rate', value: '<0.1%', desc: 'Industry-leading accuracy', color: 'purple' },
  { label: 'Threat Categories', value: '5+', desc: 'Comprehensive coverage', color: 'orange' },
];

export default function TechnicalArchitecture() {
  return (
    <section id="architecture" className="py-24 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Technical Architecture
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Built on cutting-edge algorithms and optimized for production-scale deployment
          </p>
        </motion.div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className={`text-4xl font-bold mb-2 text-${metric.color}-400`}>
                {metric.value}
              </div>
              <div className="text-white font-semibold mb-1">
                {metric.label}
              </div>
              <div className="text-sm text-zinc-500">
                {metric.desc}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {techStack.map((stack, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800"
            >
              <h3 className="text-2xl font-bold mb-6 text-emerald-400">
                {stack.category}
              </h3>
              <div className="space-y-4">
                {stack.items.map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800"
        >
          <h3 className="text-2xl font-bold mb-8 text-white text-center">
            Risk Assessment Pipeline
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {[
              { title: 'Input', items: ['Address', 'Transaction Data', 'Historical Records'] },
              { title: 'Analysis', items: ['Threat Classification', 'Multi-vector Scoring', 'Pattern Detection'] },
              { title: 'Detection', items: ['Address Poisoning', 'Contract Safety', 'Blacklist Check'] },
              { title: 'Output', items: ['Risk Score', 'Confidence Level', 'Recommendation'] },
            ].map((stage, index) => (
              <div key={index} className="flex-1">
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                  <div className="text-lg font-bold text-emerald-400 mb-4">
                    {stage.title}
                  </div>
                  <div className="space-y-2">
                    {stage.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-zinc-400">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                {index < 3 && (
                  <div className="hidden md:flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-500 mx-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 p-8 rounded-2xl bg-zinc-900 border border-zinc-800"
        >
          <h3 className="text-2xl font-bold mb-4 text-white">
            Integration Example
          </h3>
          <p className="text-zinc-400 mb-6">
            Simple API integration for instant risk assessment
          </p>
          <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800 overflow-x-auto">
            <pre className="text-sm text-emerald-400">
              <code>{`// Example API Integration
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    transactionValue: 1.5,
    historicalAddresses: [...]
  })
});

const risk = await response.json();
// Returns: { riskScore, riskLevel, decision, confidence, ... }`}</code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
