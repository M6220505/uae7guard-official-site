import Hero from '@/components/sections/Hero';
import SecurityScanner from '@/components/sections/SecurityScanner';
import AIScamDetection from '@/components/sections/AIScamDetection';
import WalletMonitoring from '@/components/sections/WalletMonitoring';
import MultiChainSupport from '@/components/sections/MultiChainSupport';
import SecureEscrow from '@/components/sections/SecureEscrow';
import NFTRiskAnalysis from '@/components/sections/NFTRiskAnalysis';
import ServiceModules from '@/components/sections/ServiceModules';
import TechnicalArchitecture from '@/components/sections/TechnicalArchitecture';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Hero />
      <SecurityScanner />
      <AIScamDetection />
      <WalletMonitoring />
      <MultiChainSupport />
      <SecureEscrow />
      <NFTRiskAnalysis />
      <ServiceModules />
      <TechnicalArchitecture />
      <Footer />
    </main>
  );
}
