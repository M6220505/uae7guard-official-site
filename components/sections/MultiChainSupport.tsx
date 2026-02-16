'use client';

import { motion } from 'framer-motion';

export default function MultiChainSupport() {
  const chains = [
    {
      name: 'Ethereum',
      icon: '⟠',
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-500',
      features: ['ERC-20 Tokens', 'Smart Contracts', 'Layer 2s', 'NFTs'],
      status: 'Live',
      txCount: '2.4M+'
    },
    {
      name: 'Solana',
      icon: '◎',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      features: ['SPL Tokens', 'NFTs', 'DeFi Protocols', 'Fast Finality'],
      status: 'Live',
      txCount: '1.8M+'
    },
    {
      name: 'Polygon',
      icon: '⬣',
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500',
      features: ['MATIC', 'Low Gas', 'Scaling', 'zkEVM'],
      status: 'Live',
      txCount: '1.2M+'
    },
    {
      name: 'BNB Chain',
      icon: '◆',
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500',
      features: ['BEP-20', 'BSC', 'High Speed', 'Low Fees'],
      status: 'Live',
      txCount: '980K+'
    }
  ];

  return (
    <section className="py-24 px-6 bg-zinc-950 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Colored orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 backdrop-blur-sm">
            <span className="text-indigo-400 text-sm font-medium">🌐 Universal Protection</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Multi-Chain Support
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            One security solution for all major blockchains. Seamless protection across
            Ethereum, Solana, Polygon, and BNB Chain
          </p>
        </motion.div>

        {/* Chain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {chains.map((chain, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="group relative"
            >
              <div className={`h-full p-6 rounded-2xl bg-zinc-900 border border-${chain.color}-500/20 hover:border-${chain.color}-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]`}>
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  <div className={`px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1`}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-400 text-xs font-medium">{chain.status}</span>
                  </div>
                </div>

                {/* Chain icon */}
                <div className={`text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-br ${chain.gradient}`}>
                  {chain.icon}
                </div>

                {/* Chain name */}
                <h3 className={`text-2xl font-bold mb-2 text-${chain.color}-400`}>
                  {chain.name}
                </h3>

                {/* Transaction count */}
                <div className="mb-4 text-sm text-zinc-500">
                  {chain.txCount} transactions secured
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-4">
                  {chain.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                      <svg className={`w-4 h-4 text-${chain.color}-400`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Hover gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${chain.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cross-chain features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-indigo-500/30"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Unified Security Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔄',
                title: 'Cross-Chain Tracking',
                description: 'Track wallet activity across all supported chains from a single dashboard'
              },
              {
                icon: '⚡',
                title: 'Instant Synchronization',
                description: 'Real-time updates across all chains with sub-second latency'
              },
              {
                icon: '🔐',
                title: 'Unified Risk Scoring',
                description: 'Consistent security standards and risk assessment across all networks'
              }
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Coming soon section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-zinc-500 mb-4">Coming Soon</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Avalanche', 'Arbitrum', 'Optimism', 'Base'].map((chain, idx) => (
              <div key={idx} className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 text-sm">
                {chain}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
