'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-black group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300">
              U7
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              UAE7Guard
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/#scanner" className="text-zinc-400 hover:text-white transition-colors">
              Scanner
            </Link>
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/developers" className="text-zinc-400 hover:text-white transition-colors">
              Developers
            </Link>
            <Link href="/developers#docs" className="text-zinc-400 hover:text-white transition-colors">
              Docs
            </Link>
            <ConnectButton />
            <Link href="/developers" className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300">
              Get API Key
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden mt-4 pb-4 space-y-4">
            <Link href="/#scanner" className="block text-zinc-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Scanner</Link>
            <Link href="/dashboard" className="block text-zinc-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            <Link href="/developers" className="block text-zinc-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Developers</Link>
            <Link href="/developers#docs" className="block text-zinc-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Docs</Link>
            <div className="py-2"><ConnectButton /></div>
            <Link href="/developers" className="block px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-black text-center" onClick={() => setIsMenuOpen(false)}>Get API Key</Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
