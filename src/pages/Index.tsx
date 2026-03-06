import SiteNav from "@/components/landing/SiteNav";
import Hero from "@/components/landing/Hero";
import LegacyStatement from "@/components/landing/LegacyStatement";
import HowItWorks from "@/components/landing/HowItWorks";
import Products from "@/components/landing/Products";
import Craftsmanship from "@/components/landing/Craftsmanship";
import Testimonials from "@/components/landing/Testimonials";
import TrustIndicators from "@/components/landing/TrustIndicators";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import GoldDivider from "@/components/decorative/GoldDivider";

const Index = () => {
  return (
    <main className="min-h-screen bg-background font-sans">
      {/*
        Mission Memory Vault™ Landing Page

        Design Philosophy (Heirloom-Quality Elegance):
        - Visual Authority: Clean, generous spacing, controlled palette
        - Emotional Storytelling: Connect to memory, identity, legacy
        - Craftsmanship: Premium materials, durability, museum-quality
        - Trust Signals: Testimonials, guarantees, security
        - Value Framing: Explain why it's worth the investment
        - Gold accents used as jewelry — sparingly to signal value
        - Refined typography with serif text for elegance
      */}

      {/* Fixed editorial navigation */}
      <SiteNav />

      {/* Two-column hero with book image */}
      <Hero />

      {/* Cinematic dark manifesto section */}
      <LegacyStatement />

      {/* Ornate gold divider */}
      <GoldDivider variant="diamond" className="my-4" />

      <HowItWorks />

      <Products />

      <Craftsmanship />

      <Testimonials />

      {/* Ornate divider before trust indicators */}
      <GoldDivider variant="ornate" className="my-4" />

      <TrustIndicators />

      <Pricing />

      <Footer />
    </main>
  );
};

export default Index;
