'use client';

import { motion } from 'framer-motion';

export default function SecureEscrow() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-zinc-950 to-zinc-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
            <span className="text-emerald-400 text-sm font-medium">🤝 Zero Trust, Maximum Security</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600">
            Secure Escrow Service
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Trade with confidence. Our decentralized escrow service acts as a trusted intermediary,
            protecting both parties in Web3 transactions
          </p>
        </motion.div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: '📝',
                title: 'Create Agreement',
                description: 'Define terms, amount, and conditions for the transaction'
              },
              {
                step: '02',
                icon: '🔒',
                title: 'Funds Locked',
                description: 'Assets are securely held in smart contract escrow'
              },
              {
                step: '03',
                icon: '✅',
                title: 'Verify Delivery',
                description: 'Both parties confirm transaction completion'
              },
              {
                step: '04',
                icon: '💸',
                title: 'Auto Release',
                description: 'Funds released automatically upon conditions being met'
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="relative"
              >
                {/* Connector line */}
                {idx < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent" />
                )}

                <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 relative z-10">
                  <div className="text-emerald-400 font-mono text-sm mb-2">{step.step}</div>
                  <div className="text-4xl mb-3">{step.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-zinc-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-emerald-500/20"
          >
            <h3 className="text-2xl font-bold text-emerald-400 mb-6">Security Features</h3>
            <ul className="space-y-4">
              {[
                {
                  title: 'Smart Contract Verified',
                  description: 'Designed for independent audit before handling production funds'
                },
                {
                  title: 'Multi-Signature Protection',
                  description: 'Requires consensus from multiple parties for critical actions'
                },
                {
                  title: 'Time-Locked Releases',
                  description: 'Configurable time delays prevent instant rug pulls'
                },
                {
                  title: 'Dispute Resolution',
                  description: 'Built-in arbitration system for handling disagreements'
                }
              ].map((feature, idx) => (
                <li key={idx} className="flex gap-4">
                  <svg className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold text-white mb-1">{feature.title}</div>
                    <div className="text-sm text-zinc-400">{feature.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-teal-500/20"
          >
            <h3 className="text-2xl font-bold text-teal-400 mb-6">Use Cases</h3>
            <div className="space-y-6">
              {[
                {
                  icon: '🎨',
                  title: 'NFT Trading',
                  description: 'Secure high-value NFT trades with verified authenticity checks'
                },
                {
                  icon: '💼',
                  title: 'Freelance Payments',
                  description: 'Milestone-based releases for Web3 development projects'
                },
                {
                  icon: '🏢',
                  title: 'Business Deals',
                  description: 'Enterprise-level transactions with compliance features'
                },
                {
                  icon: '🤝',
                  title: 'P2P Trading',
                  description: 'Safe peer-to-peer token swaps and OTC trades'
                }
              ].map((useCase, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="text-3xl">{useCase.icon}</div>
                  <div>
                    <div className="font-semibold text-white mb-1">{useCase.title}</div>
                    <div className="text-sm text-zinc-400">{useCase.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: 'Planned', label: 'Escrow Module' },
            { value: 'Policy', label: 'Release Controls' },
            { value: 'Audit', label: 'Before Mainnet' },
            { value: 'Clear', label: 'Dispute Flow' }
          ].map((stat, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-zinc-900/50 border border-emerald-500/20 backdrop-blur-sm text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">{stat.value}</div>
              <div className="text-sm text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
