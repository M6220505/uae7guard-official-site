'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import NotificationSettings from '@/components/NotificationSettings';
import TransactionSimulator from '@/components/TransactionSimulator';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationConfig, setNotificationConfig] = useState<any>(null);
  const [liveThreatFeed, setLiveThreatFeed] = useState<any[]>([]);

  useEffect(() => {
    // Load notification configuration from localStorage
    const stored = localStorage.getItem('uae7guard_notifications');
    if (stored) {
      try {
        setNotificationConfig(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse notification config');
      }
    }

    // Simulate live threat feed updates
    const interval = setInterval(() => {
      const newThreat = {
        id: Date.now(),
        type: ['Address Poisoning', 'Suspicious Approval', 'NFT Scam', 'Rug Pull Risk'][
          Math.floor(Math.random() * 4)
        ],
        severity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
        timestamp: new Date().toISOString(),
        address: '0x' + Math.random().toString(16).slice(2, 42),
        chain: ['Ethereum', 'Polygon', 'BNB Chain', 'Solana'][Math.floor(Math.random() * 4)],
      };

      setLiveThreatFeed((prev) => [newThreat, ...prev].slice(0, 10));
    }, 15000); // New threat every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const isNotificationActive = notificationConfig?.telegram?.enabled || notificationConfig?.discord?.enabled;

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Header */}
      <section className="pt-24 pb-12 px-6 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Security Dashboard</h1>
                <p className="text-zinc-400">Real-time monitoring and threat intelligence</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-sm font-medium">All Systems Operational</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 overflow-x-auto">
              {['overview', 'monitoring', 'threats', 'analytics', 'notifications', 'simulator'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-cyan-500 text-black'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                {
                  label: 'Wallets Protected',
                  value: '1,247',
                  change: '+12.5%',
                  trend: 'up',
                  icon: '🛡️',
                  color: 'emerald'
                },
                {
                  label: 'Threats Blocked',
                  value: '156',
                  change: '-5.2%',
                  trend: 'down',
                  icon: '🚫',
                  color: 'red'
                },
                {
                  label: 'Avg Response Time',
                  value: '87ms',
                  change: '-15%',
                  trend: 'down',
                  icon: '⚡',
                  color: 'yellow'
                },
                {
                  label: 'Risk Score',
                  value: '23/100',
                  change: 'LOW',
                  trend: 'neutral',
                  icon: '📊',
                  color: 'cyan'
                }
              ].map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className={`p-6 rounded-2xl bg-zinc-900 border border-${metric.color}-500/20 hover:border-${metric.color}-500/50 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{metric.icon}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        metric.trend === 'up'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : metric.trend === 'down'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                  <div className={`text-3xl font-bold text-${metric.color}-400 mb-1`}>
                    {metric.value}
                  </div>
                  <div className="text-sm text-zinc-500">{metric.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Service Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 mb-12"
            >
              <h2 className="text-2xl font-bold text-white mb-6">V2 Service Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: 'AI Scam Detection',
                    status: 'Active',
                    uptime: '99.98%',
                    latency: '50ms'
                  },
                  {
                    name: 'Wallet Monitoring',
                    status: 'Active',
                    uptime: '99.99%',
                    latency: '1.2s'
                  },
                  {
                    name: 'Multi-Chain Support',
                    status: 'Active',
                    uptime: '99.95%',
                    latency: '87ms'
                  },
                  {
                    name: 'Secure Escrow',
                    status: 'Active',
                    uptime: '100%',
                    latency: '120ms'
                  },
                  {
                    name: 'NFT Risk Analysis',
                    status: 'Active',
                    uptime: '99.97%',
                    latency: '95ms'
                  },
                  {
                    name: 'Security API',
                    status: 'Active',
                    uptime: '99.99%',
                    latency: '68ms'
                  }
                ].map((service, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{service.name}</h3>
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                        {service.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-zinc-500 text-xs mb-1">Uptime</div>
                        <div className="text-zinc-300 font-mono">{service.uptime}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-xs mb-1">Latency</div>
                        <div className="text-zinc-300 font-mono">{service.latency}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Multi-Chain Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 mb-12"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Multi-Chain Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { chain: 'Ethereum', icon: '⟠', txCount: '2.4M+', color: 'indigo' },
                  { chain: 'Solana', icon: '◎', txCount: '1.8M+', color: 'purple' },
                  { chain: 'Polygon', icon: '⬣', txCount: '1.2M+', color: 'violet' },
                  { chain: 'BNB Chain', icon: '◆', txCount: '980K+', color: 'yellow' }
                ].map((chain, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-xl bg-zinc-950 border border-${chain.color}-500/20 text-center`}
                  >
                    <div className={`text-4xl mb-3 text-${chain.color}-400`}>{chain.icon}</div>
                    <h3 className="font-semibold text-white mb-2">{chain.chain}</h3>
                    <div className="flex items-center justify-center gap-1 text-xs text-emerald-400 mb-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      Live
                    </div>
                    <div className="text-sm text-zinc-500">{chain.txCount} analyzed</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Live Threat Feed - NEW V2.5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Live Threat Feed</h2>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-red-400 text-xs font-medium">Live</span>
                </div>
              </div>

              {liveThreatFeed.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-zinc-400">No threats detected in the last hour</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {liveThreatFeed.map((threat) => (
                    <motion.div
                      key={threat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl bg-zinc-950 border ${
                        threat.severity === 'Critical'
                          ? 'border-red-500/30'
                          : threat.severity === 'High'
                          ? 'border-orange-500/30'
                          : threat.severity === 'Medium'
                          ? 'border-yellow-500/30'
                          : 'border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              threat.severity === 'Critical'
                                ? 'bg-red-500/10 text-red-400'
                                : threat.severity === 'High'
                                ? 'bg-orange-500/10 text-orange-400'
                                : threat.severity === 'Medium'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-zinc-700 text-zinc-400'
                            }`}
                          >
                            {threat.severity}
                          </span>
                          <h4 className="font-semibold text-white">{threat.type}</h4>
                        </div>
                        <span className="text-xs text-zinc-500">{new Date(threat.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400 font-mono truncate">{threat.address.slice(0, 20)}...</span>
                        <span className="text-zinc-500">{threat.chain}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Notification Status - NEW V2.5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Notification Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Telegram</h3>
                        <p className="text-xs text-zinc-500">Bot notifications</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs ${
                      notificationConfig?.telegram?.enabled ? 'text-emerald-400' : 'text-zinc-500'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        notificationConfig?.telegram?.enabled ? 'bg-emerald-400' : 'bg-zinc-600'
                      }`}></span>
                      {notificationConfig?.telegram?.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {notificationConfig?.telegram?.enabled && (
                    <div className="text-xs text-zinc-400 space-y-1">
                      <div>Chat ID: {notificationConfig.telegram.chatId || 'Not set'}</div>
                      <div>Last sent: 2 minutes ago</div>
                    </div>
                  )}
                </div>

                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Discord</h3>
                        <p className="text-xs text-zinc-500">Webhook alerts</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs ${
                      notificationConfig?.discord?.enabled ? 'text-emerald-400' : 'text-zinc-500'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        notificationConfig?.discord?.enabled ? 'bg-emerald-400' : 'bg-zinc-600'
                      }`}></span>
                      {notificationConfig?.discord?.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {notificationConfig?.discord?.enabled && (
                    <div className="text-xs text-zinc-400 space-y-1">
                      <div>Webhook configured</div>
                      <div>Last sent: 5 minutes ago</div>
                    </div>
                  )}
                </div>
              </div>

              {!isNotificationActive && (
                <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-1">No Notifications Configured</h4>
                      <p className="text-sm text-yellow-300">
                        Configure Telegram or Discord notifications in the Notifications tab to receive real-time threat alerts.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Notifications Tab - NEW V2.5 */}
      {activeTab === 'notifications' && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <NotificationSettings />
            </motion.div>
          </div>
        </section>
      )}

      {/* Transaction Simulator Tab - NEW V2.5 */}
      {activeTab === 'simulator' && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-2">Transaction Simulator</h2>
              <p className="text-zinc-400">
                Test transactions before signing to understand exactly what will happen
              </p>
            </motion.div>

            <TransactionSimulator />
          </div>
        </section>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Active Monitors</h2>
              <div className="space-y-4">
                {[
                  {
                    wallet: '0x742d...f0bEb',
                    chain: 'Ethereum',
                    status: 'Monitoring',
                    lastActivity: '2 minutes ago',
                    alerts: 0
                  },
                  {
                    wallet: '0x1234...7890',
                    chain: 'Polygon',
                    status: 'Monitoring',
                    lastActivity: '15 minutes ago',
                    alerts: 2
                  },
                  {
                    wallet: 'So11...abc123',
                    chain: 'Solana',
                    status: 'Monitoring',
                    lastActivity: '1 hour ago',
                    alerts: 0
                  }
                ].map((monitor, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-xl bg-zinc-950 border border-cyan-500/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                        <span className="text-xl">👁️</span>
                      </div>
                      <div>
                        <div className="font-mono text-white mb-1">{monitor.wallet}</div>
                        <div className="text-sm text-zinc-500">{monitor.chain}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div>
                        <div className="text-xs text-zinc-500 mb-1">Last Activity</div>
                        <div className="text-sm text-zinc-300">{monitor.lastActivity}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 mb-1">Alerts</div>
                        <div
                          className={`text-sm font-semibold ${
                            monitor.alerts > 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {monitor.alerts}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        {monitor.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Threats Tab */}
      {activeTab === 'threats' && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Recent Threats Detected</h2>
              <div className="space-y-4">
                {[
                  {
                    type: 'Address Poisoning',
                    severity: 'High',
                    time: '5 minutes ago',
                    details: 'Detected visually similar address with 85% match'
                  },
                  {
                    type: 'Suspicious Approval',
                    severity: 'Critical',
                    time: '1 hour ago',
                    details: 'Unlimited token approval to unverified contract'
                  },
                  {
                    type: 'NFT Rug Pull Risk',
                    severity: 'Medium',
                    time: '3 hours ago',
                    details: 'Collection shows wash trading patterns'
                  }
                ].map((threat, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-xl bg-zinc-950 border ${
                      threat.severity === 'Critical'
                        ? 'border-red-500/30'
                        : threat.severity === 'High'
                        ? 'border-orange-500/30'
                        : 'border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">{threat.type}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              threat.severity === 'Critical'
                                ? 'bg-red-500/10 text-red-400'
                                : threat.severity === 'High'
                                ? 'bg-orange-500/10 text-orange-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}
                          >
                            {threat.severity}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 mb-1">{threat.details}</p>
                        <p className="text-xs text-zinc-600">{threat.time}</p>
                      </div>
                      <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
                <h2 className="text-2xl font-bold text-white mb-6">Threat Distribution</h2>
                <div className="space-y-4">
                  {[
                    { type: 'Address Poisoning', count: 45, percentage: 35 },
                    { type: 'Smart Contract Risk', count: 32, percentage: 25 },
                    { type: 'NFT Scams', count: 28, percentage: 22 },
                    { type: 'Phishing', count: 23, percentage: 18 }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-400">{item.type}</span>
                        <span className="text-white font-semibold">{item.count}</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
                <h2 className="text-2xl font-bold text-white mb-6">Performance Metrics</h2>
                <div className="space-y-6">
                  {[
                    { metric: 'Average Analysis Time', value: '87ms', target: '<100ms' },
                    { metric: 'Success Rate', value: '99.9%', target: '>99%' },
                    { metric: 'False Positive Rate', value: '0.1%', target: '<1%' },
                    { metric: 'API Uptime', value: '99.99%', target: '>99.9%' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-semibold">{item.metric}</div>
                        <div className="text-xs text-zinc-500">Target: {item.target}</div>
                      </div>
                      <div className="text-2xl font-bold text-emerald-400">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </main>
  );
}
