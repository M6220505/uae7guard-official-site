'use client';

import { motion } from 'framer-motion';

export default function AIScamDetection() {
  return (
    <section className="py-24 px-6 bg-zinc-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
            <span className="text-purple-400 text-sm font-medium">🧠 Powered by Advanced AI</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600">
            AI-Powered Scam Detection
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Our behavioral analysis engine uses machine learning to identify suspicious patterns
            that traditional security tools miss
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl">
                🎯
              </div>
              <h3 className="text-2xl font-bold text-white">Behavioral Analysis</h3>
            </div>
            <p className="text-zinc-400 mb-6">
              Advanced pattern recognition analyzes wallet behavior, transaction history, and interaction
              patterns to identify anomalies that indicate potential scams.
            </p>
            <ul className="space-y-3">
              {[
                'Transaction velocity analysis',
                'Wallet interaction graph mapping',
                'Anomaly detection algorithms',
                'Real-time learning from new threats'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                  <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center text-2xl">
                🔬
              </div>
              <h3 className="text-2xl font-bold text-white">Phishing Detection</h3>
            </div>
            <p className="text-zinc-400 mb-6">
              Identifies phishing attempts through URL analysis, domain reputation checks, and
              visual similarity detection of fake dApps and websites.
            </p>
            <ul className="space-y-3">
              {[
                'Domain reputation scoring',
                'Visual fingerprinting of fake sites',
                'SSL certificate verification',
                'Cross-reference with known scams'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                  <svg className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12"
        >
          {[
            { value: '99.9%', label: 'Scam Detection Rate', color: 'purple' },
            { value: '50ms', label: 'Analysis Time', color: 'pink' },
            { value: '2M+', label: 'Patterns Analyzed', color: 'purple' },
            { value: '<0.1%', label: 'False Positives', color: 'pink' }
          ].map((stat, idx) => (
            <div key={idx} className={`p-6 rounded-xl bg-zinc-900/50 border border-${stat.color}-500/20 backdrop-blur-sm text-center`}>
              <div className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>{stat.value}</div>
              <div className="text-sm text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
