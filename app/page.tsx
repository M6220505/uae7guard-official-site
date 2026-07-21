import Hero from '@/components/sections/Hero';
import SecurityScanner from '@/components/sections/SecurityScanner';
import AIScamDetection from '@/components/sections/AIScamDetection';
import WalletMonitoring from '@/components/sections/WalletMonitoring';
import MultiChainSupport from '@/components/sections/MultiChainSupport';
import SecureEscrow from '@/components/sections/SecureEscrow';
import NFTRiskAnalysis from '@/components/sections/NFTRiskAnalysis';
import ServiceModules from '@/components/sections/ServiceModules';
import TechnicalArchitecture from '@/components/sections/TechnicalArchitecture';
import TransactionSimulator from '@/components/TransactionSimulator';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Hero />
      <SecurityScanner />
      <AIScamDetection />
      <WalletMonitoring />
      <section className="px-4 py-20 bg-zinc-950">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Before signing</p>
            <h2 className="text-3xl font-bold text-white md:text-5xl">Transaction simulation is now the core protection layer</h2>
            <p className="mx-auto mt-4 max-w-3xl text-zinc-400">
              UAE7Guard translates approvals, transfers, swaps, and mints into plain warnings before users connect trust to a risky site.
            </p>
          </div>
          <TransactionSimulator />
        </div>
      </section>
      <MultiChainSupport />
      <SecureEscrow />
      <NFTRiskAnalysis />
      <ServiceModules />
      <TechnicalArchitecture />
      <Footer />
    </main>
  );
}
