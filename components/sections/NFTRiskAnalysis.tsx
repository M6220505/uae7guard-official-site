'use client';

import { motion } from 'framer-motion';

export default function NFTRiskAnalysis() {
  return (
    <section className="py-24 px-6 bg-zinc-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-pink-500/10 border border-pink-500/20 backdrop-blur-sm">
            <span className="text-pink-400 text-sm font-medium">🎨 NFT Intelligence</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-pink-600">
            NFT Risk Analysis
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Advanced pattern recognition identifies rug-pull risks, fake collections, and wash trading
            before you invest in NFT projects
          </p>
        </motion.div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: '🔍',
              title: 'Collection Scanning',
              color: 'pink',
              description: 'Deep analysis of NFT collections for authenticity and risk factors',
              features: [
                'Contract verification',
                'Creator history check',
                'Metadata validation',
                'Similarity detection'
              ]
            },
            {
              icon: '📈',
              title: 'Rug-Pull Detection',
              color: 'purple',
              description: 'Machine learning identifies suspicious patterns before projects collapse',
              features: [
                'Trading volume analysis',
                'Holder distribution check',
                'Liquidity monitoring',
                'Team wallet tracking'
              ]
            },
            {
              icon: '🎯',
              title: 'Value Assessment',
              color: 'fuchsia',
              description: 'Real-time market analysis and fair value estimation for NFT assets',
              features: [
                'Floor price tracking',
                'Rarity scoring',
                'Historical sales data',
                'Market trend analysis'
              ]
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className={`p-8 rounded-2xl bg-zinc-950 border border-${feature.color}-500/20 hover:border-${feature.color}-500/50 transition-all duration-300`}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className={`text-2xl font-bold mb-4 text-${feature.color}-400`}>
                {feature.title}
              </h3>
              <p className="text-zinc-400 mb-6">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.features.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <svg className={`w-5 h-5 text-${feature.color}-400 flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Risk Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-pink-500/30"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Red Flag Detection System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                flag: '⚠️ Anonymous Team',
                risk: 'High',
                description: 'No verified team members or social presence'
              },
              {
                flag: '📉 Concentrated Holdings',
                risk: 'Critical',
                description: 'Top 5 wallets hold >60% of supply'
              },
              {
                flag: '🤖 Bot Activity',
                risk: 'High',
                description: 'Suspicious automated trading patterns detected'
              },
              {
                flag: '💸 Low Liquidity',
                risk: 'Medium',
                description: 'Insufficient market depth for safe trading'
              },
              {
                flag: '🔄 Wash Trading',
                risk: 'Critical',
                description: 'Artificial volume inflation detected'
              },
              {
                flag: '⏰ New Collection',
                risk: 'Medium',
                description: 'Less than 30 days since launch'
              }
            ].map((indicator, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-pink-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-mono text-zinc-300">{indicator.flag}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    indicator.risk === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    indicator.risk === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {indicator.risk}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{indicator.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Analysis Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
                ✅
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-400">Verified Safe</h4>
                <p className="text-sm text-zinc-500">Example: Established Collection</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Verified team with public identities
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Healthy holder distribution
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Consistent organic trading volume
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Strong community engagement
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-400 mb-1">Risk Score: 12/100</div>
              <div className="text-sm text-zinc-500">LOW RISK - Safe to trade</div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-2xl">
                ⛔
              </div>
              <div>
                <h4 className="text-lg font-bold text-red-400">High Risk Detected</h4>
                <p className="text-sm text-zinc-500">Example: Suspicious Collection</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                Anonymous team, no verification
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                70% supply held by top 3 wallets
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                Wash trading patterns detected
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                Suspicious metadata inconsistencies
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-red-500/20">
              <div className="text-3xl font-bold text-red-400 mb-1">Risk Score: 87/100</div>
              <div className="text-sm text-zinc-500">CRITICAL RISK - Avoid trading</div>
            </div>
          </div>
        </motion.div>

        {/* Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: '45K+', label: 'Collections Analyzed' },
            { value: '98.7%', label: 'Accuracy Rate' },
            { value: '127', label: 'Rug Pulls Prevented' },
            { value: '$42M', label: 'Losses Avoided' }
          ].map((stat, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-zinc-950 border border-pink-500/20 backdrop-blur-sm text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">{stat.value}</div>
              <div className="text-sm text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
