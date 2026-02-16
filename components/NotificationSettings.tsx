'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface NotificationConfig {
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
  };
  discord: {
    enabled: boolean;
    webhookUrl: string;
  };
  alertTypes: {
    addressPoisoning: boolean;
    suspiciousApprovals: boolean;
    highRiskTransactions: boolean;
    rugPullAlerts: boolean;
    nftScams: boolean;
  };
}

export default function NotificationSettings() {
  const t = useTranslations('notifications');
  const [config, setConfig] = useState<NotificationConfig>({
    telegram: {
      enabled: false,
      botToken: '',
      chatId: '',
    },
    discord: {
      enabled: false,
      webhookUrl: '',
    },
    alertTypes: {
      addressPoisoning: true,
      suspiciousApprovals: true,
      highRiskTransactions: true,
      rugPullAlerts: true,
      nftScams: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Store configuration in localStorage for demo
      // In production, this would be sent to your backend API
      localStorage.setItem('uae7guard_notifications', JSON.stringify(config));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const testNotification = async (platform: 'telegram' | 'discord') => {
    // In production, this would send a test notification
    alert(`Test notification sent to ${platform}! Check your ${platform} for the test message.`);
  };

  return (
    <div className="space-y-6">
      {/* Telegram Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Telegram Notifications</h3>
              <p className="text-sm text-zinc-400">Receive instant alerts via Telegram bot</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.telegram.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  telegram: { ...config.telegram, enabled: e.target.checked },
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {config.telegram.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Bot Token
              </label>
              <input
                type="text"
                value={config.telegram.botToken}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    telegram: { ...config.telegram, botToken: e.target.value },
                  })
                }
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Get your bot token from{' '}
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  @BotFather
                </a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Chat ID
              </label>
              <input
                type="text"
                value={config.telegram.chatId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    telegram: { ...config.telegram, chatId: e.target.value },
                  })
                }
                placeholder="123456789"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Get your chat ID from{' '}
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  @userinfobot
                </a>
              </p>
            </div>

            <button
              onClick={() => testNotification('telegram')}
              disabled={!config.telegram.botToken || !config.telegram.chatId}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg text-white font-semibold transition-colors"
            >
              Send Test Notification
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Discord Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Discord Notifications</h3>
              <p className="text-sm text-zinc-400">Receive alerts in your Discord server</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.discord.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  discord: { ...config.discord, enabled: e.target.checked },
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {config.discord.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Webhook URL
              </label>
              <input
                type="text"
                value={config.discord.webhookUrl}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    discord: { ...config.discord, webhookUrl: e.target.value },
                  })
                }
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Create a webhook in your Discord server settings under Integrations
              </p>
            </div>

            <button
              onClick={() => testNotification('discord')}
              disabled={!config.discord.webhookUrl}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg text-white font-semibold transition-colors"
            >
              Send Test Notification
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Alert Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800"
      >
        <h3 className="text-xl font-bold text-white mb-4">Alert Types</h3>
        <p className="text-sm text-zinc-400 mb-6">
          Choose which types of threats you want to be notified about
        </p>

        <div className="space-y-3">
          {[
            {
              key: 'addressPoisoning' as const,
              label: 'Address Poisoning',
              description: 'Similar addresses designed to deceive',
            },
            {
              key: 'suspiciousApprovals' as const,
              label: 'Suspicious Approvals',
              description: 'Unlimited token approvals to unverified contracts',
            },
            {
              key: 'highRiskTransactions' as const,
              label: 'High Risk Transactions',
              description: 'Transactions with high risk scores',
            },
            {
              key: 'rugPullAlerts' as const,
              label: 'Rug Pull Alerts',
              description: 'Potential rug pulls and exit scams',
            },
            {
              key: 'nftScams' as const,
              label: 'NFT Scams',
              description: 'Counterfeit NFTs and marketplace scams',
            },
          ].map((alert) => (
            <label
              key={alert.key}
              className="flex items-start gap-3 p-4 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={config.alertTypes[alert.key]}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    alertTypes: {
                      ...config.alertTypes,
                      [alert.key]: e.target.checked,
                    },
                  })
                }
                className="mt-1 w-5 h-5 text-cyan-500 bg-zinc-900 border-zinc-700 rounded focus:ring-cyan-500 focus:ring-2"
              />
              <div>
                <div className="font-semibold text-white">{alert.label}</div>
                <div className="text-sm text-zinc-500">{alert.description}</div>
              </div>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>

        {saveStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-emerald-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-semibold">Settings saved successfully!</span>
          </motion.div>
        )}

        {saveStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-red-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="font-semibold">Failed to save settings</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
