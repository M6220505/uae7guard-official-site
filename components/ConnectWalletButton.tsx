'use client';

import {useMemo} from 'react';
import {useAccount, useConnect, useDisconnect} from 'wagmi';

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ConnectWalletButton() {
  const {address, isConnected} = useAccount();
  const {connect, connectors, isPending} = useConnect();
  const {disconnect} = useDisconnect();

  const injectedConnectors = useMemo(
    () => connectors.filter((connector) => connector.type === 'injected'),
    [connectors]
  );

  if (isConnected && address) {
    return (
      <button
        type="button"
        className="rounded-lg border border-emerald-500/60 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-100"
        onClick={() => disconnect()}
      >
        {shortenAddress(address)}
      </button>
    );
  }

  const connector = injectedConnectors[0];

  return (
    <button
      type="button"
      className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-100 hover:border-cyan-400/70 disabled:opacity-50"
      onClick={() => {
        if (connector) connect({connector});
      }}
      disabled={!connector || isPending}
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
