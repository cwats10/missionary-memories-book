import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Products from "@/components/landing/Products";
import Craftsmanship from "@/components/landing/Craftsmanship";
import Testimonials from "@/components/landing/Testimonials";
import TrustIndicators from "@/components/landing/TrustIndicators";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background font-sans">
      {/* 
        Mission Memory Vault™ Landing Page
        
        Design Philosophy (High Quality Website Framework):
        - Visual Authority: Clean, generous spacing, controlled palette
        - Emotional Storytelling: Connect to memory, identity, legacy
        - Craftsmanship: Explain materials, durability, quality
        - Trust Signals: Testimonials, guarantees, security
        - Value Framing: Explain why it's worth the price
        - Calm, confident language without hype or pressure
      */}
      
      <Hero />
      
      {/* Thin divider - gold accent used sparingly */}
      <div className="max-w-xs mx-auto h-px bg-gold/30" />
      
      <HowItWorks />
      
      <Products />
      
      <Craftsmanship />
      
      <Testimonials />
      
      <div className="max-w-xs mx-auto h-px bg-gold/30" />
      
      <TrustIndicators />
      
      <Pricing />
      
      <Footer />
    </main>
  );
};

export default Index;
