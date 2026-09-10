import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { QuickstartSection } from "@/components/landing/quickstart-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { FaqSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col text-slate-900">
      <LandingNav />
      <div className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <QuickstartSection />
        <ComparisonSection />
        <FaqSection />
      </div>
      <LandingFooter />
    </main>
  );
}


