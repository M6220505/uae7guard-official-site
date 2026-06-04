import Navigation from '@/components/Navigation';
import ArchitectureSection from '@/components/sections/ArchitectureSection';
import HeroSection from '@/components/sections/HeroSection';
import SecurityScannerSection from '@/components/sections/SecurityScannerSection';
import ServicesSection from '@/components/sections/ServicesSection';

type HomePageProps = {
  params: Promise<{locale: string}>;
};

export default async function HomePage({params}: HomePageProps) {
  const {locale} = await params;

  return (
    <main className="relative min-h-screen pb-16">
      <Navigation />
      <div className="container-shell space-y-8 pt-8">
        <HeroSection locale={locale} />
        <SecurityScannerSection />
        <ServicesSection />
        <ArchitectureSection />
      </div>
    </main>
  );
}
