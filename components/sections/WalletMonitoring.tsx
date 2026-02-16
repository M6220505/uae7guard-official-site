'use client';

import { motion } from 'framer-motion';

export default function WalletMonitoring() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-zinc-900 to-zinc-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 text-sm font-medium">Real-Time Protection Active</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-600">
            24/7 Wallet Monitoring
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Never miss a threat. Our continuous monitoring system tracks your wallets around the clock,
            alerting you to suspicious activities in real-time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: '🔔',
              title: 'Instant Alerts',
              description: 'Receive immediate notifications for suspicious transactions, unauthorized approvals, and potential threats.',
              color: 'cyan',
              features: [
                'Push & email notifications',
                'Configurable alert thresholds',
                'Priority-based escalation',
                'Multi-channel delivery'
              ]
            },
            {
              icon: '✅',
              title: 'Approval Tracking',
              description: 'Monitor all token approvals across your wallets. Identify and revoke dangerous unlimited approvals instantly.',
              color: 'blue',
              features: [
                'Real-time approval scanning',
                'Risk scoring per approval',
                'One-click revocation',
                'Historical approval audit'
              ]
            },
            {
              icon: '📊',
              title: 'Activity Dashboard',
              description: 'Comprehensive view of all wallet activities with detailed analytics and risk assessments.',
              color: 'indigo',
              features: [
                'Transaction history timeline',
                'Risk trend analysis',
                'Balance change tracking',
                'Interaction graph visualization'
              ]
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className={`p-8 rounded-2xl bg-zinc-900 border border-${feature.color}-500/20 hover:border-${feature.color}-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.1)]`}
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

        {/* Live Monitoring Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-cyan-500/30"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Live Monitoring Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Wallets Protected', value: '1,247', trend: '+12%', icon: '🛡️' },
              { label: 'Alerts Sent Today', value: '3,892', trend: '+8%', icon: '🔔' },
              { label: 'Threats Blocked', value: '156', trend: '-5%', icon: '🚫' },
              { label: 'Avg Response Time', value: '1.2s', trend: '-15%', icon: '⚡' }
            ].map((metric, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-cyan-500/10">
                <div className="text-2xl mb-2">{metric.icon}</div>
                <div className="text-2xl font-bold text-cyan-400 mb-1">{metric.value}</div>
                <div className="text-xs text-zinc-500 mb-1">{metric.label}</div>
                <div className={`text-xs font-semibold ${metric.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metric.trend} from yesterday
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
