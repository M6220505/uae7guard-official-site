'use client';

import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import Web3WalletAnalyzer from '@/components/Web3WalletAnalyzer';
import TransactionSimulator from '@/components/TransactionSimulator';
import NotificationSettings from '@/components/NotificationSettings';
import { useState } from 'react';

type Tab = 'overview' | 'simulator' | 'notifications';

export default function Dashboard() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Wallet Overview' },
    { id: 'simulator', label: 'Transaction Simulator' },
    { id: 'notifications', label: 'Alert Settings' },
  ];

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-zinc-950 pt-32 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Security Dashboard</h1>
            <p className="text-zinc-400 mb-8 text-lg">
              Connect your wallet to access real-time security analysis, transaction simulation, and threat alerts.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
              <p className="text-zinc-400 mt-1">
                {address?.slice(0, 6)}...{address?.slice(-4)}{' '}
                <span className="text-zinc-600">on</span>{' '}
                <span className="text-emerald-400">{chain?.name ?? 'Unknown'}</span>
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide">Balance</div>
                <div className="text-white font-mono font-semibold">
                  {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '—'}
                </div>
              </div>
              <div className="ml-4">
                <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Network', value: chain?.name ?? '—', color: 'text-emerald-400' },
                  { label: 'Chain ID', value: chain?.id?.toString() ?? '—', color: 'text-cyan-400' },
                  { label: 'Balance', value: balance ? parseFloat(balance.formatted).toFixed(4) : '—', color: 'text-white' },
                  { label: 'Currency', value: balance?.symbol ?? '—', color: 'text-purple-400' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">{stat.label}</div>
                    <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
              <Web3WalletAnalyzer />
            </div>
          )}

          {activeTab === 'simulator' && (
            <div>
              <p className="text-zinc-400 mb-6 text-sm">
                Paste raw transaction data below to see a detailed simulation of what will happen before you sign.
              </p>
              <TransactionSimulatorPanel address={address} />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <p className="text-zinc-400 mb-6 text-sm">
                Configure real-time threat alerts delivered to Telegram or Discord when suspicious activity is detected.
              </p>
              <NotificationSettings />
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

function TransactionSimulatorPanel({ address }: { address?: string }) {
  const [rawTx, setRawTx] = useState('');
  const [txData, setTxData] = useState<Record<string, string> | null>(null);
  const [parseError, setParseError] = useState('');

  const examples = [
    {
      label: 'ETH Transfer',
      tx: { from: address || '0x0000000000000000000000000000000000000001', to: '0x1111111111111111111111111111111111111111', value: '0xde0b6b3a7640000', data: '0x' },
    },
    {
      label: 'Unlimited Approval',
      tx: { from: address || '0x0000000000000000000000000000000000000001', to: '0x2222222222222222222222222222222222222222', value: '0x0', data: '0x095ea7b3000000000000000000000000abcdef12345678901234567890123456789012345ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' },
    },
    {
      label: 'Token Transfer',
      tx: { from: address || '0x0000000000000000000000000000000000000001', to: '0x2222222222222222222222222222222222222222', value: '0x0', data: '0xa9059cbb000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000003635c9adc5dea00000' },
    },
  ];

  const handleSimulate = () => {
    setParseError('');
    try {
      const parsed = JSON.parse(rawTx);
      setTxData(parsed);
    } catch {
      setParseError('Invalid JSON — paste a valid transaction object.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-lg font-semibold text-white mb-3">Transaction Data (JSON)</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-zinc-500 self-center">Try examples:</span>
          {examples.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { setRawTx(JSON.stringify(ex.tx, null, 2)); setTxData(null); setParseError(''); }}
              className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-300 transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
        <textarea
          value={rawTx}
          onChange={(e) => { setRawTx(e.target.value); setTxData(null); }}
          rows={8}
          placeholder={'{\n  "from": "0x...",\n  "to": "0x...",\n  "value": "0x...",\n  "data": "0x..."\n}'}
          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
        {parseError && <p className="mt-2 text-sm text-red-400">{parseError}</p>}
        <button
          onClick={handleSimulate}
          disabled={!rawTx.trim()}
          className="mt-4 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Simulate Transaction
        </button>
      </div>

      {txData && <TransactionSimulator transactionData={txData} />}
    </div>
  );
}
