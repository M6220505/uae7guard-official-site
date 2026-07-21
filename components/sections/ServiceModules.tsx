'use client';

import { motion } from 'framer-motion';

const services = [
  {
    icon: '🛡️',
    title: 'Address Poisoning Defense',
    description: 'Advanced Levenshtein distance algorithm detects visually similar addresses that could trick users into sending funds to malicious wallets.',
    features: [
      'Prefix/suffix similarity detection',
      'Vanity address pattern recognition',
      'Historical address comparison',
      '70%+ similarity threshold alerting',
    ],
    metrics: {
      similarityScoring: 'Tuned',
      localChecks: 'Fast',
      falsePositive: 'Tunable',
    },
  },
  {
    icon: '📋',
    title: 'Smart Contract Auditing',
    description: 'Automated bytecode and source code analysis identifies dangerous opcodes, reentrancy vulnerabilities, and honeypot patterns.',
    features: [
      'SELFDESTRUCT & DELEGATECALL detection',
      'Reentrancy vulnerability scanning',
      'Honeypot pattern identification',
      'Unverified contract risk assessment',
    ],
    metrics: {
      evidenceMapping: 'OWASP',
      bytecodeChecks: 'Static',
      owaspRisks: 'Mapped',
    },
  },
  {
    icon: '⚡',
    title: 'Real-time Risk Scoring',
    description: 'Multi-vector threat intelligence with granular weight system adapts to threat type for maximum explainability.',
    features: [
      'Dynamic weight adjustment per threat',
      'Age, activity, value pattern analysis',
      'Flash loan attack detection',
      'Confidence scoring with transparent breakdown',
    ],
    metrics: {
      evidenceMapping: 'OWASP',
      liveInputs: 'Configurable',
      threats: '5 types',
    },
  },
];

export default function ServiceModules() {
  return (
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
            Service Modules
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Enterprise-grade security modules designed to protect against sophisticated blockchain threats
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative"
            >
              <div className="h-full p-8 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                {/* Icon */}
                <div className="text-5xl mb-4">{service.icon}</div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-emerald-400 transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-zinc-500 mb-3 uppercase tracking-wide">
                    Key Features
                  </h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                        <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metrics */}
                <div className="border-t border-zinc-800 pt-6">
                  <h4 className="text-sm font-semibold text-zinc-500 mb-3 uppercase tracking-wide">
                    Evidence Metrics
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(service.metrics).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-lg font-bold text-emerald-400">
                          {value}
                        </div>
                        <div className="text-xs text-zinc-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hover gradient effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 via-cyan-500/0 to-purple-500/0 group-hover:from-emerald-500/5 group-hover:via-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
