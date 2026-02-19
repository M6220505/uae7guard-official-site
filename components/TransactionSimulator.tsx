'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, parseAbiItem } from 'viem';

interface SimulatedTransaction {
  type: 'transfer' | 'approval' | 'swap' | 'mint' | 'unknown';
  from: string;
  to: string;
  value?: string;
  token?: {
    symbol: string;
    amount: string;
    decimals: number;
  };
  approval?: {
    spender: string;
    amount: string;
    isUnlimited: boolean;
  };
  swap?: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    amountOut: string;
  };
  gasEstimate: string;
  risks: string[];
  warnings: string[];
  summary: string;
  summaryAr?: string;
}

interface TransactionSimulatorProps {
  transactionData?: any;
  onApprove?: () => void;
  onReject?: () => void;
}

export default function TransactionSimulator({
  transactionData,
  onApprove,
  onReject,
}: TransactionSimulatorProps) {
  const { address } = useAccount();
  const [simulating, setSimulating] = useState(false);
  const [simulation, setSimulation] = useState<SimulatedTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionData) {
      simulateTransaction(transactionData);
    }
  }, [transactionData]);

  const simulateTransaction = async (txData: any) => {
    setSimulating(true);
    setError(null);

    try {
      // Simulate delay for API call (in production, call your backend simulation API)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Parse transaction data
      const simulation = parseTransactionData(txData);
      setSimulation(simulation);
    } catch (err: any) {
      setError(err.message || 'Failed to simulate transaction');
    } finally {
      setSimulating(false);
    }
  };

  const parseTransactionData = (txData: any): SimulatedTransaction => {
    const { to, from, value, data } = txData;

    // Detect transaction type based on data
    let type: SimulatedTransaction['type'] = 'unknown';
    const risks: string[] = [];
    const warnings: string[] = [];
    let summary = '';
    let summaryAr = '';

    // Simple ETH transfer (no data or data is 0x)
    if (!data || data === '0x') {
      type = 'transfer';
      const ethAmount = value ? formatUnits(BigInt(value), 18) : '0';
      summary = `Transfer ${parseFloat(ethAmount).toFixed(4)} ETH to ${to}`;
      summaryAr = `تحويل ${parseFloat(ethAmount).toFixed(4)} ETH إلى ${to}`;

      // Check if sending to new address
      if (to.toLowerCase().includes('0000') || to.toLowerCase().includes('1111')) {
        warnings.push('Sending to a suspicious-looking address');
      }
    }
    // ERC-20 approve function
    else if (data.startsWith('0x095ea7b3')) {
      type = 'approval';
      const spender = '0x' + data.slice(34, 74);
      const amountHex = '0x' + data.slice(74);
      const amount = BigInt(amountHex);
      const isUnlimited = amount > BigInt('0xffffffffffffffffffffffffffffffff');

      summary = isUnlimited
        ? `Grant unlimited token approval to ${spender}`
        : `Approve ${formatUnits(amount, 18)} tokens for ${spender}`;

      summaryAr = isUnlimited
        ? `منح موافقة غير محدودة للرموز إلى ${spender}`
        : `الموافقة على ${formatUnits(amount, 18)} رموز لـ ${spender}`;

      if (isUnlimited) {
        risks.push('Unlimited approval detected - contract can spend all your tokens');
        risks.push('Consider approving only the required amount');
      }

      // Check if spender is verified
      if (!spender.startsWith('0x1') && !spender.startsWith('0x7')) {
        warnings.push('Unverified contract address');
      }
    }
    // ERC-20 transfer
    else if (data.startsWith('0xa9059cbb')) {
      type = 'transfer';
      const recipient = '0x' + data.slice(34, 74);
      const amountHex = '0x' + data.slice(74);
      const amount = BigInt(amountHex);

      summary = `Transfer ${formatUnits(amount, 18)} tokens to ${recipient}`;
      summaryAr = `تحويل ${formatUnits(amount, 18)} رموز إلى ${recipient}`;

      // Address poisoning check
      if (recipient.slice(0, 10) === from.slice(0, 10)) {
        risks.push('⚠️ Address Poisoning Detected: Recipient has similar prefix to your address');
      }
    }
    // Swap (common DEX patterns)
    else if (
      data.startsWith('0x38ed1739') || // swapExactTokensForTokens
      data.startsWith('0x8803dbee') || // swapTokensForExactTokens
      data.startsWith('0x7ff36ab5')    // swapExactETHForTokens
    ) {
      type = 'swap';
      summary = 'Execute token swap on decentralized exchange';
      summaryAr = 'تنفيذ تبادل الرموز في البورصة اللامركزية';

      warnings.push('Ensure you understand slippage tolerance');
      warnings.push('Verify token contract addresses before swapping');
    }
    // NFT mint
    else if (
      data.startsWith('0x40c10f19') || // mint
      data.startsWith('0xa0712d68')    // mint (alternative)
    ) {
      type = 'mint';
      summary = `Mint NFT from ${to}`;
      summaryAr = `سك NFT من ${to}`;

      warnings.push('Verify the authenticity of the NFT collection');
      risks.push('Check for similar-named fake collections');
    }

    // Gas estimation (mock - in production, use eth_estimateGas)
    const gasEstimate = (21000 + (data?.length || 0) * 16).toString();

    return {
      type,
      from: from || address || '',
      to,
      value,
      gasEstimate,
      risks,
      warnings,
      summary,
      summaryAr,
    };
  };

  if (!transactionData && !simulation) {
    return (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Transaction Simulator</h3>
        <p className="text-zinc-400 text-sm">
          Initiate a transaction to see a detailed simulation of what will happen
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {simulating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-8 rounded-2xl bg-zinc-900 border border-cyan-500/30 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Simulating Transaction...</h3>
            <p className="text-zinc-400 text-sm">Analyzing transaction effects and potential risks</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-red-400 mb-1">Simulation Failed</h4>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {simulation && !simulating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6"
          >
            {/* Transaction Type Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  {simulation.type === 'transfer' && '💸'}
                  {simulation.type === 'approval' && '✅'}
                  {simulation.type === 'swap' && '🔄'}
                  {simulation.type === 'mint' && '🎨'}
                  {simulation.type === 'unknown' && '❓'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white capitalize">{simulation.type} Transaction</h3>
                  <p className="text-sm text-zinc-400">Simulated outcome</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400">
                Gas: ~{parseInt(simulation.gasEstimate).toLocaleString()}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-400 mb-2">What will happen:</h4>
              <p className="text-white font-mono text-sm leading-relaxed">{simulation.summary}</p>
              {simulation.summaryAr && (
                <p className="text-zinc-400 font-mono text-sm leading-relaxed mt-2 text-right" dir="rtl">
                  {simulation.summaryAr}
                </p>
              )}
            </div>

            {/* Risks */}
            {simulation.risks.length > 0 && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Critical Risks Detected
                </h4>
                <ul className="space-y-2">
                  {simulation.risks.map((risk, idx) => (
                    <li key={idx} className="text-sm text-red-300 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {simulation.warnings.length > 0 && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Warnings
                </h4>
                <ul className="space-y-2">
                  {simulation.warnings.map((warning, idx) => (
                    <li key={idx} className="text-sm text-yellow-300 flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Transaction Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">From</div>
                <div className="text-sm text-white font-mono truncate">{simulation.from}</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">To</div>
                <div className="text-sm text-white font-mono truncate">{simulation.to}</div>
              </div>
            </div>

            {/* Action Buttons */}
            {onApprove && onReject && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={onReject}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-semibold text-white transition-colors"
                >
                  Reject Transaction
                </button>
                <button
                  onClick={onApprove}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    simulation.risks.length > 0
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] text-black'
                  }`}
                >
                  {simulation.risks.length > 0 ? 'Sign Anyway (Not Recommended)' : 'Sign Transaction'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
